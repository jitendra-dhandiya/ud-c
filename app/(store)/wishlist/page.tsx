'use client';
import { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Button, Card, CardMedia, CardContent,
  IconButton, Skeleton, Divider,
} from '@mui/material';
import Link from 'next/link';
import { Delete, ShoppingBag, Favorite } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { wishlistApi } from '../../../services/api.service';
import { useCart } from '../../../hooks/useCart';
import { formatPrice } from '../../../utils/format';
import { toast } from 'react-hot-toast';

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const fetchWishlist = () => {
    setLoading(true);
    wishlistApi.getMyWishlist()
      .then(({ data }) => setItems(data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchWishlist(); }, []);

  const removeItem = async (productId: string) => {
    try {
      await wishlistApi.remove(productId);
      setItems(prev => prev.filter(i => i.productId !== productId));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove');
    }
  };

  const moveToCart = async (item: any) => {
    await addToCart(item.productId, undefined, 1);
    await removeItem(item.productId);
  };

  if (loading) return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', px: { xs: 2, md: 4 }, py: 6 }}>
      <Skeleton height={40} width={200} sx={{ mb: 3 }} />
      <Grid container spacing={2}>
        {[...Array(4)].map((_, i) => <Grid item xs={6} sm={3} key={i}><Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} /></Grid>)}
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', px: { xs: 2, md: 4 }, py: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
        <Favorite sx={{ color: '#c9a84c' }} />
        <Typography variant="h4" sx={{ fontFamily: 'var(--font-playfair)', fontWeight: 800 }}>
          My Wishlist
        </Typography>
        {items.length > 0 && (
          <Typography variant="body2" color="text.secondary">({items.length} items)</Typography>
        )}
      </Box>

      {items.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Favorite sx={{ fontSize: 64, color: '#eee', mb: 2 }} />
          <Typography variant="h5" sx={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, mb: 1 }}>
            Your wishlist is empty
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Save items you love and come back later.
          </Typography>
          <Button variant="contained" component={Link} href="/shop"
            sx={{ bgcolor: '#1a1a1a', '&:hover': { bgcolor: '#333' } }}>
            Browse Shop
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          <AnimatePresence>
            {items.map(item => (
              <Grid item xs={6} sm={4} md={3} key={item.id}>
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, position: 'relative' }}>
                    <IconButton
                      size="small" onClick={() => removeItem(item.productId)}
                      sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, bgcolor: 'rgba(255,255,255,0.9)' }}>
                      <Delete fontSize="small" />
                    </IconButton>
                    <CardMedia
                      component="img"
                      image={item.product?.images?.[0]?.url || '/placeholder.jpg'}
                      alt={item.product?.name}
                      sx={{ height: 220, objectFit: 'cover', cursor: 'pointer' }}
                      onClick={() => { window.location.href = `/product/${item.product?.slug}`; }}
                    />
                    <CardContent sx={{ p: 1.5 }}>
                      <Typography variant="body2" fontWeight={600} noWrap sx={{ mb: 0.25 }}>
                        {item.product?.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <Typography variant="body2" fontWeight={800}>
                          {formatPrice(item.product?.salePrice || item.product?.basePrice)}
                        </Typography>
                        {item.product?.salePrice && (
                          <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                            {formatPrice(item.product?.basePrice)}
                          </Typography>
                        )}
                      </Box>
                      <Button fullWidth size="small" variant="contained"
                        startIcon={<ShoppingBag fontSize="small" />}
                        onClick={() => moveToCart(item)}
                        sx={{ bgcolor: '#1a1a1a', '&:hover': { bgcolor: '#333' }, fontSize: '0.72rem' }}>
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      )}
    </Box>
  );
}
