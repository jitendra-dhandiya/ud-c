'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Box, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { Category } from '../../types';

const DARK_GRADIENTS = [
  'linear-gradient(160deg, #1a0a2e 0%, #2d1b4e 100%)',
  'linear-gradient(160deg, #071f18 0%, #0d3b2e 100%)',
  'linear-gradient(160deg, #1f0e07 0%, #3b1a0d 100%)',
  'linear-gradient(160deg, #0a1630 0%, #1a2d4e 100%)',
  'linear-gradient(160deg, #1a1a07 0%, #2d2d0d 100%)',
  'linear-gradient(160deg, #1a0710 0%, #2d0d1a 100%)',
];

interface Props {
  categories: Category[];
}

export default function CategoryShowcase({ categories }: Props) {
  if (!categories.length) return null;
  const cats = categories.slice(0, 6);

  return (
    <Box sx={{ py: { xs: 7, md: 11 }, bgcolor: '#fff' }}>
      <Container maxWidth="xl">

        {/* ── Section header ────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: { xs: 4, md: 6 } }}>
            <Box>
              <Typography sx={{
                fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.28em',
                textTransform: 'uppercase', color: '#c9a84c', display: 'block', mb: 1,
              }}>
                Explore
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  fontFamily: 'var(--font-playfair)',
                  fontWeight: 700,
                  fontSize: { xs: '1.7rem', sm: '2.3rem', md: '3rem' },
                  color: '#111',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.05,
                }}
              >
                Shop by<br />Category
              </Typography>
            </Box>
            <Typography
              component={Link}
              href="/categories"
              sx={{
                fontSize: '0.72rem', fontWeight: 700, color: '#888',
                textDecoration: 'underline', textUnderlineOffset: 4, whiteSpace: 'nowrap',
                mb: 0.5, ml: 2, '&:hover': { color: '#c9a84c' }, transition: 'color 0.22s',
              }}
            >
              View all
            </Typography>
          </Box>
        </motion.div>

        {/* ── Bento grid ────────────────────────────────────────── */}
        {/*
          Desktop (3 cols: 2fr 1fr 1fr):
            Row1: [Cat0 rowspan2] [Cat1] [Cat2]
            Row2: [Cat0 rowspan2] [Cat3] [Cat4]
            Row3: [Cat5 ──── full width ──────]

          Mobile (2 cols: 1fr 1fr):
            Row1: [Cat0 ── full width ─────── ]
            Row2: [Cat1      ] [Cat2          ]
            Row3: [Cat3      ] [Cat4          ]
            Row4: [Cat5 ── full width ─────── ]
        */}
        <Box sx={{ display: 'grid', gap: { xs: 1.5, md: 2 }, gridTemplateColumns: { xs: '1fr 1fr', md: '2fr 1fr 1fr' } }}>

          {/* Cat 0 — hero card: full-width on mobile, spans 2 rows on desktop */}
          {cats[0] && (
            <Box sx={{ gridColumn: { xs: '1 / 3', md: '1 / 2' }, gridRow: { md: '1 / 3' } }}>
              <CategoryCard category={cats[0]} height={{ xs: 260, sm: 320, md: '100%' }} minHeight={{ md: 500 }} index={0} featured />
            </Box>
          )}

          {/* Cat 1 — top-right first */}
          {cats[1] && (
            <Box sx={{ gridColumn: { xs: '1 / 2', md: '2 / 3' }, gridRow: { md: '1 / 2' } }}>
              <CategoryCard category={cats[1]} height={{ xs: 200, sm: 240, md: 244 }} index={1} />
            </Box>
          )}

          {/* Cat 2 — top-right second */}
          {cats[2] && (
            <Box sx={{ gridColumn: { xs: '2 / 3', md: '3 / 4' }, gridRow: { md: '1 / 2' } }}>
              <CategoryCard category={cats[2]} height={{ xs: 200, sm: 240, md: 244 }} index={2} />
            </Box>
          )}

          {/* Cat 3 — bottom-right first */}
          {cats[3] && (
            <Box sx={{ gridColumn: { xs: '1 / 2', md: '2 / 3' }, gridRow: { md: '2 / 3' } }}>
              <CategoryCard category={cats[3]} height={{ xs: 180, sm: 210, md: 244 }} index={3} />
            </Box>
          )}

          {/* Cat 4 — bottom-right second */}
          {cats[4] && (
            <Box sx={{ gridColumn: { xs: '2 / 3', md: '3 / 4' }, gridRow: { md: '2 / 3' } }}>
              <CategoryCard category={cats[4]} height={{ xs: 180, sm: 210, md: 244 }} index={4} />
            </Box>
          )}

          {/* Cat 5 — full-width footer row */}
          {cats[5] && (
            <Box sx={{ gridColumn: { xs: '1 / 3', md: '1 / 4' }, gridRow: { md: '3 / 4' } }}>
              <CategoryCard category={cats[5]} height={{ xs: 160, sm: 180, md: 170 }} index={5} wide />
            </Box>
          )}

        </Box>
      </Container>
    </Box>
  );
}

