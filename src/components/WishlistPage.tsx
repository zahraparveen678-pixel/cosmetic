import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import type { Product } from '../types/shop';
import { formatPKR } from '../utils/format';
import { ProductImage } from './ProductImage';

interface WishlistPageProps {
  products: Product[];
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onNavigate: (path: string) => void;
}

export function WishlistPage({
  products,
  wishlistIds,
  onToggleWishlist,
  onAddToCart,
  onNavigate,
}: WishlistPageProps) {
  const savedProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="min-h-[75vh] bg-[#FCE4EC]">
      <section className="border-b border-[#EED3DF] bg-[#FFF4E8]">
        <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#C6A15B] uppercase">
            Saved Favorites
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-[#51243A] sm:text-5xl">
            My Wishlist
          </h1>
          <p className="mt-2 text-sm text-[#6E545F]">
            {savedProducts.length} {savedProducts.length === 1 ? 'item' : 'items'} saved for your
            beauty routine.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8">
        {savedProducts.length === 0 ? (
          <div className="rounded-2xl border border-[#EAD6DF] bg-[#FFFDF9] p-12 text-center">
            <Heart className="mx-auto h-10 w-10 text-[#C6A15B]" strokeWidth={1.4} />
            <h2 className="mt-4 font-display text-3xl font-semibold text-[#51243A]">
              Your wishlist is empty
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#6E545F]">
              Tap the heart icon on any lipstick, serum, or fragrance to save it here.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('/shop')}
              className="mt-6 inline-flex min-h-[44px] cursor-pointer items-center rounded-xl bg-[#D85B83] px-6 text-xs font-semibold text-[#FFFDF9] hover:bg-[#C0466E]"
            >
              Browse Cosmetics
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedProducts.map((product) => (
              <div
                key={product.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-[#EAD6DF] bg-[#FFFDF9] shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => onNavigate(`/product/${encodeURIComponent(product.id)}`)}
                  className="aspect-[4/3] w-full cursor-pointer overflow-hidden bg-[#FFF4E8]"
                >
                  <ProductImage src={product.image_url} alt={product.name} />
                </button>
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <p className="text-xs font-medium tracking-wider text-[#7D5E69] uppercase">
                      {product.category}
                    </p>
                    <h2 className="mt-1.5 font-display text-xl font-semibold text-[#38252D]">
                      {product.name}
                    </h2>
                    <p className="mt-2 text-base font-bold text-[#51243A] tabular-nums">
                      {formatPKR(product.price)}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center gap-2.5 border-t border-[#F3E6EB] pt-4">
                    <button
                      type="button"
                      disabled={product.stock <= 0}
                      onClick={() => {
                        onAddToCart(product, 1);
                        onNavigate('/cart');
                      }}
                      className="inline-flex min-h-[42px] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#D85B83] px-4 text-xs font-semibold text-[#FFFDF9] hover:bg-[#C0466E] disabled:opacity-50"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      <span>Move to Cart</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleWishlist(product.id)}
                      aria-label={`Remove ${product.name} from wishlist`}
                      className="inline-flex h-[42px] w-[42px] cursor-pointer items-center justify-center rounded-xl border border-[#E5CED8] bg-[#FFF4E8] text-[#7D5E69] hover:text-[#A82846]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
