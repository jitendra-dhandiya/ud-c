'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';
import Image from 'next/image';
import Link from 'next/link';
import { Box, Typography, Button, Container } from '@mui/material';
import { motion } from 'framer-motion';
import type { Banner } from '../../types';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

// Responsive hero height — tall enough to feel premium, not viewport-locked
const HERO_H = { xs: 300, sm: 430, md: 580, lg: 700 };

interface HeroSliderProps {
  banners: Banner[];
}

export default function HeroSlider({ banners }: HeroSliderProps) {
  if (!banners.length) {
    return (
      <Box sx={{
        height: HERO_H,
        position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center',
        background: 'linear-gradient(135deg, #0d0d0d 0%, #1e1a14 60%, #2c2410 100%)',
      }}>
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
          <motion.div initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.85 }}>
            <Typography variant="overline" sx={{ color: '#c9a84c', letterSpacing: '0.32em', display: 'block', mb: 2, fontSize: '0.7rem', fontWeight: 600 }}>
              NEW COLLECTION
            </Typography>
            <Typography
              variant="h1"
              sx={{
                fontFamily: 'var(--font-playfair)', color: 'white',
                fontSize: { xs: '2.4rem', sm: '3.4rem', md: '5rem' },
                lineHeight: 1.08, mb: 3, fontWeight: 700,
                maxWidth: 540,
              }}
            >
              Dress to<br />Impress
            </Typography>
            <Button
              component={Link} href="/shop"
              variant="contained"
              sx={{
                bgcolor: '#c9a84c', color: '#111',
                fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.14em',
                py: 1.6, px: 5,
                borderRadius: 0,
                '&:hover': { bgcolor: '#a8872a' },
                boxShadow: '0 4px 20px rgba(201,168,76,0.4)',
              }}
            >
              Shop Now
            </Button>
          </motion.div>
        </Container>

        {/* Decorative gold accent lines */}
        <Box sx={{ position: 'absolute', right: { xs: -60, md: 80 }, top: '50%', transform: 'translateY(-50%)', opacity: 0.06 }}>
          <Box sx={{ width: 320, height: 320, border: '1px solid #c9a84c', borderRadius: '50%' }} />
          <Box sx={{ position: 'absolute', top: 30, left: 30, width: 260, height: 260, border: '1px solid #c9a84c', borderRadius: '50%' }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: HERO_H,
        position: 'relative', overflow: 'hidden',
        '& .swiper, & .swiper-wrapper, & .swiper-slide': { height: '100%' },
        '& .swiper-pagination': { bottom: { xs: 14, md: 22 } },
        '& .swiper-pagination-bullet': {
          bgcolor: 'rgba(255,255,255,0.5)',
          width: 6, height: 6,
          transition: 'all 0.3s',
        },
        '& .swiper-pagination-bullet-active': {
          bgcolor: 'white',
          width: 22,
          borderRadius: 4,
        },
        '& .swiper-button-next, & .swiper-button-prev': {
          color: 'white',
          width: 40, height: 40,
          '&::after': { fontSize: '14px', fontWeight: 700 },
          '&:hover': { opacity: 0.75 },
        },
      }}
    >
      <Swiper
        modules={[Autoplay, Navigation, Pagination, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{ delay: 5500, disableOnInteraction: false }}
        navigation
        pagination={{ clickable: true }}
        loop={banners.length > 1}
        style={{ width: '100%', height: '100%' }}
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
              {/* Multi-stop gradient for better text legibility */}
              <Box sx={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to right, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.05) 100%)',
              }} />

              <Container maxWidth="xl" sx={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
                <Box sx={{ color: 'white', maxWidth: { xs: '85%', md: 560 } }}>
                  <motion.div initial={{ opacity: 0, x: -32 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.75 }}>
                    {banner.subtitle && (
                      <Typography variant="overline" sx={{
                        color: '#c9a84c', letterSpacing: '0.28em',
                        display: 'block', mb: 1.5,
                        fontSize: { xs: '0.62rem', md: '0.72rem' }, fontWeight: 700,
                      }}>
                        {banner.subtitle}
                      </Typography>
                    )}
                    <Typography
                      variant="h2"
                      sx={{
                        fontFamily: 'var(--font-playfair)', color: 'white',
                        fontSize: { xs: '1.8rem', sm: '2.6rem', md: '3.8rem' },
                        lineHeight: 1.1, mb: { xs: 2, md: 3 }, fontWeight: 700,
                        textShadow: '0 2px 20px rgba(0,0,0,0.3)',
                      }}
                    >
                      {banner.title}
                    </Typography>
                    {banner.ctaText && banner.link && (
                      <Button
                        component={Link} href={banner.link}
                        variant="contained"
                        sx={{
                          bgcolor: 'white', color: '#111',
                          fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.12em',
                          py: { xs: 1.2, md: 1.7 }, px: { xs: 3.5, md: 5.5 },
                          borderRadius: 0,
                          '&:hover': { bgcolor: '#c9a84c', color: '#111' },
                          transition: 'all 0.28s',
                        }}
                      >
                        {banner.ctaText}
                      </Button>
                    )}
                  </motion.div>
                </Box>
              </Container>
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
}
