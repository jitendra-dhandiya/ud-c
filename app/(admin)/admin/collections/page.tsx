'use client';
import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Avatar, Chip, IconButton,
  Stack, Skeleton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControlLabel, Switch, TablePagination, InputAdornment,
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { collectionApi } from '../../../../services/api.service';
import { toast } from 'react-hot-toast';

const PAGE_SIZE = 20;
const schema = Yup.object({ name: Yup.string().required('Name required'), description: Yup.string() });

export default function CollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCol, setEditCol] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  const fetchCollections = useCallback(() => {
    setLoading(true);
    collectionApi.getAll({ page: page + 1, limit: PAGE_SIZE, search: search || undefined })
      .then(({ data }) => {
        const d = data as any;
        setCollections(d.data || []);
        setTotal(d.meta?.total || 0);
      }).finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    const t = setTimeout(fetchCollections, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchCollections, search]);

  const formik = useFormik({
    initialValues: { name: '', description: '', isActive: true, isFeatured: false },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const fd = new FormData();
        Object.entries(values).forEach(([k, v]) => fd.append(k, String(v)));
        if (imageFile) fd.append('image', imageFile);
        if (editCol) {
          await collectionApi.update(editCol.id, fd);
          toast.success('Collection updated');
        } else {
          await collectionApi.create(fd);
          toast.success('Collection created');
        }
        closeDialog();
        fetchCollections();
      } catch {
        toast.error('Save failed');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const openCreate = () => {
    setEditCol(null); setImageFile(null); setImagePreview('');
    formik.resetForm(); setDialogOpen(true);
  };
  const openEdit = (c: any) => {
    setEditCol(c); setImagePreview(c.image || ''); setImageFile(null);
    formik.setValues({ name: c.name, description: c.description || '', isActive: c.isActive ?? true, isFeatured: c.isFeatured ?? false });
    setDialogOpen(true);
  };
  const closeDialog = () => { setDialogOpen(false); setEditCol(null); formik.resetForm(); };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this collection?')) return;
    try {
      await collectionApi.delete(id);
      toast.success('Deleted');
      fetchCollections();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontFamily: 'var(--font-playfair)', fontWeight: 700 }}>Collections</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}
          sx={{ bgcolor: '#1a1a1a', '&:hover': { bgcolor: '#333' } }}>Add Collection</Button>
      </Box>

      <Box sx={{ mb: 2.5 }}>
        <TextField size="small" placeholder="Search collections..." sx={{ width: 280 }}
          value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} />
      </Box>

      {loading ? (
        <Stack spacing={1.5}>{[...Array(6)].map((_, i) => <Skeleton key={i} height={80} sx={{ borderRadius: 2 }} />)}</Stack>
      ) : (
        <>
          <Stack spacing={1.5}>
            {collections.map(c => (
              <Card key={c.id} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar src={c.image} variant="rounded" sx={{ width: 60, height: 70, bgcolor: '#f5f5f5' }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={700}>{c.name}</Typography>
                    {c.description && <Typography variant="caption" color="text.secondary" noWrap>{c.description}</Typography>}
                    <Typography variant="caption" color="text.secondary" display="block">
                      Slug: /{c.slug} · {c._count?.products ?? 0} products
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {c.isFeatured && <Chip label="Featured" size="small" color="secondary" sx={{ height: 20, fontSize: '0.6rem' }} />}
                    <Chip label={c.isActive ? 'Active' : 'Inactive'} size="small" color={c.isActive ? 'success' : 'default'} />
                    <IconButton size="small" onClick={() => openEdit(c)}><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(c.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
            {collections.length === 0 && (
              <Typography color="text.secondary" sx={{ p: 4, textAlign: 'center' }}>No collections found</Typography>
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
        <DialogTitle sx={{ fontWeight: 700 }}>{editCol ? 'Edit Collection' : 'Add Collection'}</DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Box>
              {imagePreview && <Box component="img" src={imagePreview} sx={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 1, mb: 1 }} />}
              <Button variant="outlined" component="label" size="small">
                {imagePreview ? 'Change' : 'Upload Image'}
                <input type="file" hidden accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }} />
              </Button>
            </Box>
            <TextField label="Name" size="small" fullWidth required
              {...formik.getFieldProps('name')}
              error={formik.touched.name && !!formik.errors.name}
              helperText={formik.touched.name && formik.errors.name} />
            <TextField label="Description" size="small" fullWidth multiline rows={2} {...formik.getFieldProps('description')} />
            <FormControlLabel control={<Switch checked={formik.values.isActive} onChange={e => formik.setFieldValue('isActive', e.target.checked)} />} label="Active" />
            <FormControlLabel control={<Switch checked={formik.values.isFeatured} onChange={e => formik.setFieldValue('isFeatured', e.target.checked)} />} label="Featured" />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={closeDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={formik.isSubmitting}
              sx={{ bgcolor: '#1a1a1a', '&:hover': { bgcolor: '#333' } }}>
              {editCol ? 'Save' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
