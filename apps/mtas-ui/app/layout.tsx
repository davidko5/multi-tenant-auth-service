import type React from 'react';
import { Inter } from 'next/font/google';
import { QueryProvider } from '@/lib/query-provider';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';
import { Header } from '@/components/header';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scrollbar-hide">
      <body className={`${inter.className} bg-white text-gray-800`}>
        <QueryProvider>
          <Header />
          <main className="min-h-screen flex flex-col">{children}</main>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
