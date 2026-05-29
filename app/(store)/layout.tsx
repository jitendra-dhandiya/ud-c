import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import CartDrawer from '../../components/cart/CartDrawer';
import MobileBottomNav from '../../components/layout/MobileBottomNav';
import AuthInitializer from '../../components/common/AuthInitializer';

async function getPublicSettings(): Promise<Record<string, string>> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const res = await fetch(`${apiUrl}/settings/public`, { cache: 'no-store' });
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
      <Navbar settings={settings} />
      <main style={{ minHeight: '70vh' }}>{children}</main>
      <Footer settings={settings} />
      <CartDrawer />
      <MobileBottomNav />
    </>
  );
}
