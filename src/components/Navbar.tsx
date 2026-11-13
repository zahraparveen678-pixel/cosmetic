import { Heart, Menu, Search, ShoppingBag, X } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import type { AppRoute } from '../types/shop';

interface NavbarProps {
  currentRoute: AppRoute;
  cartCount: number;
  wishlistCount: number;
  onNavigate: (path: string) => void;
  onOpenQuickBag: () => void;
}

const PRIMARY_NAV = [
  { label: 'Shop All', path: '/shop', page: 'shop' },
  { label: 'Makeup', path: '/makeup', page: 'makeup' },
  { label: 'Skincare', path: '/skincare', page: 'skincare' },
  { label: 'Lipsticks', path: '/lipsticks', page: 'lipsticks' },
  { label: 'Perfumes', path: '/perfumes', page: 'perfumes' },
  { label: 'Gallery', path: '/gallery', page: 'gallery' },
];

const MOBILE_ALL_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Shop All (99 Products)', path: '/shop' },
  { label: 'Makeup Collection', path: '/makeup' },
  { label: 'Skincare Collection', path: '/skincare' },
  { label: 'Lipstick Collection', path: '/lipsticks' },
  { label: 'Perfume Collection', path: '/perfumes' },
  { label: 'New Arrivals', path: '/new-arrivals' },
  { label: 'Best Sellers', path: '/best-sellers' },
  { label: 'Beauty Gallery', path: '/gallery' },
  { label: 'Wishlist', path: '/wishlist' },
  { label: 'Shopping Cart', path: '/cart' },
  { label: 'My Orders', path: '/orders' },
  { label: 'About Us', path: '/about' },
  { label: 'Contact Us', path: '/contact' },
];

export function Navbar({
  currentRoute,
  cartCount,
  wishlistCount,
  onNavigate,
  onOpenQuickBag,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  const handleLinkClick = (path: string) => {
    setMobileOpen(false);
    setSearchOpen(false);
    onNavigate(path);
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = searchText.trim();
    setSearchOpen(false);
    setMobileOpen(false);
    onNavigate(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#6C3650] bg-[#51243A] text-[#FFFDF9] shadow-md">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-4 px-4 sm:px-6 lg:gap-8 lg:px-8">
        {/* Brand Wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('/');
          }}
          className="flex shrink-0 items-center gap-2.5 whitespace-nowrap font-display text-2xl font-semibold tracking-wide text-[#FFFDF9] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C6A15B]"
        >
          <svg
            className="h-5 w-5 text-[#C6A15B]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
          >
            <path d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z" />
          </svg>
          <span>Vespera</span>
        </a>

        {/* Desktop Primary Links */}
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main navigation">
          {PRIMARY_NAV.map((item) => {
            const active = currentRoute.page === item.page;
            return (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(item.path);
                }}
                className={`shrink-0 whitespace-nowrap text-sm font-medium transition-colors duration-150 ${
                  active
                    ? 'text-[#C6A15B] underline decoration-[#C6A15B] underline-offset-8'
                    : 'text-[#F6E8EE] hover:text-[#C6A15B]'
                }`}
              >
                {item.label}
              </a>
            );
          })}
          <a
            href="/orders"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('/orders');
            }}
            className={`shrink-0 whitespace-nowrap text-sm font-medium transition-colors duration-150 ${
              currentRoute.page === 'orders'
                ? 'text-[#C6A15B] underline decoration-[#C6A15B] underline-offset-8'
                : 'text-[#F6E8EE] hover:text-[#C6A15B]'
            }`}
          >
            My Orders
          </a>
        </nav>

        {/* Action Controls */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setSearchOpen((prev) => !prev)}
            aria-label="Toggle product search"
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-[#723B56] text-[#FFFDF9] transition-colors hover:border-[#C6A15B] hover:text-[#C6A15B]"
          >
            <Search className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => handleLinkClick('/wishlist')}
            aria-label={`Wishlist (${wishlistCount} saved)`}
            className="relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-[#723B56] text-[#FFFDF9] transition-colors hover:border-[#C6A15B] hover:text-[#C6A15B]"
          >
            <Heart className="h-4 w-4" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#C6A15B] px-1 text-[10px] font-bold text-[#38252D] tabular-nums">
                {wishlistCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenQuickBag}
            aria-label={`Open shopping cart with ${cartCount} items`}
            className="inline-flex min-h-[40px] shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-[#D85B83] px-3.5 py-2 text-xs font-semibold whitespace-nowrap text-[#FFFDF9] transition-colors hover:bg-[#C0466E]"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            <span className="tabular-nums">Bag ({cartCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-[#723B56] text-[#FFFDF9] hover:border-[#C6A15B] lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Expandable Search Bar */}
      {searchOpen && (
        <div className="border-t border-[#6C3650] bg-[#451E31] px-4 py-3">
          <form
            onSubmit={handleSearchSubmit}
            className="mx-auto flex max-w-2xl items-center gap-2"
          >
            <input
              type="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search lipsticks, foundations, serums, perfumes..."
              aria-label="Search cosmetics products"
              autoFocus
              className="h-11 flex-1 rounded-lg border border-[#7D445F] bg-[#FFFDF9] px-4 text-sm text-[#38252D] placeholder:text-[#8E6F7B] focus:border-[#C6A15B] focus:outline-none"
            />
            <button
              type="submit"
              className="min-h-[44px] cursor-pointer rounded-lg bg-[#D85B83] px-5 text-xs font-semibold text-[#FFFDF9] hover:bg-[#C0466E]"
            >
              Search
            </button>
          </form>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <nav
          className="max-h-[75vh] overflow-y-auto border-t border-[#6C3650] bg-[#51243A] px-4 py-4 lg:hidden"
          aria-label="Mobile full navigation"
        >
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {MOBILE_ALL_LINKS.map((link) => (
              <a
                key={link.path}
                href={link.path}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(link.path);
                }}
                className="flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium text-[#FCE4EC] transition-colors hover:bg-[#662F4A] hover:text-[#C6A15B]"
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
