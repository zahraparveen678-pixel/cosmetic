import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useEffect } from 'react';
import type { CartItem } from '../types/shop';
import { formatPKR } from '../utils/format';
import { FREE_DELIVERY_PKR, STANDARD_DELIVERY_PKR } from './CartPage';
import { ProductImage } from './ProductImage';

interface QuickBagDrawerProps {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onNavigate: (path: string) => void;
}

export function QuickBagDrawer({
  open,
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onNavigate,
}: QuickBagDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_DELIVERY_PKR ? 0 : STANDARD_DELIVERY_PKR;
  const total = subtotal + shipping;
  const remaining = Math.max(0, FREE_DELIVERY_PKR - subtotal);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#381626]/60 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Quick shopping bag"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex h-full w-full max-w-md flex-col border-l border-[#EAD6DF] bg-[#FFFDF9] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#EED8DF] bg-[#51243A] px-6 py-4 text-[#FFFDF9]">
          <h2 className="font-display text-2xl font-semibold">Shopping Bag</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shopping bag"
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#723B56] hover:border-[#C6A15B]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {items.length > 0 && (
          <div className="border-b border-[#EED8DF] bg-[#FFF4E8] px-6 py-2.5 text-xs text-[#51243A]">
            {remaining > 0 ? (
              <span>
                Add <strong className="tabular-nums">{formatPKR(remaining)}</strong> more for free
                delivery.
              </span>
            ) : (
              <span className="font-semibold text-[#2F5233]">
                Complimentary delivery unlocked.
              </span>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="h-10 w-10 text-[#C6A15B]" strokeWidth={1.3} />
              <p className="mt-4 font-display text-2xl font-semibold text-[#51243A]">
                Your bag is empty
              </p>
              <p className="mt-2 max-w-xs text-sm text-[#6E545F]">
                Discover our velvet lipsticks, serums, and fragrances.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigate('/shop');
                }}
                className="mt-6 inline-flex min-h-[42px] cursor-pointer items-center rounded-xl bg-[#D85B83] px-5 text-xs font-semibold text-[#FFFDF9] hover:bg-[#C0466E]"
              >
                Shop Collection
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-[#F0DCE4]">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex gap-4 py-4 first:pt-0">
                  <div className="h-20 w-22 shrink-0 overflow-hidden rounded-xl bg-[#FFF4E8]">
                    <ProductImage src={product.image_url} alt={product.name} />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-semibold tracking-wider text-[#C6A15B] uppercase">
                          {product.category}
                        </p>
                        <h3 className="font-display text-base leading-snug font-semibold text-[#38252D]">
                          {product.name}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(product.id)}
                        aria-label={`Remove ${product.name}`}
                        className="cursor-pointer p-1 text-[#8E6F7B] hover:text-[#A82846]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-lg border border-[#E5CED8] bg-[#FFF4E8]">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                          aria-label="Decrease quantity"
                          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold tabular-nums">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          disabled={quantity >= product.stock}
                          onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                          aria-label="Increase quantity"
                          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center disabled:opacity-40"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-[#51243A] tabular-nums">
                        {formatPKR(product.price * quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-[#EED8DF] bg-[#FFF4E8] p-6">
            <div className="space-y-1.5 text-sm text-[#573A46]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold tabular-nums">{formatPKR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="font-semibold tabular-nums">
                  {shipping === 0 ? 'Complimentary' : formatPKR(shipping)}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#E6C7D4] pt-2 text-base font-bold text-[#51243A]">
                <span>Total</span>
                <span className="tabular-nums">{formatPKR(total)}</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigate('/cart');
                }}
                className="min-h-[44px] cursor-pointer rounded-xl border border-[#C6A15B] bg-[#FFFDF9] px-4 text-xs font-semibold text-[#51243A] hover:bg-[#FCE4EC]"
              >
                View Cart
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigate('/checkout');
                }}
                className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#D85B83] px-4 text-xs font-semibold text-[#FFFDF9] hover:bg-[#C0466E]"
              >
                <span>Checkout</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
