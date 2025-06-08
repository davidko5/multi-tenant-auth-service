'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  useClientLogout,
  useGetAuthenticatedClient,
} from '@/hooks/use-auth-queries';
import { useRouter } from 'next/navigation';

export function Header() {
  const { data: client } = useGetAuthenticatedClient();
  const { mutate: logout } = useClientLogout();
  const router = useRouter();

  return (
    <header className="border-b border-gray-100 px-5">
      <div className=" flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-medium text-gray-700">
            Auth Portal
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {client ? (
            <>
              <Button
                variant="ghost"
                className="font-medium text-lg text-gray-500 px-2"
                onClick={() => router.push('/client/dashboard')}
              >
                {client.email}
              </Button>
              <Button
                variant="outline"
                className="font-medium text-md border-gray-500 border-2"
                onClick={() => logout()}
              >
                Logout
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
