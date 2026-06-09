'use client';
import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { useAppSelector } from '../../store';
import HeroSlider from './HeroSlider';
import ProductSection from './ProductSection';
import CategoryShowcase from './CategoryShowcase';
import TestimonialsSection from './TestimonialsSection';
import { productApi } from '../../services/api.service';

function PromoStrip() {
  return (
    <Box sx={{
      bgcolor: '#f8f4ef', py: 2,
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
      gap: 2, px: { xs: 2, md: 8 }, textAlign: 'center',
    }}>
      {[
        { label: 'Free Shipping', desc: 'On orders above ₹999' },
        { label: 'Easy Returns', desc: '7-day hassle-free returns' },
        { label: 'Secure Payments', desc: 'Razorpay, UPI & COD' },
      ].map(item => (
        <Box key={item.label} sx={{ py: 1 }}>
          <Box component="span" sx={{ fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.06em', display: 'block' }}>
            {item.label}
          </Box>
          <Box component="span" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            {item.desc}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

interface ProductData {
  featured: any[];
  newArrivals: any[];
  trending: any[];
  bestSellers: any[];
}

interface Props {
  sections: any[];
  initialData: {
    heroBanners: any[];
    featured: any[];
    newArrivals: any[];
    trending: any[];
    bestSellers: any[];
    categories: any[];
    testimonials: any[];
  };
}

export default function GenderHomePage({ sections, initialData }: Props) {
  const gender = useAppSelector((s) => s.gender.selected);
  const [products, setProducts] = useState<ProductData>({
    featured: initialData.featured,
    newArrivals: initialData.newArrivals,
    trending: initialData.trending,
    bestSellers: initialData.bestSellers,
  });

  useEffect(() => {
    if (!gender) {
      setProducts({
        featured: initialData.featured,
        newArrivals: initialData.newArrivals,
        trending: initialData.trending,
        bestSellers: initialData.bestSellers,
      });
      return;
    }
    const opts = { limit: 8, gender };
    Promise.all([
      productApi.getFeatured(opts),
      productApi.getNewArrivals(opts),
      productApi.getTrending(opts),
      productApi.getBestSellers(opts),
    ]).then(([f, n, t, b]) => {
      setProducts({
        featured: (f.data as any)?.data || [],
        newArrivals: (n.data as any)?.data || [],
        trending: (t.data as any)?.data || [],
        bestSellers: (b.data as any)?.data || [],
      });
    }).catch(() => {});
  }, [gender]); // eslint-disable-line react-hooks/exhaustive-deps

  const genderLabel = gender ? ` for ${gender === 'MEN' ? 'Men' : 'Women'}` : '';

  function renderSection(section: any) {
    const title = section.title;
    const subtitle = section.subtitle;
    switch (section.type) {
      case 'HERO_SLIDER':
        return <HeroSlider key={section.id} banners={initialData.heroBanners} />;
      case 'PROMO_STRIP':
        return <PromoStrip key={section.id} />;
      case 'FEATURED_PRODUCTS':
        return (
          <ProductSection
            key={section.id}
            title={(title || 'Featured Products') + genderLabel}
            subtitle={subtitle || 'Curated For You'}
            products={products.featured}
            viewAllLink={`/shop?isFeatured=true${gender ? `&gender=${gender}` : ''}`}
          />
        );
      case 'NEW_ARRIVALS':
        return (
          <ProductSection
            key={section.id}
            title={(title || 'New Arrivals') + genderLabel}
            subtitle={subtitle || 'Fresh Drops'}
            products={products.newArrivals}
            viewAllLink={`/shop?isNewArrival=true${gender ? `&gender=${gender}` : ''}`}
          />
        );
      case 'TRENDING_PRODUCTS':
        return (
          <ProductSection
            key={section.id}
            title={(title || 'Trending Now') + genderLabel}
            subtitle={subtitle || "Everyone's Talking About"}
            products={products.trending}
            viewAllLink={`/shop?isTrending=true${gender ? `&gender=${gender}` : ''}`}
          />
        );
      case 'BEST_SELLERS':
        return (
          <ProductSection
            key={section.id}
            title={(title || 'Best Sellers') + genderLabel}
            subtitle={subtitle || 'Fan Favourites'}
            products={products.bestSellers}
            viewAllLink={`/shop?isBestSeller=true${gender ? `&gender=${gender}` : ''}`}
            bgColor="#f8f4ef"
          />
        );
      case 'CATEGORY_SHOWCASE':
        return <CategoryShowcase key={section.id} categories={initialData.categories} />;
      case 'TESTIMONIALS':
        return <TestimonialsSection key={section.id} testimonials={initialData.testimonials} />;
      default:
        return null;
    }
  }

  if (sections.length > 0) {
    return <>{sections.map(renderSection)}</>;
  }

  return (
    <>
      <HeroSlider banners={initialData.heroBanners} />
      <PromoStrip />
      <ProductSection
        title={`New Arrivals${genderLabel}`}
        subtitle="Fresh Drops"
        products={products.newArrivals}
        viewAllLink={`/shop?isNewArrival=true${gender ? `&gender=${gender}` : ''}`}
      />
      <CategoryShowcase categories={initialData.categories} />
      <ProductSection
        title={`Trending Now${genderLabel}`}
        subtitle="Everyone's Talking About"
        products={products.trending}
        viewAllLink={`/shop?isTrending=true${gender ? `&gender=${gender}` : ''}`}
      />
      <ProductSection
        title={`Best Sellers${genderLabel}`}
        subtitle="Fan Favourites"
        products={products.bestSellers}
        viewAllLink={`/shop?isBestSeller=true${gender ? `&gender=${gender}` : ''}`}
        bgColor="#f8f4ef"
      />
      <TestimonialsSection testimonials={initialData.testimonials} />
    </>
  );
}
