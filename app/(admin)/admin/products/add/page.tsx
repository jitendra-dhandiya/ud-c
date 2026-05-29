'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Button, Card, CardContent, Grid, TextField,
  MenuItem, FormControlLabel, Switch, Chip, IconButton, Divider,
} from '@mui/material';
import { Add, Remove, ArrowBack, CloudUpload } from '@mui/icons-material';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { productApi, categoryApi } from '../../../../../services/api.service';
import { toast } from 'react-hot-toast';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const schema = Yup.object({
  name: Yup.string().required('Product name required'),
  description: Yup.string().required('Description required'),
  basePrice: Yup.number().positive().required('Price required'),
  categoryId: Yup.string().required('Category required'),
  sku: Yup.string().required('SKU required'),
});

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    categoryApi.getAll({ page: 1, limit: 100 }).then(({ data }) => setCategories((data as any).data || data || []));
  }, []);

  const formik = useFormik({
    initialValues: {
      name: '', description: '', basePrice: '', salePrice: '', sku: '',
      categoryId: '', collectionId: '',
      isFeatured: false, isTrending: false, isNewArrival: true, isBestSeller: false,
      material: '', careInstructions: '', fit: '', style: '',
      metaTitle: '', metaDescription: '',
      tags: [] as string[],
      variants: [{ color: '', colorHex: '#000000', sizes: SIZES.map(s => ({ size: s, stock: 10, price: '' })) }],
    },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const fd = new FormData();
        fd.append('name', values.name);
        fd.append('description', values.description);
        fd.append('basePrice', String(values.basePrice));
        if (values.salePrice) fd.append('salePrice', String(values.salePrice));
        fd.append('sku', values.sku);
        fd.append('categoryId', values.categoryId);
        if (values.collectionId) fd.append('collectionId', values.collectionId);
        fd.append('isFeatured', String(values.isFeatured));
        fd.append('isTrending', String(values.isTrending));
        fd.append('isNewArrival', String(values.isNewArrival));
        fd.append('isBestSeller', String(values.isBestSeller));
        fd.append('material', values.material);
        fd.append('careInstructions', values.careInstructions);
        fd.append('fit', values.fit);
        fd.append('style', values.style);
        fd.append('metaTitle', values.metaTitle);
        fd.append('metaDescription', values.metaDescription);
        fd.append('tags', JSON.stringify(values.tags));
        fd.append('variants', JSON.stringify(values.variants));
        images.forEach(img => fd.append('images', img));

        await productApi.create(fd);
        toast.success('Product created!');
        router.push('/admin/products');
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to create product');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeImage = (i: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
    setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formik.values.tags.includes(tag)) {
      formik.setFieldValue('tags', [...formik.values.tags, tag]);
    }
    setTagInput('');
  };

  return (
    <FormikProvider value={formik}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={() => router.push('/admin/products')}><ArrowBack /></IconButton>
          <Typography variant="h5" sx={{ fontFamily: 'var(--font-playfair)', fontWeight: 700 }}>
            Add Product
          </Typography>
        </Box>

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            {/* Main details */}
            <Grid item xs={12} lg={8}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>Basic Information</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField label="Product Name" size="small" fullWidth required
                        {...formik.getFieldProps('name')}
                        error={formik.touched.name && !!formik.errors.name}
                        helperText={formik.touched.name && formik.errors.name} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField label="Description" size="small" fullWidth multiline rows={4} required
                        {...formik.getFieldProps('description')}
                        error={formik.touched.description && !!formik.errors.description}
                        helperText={formik.touched.description && formik.errors.description} />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField label="Base Price (₹)" type="number" size="small" fullWidth required
                        {...formik.getFieldProps('basePrice')}
                        error={formik.touched.basePrice && !!formik.errors.basePrice}
                        helperText={formik.touched.basePrice && formik.errors.basePrice} />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField label="Sale Price (₹)" type="number" size="small" fullWidth
                        {...formik.getFieldProps('salePrice')} />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField label="SKU" size="small" fullWidth required
                        {...formik.getFieldProps('sku')}
                        error={formik.touched.sku && !!formik.errors.sku}
                        helperText={formik.touched.sku && formik.errors.sku} />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField select label="Category" size="small" fullWidth required
                        {...formik.getFieldProps('categoryId')}
                        error={formik.touched.categoryId && !!formik.errors.categoryId}
                        helperText={formik.touched.categoryId && formik.errors.categoryId}>
                        {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                      </TextField>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Images */}
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>Product Images</Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                    {imagePreviews.map((src, i) => (
                      <Box key={i} sx={{ position: 'relative' }}>
                        <Box component="img" src={src} alt=""
                          sx={{ width: 90, height: 110, objectFit: 'cover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }} />
                        <IconButton size="small" onClick={() => removeImage(i)} sx={{
                          position: 'absolute', top: -8, right: -8, bgcolor: '#fff', boxShadow: 1,
                          '&:hover': { bgcolor: '#fff' }, p: 0.25,
                        }}>
                          <Remove fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                    <Button component="label" variant="outlined" sx={{
                      width: 90, height: 110, borderRadius: 1, borderStyle: 'dashed', flexDirection: 'column', gap: 0.5,
                    }}>
                      <CloudUpload fontSize="small" />
                      <Typography variant="caption">Add</Typography>
                      <input type="file" hidden accept="image/*" multiple onChange={handleImages} />
                    </Button>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    First image will be the cover. Images are auto-optimized to WebP.
                  </Typography>
                </CardContent>
              </Card>

              {/* Variants */}
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight={700}>Variants (Colors & Sizes)</Typography>
                    <Button size="small" startIcon={<Add />} onClick={() => {
                      formik.setFieldValue('variants', [...formik.values.variants, {
                        color: '', colorHex: '#000000',
                        sizes: SIZES.map(s => ({ size: s, stock: 10, price: '' })),
                      }]);
                    }}>
                      Add Color
                    </Button>
                  </Box>

                  {formik.values.variants.map((variant, vi) => (
                    <Box key={vi} sx={{ mb: 3, p: 2, bgcolor: '#fafafa', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                        <TextField label="Color Name" size="small" sx={{ flex: 1 }}
                          value={variant.color}
                          onChange={e => formik.setFieldValue(`variants.${vi}.color`, e.target.value)} />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption">Hex:</Typography>
                          <input type="color" value={variant.colorHex}
                            onChange={e => formik.setFieldValue(`variants.${vi}.colorHex`, e.target.value)}
                            style={{ width: 40, height: 32, border: 'none', cursor: 'pointer', borderRadius: 4 }} />
                        </Box>
                        {formik.values.variants.length > 1 && (
                          <IconButton size="small" color="error" onClick={() =>
                            formik.setFieldValue('variants', formik.values.variants.filter((_, i) => i !== vi))}>
                            <Remove fontSize="small" />
                          </IconButton>
                        )}
                      </Box>

                      <Grid container spacing={1.5}>
                        {variant.sizes.map((sv, si) => (
                          <Grid item xs={4} sm={2} key={sv.size}>
                            <Typography variant="caption" fontWeight={700} display="block" sx={{ mb: 0.5 }}>
                              {sv.size}
                            </Typography>
                            <TextField
                              label="Stock" type="number" size="small" fullWidth
                              value={sv.stock}
                              onChange={e => formik.setFieldValue(`variants.${vi}.sizes.${si}.stock`, Number(e.target.value))}
                              inputProps={{ min: 0 }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  ))}
                </CardContent>
              </Card>

              {/* Additional details */}
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>Product Details</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}><TextField label="Material" size="small" fullWidth {...formik.getFieldProps('material')} /></Grid>
                    <Grid item xs={6}><TextField label="Fit" size="small" fullWidth {...formik.getFieldProps('fit')} /></Grid>
                    <Grid item xs={6}><TextField label="Style" size="small" fullWidth {...formik.getFieldProps('style')} /></Grid>
                    <Grid item xs={12}><TextField label="Care Instructions" size="small" fullWidth multiline rows={2} {...formik.getFieldProps('careInstructions')} /></Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* SEO */}
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>SEO</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}><TextField label="Meta Title" size="small" fullWidth {...formik.getFieldProps('metaTitle')} /></Grid>
                    <Grid item xs={12}><TextField label="Meta Description" size="small" fullWidth multiline rows={2} {...formik.getFieldProps('metaDescription')} /></Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} lg={4}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>Flags</Typography>
                  {(['isFeatured', 'isTrending', 'isNewArrival', 'isBestSeller'] as const).map(flag => (
                    <FormControlLabel key={flag}
                      control={<Switch size="small" checked={formik.values[flag]}
                        onChange={e => formik.setFieldValue(flag, e.target.checked)} />}
                      label={flag.replace('is', '').replace(/([A-Z])/g, ' $1').trim()}
                      sx={{ display: 'flex', mb: 0.5 }}
                    />
                  ))}
                </CardContent>
              </Card>

              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>Tags</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                    <TextField size="small" placeholder="Add tag" fullWidth
                      value={tagInput} onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} />
                    <Button size="small" onClick={addTag}><Add /></Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {formik.values.tags.map(tag => (
                      <Chip key={tag} label={tag} size="small" onDelete={() =>
                        formik.setFieldValue('tags', formik.values.tags.filter(t => t !== tag))} />
                    ))}
                  </Box>
                </CardContent>
              </Card>

              <Button type="submit" variant="contained" fullWidth size="large" disabled={formik.isSubmitting}
                sx={{ bgcolor: '#1a1a1a', '&:hover': { bgcolor: '#333' }, py: 1.5, borderRadius: 2 }}>
                {formik.isSubmitting ? 'Creating...' : 'Create Product'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </FormikProvider>
  );
}
