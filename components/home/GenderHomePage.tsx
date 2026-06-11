'use client';
<<<<<<< HEAD
import { useState, useEffect, useRef } from 'react';
=======
import { useState, useEffect } from 'react';
>>>>>>> 229fe5e6cb635d434839f462a2ae52b8a641a654
import { Box } from '@mui/material';
import { useAppSelector } from '../../store';
import HeroSlider from './HeroSlider';
import ProductSection from './ProductSection';
import CategoryShowcase from './CategoryShowcase';
import TestimonialsSection from './TestimonialsSection';
<<<<<<< HEAD
import { productApi, bannerApi } from '../../services/api.service';
=======
import { productApi } from '../../services/api.service';
>>>>>>> 229fe5e6cb635d434839f462a2ae52b8a641a654

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
<<<<<<< HEAD
  const [heroBanners, setHeroBanners] = useState<any[]>(initialData.heroBanners);
  // Dim product sections while re-fetching to signal a refresh without clearing content
  const [fetching, setFetching] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Cancel any in-flight request from the previous render
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setFetching(true);
    const opts = { limit: 8, gender };

    Promise.all([
      bannerApi.getByType('hero', gender),
=======

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
>>>>>>> 229fe5e6cb635d434839f462a2ae52b8a641a654
      productApi.getFeatured(opts),
      productApi.getNewArrivals(opts),
      productApi.getTrending(opts),
      productApi.getBestSellers(opts),
<<<<<<< HEAD
    ]).then(([bRes, f, n, t, b]) => {
      if (controller.signal.aborted) return;
      setHeroBanners((bRes.data as any)?.data || []);
=======
    ]).then(([f, n, t, b]) => {
>>>>>>> 229fe5e6cb635d434839f462a2ae52b8a641a654
      setProducts({
        featured: (f.data as any)?.data || [],
        newArrivals: (n.data as any)?.data || [],
        trending: (t.data as any)?.data || [],
        bestSellers: (b.data as any)?.data || [],
      });
<<<<<<< HEAD
    }).catch(() => {
      // Keep existing content on error
    }).finally(() => {
      if (!controller.signal.aborted) setFetching(false);
    });

    return () => { controller.abort(); };
  }, [gender]); // eslint-disable-line react-hooks/exhaustive-deps

  const genderLabel = gender === 'MEN' ? ' for Men' : ' for Women';

  // Wrapper that dims product sections while a fetch is in progress
  function FetchWrapper({ children }: { children: React.ReactNode }) {
    return (
      <Box sx={{ transition: 'opacity 0.25s ease', opacity: fetching ? 0.55 : 1 }}>
        {children}
      </Box>
    );
  }
=======
    }).catch(() => {});
  }, [gender]); // eslint-disable-line react-hooks/exhaustive-deps

  const genderLabel = gender ? ` for ${gender === 'MEN' ? 'Men' : 'Women'}` : '';
>>>>>>> 229fe5e6cb635d434839f462a2ae52b8a641a654

  function renderSection(section: any) {
    const title = section.title;
    const subtitle = section.subtitle;
    switch (section.type) {
      case 'HERO_SLIDER':
<<<<<<< HEAD
        return <HeroSlider key={section.id} banners={heroBanners} />;
=======
        return <HeroSlider key={section.id} banners={initialData.heroBanners} />;
>>>>>>> 229fe5e6cb635d434839f462a2ae52b8a641a654
      case 'PROMO_STRIP':
        return <PromoStrip key={section.id} />;
      case 'FEATURED_PRODUCTS':
        return (
<<<<<<< HEAD
          <FetchWrapper key={section.id}>
            <ProductSection
              title={(title || 'Featured Products') + genderLabel}
              subtitle={subtitle || 'Curated For You'}
              products={products.featured}
              viewAllLink={`/shop?isFeatured=true&gender=${gender}`}
            />
          </FetchWrapper>
        );
      case 'NEW_ARRIVALS':
        return (
          <FetchWrapper key={section.id}>
            <ProductSection
              title={(title || 'New Arrivals') + genderLabel}
              subtitle={subtitle || 'Fresh Drops'}
              products={products.newArrivals}
              viewAllLink={`/shop?isNewArrival=true&gender=${gender}`}
            />
          </FetchWrapper>
        );
      case 'TRENDING_PRODUCTS':
        return (
          <FetchWrapper key={section.id}>
            <ProductSection
              title={(title || 'Trending Now') + genderLabel}
              subtitle={subtitle || "Everyone's Talking About"}
              products={products.trending}
              viewAllLink={`/shop?isTrending=true&gender=${gender}`}
            />
          </FetchWrapper>
        );
      case 'BEST_SELLERS':
        return (
          <FetchWrapper key={section.id}>
            <ProductSection
              title={(title || 'Best Sellers') + genderLabel}
              subtitle={subtitle || 'Fan Favourites'}
              products={products.bestSellers}
              viewAllLink={`/shop?isBestSeller=true&gender=${gender}`}
              bgColor="#f8f4ef"
            />
          </FetchWrapper>
=======
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
>>>>>>> 229fe5e6cb635d434839f462a2ae52b8a641a654
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
<<<<<<< HEAD
      <HeroSlider banners={heroBanners} />
      <PromoStrip />
      <FetchWrapper>
        <ProductSection
          title={`New Arrivals${genderLabel}`}
          subtitle="Fresh Drops"
          products={products.newArrivals}
          viewAllLink={`/shop?isNewArrival=true&gender=${gender}`}
        />
      </FetchWrapper>
      <CategoryShowcase categories={initialData.categories} />
      <FetchWrapper>
        <ProductSection
          title={`Trending Now${genderLabel}`}
          subtitle="Everyone's Talking About"
          products={products.trending}
          viewAllLink={`/shop?isTrending=true&gender=${gender}`}
        />
      </FetchWrapper>
      <FetchWrapper>
        <ProductSection
          title={`Best Sellers${genderLabel}`}
          subtitle="Fan Favourites"
          products={products.bestSellers}
          viewAllLink={`/shop?isBestSeller=true&gender=${gender}`}
          bgColor="#f8f4ef"
        />
      </FetchWrapper>
=======
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
>>>>>>> 229fe5e6cb635d434839f462a2ae52b8a641a654
      <TestimonialsSection testimonials={initialData.testimonials} />
    </>
  );
}
