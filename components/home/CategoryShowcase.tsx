'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Box, Container, Typography, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import type { Category } from '../../types';

interface CategoryShowcaseProps {
  categories: Category[];
}

export default function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  if (!categories.length) return null;

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: '#fafafa' }}>
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Typography variant="overline" sx={{ color: '#c9a84c', letterSpacing: '0.2em', fontWeight: 600, display: 'block', mb: 1 }}>
              Explore
            </Typography>
            <Typography variant="h3" sx={{ fontFamily: 'var(--font-playfair)', fontWeight: 700 }}>
              Shop by Category
            </Typography>
          </motion.div>
        </Box>

        <Grid container spacing={2}>
          {categories.slice(0, 6).map((category, index) => (
            <Grid
              key={category.id}
              item
              xs={6}
              sm={index < 2 ? 6 : 4}
              md={index < 2 ? 4 : index < 4 ? 3 : 3}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
              >
                <Link href={`/category/${category.slug}`} style={{ textDecoration: 'none' }}>
                  <Box
                    sx={{
                      position: 'relative',
                      paddingTop: index < 2 ? '120%' : '140%',
                      borderRadius: 2,
                      overflow: 'hidden',
                      bgcolor: '#f0f0f0',
                      cursor: 'pointer',
                      '&:hover img': { transform: 'scale(1.06)' },
                      '&:hover .cat-overlay': { opacity: 0.7 },
                    }}
                  >
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    ) : (
                      <Box sx={{ position: 'absolute', inset: 0, background: `hsl(${index * 60}, 25%, 75%)` }} />
                    )}

                    <Box
                      className="cat-overlay"
                      sx={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%)',
                        transition: 'opacity 0.3s',
                      }}
                    />

                    <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: { xs: 1.5, md: 2.5 } }}>
                      <Typography
                        variant="h6"
                        sx={{
                          color: 'white',
                          fontFamily: 'var(--font-playfair)',
                          fontWeight: 700,
                          fontSize: { xs: '0.9rem', md: index < 2 ? '1.5rem' : '1.2rem' },
                          textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                        }}
                      >
                        {category.name}
                      </Typography>
                      {category._count && (
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem' }}>
                          {category._count.products} products
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Link>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
