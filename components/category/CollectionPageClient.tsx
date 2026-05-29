'use client';
import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Grid, Breadcrumbs, Link as MuiLink,
  MenuItem, Select, FormControl, InputLabel, Skeleton, Pagination,
} from '@mui/material';
import Link from 'next/link';
import { NavigateNext } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { productApi } from '../../services/api.service';
import ProductCard from '../product/ProductCard';

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest' },
  { value: 'basePrice:asc', label: 'Price: Low to High' },
  { value: 'basePrice:desc', label: 'Price: High to Low' },
  { value: 'rating:desc', label: 'Top Rated' },
];

export default function CollectionPageClient({ collection }: { collection: any }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('createdAt:desc');
  const limit = 24;

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const [sortBy, sortOrder] = sort.split(':');
    productApi.getAll({ collectionId: collection.id, page, limit, sortBy, sortOrder })
      .then(({ data }) => { setProducts(data.data || []); setTotal(data.meta?.total || 0); })
      .finally(() => setLoading(false));
  }, [collection.id, page, sort]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
        <MuiLink component={Link} href="/" underline="hover" color="text.secondary" variant="body2">Home</MuiLink>
        <Typography variant="body2" color="text.primary" fontWeight={600}>{collection.name}</Typography>
      </Breadcrumbs>

      {/* Collection hero */}
      <Box sx={{
        position: 'relative', height: { xs: 220, md: 320 }, borderRadius: 3, overflow: 'hidden', mb: 4,
        bgcolor: collection.imageUrl ? 'transparent' : '#1a1a1a',
      }}>
        {collection.imageUrl && (
          <Box component="img" src={collection.imageUrl} alt={collection.name}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <Box sx={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', pl: { xs: 3, md: 6 },
        }}>
          <Typography variant="overline" sx={{ color: '#c9a84c', letterSpacing: '0.15em', fontWeight: 700 }}>
            Collection
          </Typography>
          <Typography variant="h2" sx={{ color: '#fff', fontFamily: 'var(--font-playfair)', fontWeight: 800, mb: 1 }}>
            {collection.name}
          </Typography>
          {collection.description && (
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', maxWidth: 480 }}>
              {collection.description}
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">{total} products</Typography>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Sort by</InputLabel>
          <Select value={sort} label="Sort by" onChange={e => { setSort(e.target.value); setPage(1); }}>
            {SORT_OPTIONS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={2.5}>
        {loading ? (
          [...Array(12)].map((_, i) => (
            <Grid item xs={6} sm={4} md={3} key={i}>
              <Skeleton variant="rectangular" height={360} sx={{ borderRadius: 2 }} />
            </Grid>
          ))
        ) : products.map((p, i) => (
          <Grid item xs={6} sm={4} md={3} key={p.id}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <ProductCard product={p} />
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {Math.ceil(total / limit) > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <Pagination count={Math.ceil(total / limit)} page={page} onChange={(_, p) => setPage(p)} color="primary" shape="rounded" />
        </Box>
      )}
    </Box>
  );
}
