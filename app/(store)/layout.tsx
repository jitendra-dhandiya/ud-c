import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CartDrawer from '../../components/cart/CartDrawer';
import MobileBottomNav from '../../components/layout/MobileBottomNav';
import AuthInitializer from '../../components/common/AuthInitializer';
import GenderInitializer from '../../components/common/GenderInitializer';
import LoginModal from '../../components/auth/LoginModal';

const API = process.env.BACKEND_URL || 'http://localhost:5000';

async function getPublicSettings(): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${API}/api/v1/settings/public`, { cache: 'no-store' });
    if (!res.ok) return {};
    const json = await res.json();
    return json.data || {};
  } catch {
    return {};
  }
}

async function getNavCategories() {
  try {
    const res = await fetch(`${API}/api/v1/categories/nav-menu`, {
      next: { revalidate: 60 }, // re-fetch at most every 60 s
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, navCategories] = await Promise.all([
    getPublicSettings(),
    getNavCategories(),
  ]);

  return (
    <>
      <AuthInitializer />
      <GenderInitializer />
      <Navbar settings={settings} navCategories={navCategories} />
      <main style={{ minHeight: '70vh' }}>{children}</main>
      <Footer settings={settings} />
      <CartDrawer />
      <MobileBottomNav />
      <LoginModal />
    </>
  );
}
