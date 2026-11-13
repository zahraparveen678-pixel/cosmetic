import { RefreshCw, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Category, Product } from '../types/shop';
import { ProductCard } from './ProductCard';

interface CatalogPageProps {
  mode: 'shop' | 'makeup' | 'skincare' | 'lipsticks' | 'perfumes' | 'new-arrivals' | 'best-sellers';
  initialCategory: string | null;
  initialSearch: string;
  categories: Category[];
  products: Product[];
  wishlistIds: string[];
  loading: boolean;
  dbStatus: { mode: 'live' | 'preview'; message?: string };
  onRetryDb: () => void;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onNavigate: (path: string) => void;
}

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name';
type PriceFilter = 'all' | 'under-2500' | '2500-4500' | 'above-4500';

const MODE_META: Record<
  CatalogPageProps['mode'],
  { title: string; eyebrow: string; description: string }
> = {
  shop: {
    eyebrow: 'Complete Beauty Atelier',
    title: 'Shop All Cosmetics & Skincare',
    description:
      'Browse our full collection of 99 luxury makeup, botanical skincare, fragrance, and gift coffret formulations priced in PKR.',
  },
  makeup: {
    eyebrow: 'Color & Complexion',
    title: 'Makeup Collection',
    description:
      'Velvet lipsticks, silk serum foundations, concealers, baked blushes, eyeshadow palettes, brushes, and nail lacquers.',
  },
  skincare: {
    eyebrow: 'Botanical Apothecary',
    title: 'Skincare Collection',
    description:
      'Targeted face serums, gentle cleansers, peptide moisturizers, mineral SPF 50 sunscreens, clay masks, and floral toners.',
  },
  lipsticks: {
    eyebrow: 'Signature Lip Wardrobe',
    title: 'Lipstick Collection',
    description:
      'Richly pigmented matte, satin, and velvet lipsticks crafted to flatter South Asian and warm undertones.',
  },
  perfumes: {
    eyebrow: 'Fine Fragrance Salon',
    title: 'Perfume Collection',
    description:
      'Faceted crystal eau de parfum decanters infused with Taif rose, golden amber, Arabian jasmine, and cashmere musk.',
  },
  'new-arrivals': {
    eyebrow: 'Just Launched',
    title: 'New Arrivals',
    description:
      'Our newest seasonal shades, botanical actives, and limited-edition luxury gift coffrets.',
  },
  'best-sellers': {
    eyebrow: 'Client Favorites',
    title: 'Best Sellers',
    description:
      'Our highest-rated icons loved by customers across Lahore, Karachi, Islamabad, and nationwide.',
  },
};

