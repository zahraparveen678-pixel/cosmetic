import { useState } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function ProductImage({ src, alt, className = '' }: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#FFF4E8] via-[#FCE4EC] to-[#F7D2DF] p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <svg
          className="mb-2 h-8 w-8 text-[#C6A15B]"
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          aria-hidden="true"
        >
          <path d="M13 5h6v4l2.5 3.2A4 4 0 0 1 22.4 14.7V25a2 2 0 0 1-2 2h-8.8a2 2 0 0 1-2-2V14.7a4 4 0 0 1 .9-2.5L13 9V5Z" />
          <path d="M12 5h8" />
        </svg>
        <span className="font-display text-sm font-medium text-[#51243A] line-clamp-2">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`h-full w-full object-cover ${className}`}
    />
  );
}
