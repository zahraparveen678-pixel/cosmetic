/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { CartPage } from './components/CartPage';
import { CatalogPage } from './components/CatalogPage';
import { CheckoutPage } from './components/CheckoutPage';
import { Footer } from './components/Footer';
import { GalleryPage } from './components/GalleryPage';
import { HomePage } from './components/HomePage';
import { AboutUsPage, ContactUsPage, PrivacyPolicyPage, TermsPage } from './components/InfoPages';
import { Navbar } from './components/Navbar';
import { OrdersPage } from './components/OrdersPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { QuickBagDrawer } from './components/QuickBagDrawer';
import { WishlistPage } from './components/WishlistPage';
import { SEED_CATEGORIES, SEED_PRODUCTS } from './data/catalogSeed';
import { fetchCategories, fetchProducts, isSupabaseConfigured } from './lib/supabase';
import type { AppRoute, CartItem, Category, Order, Product } from './types/shop';
import { getQueryCategory, getQuerySearch, parseRoute } from './utils/router';

const CART_KEY = 'vespera_cart_pkr_v1';
const WISHLIST_KEY = 'vespera_wishlist_v1';

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() => parseRoute(window.location.pathname));
  const [querySearch, setQuerySearch] = useState(() => getQuerySearch(window.location.search));
  const [queryCategory, setQueryCategory] = useState<string | null>(() =>
    getQueryCategory(window.location.search)
  );

  const [categories, setCategories] = useState<Category[]>(SEED_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ mode: 'live' | 'preview'; message?: string }>({
    mode: isSupabaseConfigured() ? 'live' : 'preview',
    message: isSupabaseConfigured()
      ? undefined
      : 'Preview Catalog Active — Add VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY and run supabase/schema.sql to connect live Supabase products and orders.',
  });

  const [cart, setCart] = useState<CartItem[]>(() => readStorage<CartItem[]>(CART_KEY, []));
  const [wishlistIds, setWishlistIds] = useState<string[]>(() =>
    readStorage<string[]>(WISHLIST_KEY, [])
  );
  const [sessionOrders, setSessionOrders] = useState<Order[]>([]);
  const [quickBagOpen, setQuickBagOpen] = useState(false);

  const syncFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setDbStatus({
        mode: 'preview',
        message:
          'Preview Catalog Active — Add VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY and run supabase/schema.sql to switch to live Supabase data.',
      });
      return;
    }

    setLoadingCatalog(true);
    try {
      const [liveCategories, liveProducts] = await Promise.all([
        fetchCategories(),
        fetchProducts(),
      ]);

      if (liveCategories.length > 0) {
        setCategories(liveCategories);
      }
      if (liveProducts.length > 0) {
        setProducts(liveProducts);
        setCart((prev) =>
          prev
            .map((item) => {
              const match = liveProducts.find(
                (p) => p.id === item.product.id || p.name === item.product.name
              );
              if (!match || match.stock <= 0) return null;
              return { product: match, quantity: Math.min(item.quantity, match.stock) };
            })
            .filter((entry): entry is CartItem => entry !== null)
        );
      }
      setDbStatus({ mode: 'live' });
    } catch (err) {
      setDbStatus({
        mode: 'preview',
        message:
          err instanceof Error
            ? `Supabase sync notice: ${err.message}`
            : 'Unable to sync with Supabase yet.',
      });
    } finally {
      setLoadingCatalog(false);
    }
  }, []);

  useEffect(() => {
    void syncFromSupabase();
  }, [syncFromSupabase]);

  useEffect(() => {
    const onPopState = () => {
      setRoute(parseRoute(window.location.pathname));
      setQuerySearch(getQuerySearch(window.location.search));
      setQueryCategory(getQueryCategory(window.location.search));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      // Ignore quota errors
    }
  }, [cart]);

  useEffect(() => {
    try {
      window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistIds));
    } catch {
      // Ignore quota errors
    }
  }, [wishlistIds]);

  const navigate = (path: string) => {
    const url = new URL(path, window.location.origin);
    window.history.pushState({}, '', `${url.pathname}${url.search}`);
    setRoute(parseRoute(url.pathname));
    setQuerySearch(getQuerySearch(url.search));
    setQueryCategory(getQueryCategory(url.search));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product: Product, quantity = 1) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { product, quantity: Math.min(product.stock, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
    });
  };

  const handleUpdateQuantity = (productId: string, nextQty: number) => {
    if (nextQty <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(item.product.stock, nextQty) }
          : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleOrderSuccess = (order: Order) => {
    setCart([]);
    setSessionOrders((prev) => [order, ...prev]);
    void syncFromSupabase();
  };

  const totalBagCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex min-h-screen flex-col bg-[#FCE4EC] text-[#38252D]">
      <Navbar
        currentRoute={route}
        cartCount={totalBagCount}
        wishlistCount={wishlistIds.length}
        onNavigate={navigate}
        onOpenQuickBag={() => setQuickBagOpen(true)}
      />

      <main className="flex-1">
        {route.page === 'home' && (
          <HomePage
            categories={categories}
            products={products}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onNavigate={navigate}
          />
        )}

        {(route.page === 'shop' ||
          route.page === 'makeup' ||
          route.page === 'skincare' ||
          route.page === 'lipsticks' ||
          route.page === 'perfumes' ||
          route.page === 'new-arrivals' ||
          route.page === 'best-sellers') && (
          <CatalogPage
            mode={route.page}
            initialCategory={queryCategory}
            initialSearch={querySearch}
            categories={categories}
            products={products}
            wishlistIds={wishlistIds}
            loading={loadingCatalog}
            dbStatus={dbStatus}
            onRetryDb={() => void syncFromSupabase()}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onNavigate={navigate}
          />
        )}

        {route.page === 'product' && (
          <ProductDetailPage
            productId={route.productId}
            products={products}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onNavigate={navigate}
          />
        )}

        {route.page === 'gallery' && <GalleryPage onNavigate={navigate} />}

        {route.page === 'wishlist' && (
          <WishlistPage
            products={products}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onNavigate={navigate}
          />
        )}

        {route.page === 'cart' && (
          <CartPage
            items={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onNavigate={navigate}
          />
        )}

        {route.page === 'checkout' && (
          <CheckoutPage
            items={cart}
            onOrderSuccess={handleOrderSuccess}
            onNavigate={navigate}
          />
        )}

        {route.page === 'orders' && <OrdersPage sessionOrders={sessionOrders} />}

        {route.page === 'about' && <AboutUsPage onNavigate={navigate} />}
        {route.page === 'contact' && <ContactUsPage />}
        {route.page === 'privacy-policy' && <PrivacyPolicyPage />}
        {route.page === 'terms' && <TermsPage />}
      </main>

      <Footer onNavigate={navigate} />

      <QuickBagDrawer
        open={quickBagOpen}
        items={cart}
        onClose={() => setQuickBagOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onNavigate={navigate}
      />
    </div>
  );
}
