import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Global Investment Clock - Real-time Economic Positioning',
  description:
    'Track global economic positioning using the Merrill Lynch Investment Clock. Monitor growth and inflation trends across countries with real-time economic indicators.',
  keywords: [
    'investment',
    'economics',
    'merrill lynch',
    'investment clock',
    'economic indicators',
    'global markets',
  ],
  authors: [{ name: 'DU Finance' }],
  creator: 'DU Finance',
  publisher: 'DU Finance',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
  openGraph: {
    title: 'Global Investment Clock',
    description: 'Real-time economic positioning across global markets',
    type: 'website',
    locale: 'en_US',
    siteName: 'Global Investment Clock',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Global Investment Clock',
    description: 'Real-time economic positioning across global markets',
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
