import { ArrowRight, X, ZoomIn } from 'lucide-react';
import { useMemo, useState } from 'react';
import { GALLERY_ITEMS } from '../data/catalogSeed';
import type { GalleryItem } from '../types/shop';

interface GalleryPageProps {
  onNavigate: (path: string) => void;
}

export function GalleryPage({ onNavigate }: GalleryPageProps) {
  const [selectedTheme, setSelectedTheme] = useState<string>('All');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  const themes = useMemo(
    () => ['All', ...GALLERY_ITEMS.map((g) => g.category)],
    []
  );

  const visibleItems = useMemo(() => {
    if (selectedTheme === 'All') return GALLERY_ITEMS;
    return GALLERY_ITEMS.filter((g) => g.category === selectedTheme);
  }, [selectedTheme]);

  return (
    <div className="min-h-[75vh] bg-[#FCE4EC]">
      <section className="border-b border-[#EED3DF] bg-[#FFF4E8]">
        <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#C6A15B] uppercase">
            Visual Editorial Lookbook
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-[#51243A] sm:text-5xl">
            Luxury Beauty Image Gallery
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#6E545F]">
            Explore curated makeup collections, apothecary skincare rituals, velvet lipsticks,
            crystal perfume salons, and keepsake coffrets. Hover to zoom or click any frame to
            inspect.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {themes.map((theme) => {
              const active = selectedTheme === theme;
              return (
                <button
                  key={theme}
                  type="button"
                  onClick={() => setSelectedTheme(theme)}
                  className={`min-h-[38px] cursor-pointer rounded-xl border px-4 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? 'border-[#51243A] bg-[#51243A] text-[#FFFDF9]'
                      : 'border-[#E5CED8] bg-[#FFFDF9] text-[#51243A] hover:border-[#C6A15B]'
                  }`}
                >
                  {theme}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((item, idx) => (
            <article
              key={item.id}
              className={`group flex flex-col overflow-hidden rounded-2xl border border-[#EAD6DF] bg-[#FFFDF9] shadow-sm transition-shadow hover:shadow-lg ${
                idx === 0 && selectedTheme === 'All' ? 'md:col-span-2' : ''
              }`}
            >
              <button
                type="button"
                onClick={() => setLightboxItem(item)}
                className="relative aspect-[4/3] w-full cursor-pointer overflow-hidden bg-[#FFF4E8]"
                aria-label={`Zoom image: ${item.title}`}
              >
                <img
                  src={item.image_url}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <span className="absolute right-3 bottom-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#51243A]/85 text-[#FFFDF9] opacity-0 transition-opacity group-hover:opacity-100">
                  <ZoomIn className="h-4 w-4" />
                </span>
              </button>

              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <p className="text-xs font-semibold tracking-wider text-[#C6A15B] uppercase">
                    {item.category}
                  </p>
                  <h2 className="mt-1.5 font-display text-2xl font-semibold text-[#51243A]">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#6E545F]">{item.caption}</p>
                </div>

                <div className="mt-5 border-t border-[#F3E6EB] pt-4">
                  <button
                    type="button"
                    onClick={() => onNavigate(item.targetRoute)}
                    className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-[#D85B83] hover:underline"
                  >
                    <span>Shop This Collection</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#381626]/80 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightboxItem(null);
          }}
        >
          <div className="relative max-w-4xl overflow-hidden rounded-3xl border border-[#C6A15B] bg-[#FFFDF9] shadow-2xl">
            <button
              type="button"
              onClick={() => setLightboxItem(null)}
              aria-label="Close lightbox"
              className="absolute top-4 right-4 z-10 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#51243A] text-[#FFFDF9] hover:bg-[#D85B83]"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={lightboxItem.image_url}
              alt={lightboxItem.title}
              className="max-h-[70vh] w-full object-cover"
            />
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#FFF4E8] p-6">
              <div>
                <p className="text-xs font-semibold tracking-wider text-[#C6A15B] uppercase">
                  {lightboxItem.category}
                </p>
                <h3 className="font-display text-2xl font-semibold text-[#51243A]">
                  {lightboxItem.title}
                </h3>
                <p className="mt-1 text-sm text-[#6E545F]">{lightboxItem.caption}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const target = lightboxItem.targetRoute;
                  setLightboxItem(null);
                  onNavigate(target);
                }}
                className="inline-flex min-h-[42px] cursor-pointer items-center gap-2 rounded-xl bg-[#D85B83] px-5 text-xs font-semibold text-[#FFFDF9] hover:bg-[#C0466E]"
              >
                <span>Explore Collection</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
