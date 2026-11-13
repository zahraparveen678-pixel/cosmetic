import { AlertCircle, Check, CheckCircle2, Copy, Loader2, ShieldCheck } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { submitOrder } from '../lib/supabase';
import type { CartItem, Order } from '../types/shop';
import { formatOrderDate, formatPKR } from '../utils/format';
import { FREE_DELIVERY_PKR, STANDARD_DELIVERY_PKR } from './CartPage';
import { ProductImage } from './ProductImage';

interface CheckoutPageProps {
  items: CartItem[];
  onOrderSuccess: (order: Order) => void;
  onNavigate: (path: string) => void;
}

export function CheckoutPage({ items, onOrderSuccess, onNavigate }: CheckoutPageProps) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_DELIVERY_PKR ? 0 : STANDARD_DELIVERY_PKR;
  const total = subtotal + shipping;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError('Your shopping cart is empty.');
      return;
    }

    if (customerName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }

    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7) {
      setError('Please enter a valid mobile or phone number (at least 7 digits).');
      return;
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address or leave it blank.');
      return;
    }

    if (streetAddress.trim().length < 5) {
      setError('Please enter your complete street address.');
      return;
    }

    if (city.trim().length < 2) {
      setError('Please enter your city.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await submitOrder({
        customer_name: customerName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: `${streetAddress.trim()}, ${city.trim()}`,
        notes: notes.trim() || undefined,
        items: items.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
        })),
      });

      setConfirmedOrder(created);
      onOrderSuccess(created);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to submit order to Supabase. Please check your database configuration.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(true);
      window.setTimeout(() => setCopiedId(false), 1800);
    } catch {
      // Ignore clipboard restrictions
    }
  };

  if (confirmedOrder) {
    return (
      <div className="min-h-[75vh] bg-[#FCE4EC] py-14">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="rounded-3xl border border-[#C6A15B] bg-[#FFFDF9] p-8 shadow-lg sm:p-10">
            <div className="flex items-center gap-2.5 text-[#2F5233]">
              <CheckCircle2 className="h-6 w-6" />
              <span className="text-xs font-bold tracking-[0.16em] uppercase">
                Order Confirmed in Supabase
              </span>
            </div>

            <h1 className="mt-3 font-display text-4xl font-semibold text-[#51243A]">
              Thank you, {confirmedOrder.customer_name}
            </h1>
            <p className="mt-2 text-sm text-[#6E545F]">
              Your beauty parcel is now in our fulfillment queue. Keep your Order ID below to track
              status anytime on the My Orders page.
            </p>

            <div className="mt-6 rounded-2xl border border-[#EED8DF] bg-[#FFF4E8] p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold tracking-wider text-[#7D5E69] uppercase">
                  Order ID
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyId(confirmedOrder.id)}
                  className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-[#51243A] hover:text-[#D85B83]"
                >
                  {copiedId ? <Check className="h-3.5 w-3.5 text-[#2F5233]" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedId ? 'Copied' : 'Copy ID'}</span>
                </button>
              </div>
              <p className="mt-1 font-mono text-xs break-all text-[#38252D]">{confirmedOrder.id}</p>

              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#E6C7D4] pt-3 text-xs">
                <div>
                  <span className="text-[#7D5E69]">Order Status</span>
                  <p className="mt-0.5 font-bold capitalize text-[#51243A]">
                    {confirmedOrder.order_status}
                  </p>
                </div>
                <div>
                  <span className="text-[#7D5E69]">Placed</span>
                  <p className="mt-0.5 font-medium text-[#38252D]">
                    {formatOrderDate(confirmedOrder.created_at)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-[#EAD6DF] bg-[#FFFDF9] p-5">
              <p className="text-xs font-semibold tracking-wider text-[#7D5E69] uppercase">
                Order Receipt
              </p>
              <ul className="mt-3 divide-y divide-[#F3E6EB]">
                {confirmedOrder.product_details?.items?.map((item, idx) => (
                  <li key={`${item.product_id}-${idx}`} className="flex justify-between py-2.5 text-sm">
                    <span className="text-[#38252D]">
                      {item.name}{' '}
                      <span className="text-xs text-[#7D5E69] tabular-nums">× {item.quantity}</span>
                    </span>
                    <span className="font-semibold text-[#51243A] tabular-nums">
                      {formatPKR(item.line_total)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-between border-t border-[#EAD6DF] pt-3 text-base font-bold text-[#51243A]">
                <span>Total (Cash on Delivery)</span>
                <span className="tabular-nums">{formatPKR(confirmedOrder.total_amount)}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate('/orders')}
                className="min-h-[46px] flex-1 cursor-pointer rounded-xl bg-[#51243A] px-5 text-sm font-semibold text-[#FFFDF9] hover:bg-[#6B314E]"
              >
                View My Orders
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/shop')}
                className="min-h-[46px] flex-1 cursor-pointer rounded-xl bg-[#D85B83] px-5 text-sm font-semibold text-[#FFFDF9] hover:bg-[#C0466E]"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[75vh] bg-[#FCE4EC]">
      <section className="border-b border-[#EED3DF] bg-[#FFF4E8]">
        <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#C6A15B] uppercase">
            Nationwide Cash on Delivery
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-[#51243A] sm:text-5xl">
            Checkout
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-[#EAD6DF] bg-[#FFFDF9] p-12 text-center">
            <h2 className="font-display text-3xl font-semibold text-[#51243A]">
              No items in your bag
            </h2>
            <p className="mt-2 text-sm text-[#6E545F]">
              Add cosmetics or skincare items before proceeding to checkout.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('/shop')}
              className="mt-6 inline-flex min-h-[44px] cursor-pointer items-center rounded-xl bg-[#D85B83] px-6 text-sm font-semibold text-[#FFFDF9] hover:bg-[#C0466E]"
            >
              Browse Shop
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Customer & Delivery Form */}
            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-5 rounded-2xl border border-[#EAD6DF] bg-[#FFFDF9] p-6 shadow-sm sm:p-8 lg:col-span-7"
            >
              <h2 className="font-display text-2xl font-semibold text-[#51243A]">
                Customer &amp; Delivery Information
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="co-name"
                    className="block text-xs font-semibold tracking-wider text-[#51243A] uppercase"
                  >
                    Full Name *
                  </label>
                  <input
                    id="co-name"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ayesha Khan"
                    className="mt-1.5 h-11 w-full rounded-xl border border-[#E5CED8] bg-[#FFF4E8]/40 px-3.5 text-sm text-[#38252D] focus:border-[#51243A] focus:bg-[#FFFDF9] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="co-phone"
                    className="block text-xs font-semibold tracking-wider text-[#51243A] uppercase"
                  >
                    Phone Number *
                  </label>
                  <input
                    id="co-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="mt-1.5 h-11 w-full rounded-xl border border-[#E5CED8] bg-[#FFF4E8]/40 px-3.5 text-sm text-[#38252D] focus:border-[#51243A] focus:bg-[#FFFDF9] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="co-email"
                    className="block text-xs font-semibold tracking-wider text-[#51243A] uppercase"
                  >
                    Email Address (Optional)
                  </label>
                  <input
                    id="co-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ayesha@example.com"
                    className="mt-1.5 h-11 w-full rounded-xl border border-[#E5CED8] bg-[#FFF4E8]/40 px-3.5 text-sm text-[#38252D] focus:border-[#51243A] focus:bg-[#FFFDF9] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="co-city"
                    className="block text-xs font-semibold tracking-wider text-[#51243A] uppercase"
                  >
                    City *
                  </label>
                  <input
                    id="co-city"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Lahore / Karachi / Islamabad"
                    className="mt-1.5 h-11 w-full rounded-xl border border-[#E5CED8] bg-[#FFF4E8]/40 px-3.5 text-sm text-[#38252D] focus:border-[#51243A] focus:bg-[#FFFDF9] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="co-address"
                  className="block text-xs font-semibold tracking-wider text-[#51243A] uppercase"
                >
                  Complete Street Address *
                </label>
                <input
                  id="co-address"
                  type="text"
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="House 14, Street 6, Gulberg III"
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#E5CED8] bg-[#FFF4E8]/40 px-3.5 text-sm text-[#38252D] focus:border-[#51243A] focus:bg-[#FFFDF9] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="co-notes"
                  className="block text-xs font-semibold tracking-wider text-[#51243A] uppercase"
                >
                  Delivery Instructions (Optional)
                </label>
                <textarea
                  id="co-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Call upon arrival or gift wrap request..."
                  className="mt-1.5 w-full rounded-xl border border-[#E5CED8] bg-[#FFF4E8]/40 p-3.5 text-sm text-[#38252D] focus:border-[#51243A] focus:bg-[#FFFDF9] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2.5 rounded-xl border border-[#EED8DF] bg-[#FFF4E8] p-4 text-xs text-[#51243A]">
                <ShieldCheck className="h-5 w-5 shrink-0 text-[#C6A15B]" />
                <span>
                  Payment Method: <strong>Cash on Delivery (COD)</strong>. Orders are verified and
                  stored directly in Supabase.
                </span>
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-xl border border-[#E5B4B4] bg-[#FDF5F5] p-4 text-sm text-[#8B2626]"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#D85B83] px-6 text-sm font-semibold text-[#FFFDF9] transition-colors hover:bg-[#C0466E] disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <span>Confirm Order · {formatPKR(total)}</span>
                )}
              </button>
            </form>

            {/* Summary Column */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-[#EAD6DF] bg-[#FFFDF9] p-6 shadow-sm">
                <h2 className="font-display text-2xl font-semibold text-[#51243A]">
                  Your Parcel ({items.reduce((a, b) => a + b.quantity, 0)} items)
                </h2>
                <ul className="mt-4 divide-y divide-[#F3E6EB]">
                  {items.map(({ product, quantity }) => (
                    <li key={product.id} className="flex items-center gap-3 py-3">
                      <div className="h-14 w-16 shrink-0 overflow-hidden rounded-lg bg-[#FFF4E8]">
                        <ProductImage src={product.image_url} alt={product.name} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#38252D]">{product.name}</p>
                        <p className="text-xs text-[#7D5E69] tabular-nums">Qty: {quantity}</p>
                      </div>
                      <span className="text-sm font-bold text-[#51243A] tabular-nums">
                        {formatPKR(product.price * quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 space-y-2 border-t border-[#EAD6DF] pt-4 text-sm text-[#573A46]">
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
                  <div className="flex justify-between border-t border-[#EAD6DF] pt-3 text-base font-bold text-[#51243A]">
                    <span>Total Payable</span>
                    <span className="tabular-nums">{formatPKR(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
