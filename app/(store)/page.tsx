import type { Metadata } from 'next';
import { Box } from '@mui/material';
import HeroSlider from '../../components/home/HeroSlider';
import ProductSection from '../../components/home/ProductSection';
import CategoryShowcase from '../../components/home/CategoryShowcase';
import TestimonialsSection from '../../components/home/TestimonialsSection';
import { API_URL, SITE_NAME } from '../../constants';

export const metadata: Metadata = {
  title: `${SITE_NAME} — Premium Fashion & Lifestyle`,
  description: 'Discover the latest trends in fashion. Shop premium clothing, co-ord sets, dresses, and streetwear at the best prices.',
};

const API = API_URL || 'http://localhost:5000/api/v1';

async function getHomepageData() {
  try {
    const res = await fetch(`${API}/homepage/data`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch { return null; }
}

async function getProducts(type: string) {
  try {
    const res = await fetch(`${API}/products/${type}?limit=8`, { cache: 'no-store' });
    if (!res.ok) return [];
    return (await res.json()).data || [];
  } catch { return []; }
}

async function getCategories() {
  try {
    const res = await fetch(`${API}/categories/featured`, { cache: 'no-store' });
    if (!res.ok) return [];
    return (await res.json()).data || [];
  } catch { return []; }
}

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

interface SectionData {
  heroBanners: any[];
  featured: any[];
  newArrivals: any[];
  trending: any[];
  bestSellers: any[];
  categories: any[];
  testimonials: any[];
}

function renderSection(section: any, data: SectionData) {
  const title = section.title;
  const subtitle = section.subtitle;

  switch (section.type) {
    case 'HERO_SLIDER':
      return <HeroSlider key={section.id} banners={data.heroBanners} />;
    case 'PROMO_STRIP':
      return <PromoStrip key={section.id} />;
    case 'FEATURED_PRODUCTS':
      return <ProductSection key={section.id} title={title || 'Featured Products'} subtitle={subtitle || 'Curated For You'} products={data.featured} viewAllLink="/shop?isFeatured=true" />;
    case 'NEW_ARRIVALS':
      return <ProductSection key={section.id} title={title || 'New Arrivals'} subtitle={subtitle || 'Fresh Drops'} products={data.newArrivals} viewAllLink="/shop?isNewArrival=true" />;
    case 'TRENDING_PRODUCTS':
      return <ProductSection key={section.id} title={title || 'Trending Now'} subtitle={subtitle || "Everyone's Talking About"} products={data.trending} viewAllLink="/shop?isTrending=true" />;
    case 'BEST_SELLERS':
      return <ProductSection key={section.id} title={title || 'Best Sellers'} subtitle={subtitle || 'Fan Favourites'} products={data.bestSellers} viewAllLink="/shop?isBestSeller=true" bgColor="#f8f4ef" />;
    case 'CATEGORY_SHOWCASE':
      return <CategoryShowcase key={section.id} categories={data.categories} />;
    case 'TESTIMONIALS':
      return <TestimonialsSection key={section.id} testimonials={data.testimonials} />;
    default:
      return null;
  }
}

export default async function HomePage() {
  const [homepageData, featured, newArrivals, trending, bestSellers, categories] = await Promise.all([
    getHomepageData(),
    getProducts('featured'),
    getProducts('new-arrivals'),
    getProducts('trending'),
    getProducts('best-sellers'),
    getCategories(),
  ]);

  const sections: any[] = homepageData?.sections || [];
  const heroBanners: any[] = homepageData?.heroBanners || [];
  const testimonials: any[] = homepageData?.testimonials || [];

  const sectionData: SectionData = {
    heroBanners, featured, newArrivals, trending, bestSellers, categories, testimonials,
  };

  if (sections.length > 0) {
    return (
      <>
        {sections.map(section => renderSection(section, sectionData))}
        <Box sx={{ display: { md: 'none' }, height: 64 }} />
      </>
    );
  }

  // Fallback when no sections are seeded
  return (
    <>
      <HeroSlider banners={heroBanners} />
      <PromoStrip />
      <ProductSection title="New Arrivals" subtitle="Fresh Drops" products={newArrivals} viewAllLink="/shop?isNewArrival=true" />
      <CategoryShowcase categories={categories} />
      <ProductSection title="Trending Now" subtitle="Everyone's Talking About" products={trending} viewAllLink="/shop?isTrending=true" />
      <ProductSection title="Best Sellers" subtitle="Fan Favourites" products={bestSellers} viewAllLink="/shop?isBestSeller=true" bgColor="#f8f4ef" />
      <TestimonialsSection testimonials={testimonials} />
      <Box sx={{ display: { md: 'none' }, height: 64 }} />
    </>
  );
}