// ── Individual card ───────────────────────────────────────────────
function CategoryCard({
  category, height, minHeight, index, featured = false, wide = false,
}: {
  category: Category;
  height: any;
  minHeight?: any;
  index: number;
  featured?: boolean;
  wide?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, duration: 0.5 }}
      style={{ height: '100%' }}
    >
      <Link href={`/category/${category.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
        <Box
          sx={{
            position: 'relative',
            height,
            minHeight,
            overflow: 'hidden',
            cursor: 'pointer',
            '&:hover .cat-img': { transform: 'scale(1.08)' },
            '&:hover .cat-reveal': { opacity: 1, transform: 'translateY(0)' },
            '&:hover .cat-overlay': { opacity: 0.85 },
          }}
        >
          {/* Background */}
          {category.image ? (
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="cat-img"
              style={{ objectFit: 'cover', transition: 'transform 0.75s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          ) : (
            <Box sx={{ position: 'absolute', inset: 0, background: DARK_GRADIENTS[index % DARK_GRADIENTS.length] }} />
          )}

          {/* Bottom gradient overlay */}
          <Box
            className="cat-overlay"
            sx={{
              position: 'absolute', inset: 0,
              background: wide
                ? 'linear-gradient(to right, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)'
                : 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.0) 100%)',
              transition: 'opacity 0.4s',
            }}
          />

          {/* Top accent line */}
          <Box sx={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
            background: 'linear-gradient(to right, #c9a84c, transparent)',
            opacity: 0.6,
          }} />

          {/* Content */}
          <Box sx={{
            position: 'absolute',
            ...(wide
              ? { left: 0, top: '50%', transform: 'translateY(-50%)', p: { xs: 2.5, md: 4 } }
              : { bottom: 0, left: 0, right: 0, p: featured ? { xs: 2.5, md: 3.5 } : { xs: 1.75, md: 2.5 } }),
          }}>
            {/* Category label */}
            <Typography sx={{
              fontSize: '0.6rem',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#c9a84c',
              display: 'block',
              mb: 0.6,
            }}>
              Collection
            </Typography>

            {/* Name */}
            <Typography sx={{
              color: 'white',
              fontFamily: 'var(--font-playfair)',
              fontWeight: 700,
              fontSize: featured
                ? { xs: '1.2rem', sm: '1.6rem', md: '2rem' }
                : wide
                  ? { xs: '1.1rem', md: '1.4rem' }
                  : { xs: '0.9rem', sm: '1rem', md: '1.15rem' },
              lineHeight: 1.2,
              mb: 0.5,
              textShadow: '0 2px 12px rgba(0,0,0,0.5)',
            }}>
              {category.name}
            </Typography>

            {/* Product count */}
            {category._count && (
              <Typography sx={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: featured ? '0.72rem' : '0.62rem',
                fontWeight: 500,
                mb: featured ? 2 : 0,
              }}>
                {category._count.products} products
              </Typography>
            )}

            {/* Reveal CTA — appears on hover */}
            <Box
              className="cat-reveal"
              sx={{
                mt: featured ? 0 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                color: 'white',
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                opacity: 0,
                transform: 'translateY(8px)',
                transition: 'all 0.32s ease',
                borderBottom: '1px solid #c9a84c',
                pb: 0.25,
              }}
            >
              Shop now
              <Box component="span" sx={{ fontSize: '0.85rem', lineHeight: 1 }}>→</Box>
            </Box>
          </Box>
        </Box>
      </Link>
    </motion.div>
  );
}
