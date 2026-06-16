'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Box, Typography, Button, Card, CardContent, TextField, InputAdornment,
  Chip, IconButton, Tooltip, Select, MenuItem, FormControl, Switch,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Avatar, Pagination, Stack,
} from '@mui/material';
import { Search, Add, Edit, Delete, FilterList, Refresh } from '@mui/icons-material';
import {
  useReactTable, getCoreRowModel, flexRender,
  createColumnHelper, ColumnDef,
} from '@tanstack/react-table';
import { productApi } from '../../../../services/api.service';
import { formatPrice, formatDate } from '../../../../utils/format';
import type { Product } from '../../../../types';
import toast from 'react-hot-toast';

const columnHelper = createColumnHelper<Product>();

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const limit = 20;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await productApi.getAll({ page, limit, search: debouncedSearch || undefined });
      setProducts(data.data || []);
      setTotal(data.meta?.total || 0);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [page, debouncedSearch]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await productApi.delete(deleteId);
      toast.success('Product deleted');
      setDeleteId(null);
      fetchProducts();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const columns = useMemo<ColumnDef<Product, any>[]>(() => [
    columnHelper.display({
      id: 'image',
      header: '',
      cell: ({ row }) => (
        <Avatar
          src={row.original.images?.[0]?.url}
          variant="rounded"
          sx={{ width: 44, height: 59, bgcolor: '#f5f5f5' }}
        />
      ),
    }),
    columnHelper.accessor('name', {
      header: 'Product',
      cell: ({ getValue, row }) => (
        <Box>
          <Typography variant="body2" fontWeight={700} noWrap sx={{ maxWidth: 220 }}>
            {getValue()}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {row.original.sku && `SKU: ${row.original.sku}`}
          </Typography>
        </Box>
      ),
    }),
    columnHelper.accessor('category', {
      header: 'Category',
      cell: ({ getValue }) => (
        <Typography variant="caption" sx={{ bgcolor: '#f5f5f5', px: 1, py: 0.5, borderRadius: 1 }}>
          {getValue()?.name || '—'}
        </Typography>
      ),
    }),
    columnHelper.accessor('basePrice', {
      header: 'Price',
      cell: ({ getValue, row }) => (
        <Box>
          <Typography variant="body2" fontWeight={700}>{formatPrice(row.original.salePrice || getValue())}</Typography>
          {row.original.salePrice && (
            <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
              {formatPrice(getValue())}
            </Typography>
          )}
        </Box>
      ),
    }),
    columnHelper.accessor('stockQuantity', {
      header: 'Stock',
      cell: ({ getValue }) => (
        <Chip
          label={getValue()}
          size="small"
          color={getValue() === 0 ? 'error' : getValue() < 10 ? 'warning' : 'default'}
          sx={{ fontWeight: 700 }}
        />
      ),
    }),
    columnHelper.accessor('isActive', {
      header: 'Status',
      cell: ({ getValue }) => (
        <Chip
          label={getValue() ? 'Active' : 'Inactive'}
          size="small"
          color={getValue() ? 'success' : 'default'}
          sx={{ fontWeight: 700 }}
        />
      ),
    }),
    columnHelper.display({
      id: 'flags',
      header: 'Flags',
      cell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {row.original.isFeatured && <Chip label="Featured" size="small" sx={{ bgcolor: '#c9a84c', color: 'white', height: 18, fontSize: '0.6rem' }} />}
          {row.original.isTrending && <Chip label="Trending" size="small" sx={{ bgcolor: '#1976d2', color: 'white', height: 18, fontSize: '0.6rem' }} />}
          {row.original.isNewArrival && <Chip label="New" size="small" sx={{ bgcolor: '#2e7d32', color: 'white', height: 18, fontSize: '0.6rem' }} />}
        </Box>
      ),
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created',
      cell: ({ getValue }) => (
        <Typography variant="caption" color="text.secondary">{formatDate(getValue())}</Typography>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Edit">
            <IconButton size="small" component={Link} href={`/admin/products/${row.original.id}`}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => setDeleteId(row.original.id)} sx={{ color: '#d32f2f' }}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    }),
  ], []);

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / limit),
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontFamily: 'var(--font-playfair)', fontWeight: 700 }}>
          Products ({total})
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <Button startIcon={<Refresh />} onClick={fetchProducts} variant="outlined" sx={{ borderColor: '#e0e0e0' }}>
            Refresh
          </Button>
          <Button startIcon={<Add />} component={Link} href="/admin/products/add" variant="contained" sx={{ bgcolor: '#1a1a1a' }}>
            Add Product
          </Button>
        </Stack>
      </Box>

      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <CardContent sx={{ p: 2 }}>
          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
            <TextField
              placeholder="Search products..."
              size="small"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
              sx={{ maxWidth: 360, flex: 1 }}
            />
          </Box>

          {/* Table */}
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((header) => (
                      <th key={header.id} style={{
                        padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid #f0f0f0',
                        fontSize: '0.75rem', fontWeight: 700, color: '#666', letterSpacing: '0.06em',
                        textTransform: 'uppercase', whiteSpace: 'nowrap',
                      }}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={columns.length} style={{ padding: '48px', textAlign: 'center' }}>
                      <CircularProgress size={28} sx={{ color: '#1a1a1a' }} />
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} style={{ padding: '48px', textAlign: 'center', color: '#999' }}>
                      No products found
                    </td>
                  </tr>
                ) : table.getRowModel().rows.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #f5f5f5' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} style={{ padding: '10px 12px', verticalAlign: 'middle' }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>

          {/* Pagination */}
          {total > limit && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(total / limit)}
                page={page}
                onChange={(_, v) => setPage(v)}
                sx={{ '& .MuiPaginationItem-root.Mui-selected': { bgcolor: '#1a1a1a', color: 'white' } }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Delete dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Product</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this product? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeleteId(null)} variant="outlined">Cancel</Button>
          <Button onClick={handleDelete} variant="contained" sx={{ bgcolor: '#d32f2f' }} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
