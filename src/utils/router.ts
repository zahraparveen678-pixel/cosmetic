import type { AppRoute } from '../types/shop';

export function parseRoute(pathname: string): AppRoute {
  const clean = pathname.replace(/\/+$/, '') || '/';

  if (clean === '/' || clean === '/home') return { page: 'home' };
  if (clean === '/shop') return { page: 'shop' };
  if (clean === '/makeup') return { page: 'makeup' };
  if (clean === '/skincare') return { page: 'skincare' };
  if (clean === '/lipsticks') return { page: 'lipsticks' };
  if (clean === '/perfumes') return { page: 'perfumes' };
  if (clean === '/new-arrivals') return { page: 'new-arrivals' };
  if (clean === '/best-sellers') return { page: 'best-sellers' };
  if (clean === '/cart') return { page: 'cart' };
  if (clean === '/checkout') return { page: 'checkout' };
  if (clean === '/orders') return { page: 'orders' };
  if (clean === '/about') return { page: 'about' };
  if (clean === '/contact') return { page: 'contact' };
  if (clean === '/wishlist') return { page: 'wishlist' };
  if (clean === '/gallery') return { page: 'gallery' };
  if (clean === '/privacy-policy') return { page: 'privacy-policy' };
  if (clean === '/terms') return { page: 'terms' };

  if (clean.startsWith('/product/')) {
    const productId = decodeURIComponent(clean.slice('/product/'.length));
    if (productId) {
      return { page: 'product', productId };
    }
  }

  return { page: 'home' };
}

export function getQueryCategory(search: string): string | null {
  const params = new URLSearchParams(search);
  return params.get('category');
}

export function getQuerySearch(search: string): string {
  const params = new URLSearchParams(search);
  return params.get('q') ?? '';
}
