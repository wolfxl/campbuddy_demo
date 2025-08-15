"use client";
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ProviderLayout from '@/components/provider/ProviderLayout';

export default function ProviderRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Don't apply authentication logic to the login page
  const isLoginPage = pathname === '/provider/login';

  useEffect(() => {
    if (isLoginPage) {
      // If it's the login page, don't check authentication
      setIsAuthenticated(false);
      return;
    }

    // Check authentication for other pages
    const token = localStorage.getItem('provider_token');
    if (token === 'provider_authenticated') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      router.push('/provider/login');
    }
  }, [router, isLoginPage]);

  // For login page, render directly without layout
  if (isLoginPage) {
    return children;
  }

  // Show loading or nothing while checking auth
  if (isAuthenticated === null) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#6b7280'
      }}>
        Loading...
      </div>
    );
  }

  // If not authenticated, don't render anything (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <ProviderLayout>
      {children}
    </ProviderLayout>
  );
}