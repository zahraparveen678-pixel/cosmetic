import { AlertCircle, ArrowRight, CheckCircle2, Loader2, Sparkles, Star } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { CUSTOMER_REVIEWS, GALLERY_ITEMS } from '../data/catalogSeed';
import { subscribeNewsletter } from '../lib/supabase';
import type { Category, Product } from '../types/shop';
import { ProductCard } from './ProductCard';
import { ProductImage } from './ProductImage';

interface HomePageProps {
  categories: Category[];
  products: Product[];
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onNavigate: (path: string) => void;
}

export function HomePage({
  categories,
  products,
  wishlistIds,
  onToggleWishlist,
  onAddToCart,
  onNavigate,
}: HomePageProps) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [submittingNews, setSubmittingNews] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [newsSuccess, setNewsSuccess] = useState(false);

  const featuredProducts = products.filter((p) => p.is_featured).slice(0, 6);
  const newArrivals = products.filter((p) => p.is_new_arrival).slice(0, 4);
  const bestSellers = products.filter((p) => p.is_best_seller).slice(0, 4);
  const trendingProducts = products.filter((p) => p.is_trending).slice(0, 4);

  const handleNewsletterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setNewsError(null);
    setNewsSuccess(false);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail.trim())) {
      setNewsError('Please enter a valid email address.');
      return;
    }

    setSubmittingNews(true);
    try {
      await subscribeNewsletter(newsletterEmail);
      setNewsSuccess(true);
      setNewsletterEmail('');
    } catch (err) {
      setNewsError(
        err instanceof Error ? err.message : 'Unable to subscribe right now.'
      );
    } finally {
      setSubmittingNews(false);
    }
  };

  return (
    <div>
      {/* 1. Large Luxury Cosmetics Hero Banner */}
      <section className="relative overflow-hidden border-b border-[#EED3DF] bg-gradient-to-br from-[#FFF4E8] via-[#FCE4EC] to-[#F7D1DF]">
        <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Hero Copy */}
            <div className="flex flex-col justify-center lg:col-span-5">
              <p className="text-xs font-semibold tracking-[0.2em] text-[#C6A15B] uppercase">
                Luxury Makeup · Skincare · Fragrance
              </p>
              <h1 className="mt-4 font-display text-[clamp(2.6rem,4.6vw,4.35rem)] leading-[1.03] font-semibold tracking-tight text-balance text-[#51243A]">
                Discover Your Natural Beauty
              </h1>
              <p className="mt-4 font-display text-2xl italic text-[#7B455B]">
                Your Beauty, Your Style, Your Confidence
              </p>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-[#573A46]">
                Explore 99+ luxury lipsticks, luminous foundations, clinical botanical serums, and
                signature crystal perfumes crafted to elevate your daily beauty ritual.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate('/shop')}
                  className="inline-flex min-h-[48px] cursor-pointer items-center gap-2.5 rounded-xl bg-[#D85B83] px-7 py-3 text-sm font-semibold text-[#FFFDF9] shadow-[0_8px_20px_rgba(216,91,131,0.3)] transition-colors hover:bg-[#C0466E]"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('/makeup')}
                  className="inline-flex min-h-[48px] cursor-pointer items-center gap-2 rounded-xl border-2 border-[#C6A15B] bg-[#FFFDF9]/80 px-7 py-3 text-sm font-semibold text-[#51243A] transition-colors hover:bg-[#FFF4E8]"
                >
                  <span>Explore Collection</span>
                </button>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-[#E6C7D4] pt-6 text-xs">
                <div>
                  <p className="font-display text-2xl font-semibold text-[#51243A] tabular-nums">
                    20
                  </p>
                  <p className="text-[#6E545F]">Curated Categories</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-semibold text-[#51243A] tabular-nums">
                    99+
                  </p>
                  <p className="text-[#6E545F]">Unique Formulas</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-semibold text-[#51243A] tabular-nums">
                    COD
                  </p>
                  <p className="text-[#6E545F]">Pakistan Delivery</p>
                </div>
              </div>
            </div>

            {/* Hero Makeup, Perfume & Skincare Collage */}
            <div className="lg:col-span-7">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-[#E7CBD7] bg-[#FFF4E8] shadow-[0_20px_50px_rgba(81,36,58,0.14)] lg:h-full">
                <img
                  src="/images/banners/hero-collage.jpg"
                  alt="Luxury cosmetics collage with velvet lipsticks, crystal perfume bottles, skincare serums, eyeshadow palette, and rose gold makeup brushes"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Special Discount Promotional Banner */}
      <section className="border-b border-[#EED3DF] bg-[#51243A] text-[#FFFDF9]">
        <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-6 rounded-2xl border border-[#723B56] bg-gradient-to-r from-[#5A2941] via-[#662F4A] to-[#51243A] p-6 sm:p-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <p className="text-xs font-semibold tracking-[0.2em] text-[#C6A15B] uppercase">
                Seasonal Beauty Privilege
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-[#FFFDF9] sm:text-4xl">
                Complimentary Delivery on Orders Above PKR 6,000 + Up to 15% Savings on Gift Sets
              </h2>
              <p className="mt-2 text-sm text-[#F4D9E4]">
                Discover festive luxury coffrets, velvet lip edits, and botanical skincare trios
                crafted for weddings, celebrations, and self-care rituals.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('/shop?category=Beauty+Gift+Sets')}
                  className="inline-flex min-h-[42px] cursor-pointer items-center gap-2 rounded-lg bg-[#D85B83] px-5 py-2 text-xs font-semibold text-[#FFFDF9] hover:bg-[#C0466E]"
                >
                  <span>Shop Gift Sets</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/best-sellers')}
                  className="inline-flex min-h-[42px] cursor-pointer items-center rounded-lg border border-[#C6A15B] px-5 py-2 text-xs font-semibold text-[#C6A15B] hover:bg-[#C6A15B] hover:text-[#38252D]"
                >
                  View Best Sellers
                </button>
              </div>
            </div>
            <div className="lg:col-span-4">
              <div className="aspect-[16/10] overflow-hidden rounded-xl border border-[#7B435E]">
                <img
                  src="/images/banners/promo-flatlay.jpg"
                  alt="Luxury cosmetics coffret, perfume flacon, and rose quartz serum wrapped with champagne ribbon"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Shop All 20 Categories */}
      <section className="border-b border-[#EED3DF] bg-[#FFF4E8]">
        <div className="mx-auto max-w-[1320px] px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-[#C6A15B] uppercase">
                20 Curated Departments
              </p>
              <h2 className="mt-1.5 font-display text-3xl font-semibold text-[#51243A] sm:text-4xl">
                Browse by Category
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/shop')}
              className="cursor-pointer text-sm font-semibold text-[#D85B83] hover:underline hover:underline-offset-4"
            >
              View All 99+ Products →
            </button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onNavigate(`/shop?category=${encodeURIComponent(cat.name)}`)}
                className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-[#EAD6DF] bg-[#FFFDF9] text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-[#C6A15B] hover:shadow-md"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-[#FCE4EC]">
                  <ProductImage
                    src={cat.image_url}
                    alt={cat.name}
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <p className="text-[11px] font-medium text-[#8C6876]">{cat.group_name}</p>
                  <p className="font-display text-lg font-semibold text-[#38252D] group-hover:text-[#D85B83]">
                    {cat.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Featured Products */}
      <section className="border-b border-[#EED3DF] bg-[#FCE4EC]">
        <div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-[#C6A15B] uppercase">
                Signature Curation
              </p>
              <h2 className="mt-1.5 font-display text-3xl font-semibold text-[#51243A] sm:text-4xl">
                Featured Products
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/shop')}
              className="cursor-pointer text-sm font-semibold text-[#51243A] hover:text-[#D85B83] hover:underline"
            >
              Explore Full Catalog →
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
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
        </div>
      </section>

      {/* 5. New Arrivals */}
      <section className="border-b border-[#EED3DF] bg-[#FFF4E8]">
        <div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-[#C6A15B] uppercase">
                Fresh From the Atelier
              </p>
              <h2 className="mt-1.5 font-display text-3xl font-semibold text-[#51243A] sm:text-4xl">
                New Arrivals
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/new-arrivals')}
              className="cursor-pointer text-sm font-semibold text-[#D85B83] hover:underline"
            >
              See All New Arrivals →
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {newArrivals.map((product) => (
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
        </div>
      </section>

      {/* 6. Best Sellers & Trending Products */}
      <section className="border-b border-[#EED3DF] bg-[#FCE4EC]">
        <div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-[#C6A15B] uppercase">
                Most Loved Across Pakistan
              </p>
              <h2 className="mt-1.5 font-display text-3xl font-semibold text-[#51243A] sm:text-4xl">
                Best Sellers
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/best-sellers')}
              className="cursor-pointer text-sm font-semibold text-[#51243A] hover:text-[#D85B83] hover:underline"
            >
              Shop Best Sellers →
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {bestSellers.map((product) => (
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

          {/* Trending Row */}
          <div className="mt-16 flex flex-wrap items-end justify-between gap-4 border-t border-[#E6C7D4] pt-14">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-[#C6A15B] uppercase">
                Right Now
              </p>
              <h2 className="mt-1.5 font-display text-3xl font-semibold text-[#51243A] sm:text-4xl">
                Trending Products
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/shop')}
              className="cursor-pointer text-sm font-semibold text-[#D85B83] hover:underline"
            >
              Browse Trending →
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {trendingProducts.map((product) => (
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
        </div>
      </section>

      {/* 7. Curated Beauty Image Gallery Preview */}
      <section className="border-b border-[#EED3DF] bg-[#FFF4E8]">
        <div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-[#C6A15B] uppercase">
                Editorial Showcase
              </p>
              <h2 className="mt-1.5 font-display text-3xl font-semibold text-[#51243A] sm:text-4xl">
                Luxury Beauty Gallery
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/gallery')}
              className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-[#D85B83] hover:underline"
            >
              <span>Open Full Gallery</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {GALLERY_ITEMS.slice(0, 4).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.targetRoute)}
                className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-2xl border border-[#EAD6DF] bg-[#FFFDF9] text-left shadow-sm"
              >
                <img
                  src={item.image_url}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#381626]/85 via-[#381626]/25 to-transparent p-5 flex flex-col justify-end">
                  <span className="text-[11px] font-semibold tracking-wider text-[#C6A15B] uppercase">
                    {item.category}
                  </span>
                  <h3 className="mt-1 font-display text-xl font-semibold text-[#FFFDF9]">
                    {item.title}
                  </h3>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Customer Reviews */}
      <section className="border-b border-[#EED3DF] bg-[#FCE4EC]">
        <div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#C6A15B] uppercase">
              Verified Client Impressions
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-[#51243A] sm:text-4xl">
              Loved by Our Community
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {CUSTOMER_REVIEWS.map((review) => (
              <div
                key={review.id}
                className="flex flex-col justify-between rounded-2xl border border-[#EAD6DF] bg-[#FFF4E8] p-7 shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-1 text-[#C6A15B]" aria-label="5 out of 5 stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-[#38252D]">
                    &ldquo;{review.quote}&rdquo;
                  </p>
                </div>

                <div className="mt-6 border-t border-[#EED8DF] pt-4 text-xs">
                  <p className="font-semibold text-[#51243A]">
                    {review.name} · {review.city}
                  </p>
                  <p className="mt-0.5 text-[#7D5E69]">{review.product}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Newsletter Subscription */}
      <section className="bg-[#FFF4E8]">
        <div className="mx-auto max-w-[920px] px-4 py-16 text-center sm:px-6 lg:px-8">
          <Sparkles className="mx-auto h-6 w-6 text-[#C6A15B]" aria-hidden="true" />
          <h2 className="mt-3 font-display text-3xl font-semibold text-[#51243A] sm:text-4xl">
            Join the Vespera Beauty Circle
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#6E545F]">
            Receive early access to seasonal lipstick drops, skincare ritual guides, and private
            festive privileges.
          </p>

          <form
            onSubmit={handleNewsletterSubmit}
            noValidate
            className="mx-auto mt-7 flex max-w-lg flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address"
              aria-label="Email address for newsletter"
              className="h-12 flex-1 rounded-xl border border-[#DFC4D0] bg-[#FFFDF9] px-4 text-sm text-[#38252D] placeholder:text-[#8E6F7B] focus:border-[#51243A] focus:outline-none"
            />
            <button
              type="submit"
              disabled={submittingNews}
              className="inline-flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#D85B83] px-6 text-sm font-semibold text-[#FFFDF9] transition-colors hover:bg-[#C0466E] disabled:opacity-60"
            >
              {submittingNews ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Subscribing...</span>
                </>
              ) : (
                <span>Subscribe</span>
              )}
            </button>
          </form>

          {newsError && (
            <div
              role="alert"
              className="mx-auto mt-4 flex max-w-lg items-center justify-center gap-2 rounded-lg border border-[#E5B4B4] bg-[#FDF5F5] px-4 py-2.5 text-xs text-[#8B2626]"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{newsError}</span>
            </div>
          )}

          {newsSuccess && (
            <div
              role="status"
              className="mx-auto mt-4 flex max-w-lg items-center justify-center gap-2 rounded-lg border border-[#BFD6C1] bg-[#F3F8F3] px-4 py-2.5 text-xs text-[#2F5233]"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Welcome to the Vespera Beauty Circle. Your subscription is saved.</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
