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

// Fixed hero resolution: 1440 × 560
const HERO_HEIGHTS = { xs: 220, sm: 320, md: 480, lg: 560 };

interface HeroSliderProps {
  banners: Banner[];
}

export default function HeroSlider({ banners }: HeroSliderProps) {
  if (!banners.length) {
    return (
      <Box sx={{ height: HERO_HEIGHTS, bgcolor: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ textAlign: 'center', color: 'white', zIndex: 2, position: 'relative' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}>
            <Typography variant="overline" sx={{ color: '#c9a84c', letterSpacing: '0.3em', display: 'block', mb: 2 }}>
              NEW COLLECTION
            </Typography>
            <Typography variant="h1" sx={{ fontFamily: 'var(--font-playfair)', color: 'white', fontSize: { xs: '2rem', md: '4rem' }, lineHeight: 1.1, mb: 3 }}>
              Dress to<br />Impress
            </Typography>
            <Button component={Link} href="/shop" variant="contained"
              sx={{ bgcolor: '#c9a84c', color: 'white', '&:hover': { bgcolor: '#a07c20' }, py: 1.5, px: 5, fontSize: '0.8rem', letterSpacing: '0.15em' }}>
              Shop Now
            </Button>
          </motion.div>
        </Box>
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0d0d0d 0%, #2c2c2c 100%)' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: HERO_HEIGHTS,
        position: 'relative',
        overflow: 'hidden',
        '& .swiper, & .swiper-wrapper, & .swiper-slide': { height: '100%' },
        '& .swiper-pagination-bullet-active': { bgcolor: 'white' },
        '& .swiper-button-next, & .swiper-button-prev': { color: 'white' },
      }}
    >
      <Swiper
        modules={[Autoplay, Navigation, Pagination, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        navigation
        pagination={{ clickable: true }}
        loop={banners.length > 1}
        style={{ width: '100%', height: '100%' }}
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
              {/* Background image */}
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
              {/* Overlay */}
              <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.08) 65%)' }} />

              {/* Content */}
              <Container maxWidth="xl" sx={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
                <Box sx={{ color: 'white', maxWidth: 520 }}>
                  <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
                    <Typography variant="overline" sx={{ color: '#c9a84c', letterSpacing: '0.25em', display: 'block', mb: 1, fontWeight: 600 }}>
                      {banner.subtitle || 'NEW ARRIVALS'}
                    </Typography>
                    <Typography variant="h2" sx={{
                      fontFamily: 'var(--font-playfair)', color: 'white',
                      fontSize: { xs: '1.6rem', sm: '2.4rem', md: '3.5rem' },
                      lineHeight: 1.15, mb: 2, fontWeight: 700,
                    }}>
                      {banner.title}
                    </Typography>
                    {banner.ctaText && banner.link && (
                      <Button
                        component={Link}
                        href={banner.link}
                        variant="contained"
                        sx={{
                          bgcolor: 'white', color: '#1a1a1a',
                          '&:hover': { bgcolor: '#c9a84c', color: 'white' },
                          py: { xs: 1, md: 1.5 }, px: { xs: 3, md: 5 },
                          fontSize: '0.78rem', letterSpacing: '0.15em', fontWeight: 700,
                          transition: 'all 0.3s',
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
