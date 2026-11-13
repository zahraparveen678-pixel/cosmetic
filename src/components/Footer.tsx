interface FooterProps {
  onNavigate: (path: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const year = new Date().getFullYear();

  const go = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <footer className="border-t border-[#6C3650] bg-[#51243A] text-[#F9E6EE]">
      <div className="mx-auto max-w-[1320px] px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 border-b border-[#6E3651] pb-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div>
            <p className="font-display text-3xl font-semibold text-[#FFFDF9]">Vespera Beauty</p>
            <p className="mt-3 text-sm leading-relaxed text-[#E9C9D7]">
              Luxury makeup, cold-pressed botanical skincare, and signature fragrances crafted for
              radiant everyday confidence across Pakistan.
            </p>
            <p className="mt-4 text-xs font-medium tracking-wider text-[#C6A15B] uppercase">
              Free Shipping Over PKR 6,000 · Cash on Delivery
            </p>
          </div>

          {/* Collections */}
          <div>
            <h3 className="text-xs font-semibold tracking-[0.16em] text-[#C6A15B] uppercase">
              Collections
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href="/shop" onClick={go('/shop')} className="hover:text-[#C6A15B]">
                  Shop All Products
                </a>
              </li>
              <li>
                <a href="/makeup" onClick={go('/makeup')} className="hover:text-[#C6A15B]">
                  Makeup Collection
                </a>
              </li>
              <li>
                <a href="/skincare" onClick={go('/skincare')} className="hover:text-[#C6A15B]">
                  Skincare Collection
                </a>
              </li>
              <li>
                <a href="/lipsticks" onClick={go('/lipsticks')} className="hover:text-[#C6A15B]">
                  Lipstick Collection
                </a>
              </li>
              <li>
                <a href="/perfumes" onClick={go('/perfumes')} className="hover:text-[#C6A15B]">
                  Perfume Collection
                </a>
              </li>
            </ul>
          </div>

          {/* Curated & Account */}
          <div>
            <h3 className="text-xs font-semibold tracking-[0.16em] text-[#C6A15B] uppercase">
              Discover &amp; Orders
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href="/new-arrivals" onClick={go('/new-arrivals')} className="hover:text-[#C6A15B]">
                  New Arrivals
                </a>
              </li>
              <li>
                <a href="/best-sellers" onClick={go('/best-sellers')} className="hover:text-[#C6A15B]">
                  Best Sellers
                </a>
              </li>
              <li>
                <a href="/gallery" onClick={go('/gallery')} className="hover:text-[#C6A15B]">
                  Beauty Image Gallery
                </a>
              </li>
              <li>
                <a href="/wishlist" onClick={go('/wishlist')} className="hover:text-[#C6A15B]">
                  My Wishlist
                </a>
              </li>
              <li>
                <a href="/cart" onClick={go('/cart')} className="hover:text-[#C6A15B]">
                  Shopping Cart
                </a>
              </li>
              <li>
                <a href="/orders" onClick={go('/orders')} className="hover:text-[#C6A15B]">
                  My Orders &amp; Tracking
                </a>
              </li>
            </ul>
          </div>

          {/* Care & Legal */}
          <div>
            <h3 className="text-xs font-semibold tracking-[0.16em] text-[#C6A15B] uppercase">
              House &amp; Care
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href="/about" onClick={go('/about')} className="hover:text-[#C6A15B]">
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" onClick={go('/contact')} className="hover:text-[#C6A15B]">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/privacy-policy" onClick={go('/privacy-policy')} className="hover:text-[#C6A15B]">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" onClick={go('/terms')} className="hover:text-[#C6A15B]">
                  Terms &amp; Conditions
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-3 text-xs text-[#DFB9C8] sm:flex-row sm:items-center">
          <p>© {year} Vespera Beauty. All rights reserved.</p>
          <p>Prices in Pakistani Rupees (PKR) · Nationwide Courier Delivery</p>
        </div>
      </div>
    </footer>
  );
}
