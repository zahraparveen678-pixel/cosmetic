import { AlertCircle, CheckCircle2, Loader2, PackageSearch } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { lookupOrder, lookupOrdersByPhone } from '../lib/supabase';
import type { Order } from '../types/shop';
import { formatOrderDate, formatPKR, isValidUuid } from '../utils/format';

interface OrdersPageProps {
  sessionOrders: Order[];
}

export function OrdersPage({ sessionOrders }: OrdersPageProps) {
  const [phone, setPhone] = useState('');
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Order[] | null>(null);

  const handleLookup = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResults(null);

    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7) {
      setError('Please enter your phone number (at least 7 digits).');
      return;
    }

    if (orderId.trim() && !isValidUuid(orderId)) {
      setError('Order ID must be a valid UUID (or leave Order ID blank to view all orders for your phone).');
      return;
    }

    setLoading(true);
    try {
      if (orderId.trim()) {
        const single = await lookupOrder(orderId.trim(), phone.trim());
        setResults(single ? [single] : []);
        if (!single) {
          setError('No order found matching that Order ID and phone number.');
        }
      } else {
        const list = await lookupOrdersByPhone(phone.trim());
        setResults(list);
        if (list.length === 0) {
          setError('No orders found in Supabase for this phone number.');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch order history.');
    } finally {
      setLoading(false);
    }
  };

  const displayedOrders = results !== null ? results : sessionOrders;

  return (
    <div className="min-h-[75vh] bg-[#FCE4EC]">
      <section className="border-b border-[#EED3DF] bg-[#FFF4E8]">
        <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#C6A15B] uppercase">
            Order History &amp; Live Tracking
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-[#51243A] sm:text-5xl">
            My Orders
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#6E545F]">
            Look up your verified order history and fulfillment status directly from Supabase using
            your phone number.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1000px] px-4 py-12 sm:px-6 lg:px-8">
        <form
          onSubmit={handleLookup}
          noValidate
          className="rounded-2xl border border-[#EAD6DF] bg-[#FFFDF9] p-6 shadow-sm sm:p-8"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="ord-phone"
                className="block text-xs font-semibold tracking-wider text-[#51243A] uppercase"
              >
                Phone Number *
              </label>
              <input
                id="ord-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0300-1234567"
                className="mt-1.5 h-11 w-full rounded-xl border border-[#E5CED8] bg-[#FFF4E8]/40 px-3.5 text-sm text-[#38252D] focus:border-[#51243A] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="ord-id"
                className="block text-xs font-semibold tracking-wider text-[#51243A] uppercase"
              >
                Specific Order ID (Optional)
              </label>
              <input
                id="ord-id"
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Leave blank to show all orders for phone"
                className="mt-1.5 h-11 w-full rounded-xl border border-[#E5CED8] bg-[#FFF4E8]/40 px-3.5 font-mono text-xs text-[#38252D] placeholder:font-sans focus:border-[#51243A] focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl bg-[#D85B83] px-6 text-xs font-semibold text-[#FFFDF9] hover:bg-[#C0466E] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Fetching Orders...</span>
                </>
              ) : (
                <>
                  <PackageSearch className="h-4 w-4" />
                  <span>Retrieve Orders</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-2.5 rounded-xl border border-[#E5B4B4] bg-[#FDF5F5] p-4 text-sm text-[#8B2626]"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </form>

        {/* Results */}
        <div className="mt-8 space-y-5">
          {displayedOrders.length === 0 && results === null && (
            <div className="rounded-2xl border border-[#EAD6DF] bg-[#FFF4E8] p-8 text-center text-sm text-[#6E545F]">
              Enter your phone number above to retrieve your live orders from Supabase.
            </div>
          )}

          {displayedOrders.map((order) => (
            <article
              key={order.id}
              className="rounded-2xl border border-[#EAD6DF] bg-[#FFFDF9] p-6 shadow-xs"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#F3E6EB] pb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#2F5233] uppercase">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="capitalize">Status: {order.order_status}</span>
                  </div>
                  <p className="mt-1 font-mono text-xs text-[#6E545F]">Order #{order.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#7D5E69]">{formatOrderDate(order.created_at)}</p>
                  <p className="mt-0.5 text-lg font-bold text-[#51243A] tabular-nums">
                    {formatPKR(order.total_amount)}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-[#573A46] sm:grid-cols-2">
                <p>
                  <strong className="text-[#38252D]">Recipient:</strong> {order.customer_name}
                </p>
                <p>
                  <strong className="text-[#38252D]">Address:</strong> {order.address}
                </p>
              </div>

              {order.product_details?.items && order.product_details.items.length > 0 && (
                <ul className="mt-4 divide-y divide-[#F3E6EB] border-t border-[#F3E6EB]">
                  {order.product_details.items.map((item, idx) => (
                    <li
                      key={`${item.product_id}-${idx}`}
                      className="flex items-center justify-between py-2.5 text-sm"
                    >
                      <span>
                        {item.name}{' '}
                        <span className="text-xs text-[#7D5E69] tabular-nums">
                          × {item.quantity}
                        </span>
                      </span>
                      <span className="font-semibold text-[#51243A] tabular-nums">
                        {formatPKR(item.line_total)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
