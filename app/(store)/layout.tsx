import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CartDrawer from '../../components/cart/CartDrawer';
import MobileBottomNav from '../../components/layout/MobileBottomNav';
import AuthInitializer from '../../components/common/AuthInitializer';
import GenderInitializer from '../../components/common/GenderInitializer';
import { API_URL } from '@/constants';

async function getPublicSettings(): Promise<Record<string, string>> {
  try {
    const apiUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const res = await fetch(`${apiUrl}/api/v1/settings/public`, { cache: 'no-store' });
    if (!res.ok) return {};
    const json = await res.json();
    return json.data || {};
  } catch {
    return {};
  }
}

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const settings = await getPublicSettings();

  return (
    <>
      <AuthInitializer />
      <GenderInitializer />
      <Navbar settings={settings} />
      <main style={{ minHeight: '70vh' }}>{children}</main>
      <Footer settings={settings} />
      <CartDrawer />
      <MobileBottomNav />
    </>
  );
}
