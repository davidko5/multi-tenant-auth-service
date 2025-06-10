import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PRIVATE_ROUTE_PREFIXES = ['client/dashboard', 'user/dashboard'];

export function isPrivate(pathname: string) {
  return PRIVATE_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
