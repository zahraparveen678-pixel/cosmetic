import { ArrowLeft, Check, Heart, Minus, Plus, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Product } from '../types/shop';
import { formatPKR } from '../utils/format';
import { ProductCard } from './ProductCard';
import { ProductImage } from './ProductImage';

interface ProductDetailPageProps {
  productId: string;
  products: Product[];
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onNavigate: (path: string) => void;
}

export function ProductDetailPage({
  productId,
  products,
  wishlistIds,
  onToggleWishlist,
  onAddToCart,
  onNavigate,
}: ProductDetailPageProps) {
  const product = products.find((p) => p.id === productId);
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    setQuantity(1);
    setAddedFeedback(false);
  }, [productId]);

  if (!product) {
    return (
      <div className="mx-auto max-w-[920px] px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-4xl font-semibold text-[#51243A]">Product Not Found</h1>
        <p className="mt-3 text-sm text-[#6E545F]">
          This beauty formula may have been archived or moved. Browse our full collection below.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('/shop')}
          className="mt-6 inline-flex min-h-[44px] cursor-pointer items-center rounded-xl bg-[#D85B83] px-6 text-sm font-semibold text-[#FFFDF9] hover:bg-[#C0466E]"
        >
          Return to Shop All
        </button>
      </div>
    );
  }

  const outOfStock = product.stock <= 0;
  const maxQty = Math.max(1, product.stock);
  const isWishlisted = wishlistIds.includes(product.id);
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const handleAdd = () => {
    if (outOfStock) return;
    onAddToCart(product, quantity);
    setAddedFeedback(true);
    window.setTimeout(() => setAddedFeedback(false), 1800);
  };

  return (
    <div className="bg-[#FCE4EC]">
      <div className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <button
          type="button"
          onClick={() => onNavigate(`/shop?category=${encodeURIComponent(product.category)}`)}
          className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-[#51243A] hover:text-[#D85B83]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to {product.category}</span>
        </button>

        <div className="mt-6 grid grid-cols-1 gap-10 rounded-3xl border border-[#EAD6DF] bg-[#FFFDF9] p-6 shadow-md sm:p-8 lg:grid-cols-12 lg:p-10">
          {/* Product Gallery */}
          <div className="lg:col-span-6">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#F0DCE4] bg-[#FFF4E8]">
              <ProductImage src={product.image_url} alt={product.name} />
            </div>
          </div>

          {/* Contiguous Purchase Module */}
          <div className="flex flex-col justify-between lg:col-span-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#7D5E69]">
                <span className="font-semibold tracking-wider text-[#C6A15B] uppercase">
                  {product.category}
                </span>
                <span aria-hidden="true">·</span>
                <span className={outOfStock ? 'font-semibold text-[#A82846]' : 'tabular-nums'}>
                  {outOfStock ? 'Currently Out of Stock' : `${product.stock} units in stock`}
                </span>
              </div>

              <h1 className="mt-3 font-display text-3xl leading-tight font-semibold text-[#51243A] sm:text-4xl">
                {product.name}
              </h1>

              <p className="mt-4 text-2xl font-bold text-[#38252D] tabular-nums">
                {formatPKR(product.price)}
              </p>

              <p className="mt-5 text-base leading-relaxed text-[#573A46]">
                {product.description}
              </p>

              {product.details && (
                <div className="mt-6 rounded-xl border border-[#EED8DF] bg-[#FFF4E8] p-4">
                  <p className="text-xs font-semibold tracking-wider text-[#51243A] uppercase">
                    Formula &amp; Size Details
                  </p>
                  <p className="mt-1.5 text-sm text-[#573A46]">{product.details}</p>
                </div>
              )}

              <div className="mt-6 grid grid-cols-1 gap-3 border-t border-[#F0DCE4] pt-5 text-xs text-[#6E545F] sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-[#C6A15B]" />
                  <span>Free delivery over PKR 6,000</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#C6A15B]" />
                  <span>Cash on Delivery across Pakistan</span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4 border-t border-[#F0DCE4] pt-6">
              {!outOfStock && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider text-[#51243A] uppercase">
                    Quantity
                  </span>
                  <div className="inline-flex items-center rounded-xl border border-[#E5CED8] bg-[#FFF4E8]">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                      className="inline-flex h-11 w-11 cursor-pointer items-center justify-center text-[#38252D] hover:text-[#D85B83]"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center text-sm font-bold text-[#38252D] tabular-nums">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                      aria-label="Increase quantity"
                      className="inline-flex h-11 w-11 cursor-pointer items-center justify-center text-[#38252D] hover:text-[#D85B83]"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={outOfStock}
                  onClick={handleAdd}
                  className={`inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-[#FFFDF9] transition-colors ${
                    outOfStock
                      ? 'cursor-not-allowed bg-[#D4C3CA] text-[#6E545F]'
                      : addedFeedback
                        ? 'cursor-pointer bg-[#51243A]'
                        : 'cursor-pointer bg-[#D85B83] hover:bg-[#C0466E]'
                  }`}
                >
                  {addedFeedback ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Added to Shopping Cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" />
                      <span>
                        {outOfStock
                          ? 'Out of Stock'
                          : `Add to Cart · ${formatPKR(product.price * quantity)}`}
                      </span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onToggleWishlist(product.id)}
                  className={`inline-flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-colors ${
                    isWishlisted
                      ? 'border-[#D85B83] bg-[#FCE4EC] text-[#D85B83]'
                      : 'border-[#E5CED8] bg-[#FFF4E8] text-[#51243A] hover:border-[#C6A15B]'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                  <span>{isWishlisted ? 'Saved' : 'Wishlist'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-3xl font-semibold text-[#51243A]">
              You May Also Adore
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  isWishlisted={wishlistIds.includes(item.id)}
                  onToggleWishlist={onToggleWishlist}
                  onAddToCart={onAddToCart}
                  onViewDetails={(id) => onNavigate(`/product/${encodeURIComponent(id)}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
