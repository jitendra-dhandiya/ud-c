'use client';
import Link from 'next/link';
import { Box, Typography, Button, Container, Grid } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { motion } from 'framer-motion';
import ProductCard, { ProductCardSkeleton } from '../product/ProductCard';
import type { Product } from '../../types';

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLink?: string;
  loading?: boolean;
  bgColor?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ProductSection({
  title, subtitle, products, viewAllLink, loading = false, bgColor = '#ffffff',
}: ProductSectionProps) {
  return (
    <Box sx={{ bgcolor: bgColor, py: { xs: 6, md: 10 } }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {subtitle && (
              <Typography variant="overline" sx={{ color: '#c9a84c', letterSpacing: '0.2em', fontWeight: 600, display: 'block', mb: 1 }}>
                {subtitle}
              </Typography>
            )}
            <Typography variant="h3" sx={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, mb: viewAllLink ? 2 : 0 }}>
              {title}
            </Typography>
            {viewAllLink && (
              <Button
                component={Link}
                href={viewAllLink}
                endIcon={<ArrowForward />}
                sx={{ color: 'text.primary', fontWeight: 600, '&:hover': { color: '#c9a84c' } }}
              >
                View All
              </Button>
            )}
          </motion.div>
        </Box>

        {/* Products Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Grid container spacing={{ xs: 1.5, md: 2.5 }}>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Grid key={i} item xs={6} sm={4} md={3}>
                    <ProductCardSkeleton />
                  </Grid>
                ))
              : products.map((product) => (
                  <Grid key={product.id} item xs={6} sm={4} md={3}>
                    <motion.div variants={itemVariants}>
                      <ProductCard product={product} />
                    </motion.div>
                  </Grid>
                ))}
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
}
