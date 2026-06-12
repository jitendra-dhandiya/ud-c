import type { Metadata } from 'next';
import { Box } from '@mui/material';
import GenderHomePage from '../../components/home/GenderHomePage';
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

async function getStores() {
  try {
    const res = await fetch(`${API}/stores`, { cache: 'no-store' });
    if (!res.ok) return [];
    return (await res.json()).data || [];
  } catch { return []; }
}

export default async function HomePage() {
  const [homepageData, featured, newArrivals, trending, bestSellers, categories, stores] = await Promise.all([
    getHomepageData(),
    getProducts('featured'),
    getProducts('new-arrivals'),
    getProducts('trending'),
    getProducts('best-sellers'),
    getCategories(),
    getStores(),
  ]);

  const sections: any[] = homepageData?.sections || [];
  const heroBanners: any[] = homepageData?.heroBanners || [];
  const promoBanners: any[] = homepageData?.promoBanners || [];
  const testimonials: any[] = homepageData?.testimonials || [];

  return (
    <>
      <GenderHomePage
        sections={sections}
        initialData={{ heroBanners, promoBanners, featured, newArrivals, trending, bestSellers, categories, testimonials, stores }}
      />
      <Box sx={{ display: { md: 'none' }, height: 64 }} />
    </>
  );
}
