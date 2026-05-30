import type { MetadataRoute } from 'next';
import { API_URL, SITE_URL } from '../constants';

async function getProducts() {
  try {
    const apiUrl = API_URL || 'http://localhost:5000/api/v1';
    const res = await fetch(`${apiUrl}/products?limit=500&page=1`, { next: { revalidate: 3600 } });
    const json = await res.json();
    return json.data || [];
  } catch { return []; }
}

async function getCategories() {
  try {
    const apiUrl = API_URL || 'http://localhost:5000/api/v1';
    const res = await fetch(`${apiUrl}/categories`, { next: { revalidate: 3600 } });
    const json = await res.json();
    return json.data || [];
  } catch { return []; }
}

async function getBlogs() {
  try {
    const apiUrl = API_URL || 'http://localhost:5000/api/v1';
    const res = await fetch(`${apiUrl}/blogs?limit=100`, { next: { revalidate: 3600 } });
    const json = await res.json();
    return json.data || [];
  } catch { return []; }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, blogs] = await Promise.all([getProducts(), getCategories(), getBlogs()]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/shop`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((p: any) => ({
    url: `${SITE_URL}/product/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((c: any) => ({
    url: `${SITE_URL}/category/${c.slug}`,
    lastModified: new Date(c.updatedAt),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  const blogPages: MetadataRoute.Sitemap = blogs.map((b: any) => ({
    url: `${SITE_URL}/blog/${b.slug}`,
    lastModified: new Date(b.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...categoryPages, ...blogPages];
}
