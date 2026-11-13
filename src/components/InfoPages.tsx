import { AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { submitContactMessage } from '../lib/supabase';

interface InfoPageProps {
  onNavigate: (path: string) => void;
}

export function AboutUsPage({ onNavigate }: InfoPageProps) {
  return (
    <div className="bg-[#FCE4EC]">
      <section className="border-b border-[#EED3DF] bg-[#FFF4E8]">
        <div className="mx-auto max-w-[1320px] px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <p className="text-xs font-semibold tracking-[0.18em] text-[#C6A15B] uppercase">
                Our Beauty Philosophy
              </p>
              <h1 className="mt-2 font-display text-4xl font-semibold text-[#51243A] sm:text-5xl">
                Crafted for Natural Radiance &amp; Timeless Confidence
              </h1>
              <p className="mt-5 text-base leading-relaxed text-[#573A46]">
                Vespera Beauty was founded with a singular intention: to unite rich, expressive
                cosmetic pigments with skin-respecting botanical actives. Every lipstick, serum
                foundation, and crystal fragrance in our atelier is formulated without harsh
                parabens or drying alcohols.
              </p>
              <p className="mt-4 text-base leading-relaxed text-[#573A46]">
                From velvety crimson mattes calibrated for warm South Asian undertones to
                humidity-tested SPF 50 sunscreens, we craft products that perform effortlessly from
                morning light to celebratory evenings.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('/shop')}
                  className="min-h-[46px] cursor-pointer rounded-xl bg-[#D85B83] px-6 text-sm font-semibold text-[#FFFDF9] hover:bg-[#C0466E]"
                >
                  Explore Catalog
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/contact')}
                  className="min-h-[46px] cursor-pointer rounded-xl border border-[#C6A15B] bg-[#FFFDF9] px-6 text-sm font-semibold text-[#51243A] hover:bg-[#FCE4EC]"
                >
                  Contact Concierge
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-[#EAD6DF] shadow-lg">
                <img
                  src="/images/banners/about-atelier.jpg"
                  alt="Vespera Beauty skincare and cosmetics bottles on travertine"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function ContactUsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Shade & Routine Advice');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (message.trim().length < 6) {
      setError('Please write a message of at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await submitContactMessage({ name, email, subject, message });
      setSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit inquiry to Supabase.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] bg-[#FCE4EC]">
      <section className="border-b border-[#EED3DF] bg-[#FFF4E8]">
        <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#C6A15B] uppercase">
            Beauty Concierge
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-[#51243A] sm:text-5xl">
            Contact Us
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#6E545F]">
            Need help finding your foundation shade, layering serums, or checking an order? Write to
            our beauty advisors below.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-5 rounded-2xl border border-[#EAD6DF] bg-[#FFF4E8] p-7 lg:col-span-5">
            <h2 className="font-display text-2xl font-semibold text-[#51243A]">
              Studio &amp; Support
            </h2>
            <div className="space-y-4 text-sm text-[#573A46]">
              <div>
                <p className="text-xs font-semibold tracking-wider text-[#C6A15B] uppercase">
                  Email
                </p>
                <p className="mt-1 font-medium">concierge@vesperabeauty.pk</p>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wider text-[#C6A15B] uppercase">
                  Hours
                </p>
                <p className="mt-1">Monday – Saturday, 10:00 AM – 7:00 PM PKT</p>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wider text-[#C6A15B] uppercase">
                  Delivery Coverage
                </p>
                <p className="mt-1">
                  Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan &amp; all major
                  cities across Pakistan.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-4 rounded-2xl border border-[#EAD6DF] bg-[#FFFDF9] p-7 shadow-sm lg:col-span-7"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="cu-name"
                  className="block text-xs font-semibold tracking-wider text-[#51243A] uppercase"
                >
                  Full Name
                </label>
                <input
                  id="cu-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sana Tariq"
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#E5CED8] bg-[#FFF4E8]/40 px-3.5 text-sm focus:border-[#51243A] focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="cu-email"
                  className="block text-xs font-semibold tracking-wider text-[#51243A] uppercase"
                >
                  Email Address
                </label>
                <input
                  id="cu-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sana@example.com"
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#E5CED8] bg-[#FFF4E8]/40 px-3.5 text-sm focus:border-[#51243A] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="cu-subject"
                className="block text-xs font-semibold tracking-wider text-[#51243A] uppercase"
              >
                Inquiry Type
              </label>
              <select
                id="cu-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-[#E5CED8] bg-[#FFF4E8]/40 px-3.5 text-sm focus:border-[#51243A] focus:outline-none"
              >
                <option value="Shade & Routine Advice">Shade &amp; Routine Advice</option>
                <option value="Order & Delivery Support">Order &amp; Delivery Support</option>
                <option value="Bridal & Gift Bulk Orders">Bridal &amp; Gift Bulk Orders</option>
                <option value="General Inquiry">General Inquiry</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="cu-msg"
                className="block text-xs font-semibold tracking-wider text-[#51243A] uppercase"
              >
                Message
              </label>
              <textarea
                id="cu-msg"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your question here..."
                className="mt-1.5 w-full rounded-xl border border-[#E5CED8] bg-[#FFF4E8]/40 p-3.5 text-sm focus:border-[#51243A] focus:outline-none"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-[#E5B4B4] bg-[#FDF5F5] p-3.5 text-sm text-[#8B2626]"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div
                role="status"
                className="flex items-start gap-2 rounded-xl border border-[#BFD6C1] bg-[#F3F8F3] p-3.5 text-sm text-[#2F5233]"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Thank you! Your inquiry has been saved to our concierge queue.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-[46px] cursor-pointer items-center gap-2 rounded-xl bg-[#D85B83] px-6 text-sm font-semibold text-[#FFFDF9] hover:bg-[#C0466E] disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export function PrivacyPolicyPage() {
  return (
    <div className="bg-[#FCE4EC] py-14">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[#EAD6DF] bg-[#FFFDF9] p-8 shadow-sm sm:p-10">
        <p className="text-xs font-semibold tracking-[0.18em] text-[#C6A15B] uppercase">
          Legal &amp; Trust
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-[#51243A]">Privacy Policy</h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-[#573A46]">
          <p>
            Vespera Beauty respects your privacy. Customer names, phone numbers, email addresses,
            and delivery addresses submitted during checkout or concierge inquiries are used solely
            to fulfill your cosmetics orders and provide delivery updates.
          </p>
          <p>
            Your shopping bag and wishlist preferences are stored locally in your browser so your
            selected items remain available across visits. Order records are stored securely in our
            PostgreSQL database on Supabase with Row Level Security enabled so other visitors cannot
            view your personal contact information.
          </p>
          <p>
            We never sell, rent, or trade customer data to third-party marketing brokers. To request
            removal of an inquiry or update your delivery details, contact concierge@vesperabeauty.pk.
          </p>
        </div>
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="bg-[#FCE4EC] py-14">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[#EAD6DF] bg-[#FFFDF9] p-8 shadow-sm sm:p-10">
        <p className="text-xs font-semibold tracking-[0.18em] text-[#C6A15B] uppercase">
          Store Policies
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-[#51243A]">
          Terms &amp; Conditions
        </h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-[#573A46]">
          <p>
            All product prices are listed in Pakistani Rupees (PKR). Nationwide courier delivery is
            PKR 250 for orders below PKR 6,000 and complimentary on orders of PKR 6,000 or more.
          </p>
          <p>
            Orders placed via Cash on Delivery are confirmed against live inventory stock at the
            time of submission. Standard delivery takes 2–4 working days in major cities and 4–6
            working days for remote regions.
          </p>
          <p>
            For hygiene and safety reasons, sealed unused cosmetics and fragrances may be exchanged
            within 7 days of delivery if damaged in transit or delivered in error.
          </p>
        </div>
      </div>
    </div>
  );
}
