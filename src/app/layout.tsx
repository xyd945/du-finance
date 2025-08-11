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
  title: 'du.finance - Economics & Investment Research Lab',
  description:
    'Professional economic and investment research platform. Track global economic positioning using the Merrill Lynch Investment Clock with real-time economic indicators.',
  keywords: [
    'du.finance',
    'economic research',
    'investment research',
    'merrill lynch',
    'investment clock',
    'economic indicators',
    'global markets',
    'economic analysis',
  ],
  authors: [{ name: 'du.finance' }],
  creator: 'du.finance',
  publisher: 'du.finance',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
  openGraph: {
    title: 'du.finance - Economics & Investment Research Lab',
    description: 'Professional economic and investment research platform',
    type: 'website',
    locale: 'en_US',
    siteName: 'du.finance',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'du.finance - Economics & Investment Research Lab',
    description: 'Professional economic and investment research platform',
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
