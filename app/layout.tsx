import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import './leaflet-fixes.css';
import ConditionalLayout from '@/components/ConditionalLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CampBuddy - Plan Your Child\'s Perfect Summer',
  description: 'Search camps, build weekly schedules, and relax — we\'ve got you.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}