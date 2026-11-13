import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import type { CartItem } from '../types/shop';
import { formatPKR } from '../utils/format';
import { ProductImage } from './ProductImage';

interface CartPageProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onNavigate: (path: string) => void;
}

export const FREE_DELIVERY_PKR = 6000;
export const STANDARD_DELIVERY_PKR = 250;

export function CartPage({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onNavigate,
}: CartPageProps) {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_DELIVERY_PKR ? 0 : STANDARD_DELIVERY_PKR;
  const total = subtotal + shipping;
  const remainingFree = Math.max(0, FREE_DELIVERY_PKR - subtotal);

  return (
    <div className="min-h-[75vh] bg-[#FCE4EC]">
      <section className="border-b border-[#EED3DF] bg-[#FFF4E8]">
        <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#C6A15B] uppercase">
            Your Selection
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-[#51243A] sm:text-5xl">
            Shopping Cart
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-[#EAD6DF] bg-[#FFFDF9] p-12 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-[#C6A15B]" strokeWidth={1.4} />
            <h2 className="mt-4 font-display text-3xl font-semibold text-[#51243A]">
              Your shopping cart is empty
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#6E545F]">
              Add your favorite lipsticks, serums, foundations, or fragrances to proceed to
              checkout.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('/shop')}
              className="mt-6 inline-flex min-h-[46px] cursor-pointer items-center rounded-xl bg-[#D85B83] px-7 text-sm font-semibold text-[#FFFDF9] hover:bg-[#C0466E]"
            >
              Shop All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Items List */}
            <div className="space-y-4 lg:col-span-8">
              <div className="rounded-xl border border-[#EED8DF] bg-[#FFF4E8] px-5 py-3 text-xs font-medium text-[#51243A]">
                {remainingFree > 0 ? (
                  <span>
                    Add <strong className="tabular-nums">{formatPKR(remainingFree)}</strong> more to
                    unlock complimentary nationwide delivery.
                  </span>
                ) : (
                  <span className="font-semibold text-[#2F5233]">
                    Your order qualifies for complimentary nationwide delivery.
                  </span>
                )}
              </div>

              <div className="divide-y divide-[#F0DCE4] rounded-2xl border border-[#EAD6DF] bg-[#FFFDF9] px-5">
                {items.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => onNavigate(`/product/${encodeURIComponent(product.id)}`)}
                        className="h-24 w-28 shrink-0 cursor-pointer overflow-hidden rounded-xl bg-[#FFF4E8]"
                      >
                        <ProductImage src={product.image_url} alt={product.name} />
                      </button>
                      <div>
                        <p className="text-[11px] font-semibold tracking-wider text-[#C6A15B] uppercase">
                          {product.category}
                        </p>
                        <h2 className="font-display text-xl font-semibold text-[#38252D]">
                          <button
                            type="button"
                            onClick={() => onNavigate(`/product/${encodeURIComponent(product.id)}`)}
                            className="cursor-pointer text-left hover:text-[#D85B83]"
                          >
                            {product.name}
                          </button>
                        </h2>
                        <p className="mt-1 text-sm font-medium text-[#6E545F] tabular-nums">
                          {formatPKR(product.price)} each
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <div className="inline-flex items-center rounded-xl border border-[#E5CED8] bg-[#FFF4E8]">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                          aria-label={`Decrease ${product.name} quantity`}
                          className="inline-flex h-10 w-10 cursor-pointer items-center justify-center text-[#38252D] hover:text-[#D85B83]"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-10 text-center text-xs font-bold text-[#38252D] tabular-nums">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          disabled={quantity >= product.stock}
                          onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                          aria-label={`Increase ${product.name} quantity`}
                          className="inline-flex h-10 w-10 cursor-pointer items-center justify-center text-[#38252D] hover:text-[#D85B83] disabled:opacity-40"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <p className="min-w-[100px] text-right text-base font-bold text-[#51243A] tabular-nums">
                        {formatPKR(product.price * quantity)}
                      </p>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(product.id)}
                        aria-label={`Remove ${product.name}`}
                        className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-[#8E6F7B] hover:bg-[#FCE4EC] hover:text-[#A82846]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-4">
              <div className="rounded-2xl border border-[#EAD6DF] bg-[#FFFDF9] p-6 shadow-sm">
                <h2 className="font-display text-2xl font-semibold text-[#51243A]">
                  Order Summary
                </h2>
                <div className="mt-5 space-y-3 text-sm text-[#573A46]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold tabular-nums">{formatPKR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Courier Delivery</span>
                    <span className="font-semibold tabular-nums">
                      {shipping === 0 ? 'Complimentary' : formatPKR(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-[#F0DCE4] pt-3 text-base font-bold text-[#51243A]">
                    <span>Total</span>
                    <span className="tabular-nums">{formatPKR(total)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('/checkout')}
                  className="mt-6 inline-flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#D85B83] px-6 text-sm font-semibold text-[#FFFDF9] hover:bg-[#C0466E]"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
