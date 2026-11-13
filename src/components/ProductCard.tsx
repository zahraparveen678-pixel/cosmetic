import { Check, Eye, Heart, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '../types/shop';
import { formatPKR } from '../utils/format';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onViewDetails: (productId: string) => void;
}

export function ProductCard({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onViewDetails,
}: ProductCardProps) {
  const [justAdded, setJustAdded] = useState(false);
  const outOfStock = product.stock <= 0;

  const handleAdd = () => {
    if (outOfStock) return;
    onAddToCart(product, 1);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#EAD6DF] bg-[#FFFDF9] shadow-[0_8px_24px_rgba(81,36,58,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(81,36,58,0.1)]">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FFF4E8]">
        <button
          type="button"
          onClick={() => onViewDetails(product.id)}
          className="h-full w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-[#51243A]"
          aria-label={`View details for ${product.name}`}
        >
          <ProductImage
            src={product.image_url}
            alt={product.name}
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </button>

        <button
          type="button"
          onClick={() => onToggleWishlist(product.id)}
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          aria-pressed={isWishlisted}
          className={`absolute top-3 right-3 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition-colors ${
            isWishlisted
              ? 'border-[#D85B83] bg-[#D85B83] text-[#FFFDF9]'
              : 'border-[#EAD6DF] bg-[#FFFDF9]/90 text-[#51243A] hover:border-[#D85B83] hover:text-[#D85B83]'
          }`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs text-[#7D5E69]">
            <span className="font-medium tracking-wider uppercase">{product.category}</span>
            <span aria-hidden="true">·</span>
            <span className={outOfStock ? 'font-semibold text-[#A82846]' : 'tabular-nums'}>
              {outOfStock ? 'Out of stock' : `${product.stock} left`}
            </span>
          </div>

          <h3 className="mt-2 font-display text-xl leading-snug font-semibold text-[#38252D]">
            <button
              type="button"
              onClick={() => onViewDetails(product.id)}
              className="cursor-pointer text-left hover:text-[#D85B83] hover:underline hover:underline-offset-4"
            >
              {product.name}
            </button>
          </h3>

          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[#6E545F]">
            {product.description}
          </p>

          <p className="mt-3 text-base font-bold text-[#51243A] tabular-nums">
            {formatPKR(product.price)}
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2.5 border-t border-[#F3E6EB] pt-4">
          <button
            type="button"
            onClick={() => onViewDetails(product.id)}
            className="inline-flex min-h-[42px] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[#E5CED8] bg-[#FFF4E8] px-3 py-2 text-xs font-medium whitespace-nowrap text-[#38252D] transition-colors hover:border-[#C6A15B] hover:bg-[#FCE4EC]"
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            <span>View Details</span>
          </button>

          <button
            type="button"
            disabled={outOfStock}
            onClick={handleAdd}
            className={`inline-flex min-h-[42px] flex-[1.3] items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap text-[#FFFDF9] transition-colors ${
              outOfStock
                ? 'cursor-not-allowed bg-[#D4C3CA] text-[#6E545F]'
                : justAdded
                  ? 'cursor-pointer bg-[#51243A]'
                  : 'cursor-pointer bg-[#D85B83] hover:bg-[#C0466E]'
            }`}
          >
            {outOfStock ? (
              <span>Sold Out</span>
            ) : justAdded ? (
              <>
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
