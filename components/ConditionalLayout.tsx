"use client";
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

const ConditionalLayout: React.FC<ConditionalLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isLoginRoute = pathname?.startsWith('/login');
  const isProviderRoute = pathname?.startsWith('/provider');
  const isChatRoute = pathname?.startsWith('/chat');
  const showHeaderFooter = !isAdminRoute && !isLoginRoute && !isProviderRoute && !isChatRoute;

  if (showHeaderFooter) {
    return (
      <>
        <Header />
        <main className="main-content">
          {children}
        </main>
        <Footer />
      </>
    );
  }

  return (
    <main style={{ minHeight: '100vh' }}>
      {children}
    </main>
  );
};

export default ConditionalLayout;