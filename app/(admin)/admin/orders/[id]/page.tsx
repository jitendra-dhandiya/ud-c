'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Avatar, Divider,
  IconButton, Button, TextField, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, Skeleton, Stack,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { orderApi } from '../../../../../services/api.service';
import { formatDate, formatPrice } from '../../../../../utils/format';
import { toast } from 'react-hot-toast';

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED'];
const STATUS_COLORS: Record<string, any> = {
  PENDING: 'warning', CONFIRMED: 'info', PROCESSING: 'info',
  SHIPPED: 'primary', OUT_FOR_DELIVERY: 'primary', DELIVERED: 'success',
  CANCELLED: 'error', RETURNED: 'default',
};

export default function OrderDetailAdminPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusDialog, setStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    orderApi.getById(id).then(({ data }) => {
      setOrder(data.data);
      setNewStatus(data.data.status);
      setTrackingNumber(data.data.trackingNumber || '');
    }).finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async () => {
    setUpdating(true);
    try {
      await orderApi.updateStatus(id, { status: newStatus, trackingNumber: trackingNumber || undefined });
      toast.success('Status updated');
      setStatusDialog(false);
      setOrder((o: any) => ({ ...o, status: newStatus, trackingNumber }));
    } catch {
      toast.error('Update failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <Box>
      <Skeleton height={40} width={200} sx={{ mb: 2 }} />
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
        </Grid>
      </Grid>
    </Box>
  );

  if (!order) return <Typography>Order not found</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => router.push('/admin/orders')}><ArrowBack /></IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontFamily: 'var(--font-playfair)', fontWeight: 700 }}>
            Order #{order.orderNumber}
          </Typography>
          <Typography variant="caption" color="text.secondary">{formatDate(order.createdAt)}</Typography>
        </Box>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          <Chip label={order.status} color={STATUS_COLORS[order.status] || 'default'} sx={{ fontWeight: 700 }} />
          <Button variant="outlined" size="small" onClick={() => setStatusDialog(true)}
            sx={{ borderColor: '#1a1a1a', color: '#1a1a1a' }}>
            Update Status
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Order items */}
        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>Order Items</Typography>
              <Stack spacing={2}>
                {order.items?.map((item: any) => (
                  <Box key={item.id} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Avatar src={item.product?.images?.[0]?.url || item.image} variant="rounded"
                      sx={{ width: 64, height: 80, bgcolor: '#f5f5f5' }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600}>{item.product?.name || item.name}</Typography>
                      {item.variant && (
                        <Typography variant="caption" color="text.secondary">
                          {item.variant.color} · {item.size}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" display="block">
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={700}>{formatPrice(item.price * item.quantity)}</Typography>
                  </Box>
                ))}
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                  <Typography variant="body2">{formatPrice(order.subtotal)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Shipping</Typography>
                  <Typography variant="body2">{order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost)}</Typography>
                </Box>
                {order.discount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Discount</Typography>
                    <Typography variant="body2" color="success.main">-{formatPrice(order.discount)}</Typography>
                  </Box>
                )}
                <Divider sx={{ my: 0.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight={800}>Total</Typography>
                  <Typography variant="body2" fontWeight={800}>{formatPrice(order.total)}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Shipping address */}
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Shipping Address</Typography>
              {order.shippingAddress && (
                <Box>
                  <Typography variant="body2" fontWeight={600}>{order.shippingAddress.fullName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.shippingAddress.addressLine1}
                    {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{order.shippingAddress.phone}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Customer</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar src={order.user?.avatar} sx={{ width: 40, height: 40 }}>
                  {order.user?.firstName?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {order.user?.firstName} {order.user?.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{order.user?.email}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Payment</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Method</Typography>
                  <Typography variant="caption" fontWeight={600}>{order.paymentMethod}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Chip label={order.paymentStatus} size="small"
                    color={order.paymentStatus === 'PAID' ? 'success' : 'warning'}
                    sx={{ height: 18, fontSize: '0.6rem' }} />
                </Box>
                {order.razorpayPaymentId && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">Payment ID</Typography>
                    <Typography variant="caption" fontFamily="monospace">{order.razorpayPaymentId}</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {order.trackingNumber && (
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>Tracking</Typography>
                <Typography variant="body2" fontFamily="monospace" fontWeight={600}>{order.trackingNumber}</Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Status update dialog */}
      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Update Order Status</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField select label="Status" size="small" fullWidth value={newStatus}
            onChange={e => setNewStatus(e.target.value)}>
            {STATUS_OPTIONS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
          <TextField label="Tracking Number (optional)" size="small" fullWidth
            value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setStatusDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={updateStatus} disabled={updating}
            sx={{ bgcolor: '#1a1a1a', '&:hover': { bgcolor: '#333' } }}>
            {updating ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
