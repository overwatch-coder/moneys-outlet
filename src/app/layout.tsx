import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import '@/index.css';
import Providers from '@/components/Providers';
import { StatusOverlay } from '@/components/StatusOverlay';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Money's Outlet | Where Style Meets Value",
  description:
    "Shop the latest sneakers and apparel at Money's Outlet. Premium selection of Nike, Adidas, New Balance, and more.",
  icons: {
    icon: '/logos/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="bg-background text-white antialiased min-h-screen selection:bg-primary selection:text-white">
        <Providers>
          <StatusOverlay />
          {children}
        </Providers>
      </body>
    </html>
  );
}