export function CatalogPage({
  mode,
  initialCategory,
  initialSearch,
  categories,
  products,
  wishlistIds,
  loading,
  dbStatus,
  onRetryDb,
  onToggleWishlist,
  onAddToCart,
  onNavigate,
}: CatalogPageProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  useEffect(() => {
    setSearchQuery(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    if (mode === 'lipsticks') {
      setSelectedCategory('Lipsticks');
    } else if (mode === 'perfumes') {
      setSelectedCategory('Perfumes');
    } else if (initialCategory) {
      setSelectedCategory(initialCategory);
    } else {
      setSelectedCategory('All');
    }
  }, [mode, initialCategory]);

  const makeupNames = useMemo(
    () => new Set(categories.filter((c) => c.group_name === 'Makeup').map((c) => c.name)),
    [categories]
  );
  const skincareNames = useMemo(
    () => new Set(categories.filter((c) => c.group_name === 'Skincare').map((c) => c.name)),
    [categories]
  );

  const visibleCategoryTabs = useMemo(() => {
    if (mode === 'makeup') {
      return ['All', ...categories.filter((c) => c.group_name === 'Makeup').map((c) => c.name)];
    }
    if (mode === 'skincare') {
      return ['All', ...categories.filter((c) => c.group_name === 'Skincare').map((c) => c.name)];
    }
    if (mode === 'lipsticks' || mode === 'perfumes') {
      return [];
    }
    return ['All', ...categories.map((c) => c.name)];
  }, [mode, categories]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const matched = products.filter((p) => {
      if (mode === 'makeup' && !makeupNames.has(p.category)) return false;
      if (mode === 'skincare' && !skincareNames.has(p.category)) return false;
      if (mode === 'lipsticks' && p.category !== 'Lipsticks') return false;
      if (mode === 'perfumes' && p.category !== 'Perfumes') return false;
      if (mode === 'new-arrivals' && !p.is_new_arrival) return false;
      if (mode === 'best-sellers' && !p.is_best_seller) return false;

      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;

      if (priceFilter === 'under-2500' && p.price >= 2500) return false;
      if (priceFilter === '2500-4500' && (p.price < 2500 || p.price > 4500)) return false;
      if (priceFilter === 'above-4500' && p.price <= 4500) return false;

      if (q) {
        const hay = `${p.name} ${p.description} ${p.category} ${p.details}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });

    const sorted = [...matched];
    if (sortBy === 'price-asc') sorted.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') sorted.sort((a, b) => b.price - a.price);
    else if (sortBy === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
    else {
      sorted.sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
    }
    return sorted;
  }, [
    products,
    mode,
    makeupNames,
    skincareNames,
    selectedCategory,
    priceFilter,
    searchQuery,
    sortBy,
  ]);

  const meta = MODE_META[mode];

  return (
    <div className="min-h-[75vh] bg-[#FCE4EC]">
      {/* Page Header Banner */}
      <section className="border-b border-[#EED3DF] bg-[#FFF4E8]">
        <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-[#C6A15B] uppercase">
                {meta.eyebrow}
              </p>
              <h1 className="mt-2 font-display text-4xl font-semibold text-[#51243A] sm:text-5xl">
                {meta.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#6E545F]">
                {meta.description}
              </p>
            </div>

            <p className="shrink-0 text-sm font-semibold text-[#51243A] tabular-nums">
              {loading
                ? 'Syncing with Supabase...'
                : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'Product' : 'Products'}`}
            </p>
          </div>

          {dbStatus.mode === 'preview' && dbStatus.message && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#DFC4D0] bg-[#FFFDF9] px-4 py-3 text-xs text-[#573A46]">
              <span>{dbStatus.message}</span>
              <button
                type="button"
                onClick={onRetryDb}
                className="inline-flex cursor-pointer items-center gap-1.5 font-semibold text-[#D85B83] hover:underline"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry Supabase</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Filters & Products */}
      <section className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8">
        {/* Search, Price Filter & Sort */}
        <div className="flex flex-col gap-4 rounded-2xl border border-[#EAD6DF] bg-[#FFFDF9] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 lg:max-w-md">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#8E6F7B]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, shades, or ingredients..."
              aria-label="Filter products by keyword"
              className="h-11 w-full rounded-xl border border-[#E5CED8] bg-[#FFF4E8]/50 pr-9 pl-10 text-sm text-[#38252D] placeholder:text-[#8E6F7B] focus:border-[#51243A] focus:bg-[#FFFDF9] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer p-1 text-[#7D5E69] hover:text-[#38252D]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-medium text-[#573A46]">
              <span>Price:</span>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value as PriceFilter)}
                className="h-11 rounded-xl border border-[#E5CED8] bg-[#FFF4E8]/60 px-3 text-xs font-semibold text-[#38252D] focus:border-[#51243A] focus:outline-none"
              >
                <option value="all">All Prices (PKR)</option>
                <option value="under-2500">Under PKR 2,500</option>
                <option value="2500-4500">PKR 2,500 – 4,500</option>
                <option value="above-4500">Above PKR 4,500</option>
              </select>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-[#573A46]">
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-11 rounded-xl border border-[#E5CED8] bg-[#FFF4E8]/60 px-3 text-xs font-semibold text-[#38252D] focus:border-[#51243A] focus:outline-none"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Alphabetical (A–Z)</option>
              </select>
            </label>
          </div>
        </div>

        {/* Category Filter Pills/Tabs */}
        {visibleCategoryTabs.length > 0 && (
          <div
            className="mt-6 flex flex-wrap gap-2"
            role="tablist"
            aria-label="Filter by product category"
          >
            {visibleCategoryTabs.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedCategory(cat)}
                  className={`min-h-[38px] cursor-pointer rounded-xl border px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                    active
                      ? 'border-[#51243A] bg-[#51243A] text-[#FFFDF9]'
                      : 'border-[#E5CED8] bg-[#FFFDF9] text-[#51243A] hover:border-[#C6A15B] hover:bg-[#FFF4E8]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Loading Grid */}
        {loading ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border border-[#EAD6DF] bg-[#FFFDF9]"
              >
                <div className="aspect-[4/3] animate-pulse bg-[#FFF4E8]" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-24 animate-pulse rounded bg-[#FCE4EC]" />
                  <div className="h-6 w-3/4 animate-pulse rounded bg-[#FCE4EC]" />
                  <div className="h-10 w-full animate-pulse rounded bg-[#FCE4EC]" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-[#EAD6DF] bg-[#FFFDF9] p-12 text-center">
            <h2 className="font-display text-3xl font-semibold text-[#51243A]">
              No matching cosmetics found
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#6E545F]">
              Try clearing your search term, adjusting the PKR price filter, or selecting All
              categories.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setPriceFilter('all');
                setSelectedCategory('All');
              }}
              className="mt-6 inline-flex min-h-[44px] cursor-pointer items-center rounded-xl bg-[#D85B83] px-6 text-xs font-semibold text-[#FFFDF9] hover:bg-[#C0466E]"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={wishlistIds.includes(product.id)}
                onToggleWishlist={onToggleWishlist}
                onAddToCart={onAddToCart}
                onViewDetails={(id) => onNavigate(`/product/${encodeURIComponent(id)}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
