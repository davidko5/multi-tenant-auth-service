'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  useClientLogout,
  useGetAuthenticatedClient,
} from '@/hooks/use-auth-queries';
import { isPrivate } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';

export function Header() {
  const router = useRouter();
  const path = usePathname();

  const { data: client } = useGetAuthenticatedClient(
    isPrivate(path),
  );
  const { mutate: logout } = useClientLogout();

  return (
    <header className="absolute top-0 w-full bg-white border-b border-gray-100 px-5">
      <div className=" flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/#form" className="font-medium text-gray-700">
            M T A S
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
