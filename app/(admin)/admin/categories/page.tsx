'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box, Typography, Button, Card, CardContent, IconButton, Chip, Switch,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Avatar, Skeleton, Stack, TablePagination, InputAdornment,
  Select, MenuItem, FormControl, InputLabel, FormControlLabel,
  Tooltip, Badge,
} from '@mui/material';
import { Add, Edit, Delete, Search, CloudUpload, Close, Visibility, VisibilityOff } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { categoryApi } from '../../../../services/api.service';
import { toast } from 'react-hot-toast';

const PAGE_SIZE = 20;

const schema = Yup.object({
  name:            Yup.string().required('Name required'),
  description:     Yup.string(),
  parentId:        Yup.string(),
  sortOrder:       Yup.number(),
  isActive:        Yup.boolean(),
  showInNav:       Yup.boolean(),
  showOnHome:      Yup.boolean(),
  isFeatured:      Yup.boolean(),
  gender:          Yup.string(),
  metaTitle:       Yup.string(),
  metaDescription: Yup.string(),
});

export default function CategoriesPage() {
  const [categories, setCategories]     = useState<any[]>([]);
  const [parents, setParents]           = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [page, setPage]                 = useState(0);
  const [total, setTotal]               = useState(0);
  const [search, setSearch]             = useState('');
  const [dialogOpen, setDialogOpen]     = useState(false);
  const [editCat, setEditCat]           = useState<any>(null);
  const [imageFile, setImageFile]       = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileRef                         = useRef<HTMLInputElement>(null);

  const fetchCategories = useCallback(() => {
    setLoading(true);
    categoryApi.getAll({ page: page + 1, limit: PAGE_SIZE, search: search || undefined })
      .then(({ data }) => {
        setCategories((data as any).data || []);
        setTotal((data as any).meta?.total || 0);
      }).finally(() => setLoading(false));
  }, [page, search]);

  const fetchParents = useCallback(() => {
    categoryApi.getParents().then(({ data }) => setParents((data as any).data || []));
  }, []);

  useEffect(() => {
    fetchParents();
  }, [fetchParents]);

  useEffect(() => {
    const t = setTimeout(fetchCategories, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchCategories, search]);

  const formik = useFormik({
    initialValues: {
      name: '', description: '', parentId: '', sortOrder: 0,
      isActive: true, showInNav: true, showOnHome: false, isFeatured: false,
      gender: '',
      metaTitle: '', metaDescription: '',
    },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const fd = new FormData();
        Object.entries(values).forEach(([k, v]) => fd.append(k, String(v)));
        if (imageFile) fd.append('image', imageFile);
        if (editCat) {
          await categoryApi.update(editCat.id, fd);
          toast.success('Category updated');
        } else {
          await categoryApi.create(fd);
          toast.success('Category created');
        }
        closeDialog();
        fetchCategories();
        fetchParents();
      } catch {
        toast.error('Save failed');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const openCreate = () => {
    setEditCat(null); setImageFile(null); setImagePreview('');
    formik.resetForm({
      values: {
        name: '', description: '', parentId: '', sortOrder: 0,
        isActive: true, showInNav: true, showOnHome: false, isFeatured: false,
        gender: '',
        metaTitle: '', metaDescription: '',
      },
    });
    setDialogOpen(true);
  };

  const openEdit = (cat: any) => {
    setEditCat(cat);
    setImagePreview(cat.image || '');
    setImageFile(null);
    formik.resetForm({
      values: {
        name:            cat.name || '',
        description:     cat.description || '',
        parentId:        cat.parentId || '',
        sortOrder:       cat.sortOrder ?? 0,
        isActive:        cat.isActive ?? true,
        showInNav:       cat.showInNav ?? true,
        showOnHome:      cat.showOnHome ?? false,
        isFeatured:      cat.isFeatured ?? false,
        gender:          cat.gender || '',
        metaTitle:       cat.metaTitle || '',
        metaDescription: cat.metaDesc || '',
      },
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditCat(null);
    formik.resetForm();
    setImageFile(null);
    setImagePreview('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? This cannot be undone.')) return;
    try {
      await categoryApi.delete(id);
      toast.success('Deleted');
      fetchCategories();
      fetchParents();
    } catch {
      toast.error('Delete failed');
    }
  };

  // Quick-toggle showInNav
  const handleNavToggle = async (cat: any) => {
    const next = !cat.showInNav;
    setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, showInNav: next } : c));
    const fd = new FormData();
    fd.append('showInNav', String(next));
    try {
      await categoryApi.update(cat.id, fd);
      toast.success(next ? 'Shown in nav' : 'Hidden from nav');
    } catch {
      setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, showInNav: !next } : c));
      toast.error('Update failed');
    }
  };

  // Quick-toggle showOnHome
  const handleHomeToggle = async (cat: any) => {
    const next = !cat.showOnHome;
    setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, showOnHome: next } : c));
    const fd = new FormData();
    fd.append('showOnHome', String(next));
    try {
      await categoryApi.update(cat.id, fd);
      toast.success(next ? 'Shown on homepage' : 'Hidden from homepage');
    } catch {
      setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, showOnHome: !next } : c));
      toast.error('Update failed');
    }
  };

  const parentMap = Object.fromEntries(parents.map(p => [p.id, p.name]));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h5" sx={{ fontFamily: 'var(--font-playfair)', fontWeight: 700 }}>
            Categories
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage categories and subcategories. Toggle "Show in Nav" to control the mega menu.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}
          sx={{ bgcolor: '#1a1a1a', '&:hover': { bgcolor: '#333' }, borderRadius: 1.5, fontWeight: 700, fontSize: '0.8rem' }}>
          Add Category
        </Button>
      </Box>

      <Box sx={{ mb: 2.5 }}>
        <TextField size="small" placeholder="Search categories…" sx={{ width: 280 }}
          value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} />
      </Box>

      {loading ? (
        <Stack spacing={1.5}>
          {[...Array(6)].map((_, i) => <Skeleton key={i} height={72} sx={{ borderRadius: 2 }} />)}
        </Stack>
      ) : (
        <>
          <Stack spacing={1.5}>
            {categories.map((cat) => (
              <Card key={cat.id} elevation={0} sx={{
                border: '1px solid', borderRadius: 2,
                borderColor: cat.isActive ? 'divider' : '#f5f5f5',
                opacity: cat.isActive ? 1 : 0.65,
              }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar src={cat.image} variant="rounded" sx={{ width: 56, height: 56, bgcolor: '#f0f0f0' }}>
                    {cat.name?.charAt(0)}
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body2" fontWeight={700}>{cat.name}</Typography>
                      {cat.parentId && (
                        <Chip
                          label={`↳ ${parentMap[cat.parentId] || 'Sub'}`}
                          size="small"
                          sx={{ fontSize: '0.62rem', height: 18, bgcolor: '#f0f4ff', color: '#3366cc' }}
                        />
                      )}
                      {!cat.isActive && <Chip label="Inactive" size="small" sx={{ fontSize: '0.62rem', height: 18 }} />}
                      {cat.isFeatured && (
                        <Chip label="Featured" size="small" color="warning" sx={{ fontSize: '0.62rem', height: 18 }} />
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      /{cat.slug} · {cat._count?.products ?? 0} products
                      {cat.children?.length > 0 && ` · ${cat.children.length} sub-categories`}
                      {cat.sortOrder ? ` · order ${cat.sortOrder}` : ''}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                    <Tooltip title={cat.showInNav ? 'Shown in nav mega menu' : 'Hidden from nav'} arrow>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Switch
                          size="small"
                          color="success"
                          checked={cat.showInNav ?? true}
                          onChange={() => handleNavToggle(cat)}
                        />
                        <Typography variant="caption" sx={{ color: cat.showInNav ? '#4caf50' : '#bbb', fontSize: '0.65rem', mr: 0.5 }}>
                          Nav
                        </Typography>
                      </Box>
                    </Tooltip>
                    <Tooltip title={cat.showOnHome ? 'Shown on homepage' : 'Hidden from homepage'} arrow>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Switch
                          size="small"
                          color="warning"
                          checked={cat.showOnHome ?? false}
                          onChange={() => handleHomeToggle(cat)}
                        />
                        <Typography variant="caption" sx={{ color: cat.showOnHome ? '#ff9800' : '#bbb', fontSize: '0.65rem', mr: 0.5 }}>
                          Home
                        </Typography>
                      </Box>
                    </Tooltip>
                    <IconButton size="small" onClick={() => openEdit(cat)}>
                      <Edit sx={{ fontSize: 16 }} />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(cat.id)}>
                      <Delete sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
            {categories.length === 0 && (
              <Typography color="text.secondary" sx={{ p: 4, textAlign: 'center' }}>No categories found</Typography>
            )}
          </Stack>

          <TablePagination
            component="div" count={total} page={page} rowsPerPage={PAGE_SIZE}
            rowsPerPageOptions={[PAGE_SIZE]}
            onPageChange={(_, p) => setPage(p)}
            sx={{ mt: 2 }}
          />
        </>
      )}

      {/* ── Add / Edit Dialog ──────────────────────────────────────── */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editCat ? `Edit: ${editCat.name}` : 'Add Category'}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>

            {/* Image uploader */}
            <Box>
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Category Image
              </Typography>
              {imagePreview ? (
                <Box sx={{ position: 'relative', mb: 1 }}>
                  <Box component="img" src={imagePreview} alt="preview"
                    sx={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 1, display: 'block' }} />
                  <IconButton
                    size="small"
                    onClick={() => { setImageFile(null); setImagePreview(''); if (fileRef.current) fileRef.current.value = ''; }}
                    sx={{ position: 'absolute', top: 6, right: 6, bgcolor: 'rgba(0,0,0,0.55)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' } }}
                  >
                    <Close sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              ) : (
                <Box
                  onClick={() => fileRef.current?.click()}
                  sx={{
                    height: 100, border: '1.5px dashed #d0d0d0', borderRadius: 1,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 0.5, cursor: 'pointer', bgcolor: '#fafafa',
                    '&:hover': { borderColor: '#1a1a1a', bgcolor: '#f5f5f5' },
                    mb: 1,
                  }}
                >
                  <CloudUpload sx={{ fontSize: 28, color: '#bbb' }} />
                  <Typography variant="caption" color="text.secondary">Click to upload · JPG, PNG, WebP</Typography>
                </Box>
              )}
              <input ref={fileRef} type="file" hidden accept="image/*" onChange={e => {
                const f = e.target.files?.[0];
                if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); }
              }} />
              {imagePreview && (
                <Button size="small" variant="outlined" onClick={() => fileRef.current?.click()} sx={{ fontSize: '0.72rem', borderColor: '#ddd', color: '#555' }}>
                  Change Image
                </Button>
              )}
            </Box>

            <TextField
              label="Category Name *" size="small" fullWidth
              {...formik.getFieldProps('name')}
              error={formik.touched.name && !!formik.errors.name}
              helperText={formik.touched.name && formik.errors.name}
            />

            <FormControl size="small" fullWidth>
              <InputLabel>Parent Category (leave blank for top-level)</InputLabel>
              <Select
                label="Parent Category (leave blank for top-level)"
                value={formik.values.parentId}
                onChange={e => formik.setFieldValue('parentId', e.target.value)}
              >
                <MenuItem value=""><em>— None (top-level) —</em></MenuItem>
                {parents
                  .filter(p => p.id !== editCat?.id) // don't allow self-reference
                  .map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)
                }
              </Select>
            </FormControl>

            <TextField
              label="Description" size="small" fullWidth multiline rows={2}
              {...formik.getFieldProps('description')}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <TextField
                label="Sort Order" size="small" type="number" fullWidth
                {...formik.getFieldProps('sortOrder')}
                helperText="Lower = shown first"
              />
              <FormControl size="small" fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  label="Gender"
                  value={formik.values.gender}
                  onChange={e => formik.setFieldValue('gender', e.target.value)}
                >
                  <MenuItem value=""><em>— Unspecified —</em></MenuItem>
                  <MenuItem value="WOMEN">Women</MenuItem>
                  <MenuItem value="MEN">Men</MenuItem>
                  <MenuItem value="UNISEX">Unisex</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <FormControlLabel
                control={<Switch size="small" color="success" checked={formik.values.isActive} onChange={e => formik.setFieldValue('isActive', e.target.checked)} />}
                label={<Typography variant="caption" fontWeight={600}>Active</Typography>}
              />
              <FormControlLabel
                control={<Switch size="small" color="primary" checked={formik.values.showInNav} onChange={e => formik.setFieldValue('showInNav', e.target.checked)} />}
                label={<Typography variant="caption" fontWeight={600}>Show in Mega Menu (Nav)</Typography>}
              />
              <FormControlLabel
                control={<Switch size="small" color="warning" checked={formik.values.showOnHome} onChange={e => formik.setFieldValue('showOnHome', e.target.checked)} />}
                label={<Typography variant="caption" fontWeight={600}>Show on Homepage</Typography>}
              />
              <FormControlLabel
                control={<Switch size="small" color="secondary" checked={formik.values.isFeatured} onChange={e => formik.setFieldValue('isFeatured', e.target.checked)} />}
                label={<Typography variant="caption" fontWeight={600}>Featured</Typography>}
              />
            </Box>

            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mt: 0.5 }}>
              SEO (optional)
            </Typography>
            <TextField label="Meta Title" size="small" fullWidth {...formik.getFieldProps('metaTitle')} />
            <TextField label="Meta Description" size="small" fullWidth multiline rows={2}
              {...formik.getFieldProps('metaDescription')} />
          </DialogContent>

          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button onClick={closeDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={formik.isSubmitting}
              sx={{ bgcolor: '#1a1a1a', '&:hover': { bgcolor: '#333' }, fontWeight: 700 }}>
              {formik.isSubmitting ? 'Saving…' : editCat ? 'Save Changes' : 'Create Category'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
