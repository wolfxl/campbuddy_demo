import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Camp Buddy Admin',
  description: 'Admin access to Camp Buddy platform',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: '100vh' }}>
      {children}
    </div>
  );
}