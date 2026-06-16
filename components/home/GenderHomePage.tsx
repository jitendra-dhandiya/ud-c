'use client';
import { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { useAppSelector } from '../../store';
import HeroSlider from './HeroSlider';
import ProductSection from './ProductSection';
import ShopLatestSection from './ShopLatestSection';
import CollectionBanners from './CollectionBanners';
import CategoryShowcase from './CategoryShowcase';
import TestimonialsSection from './TestimonialsSection';
import PromoBanners from './PromoBanners';
import StoreLocations from './StoreLocations';
import { productApi, bannerApi } from '../../services/api.service';

// ── Promo strip ────────────────────────────────────────────────
function PromoStrip() {
  const ITEMS = [
    { label: 'Free Shipping', desc: 'On orders above ₹999' },
    { label: 'Easy Returns', desc: '7-day hassle-free returns' },
    { label: 'Secure Payments', desc: 'Razorpay · UPI · COD' },
  ];
  return (
    <Box sx={{
      bgcolor: '#fff',
      borderTop: '1px solid #f0f0f0',
      borderBottom: '1px solid #f0f0f0',
      py: { xs: 2.5, md: 3 },
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
      gap: 1,
      px: { xs: 3, md: 8 },
      textAlign: 'center',
    }}>
      {ITEMS.map((item) => (
        <Box key={item.label} sx={{ py: 0.5 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', mb: 0.25, color: '#111' }}>
            {item.label}
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: '#777' }}>
            {item.desc}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

// ── Types ──────────────────────────────────────────────────────
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
    promoBanners: any[];
    featured: any[];
    newArrivals: any[];
    trending: any[];
    bestSellers: any[];
    categories: any[];
    testimonials: any[];
    stores: any[];
  };
}

// ── Main component ─────────────────────────────────────────────
export default function GenderHomePage({ sections, initialData }: Props) {
  const gender = useAppSelector((s) => s.gender.selected);

  // Prevent SSR/client mismatch: server always renders WOMEN; client updates after mount
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => { setHasMounted(true); }, []);
  const displayGender = hasMounted ? gender : 'WOMEN';

  const [products, setProducts] = useState<ProductData>({
    featured: initialData.featured,
    newArrivals: initialData.newArrivals,
    trending: initialData.trending,
    bestSellers: initialData.bestSellers,
  });
  const [heroBanners, setHeroBanners] = useState<any[]>(initialData.heroBanners);
  const [promoBanners, setPromoBanners] = useState<any[]>(initialData.promoBanners);
  // Dim sections while re-fetching for the new gender
  const [fetching, setFetching] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setFetching(true);
    const opts = { limit: 10, gender };

    Promise.all([
      bannerApi.getByType('hero', gender),
      bannerApi.getByType('promotional', gender),
      productApi.getFeatured(opts),
      productApi.getNewArrivals(opts),
      productApi.getTrending(opts),
      productApi.getBestSellers(opts),
    ]).then(([bRes, promoRes, f, n, t, b]) => {
      if (controller.signal.aborted) return;
      setHeroBanners((bRes.data as any)?.data || []);
      setPromoBanners((promoRes.data as any)?.data || []);
      setProducts({
        featured: (f.data as any)?.data || [],
        newArrivals: (n.data as any)?.data || [],
        trending: (t.data as any)?.data || [],
        bestSellers: (b.data as any)?.data || [],
      });
    }).catch(() => {
      // Keep existing content on error
    }).finally(() => {
      if (!controller.signal.aborted) setFetching(false);
    });

    return () => { controller.abort(); };
  }, [gender]); // eslint-disable-line react-hooks/exhaustive-deps

  const genderLabel = displayGender === 'MEN' ? ' for Men' : ' for Women';

  // ── Dynamic section renderer (when admin configures sections) ─
  function renderSection(section: any) {
    const { type, title, subtitle } = section;
    switch (type) {
      case 'HERO_SLIDER':
        return <HeroSlider key={section.id} banners={heroBanners} />;
      case 'PROMO_STRIP':
        return <PromoStrip key={section.id} />;
      case 'SHOP_LATEST':
        return (
          <ShopLatestSection
            key={section.id}
            gender={displayGender}
            fetching={fetching}
            {...products}
          />
        );
      case 'COLLECTION_BANNERS':
      case 'COLLECTION_BANNER':
      case 'COLLECTION_SHOWCASE':
        return (
          <CollectionBanners
            key={section.id}
            categories={initialData.categories}
            gender={displayGender}
            title={title}
          />
        );
      case 'FEATURED_PRODUCTS':
        return (
          <Box key={section.id} sx={{ opacity: fetching ? 0.5 : 1, transition: 'opacity 0.25s' }}>
            <ProductSection
              title={(title || 'Featured Products') + genderLabel}
              subtitle={subtitle || 'Curated for You'}
              products={products.featured}
              viewAllLink={`/shop?isFeatured=true&gender=${displayGender}`}
            />
          </Box>
        );
      case 'NEW_ARRIVALS':
        return (
          <Box key={section.id} sx={{ opacity: fetching ? 0.5 : 1, transition: 'opacity 0.25s' }}>
            <ProductSection
              title={(title || 'New Arrivals') + genderLabel}
              subtitle={subtitle || 'Fresh Drops'}
              products={products.newArrivals}
              viewAllLink={`/shop?isNewArrival=true&gender=${displayGender}`}
            />
          </Box>
        );
      case 'TRENDING_PRODUCTS':
        return (
          <Box key={section.id} sx={{ opacity: fetching ? 0.5 : 1, transition: 'opacity 0.25s' }}>
            <ProductSection
              title={(title || 'Trending Now') + genderLabel}
              subtitle={subtitle || "Everyone's Talking About"}
              products={products.trending}
              viewAllLink={`/shop?isTrending=true&gender=${displayGender}`}
            />
          </Box>
        );
      case 'BEST_SELLERS':
        return (
          <Box key={section.id} sx={{ opacity: fetching ? 0.5 : 1, transition: 'opacity 0.25s' }}>
            <ProductSection
              title={(title || 'Best Sellers') + genderLabel}
              subtitle={subtitle || 'Fan Favourites'}
              products={products.bestSellers}
              viewAllLink={`/shop?isBestSeller=true&gender=${displayGender}`}
              bgColor="#f8f4ef"
            />
          </Box>
        );
      case 'FEATURED_CATEGORIES':
      case 'CATEGORY_SHOWCASE':
        return <CategoryShowcase key={section.id} initialCategories={initialData.categories} />;
      case 'PROMOTIONAL_BANNERS':
      case 'CUSTOM_BANNER':
        return <PromoBanners key={section.id} banners={promoBanners} title={title} />;
      case 'TESTIMONIALS':
        return <TestimonialsSection key={section.id} testimonials={initialData.testimonials} />;
      case 'STORE_LOCATOR':
        return <StoreLocations key={section.id} stores={initialData.stores} title={title} subtitle={section.subtitle} />;
      default:
        return null;
    }
  }

  // ── If admin has configured sections, render them ──────────────
  if (sections.length > 0) {
    return <>{sections.map(renderSection)}</>;
  }

  // ── Default layout (Off Duty–inspired, premium feel) ──────────
  return (
    <>
      {/* 1. Hero */}
      <HeroSlider banners={heroBanners} />

      {/* 2. Trust strip */}
      <PromoStrip />

      {/* 3. Shop the Latest — filter tabs + product grid */}
      <ShopLatestSection
        gender={displayGender}
        fetching={fetching}
        {...products}
      />

      {/* 4. Collection banners — horizontal scroll editorial cards */}
      <CollectionBanners
        categories={initialData.categories}
        gender={displayGender}
      />

      {/* 5. New Arrivals carousel */}
      <Box sx={{ opacity: fetching ? 0.5 : 1, transition: 'opacity 0.25s' }}>
        <ProductSection
          title={`New Arrivals${genderLabel}`}
          subtitle="Fresh Drops"
          products={products.newArrivals}
          viewAllLink={`/shop?isNewArrival=true&gender=${displayGender}`}
        />
      </Box>

      {/* 6. Trending carousel */}
      <Box sx={{ opacity: fetching ? 0.5 : 1, transition: 'opacity 0.25s' }}>
        <ProductSection
          title={`Trending Now${genderLabel}`}
          subtitle="Everyone's Talking About"
          products={products.trending}
          viewAllLink={`/shop?isTrending=true&gender=${displayGender}`}
          bgColor="#fafafa"
        />
      </Box>

      {/* 7. Category grid */}
      <CategoryShowcase initialCategories={initialData.categories} />

      {/* 8. Best Sellers carousel */}
      <Box sx={{ opacity: fetching ? 0.5 : 1, transition: 'opacity 0.25s' }}>
        <ProductSection
          title={`Best Sellers${genderLabel}`}
          subtitle="Fan Favourites"
          products={products.bestSellers}
          viewAllLink={`/shop?isBestSeller=true&gender=${displayGender}`}
          bgColor="#f5f0e8"
        />
      </Box>

      {/* 9. Social proof */}
      <TestimonialsSection testimonials={initialData.testimonials} />
    </>
  );
}
