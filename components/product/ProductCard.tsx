'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Card, CardContent, CardMedia, Box, Typography, IconButton,
  Chip, Rating, Skeleton, Button,
} from '@mui/material';
import { FavoriteBorder, Favorite, ShoppingBag, Visibility } from '@mui/icons-material';
import { motion } from 'framer-motion';
import type { Product } from '../../types';
import { formatPrice, getDiscountPercent } from '../../utils/format';
import { useCart } from '../../hooks/useCart';
import { wishlistApi } from '../../services/api.service';
import { useAppSelector } from '../../store';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact';
}

export default function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const { addToCart, isLoading } = useCart();
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const [inWishlist, setInWishlist] = useState(false);
  const [imageIdx, setImageIdx] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  const displayPrice = product.salePrice || product.basePrice;
  const discount = product.salePrice ? getDiscountPercent(product.basePrice, product.salePrice) : 0;
  const primaryImage = product.images?.[imageIdx]?.url;
  const secondaryImage = product.images?.[1]?.url;

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to add to wishlist'); return; }
    try {
      const { data } = await wishlistApi.toggle(product.id);
      setInWishlist(data.data.inWishlist);
      toast.success(data.data.inWishlist ? 'Added to wishlist' : 'Removed from wishlist');
    } catch {}
  };

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    setAddingToCart(true);
    await addToCart(product.id);
    setAddingToCart(false);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Card
        elevation={0}
        component={Link}
        href={`/product/${product.slug}`}
        sx={{
          textDecoration: 'none',
          display: 'block',
          border: '1px solid',
          borderColor: 'transparent',
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'white',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'rgba(0,0,0,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            '& .product-actions': { opacity: 1, transform: 'translateY(0)' },
            '& .product-img-secondary': { opacity: 1 },
          },
        }}
      >
        {/* Image */}
        <Box
          sx={{
            position: 'relative',
            paddingTop: variant === 'compact' ? '110%' : '125%',
            bgcolor: '#f8f8f8',
            overflow: 'hidden',
          }}
          onMouseEnter={() => secondaryImage && setImageIdx(1)}
          onMouseLeave={() => setImageIdx(0)}
        >
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
              sizes="(max-width: 768px) 50vw, 25vw"
              loading="lazy"
            />
          ) : (
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
              <ShoppingBag sx={{ fontSize: 48 }} />
            </Box>
          )}

          {secondaryImage && (
            <Image
              className="product-img-secondary"
              src={secondaryImage}
              alt={product.name}
              fill
              style={{ objectFit: 'cover', transition: 'opacity 0.3s ease', opacity: 0, position: 'absolute', top: 0 }}
              sizes="(max-width: 768px) 50vw, 25vw"
              loading="lazy"
            />
          )}

          {/* Badges */}
          <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {discount > 0 && (
              <Chip label={`-${discount}%`} size="small"
                sx={{ bgcolor: '#d32f2f', color: 'white', fontWeight: 700, height: 22, fontSize: '0.65rem' }} />
            )}
            {product.isNewArrival && (
              <Chip label="NEW" size="small"
                sx={{ bgcolor: '#1a1a1a', color: 'white', fontWeight: 700, height: 22, fontSize: '0.65rem' }} />
            )}
            {product.isTrending && (
              <Chip label="TRENDING" size="small"
                sx={{ bgcolor: '#c9a84c', color: 'white', fontWeight: 700, height: 22, fontSize: '0.65rem' }} />
            )}
            {product.badges?.map((badge) => (
              <Chip key={badge.id} label={badge.label} size="small"
                sx={{ bgcolor: badge.bgColor, color: badge.color, fontWeight: 700, height: 22, fontSize: '0.65rem' }} />
            ))}
          </Box>

          {/* Wishlist button */}
          <IconButton
            onClick={handleWishlist}
            size="small"
            sx={{
              position: 'absolute', top: 8, right: 8,
              bgcolor: 'white', boxShadow: 1,
              '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' },
              transition: 'transform 0.2s',
              p: 0.75,
            }}
          >
            {inWishlist ? (
              <Favorite sx={{ fontSize: 16, color: '#d32f2f' }} />
            ) : (
              <FavoriteBorder sx={{ fontSize: 16 }} />
            )}
          </IconButton>

          {/* Quick add actions */}
          <Box
            className="product-actions"
            sx={{
              position: 'absolute', bottom: 0, left: 0, right: 0, p: 1.5,
              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
              opacity: 0,
              transform: 'translateY(8px)',
              transition: 'all 0.3s ease',
              display: 'flex', gap: 1,
            }}
          >
            <Button
              fullWidth
              variant="contained"
              size="small"
              onClick={handleQuickAdd}
              disabled={addingToCart}
              sx={{
                bgcolor: 'white', color: '#1a1a1a',
                fontSize: '0.65rem', letterSpacing: '0.08em',
                py: 0.75,
                '&:hover': { bgcolor: '#f5f5f5' },
              }}
            >
              {addingToCart ? 'Adding...' : 'Quick Add'}
            </Button>
          </Box>
        </Box>

        {/* Info */}
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
          {product.brand && (
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', letterSpacing: '0.06em', textTransform: 'uppercase', mb: 0.25, fontSize: '0.65rem' }}>
              {product.brand}
            </Typography>
          )}
          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3, mb: 0.5, fontSize: variant === 'compact' ? '0.8rem' : '0.875rem' }} noWrap>
            {product.name}
          </Typography>

          {product.variants?.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, mb: 0.75, flexWrap: 'wrap' }}>
              {[...new Set(product.variants.map((v) => v.color).filter(Boolean))].slice(0, 4).map((color) => (
                <Box
                  key={color}
                  title={color}
                  sx={{
                    width: 14, height: 14, borderRadius: '50%',
                    bgcolor: product.variants.find((v) => v.color === color)?.colorHex || '#ccc',
                    border: '1.5px solid rgba(0,0,0,0.1)',
                  }}
                />
              ))}
              {[...new Set(product.variants.map((v) => v.color).filter(Boolean))].length > 4 && (
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', lineHeight: '14px' }}>
                  +{[...new Set(product.variants.map((v) => v.color).filter(Boolean))].length - 4}
                </Typography>
              )}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
              {formatPrice(displayPrice)}
            </Typography>
            {product.salePrice && product.salePrice < product.basePrice && (
              <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                {formatPrice(product.basePrice)}
              </Typography>
            )}
          </Box>

          {product.totalReviews > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <Rating value={Number(product.avgRating)} precision={0.5} size="small" readOnly sx={{ fontSize: '0.75rem' }} />
              <Typography variant="caption" color="text.secondary">({product.totalReviews})</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function ProductCardSkeleton() {
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <Skeleton variant="rectangular" sx={{ paddingTop: '125%' }} />
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Skeleton variant="text" width="40%" sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="30%" />
      </CardContent>
    </Card>
  );
}
