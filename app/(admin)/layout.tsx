import AdminLayoutClient from '../../components/admin/AdminLayoutClient';
import AuthInitializer from '../../components/common/AuthInitializer';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthInitializer />
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </>
  );
}
