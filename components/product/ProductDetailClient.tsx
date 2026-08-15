'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Box, Container, Grid, Typography, Button, IconButton,
  Chip, Rating, Tabs, Tab, Accordion, AccordionSummary,
  AccordionDetails, Breadcrumbs, Divider, Stack,
} from '@mui/material';
import {
  FavoriteBorder, Favorite, Share, ExpandMore,
  NavigateNext, LocalShipping, Replay, Security,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import type { Product, ProductVariant } from '../../types';
import { formatPrice, getDiscountPercent } from '../../utils/format';
import { useCart } from '../../hooks/useCart';
import { wishlistApi } from '../../services/api.service';
import { useAppSelector } from '../../store';
import toast from 'react-hot-toast';
import ProductSection from '../home/ProductSection';

interface Props {
  product: Product;
}

export default function ProductDetailClient({ product }: Props) {
  const { addToCart, isLoading } = useCart();
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [inWishlist, setInWishlist] = useState(false);
  const [tab, setTab] = useState(0);

  const displayPrice = product.salePrice || product.basePrice;
  const discount = product.salePrice ? getDiscountPercent(product.basePrice, product.salePrice) : 0;

  /**
   * Only sizes a customer can actually buy.
   *
   * These used to be listed and greyed out, which advertises stock that does
   * not exist and invites a click that cannot succeed. A size with no stock in
   * any colour is now simply absent. Note the check is across ALL variants of
   * that size — XL might be sold out in Black but in stock in White, and that
   * still counts as available.
   */
  const uniqueSizes = [
    ...new Set(
      product.variants
        ?.filter((v) => v.size && (v.stockQuantity ?? 0) > 0)
        .map((v) => v.size) ?? []
    ),
  ];

  const uniqueColors = [
    ...new Set(
      product.variants
        ?.filter((v) => v.color && (v.stockQuantity ?? 0) > 0)
        .map((v) => v.color) ?? []
    ),
  ];

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    const variant = product.variants?.find((v) => v.size === size && (selectedColor ? v.color === selectedColor : true));
    setSelectedVariant(variant || null);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    const variant = product.variants?.find((v) => v.color === color && (selectedSize ? v.size === selectedSize : true));
    setSelectedVariant(variant || null);
  };

  const handleAddToCart = async () => {
    if (uniqueSizes.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    await addToCart(product.id, selectedVariant?.id);
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Please login to add to wishlist'); return; }
    try {
      const { data } = await wishlistApi.toggle(product.id);
      setInWishlist(data.data.inWishlist);
      toast.success(data.data.inWishlist ? 'Added to wishlist' : 'Removed from wishlist');
    } catch {}
  };

  return (
    <Box sx={{ pb: { xs: 10, md: 6 } }}>
      <Container maxWidth="xl" sx={{ pt: 3 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3, fontSize: '0.8rem' }}>
          <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>Home</Link>
          <Link href="/shop" style={{ color: '#888', textDecoration: 'none' }}>Shop</Link>
          {product.category && (
            <Link href={`/category/${product.category.slug}`} style={{ color: '#888', textDecoration: 'none' }}>
              {product.category.name}
            </Link>
          )}
          <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
            {product.name}
          </Typography>
        </Breadcrumbs>

        <Grid container spacing={{ xs: 2, md: 6 }}>
          {/* Images */}
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'sticky', top: 88 }}>
              {/* Main image */}
              <Box
                sx={{
                  position: 'relative', paddingTop: '133%', borderRadius: 2,
                  overflow: 'hidden', bgcolor: '#f8f8f8', mb: 1.5,
                }}
              >
                {product.images?.[selectedImage]?.url && (
                  <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0.5, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    style={{ position: 'absolute', inset: 0 }}
                  >
                    <Image
                      src={product.images[selectedImage].url}
                      alt={product.images[selectedImage].altText || product.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </motion.div>
                )}
                {discount > 0 && (
                  <Chip
                    label={`${discount}% OFF`}
                    size="small"
                    sx={{ position: 'absolute', top: 12, left: 12, bgcolor: '#d32f2f', color: 'white', fontWeight: 700 }}
                  />
                )}
              </Box>

              {/* Thumbnails */}
              {product.images?.length > 1 && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {product.images.map((img, i) => (
                    <Box
                      key={img.id}
                      onClick={() => setSelectedImage(i)}
                      sx={{
                        position: 'relative', width: 64, height: 85, borderRadius: 1,
                        overflow: 'hidden', cursor: 'pointer', bgcolor: '#f8f8f8',
                        border: '2px solid', borderColor: i === selectedImage ? '#1a1a1a' : 'transparent',
                        transition: 'border-color 0.2s',
                        '&:hover': { borderColor: '#888' },
                      }}
                    >
                      {/* 64x85 thumbnail strip — explicit sizes keeps each of
                          these at a few KB instead of a full-width image. */}
                      <Image src={img.url} alt="" fill style={{ objectFit: 'cover' }} sizes="64px" />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Grid>

          {/* Product info */}
          <Grid item xs={12} md={6}>
            <Box>
              {product.brand && (
                <Typography variant="overline" sx={{ color: '#c9a84c', letterSpacing: '0.12em', fontWeight: 600 }}>
                  {product.brand}
                </Typography>
              )}

              <Typography variant="h4" sx={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, mt: 0.5, mb: 1, lineHeight: 1.2 }}>
                {product.name}
              </Typography>

              {/* Rating */}
              {product.totalReviews > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Rating value={Number(product.avgRating)} precision={0.5} size="small" readOnly />
                  <Typography variant="body2" color="text.secondary">
                    ({product.totalReviews} reviews)
                  </Typography>
                </Box>
              )}

              {/* Price */}
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a1a1a' }}>
                  {formatPrice(displayPrice)}
                </Typography>
                {product.salePrice && (
                  <>
                    <Typography variant="h6" sx={{ textDecoration: 'line-through', color: 'text.secondary', fontWeight: 400 }}>
                      {formatPrice(product.basePrice)}
                    </Typography>
                    <Chip label={`Save ${discount}%`} size="small" sx={{ bgcolor: '#d32f2f', color: 'white', fontWeight: 700 }} />
                  </>
                )}
              </Box>

              {/* Short desc */}
              {product.shortDesc && (
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
                  {product.shortDesc}
                </Typography>
              )}

              {/* Colors */}
              {uniqueColors.length > 0 && (
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                    Color: <span style={{ fontWeight: 400, color: '#666' }}>{selectedColor || 'Select'}</span>
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {uniqueColors.map((color) => {
                      const variant = product.variants?.find((v) => v.color === color);
                      return (
                        <Box
                          key={color}
                          onClick={() => color && handleColorSelect(color)}
                          title={color}
                          sx={{
                            width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
                            bgcolor: variant?.colorHex || '#ccc',
                            border: '3px solid', borderColor: selectedColor === color ? '#1a1a1a' : 'transparent',
                            boxShadow: '0 0 0 1.5px rgba(0,0,0,0.15)',
                            transition: 'all 0.2s',
                            '&:hover': { transform: 'scale(1.15)' },
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>
              )}

              {/* Sizes */}
              {uniqueSizes.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Size: <span style={{ fontWeight: 400, color: '#666' }}>{selectedSize || 'Select'}</span>
                    </Typography>
                    <Button size="small" sx={{ p: 0, color: '#888', fontSize: '0.75rem' }}>
                      Size Guide
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {uniqueSizes.map((size) => {
                      // Every size reaching here has stock in at least one
                      // colour; this narrows to the currently selected colour so
                      // a size unavailable in THAT colour still reads as such.
                      const variant = product.variants?.find(
                        (v) => v.size === size && (selectedColor ? v.color === selectedColor : true)
                      );
                      const outOfStock = (variant?.stockQuantity ?? 0) === 0;
                      return (
                        <Box
                          key={size}
                          onClick={() => !outOfStock && size && handleSizeSelect(size)}
                          sx={{
                            minWidth: 44, height: 44, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', border: '1.5px solid',
                            borderColor: selectedSize === size ? '#1a1a1a' : '#e0e0e0',
                            borderRadius: 1, cursor: outOfStock ? 'not-allowed' : 'pointer',
                            opacity: outOfStock ? 0.4 : 1,
                            fontWeight: 600, fontSize: '0.8rem', px: 1.5,
                            bgcolor: selectedSize === size ? '#1a1a1a' : 'transparent',
                            color: selectedSize === size ? 'white' : 'inherit',
                            transition: 'all 0.2s',
                            '&:hover': outOfStock ? {} : { borderColor: '#1a1a1a' },
                          }}
                        >
                          {size}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}

              {/* Actions */}
              <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleAddToCart}
                  disabled={isLoading}
                  sx={{
                    bgcolor: '#1a1a1a', py: 1.75, fontSize: '0.8rem',
                    letterSpacing: '0.12em', fontWeight: 700,
                    '&:hover': { bgcolor: '#333' },
                  }}
                >
                  {isLoading ? 'Adding...' : 'Add to Bag'}
                </Button>
                <IconButton
                  onClick={handleWishlist}
                  sx={{
                    border: '1.5px solid', borderColor: '#e0e0e0',
                    borderRadius: 1, px: 2,
                    '&:hover': { borderColor: '#1a1a1a' },
                  }}
                >
                  {inWishlist ? <Favorite sx={{ color: '#d32f2f' }} /> : <FavoriteBorder />}
                </IconButton>
                <IconButton sx={{ border: '1.5px solid', borderColor: '#e0e0e0', borderRadius: 1, px: 1.5 }}>
                  <Share fontSize="small" />
                </IconButton>
              </Stack>

              {/* Trust badges */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                {[
                  { icon: <LocalShipping fontSize="small" />, text: 'Free shipping above ₹999' },
                  { icon: <Replay fontSize="small" />, text: '7-day easy returns' },
                  { icon: <Security fontSize="small" />, text: 'Secure payments' },
                ].map((item) => (
                  <Box key={item.text} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#666' }}>
                    {item.icon}
                    <Typography variant="caption" fontWeight={500}>{item.text}</Typography>
                  </Box>
                ))}
              </Box>

              {/* Tabs */}
              <Box>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 2 }}>
                  <Tab label="Description" sx={{ fontSize: '0.8rem', fontWeight: 600 }} />
                  {product.fabric && <Tab label="Fabric & Care" sx={{ fontSize: '0.8rem', fontWeight: 600 }} />}
                  {product.faqs?.length ? <Tab label="FAQs" sx={{ fontSize: '0.8rem', fontWeight: 600 }} /> : null}
                </Tabs>

                {tab === 0 && (
                  <Typography variant="body2" sx={{ lineHeight: 1.9, color: 'text.secondary' }}>
                    {product.description || product.shortDesc || 'No description available.'}
                  </Typography>
                )}

                {tab === 1 && product.fabric && (
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.9, color: 'text.secondary' }}>
                      <strong>Fabric:</strong> {product.fabric}
                    </Typography>
                    {product.careInstructions && (
                      <Typography variant="body2" sx={{ lineHeight: 1.9, color: 'text.secondary' }}>
                        <strong>Care:</strong> {product.careInstructions}
                      </Typography>
                    )}
                  </Box>
                )}

                {tab === 2 && product.faqs?.map((faq, i) => (
                  <Accordion key={i} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 1, '&:before': { display: 'none' }, borderRadius: '4px !important' }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="body2" fontWeight={600}>{faq.question}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" color="text.secondary">{faq.answer}</Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Related products */}
        {(product.relatedProducts?.length ?? 0) > 0 && (
          <Box sx={{ mt: 10 }}>
            <ProductSection
              title="You May Also Like"
              subtitle="Recommended"
              products={(product.relatedProducts ?? []).map((rp: any) => rp.relatedProduct)}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
}
