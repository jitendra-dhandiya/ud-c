'use client';
import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, Card, CardContent, IconButton, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Avatar, Skeleton, Stack, TablePagination, InputAdornment,
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { categoryApi } from '../../../../services/api.service';
import { toast } from 'react-hot-toast';

const PAGE_SIZE = 20;

const schema = Yup.object({
  name: Yup.string().required('Name required'),
  description: Yup.string(),
  metaTitle: Yup.string(),
  metaDescription: Yup.string(),
});

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCat, setEditCat] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  const fetchCategories = useCallback(() => {
    setLoading(true);
    categoryApi.getAll({ page: page + 1, limit: PAGE_SIZE, search: search || undefined })
      .then(({ data }) => {
        setCategories(data.data || []);
        setTotal((data as any).meta?.total || 0);
      }).finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    const t = setTimeout(fetchCategories, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchCategories, search]);

  const formik = useFormik({
    initialValues: { name: '', description: '', metaTitle: '', metaDescription: '', isActive: true },
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
      } catch {
        toast.error('Save failed');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const openCreate = () => {
    setEditCat(null); setImageFile(null); setImagePreview('');
    formik.resetForm(); setDialogOpen(true);
  };

  const openEdit = (cat: any) => {
    setEditCat(cat); setImagePreview(cat.imageUrl || cat.image || ''); setImageFile(null);
    formik.setValues({
      name: cat.name || '',
      description: cat.description || '',
      metaTitle: cat.metaTitle || '',
      metaDescription: cat.metaDesc || '',
      isActive: cat.isActive ?? true,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false); setEditCat(null); formik.resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await categoryApi.delete(id);
      toast.success('Deleted');
      fetchCategories();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontFamily: 'var(--font-playfair)', fontWeight: 700 }}>
          Categories
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}
          sx={{ bgcolor: '#1a1a1a', '&:hover': { bgcolor: '#333' } }}>
          Add Category
        </Button>
      </Box>

      <Box sx={{ mb: 2.5 }}>
        <TextField size="small" placeholder="Search categories..." sx={{ width: 280 }}
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
              <Card key={cat.id} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar src={cat.imageUrl || cat.image} variant="rounded" sx={{ width: 56, height: 56, bgcolor: '#f5f5f5' }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={700}>{cat.name}</Typography>
                    {cat.description && (
                      <Typography variant="caption" color="text.secondary" noWrap display="block">{cat.description}</Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      Slug: /{cat.slug} · {cat._count?.products ?? 0} products
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label={cat.isActive ? 'Active' : 'Inactive'} size="small"
                      color={cat.isActive ? 'success' : 'default'} />
                    <IconButton size="small" onClick={() => openEdit(cat)}><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(cat.id)}>
                      <Delete fontSize="small" />
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

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editCat ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Box>
              {imagePreview && (
                <Box component="img" src={imagePreview} alt="preview"
                  sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 1, mb: 1 }} />
              )}
              <Button variant="outlined" component="label" size="small">
                {imagePreview ? 'Change Image' : 'Upload Image'}
                <input type="file" hidden accept="image/*" onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); }
                }} />
              </Button>
            </Box>
            <TextField label="Name" size="small" fullWidth required
              {...formik.getFieldProps('name')}
              error={formik.touched.name && !!formik.errors.name}
              helperText={formik.touched.name && formik.errors.name} />
            <TextField label="Description" size="small" fullWidth multiline rows={2}
              {...formik.getFieldProps('description')} />
            <Typography variant="caption" fontWeight={700} color="text.secondary">SEO</Typography>
            <TextField label="Meta Title" size="small" fullWidth {...formik.getFieldProps('metaTitle')} />
            <TextField label="Meta Description" size="small" fullWidth multiline rows={2}
              {...formik.getFieldProps('metaDescription')} />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={closeDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={formik.isSubmitting}
              sx={{ bgcolor: '#1a1a1a', '&:hover': { bgcolor: '#333' } }}>
              {editCat ? 'Save' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
