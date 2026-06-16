'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Box, Container, Typography, ButtonBase } from '@mui/material';
import { motion } from 'framer-motion';
import { categoryApi } from '../../services/api.service';

const GENDER_TABS = ['ALL', 'WOMEN', 'MEN'] as const;
type GenderTab = typeof GENDER_TABS[number];

const FALLBACK_COLORS = [
  '#0d0d1a', '#0a1a0d', '#1a0a0a', '#0d0a1a', '#1a1a0a', '#0a0d1a',
];

interface HomeCategory {
  id: string;
  name: string;
  slug: string;
  image?: string;
  gender?: string;
  _count?: { products: number };
}

interface Props {
  initialCategories?: HomeCategory[];
}

export default function CategoryShowcase({ initialCategories = [] }: Props) {
  const [categories, setCategories] = useState<HomeCategory[]>(initialCategories);
  const [tab, setTab] = useState<GenderTab>('ALL');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    categoryApi.getHomeCategories(tab === 'ALL' ? undefined : tab)
      .then(({ data }) => setCategories((data as any).data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab]);

  if (!loading && categories.length === 0 && initialCategories.length === 0) return null;

  return (
    <Box sx={{ py: { xs: 7, md: 11 }, bgcolor: '#fff' }}>
      <Container maxWidth="xl">

        {/* ── Header ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: { xs: 3, md: 5 }, gap: 2, flexWrap: 'wrap' }}>
            <Box>
              <Typography sx={{
                fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.28em',
                textTransform: 'uppercase', color: '#c9a84c', display: 'block', mb: 1,
              }}>
                Explore
              </Typography>
              <Typography variant="h2" sx={{
                fontFamily: 'var(--font-playfair)', fontWeight: 700,
                fontSize: { xs: '1.7rem', sm: '2.3rem', md: '3rem' },
                color: '#111', letterSpacing: '-0.02em', lineHeight: 1.05,
              }}>
                Shop by<br />Category
              </Typography>
            </Box>

            <Typography
              component={Link}
              href="/categories"
              sx={{
                fontSize: '0.72rem', fontWeight: 700, color: '#888',
                textDecoration: 'underline', textUnderlineOffset: 4,
                whiteSpace: 'nowrap', mb: 0.5, ml: 2,
                '&:hover': { color: '#c9a84c' }, transition: 'color 0.22s',
              }}
            >
              View all
            </Typography>
          </Box>

          {/* ── Gender tabs ────────────────────────────────────────── */}
          <Box sx={{ display: 'flex', gap: 0, mb: { xs: 3, md: 5 }, borderBottom: '2px solid #f0f0f0' }}>
            {GENDER_TABS.map((g) => (
              <ButtonBase
                key={g}
                onClick={() => setTab(g)}
                sx={{
                  px: { xs: 2, md: 3.5 },
                  py: 1.25,
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: tab === g ? '#111' : '#aaa',
                  borderBottom: tab === g ? '2px solid #111' : '2px solid transparent',
                  mb: '-2px',
                  transition: 'all 0.2s',
                  '&:hover': { color: '#111' },
                }}
              >
                {g}
              </ButtonBase>
            ))}
          </Box>
        </motion.div>

        {/* ── Grid ───────────────────────────────────────────────── */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: { xs: 1.5, md: 2 },
            opacity: loading ? 0.55 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i, 3) * 0.07, duration: 0.48 }}
            >
              <Link href={`/category/${cat.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                <Box
                  sx={{
                    position: 'relative',
                    aspectRatio: '4 / 5',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    bgcolor: FALLBACK_COLORS[i % FALLBACK_COLORS.length],
                    '&:hover .cat-img': { transform: 'scale(1.06)' },
                    '&:hover .cat-btn': { bgcolor: '#cc0000' },
                  }}
                >
                  {/* Background image */}
                  {cat.image && (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="cat-img"
                      style={{ objectFit: 'cover', transition: 'transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
                      sizes="(max-width: 600px) 50vw, 25vw"
                    />
                  )}

                  {/* Dark gradient overlay */}
                  <Box sx={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.3) 55%, rgba(0,0,0,0.08) 100%)',
                  }} />

                  {/* Gender chip — top left */}
                  {cat.gender && (
                    <Box sx={{
                      position: 'absolute', top: 12, left: 12,
                      bgcolor: 'rgba(0,0,0,0.72)',
                      color: 'white',
                      fontSize: '0.58rem',
                      fontWeight: 800,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      px: 1.25, py: 0.4,
                      border: '1px solid rgba(255,255,255,0.18)',
                    }}>
                      {cat.gender === 'WOMEN' ? 'WOMENS' : cat.gender === 'MEN' ? 'MENS' : cat.gender}
                    </Box>
                  )}

                  {/* Bottom content */}
                  <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: { xs: 1.75, md: 2.25 } }}>
                    {/* "COLLECTION" label */}
                    <Typography sx={{
                      fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.2em',
                      textTransform: 'uppercase', color: '#c9a84c', display: 'block', mb: 0.6,
                    }}>
                      Collection
                    </Typography>

                    {/* Category name */}
                    <Typography sx={{
                      color: '#FFE500',
                      fontWeight: 900,
                      fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                      textTransform: 'uppercase',
                      lineHeight: 1.15,
                      letterSpacing: '-0.01em',
                      mb: 0.5,
                      textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    }}>
                      {cat.name}
                    </Typography>

                    {/* Product count */}
                    {cat._count !== undefined && (
                      <Typography sx={{
                        color: 'rgba(255,255,255,0.55)', fontSize: '0.65rem', fontWeight: 500, mb: 1.5,
                      }}>
                        {cat._count.products} products
                      </Typography>
                    )}

                    {/* SHOP NOW button */}
                    <Box
                      className="cat-btn"
                      sx={{
                        display: 'inline-block',
                        bgcolor: '#E53935',
                        color: 'white',
                        fontSize: '0.6rem',
                        fontWeight: 800,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        px: 1.75,
                        py: 0.65,
                        transition: 'background-color 0.2s',
                      }}
                    >
                      Shop Now
                    </Box>
                  </Box>
                </Box>
              </Link>
            </motion.div>
          ))}

          {/* Empty state */}
          {!loading && categories.length === 0 && (
            <Box sx={{ gridColumn: '1 / -1', py: 8, textAlign: 'center' }}>
              <Typography color="text.secondary" fontSize="0.875rem">
                No categories available for this selection.
              </Typography>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}
