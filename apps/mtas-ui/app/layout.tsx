'use client';
import type React from 'react';
import { Inter } from 'next/font/google';
import { QueryProvider } from '@/lib/query-provider';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';
import { useGetAuthenticatedClient } from '@/hooks/use-auth-queries';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] });
// Try redirecting to login on 401 error
const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const path = usePathname();
  const router = useRouter();
  const { data: clientData, isFetched } = useGetAuthenticatedClient();

  useEffect(() => {
    const isPublicPath = ['/', '/client/login', '/user/login'].includes(path);

    if (isFetched && !clientData && !isPublicPath) {
      router.push('/');
    }
  }, [isFetched, clientData, path, router]);

  return children;
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-800`}>
        <QueryProvider>
          <AuthGate>
            <main className="min-h-screen flex flex-col">{children}</main>
            <Toaster />
          </AuthGate>
        </QueryProvider>
      </body>
    </html>
  );
}
