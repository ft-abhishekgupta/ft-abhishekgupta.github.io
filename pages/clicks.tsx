import DefaultLayout from "@/layouts/default";
import type { LoaderData } from "@/lib/loader";
import ClicksTile from "@/components/ClicksTile";
import SmartImage from "@/components/SmartImage";
import rawData from "../scripts/data/clicks.json";
import PageHeader from "@/components/PageHeader";
import { ImageWall } from "@/components/HeaderBackdrops";
import { useCallback, useEffect, useState } from "react";

interface ClickItem {
  permalink: string;
  localPath: string;
}

const data: ClickItem[] = rawData as ClickItem[];

export default function Clicks() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setActiveIndex(index);
  const closeLightbox = () => setActiveIndex(null);

  const goNext = useCallback(() => {
    if (activeIndex !== null) {
      setActiveIndex((activeIndex + 1) % data.length);
    }
  }, [activeIndex]);

  const goPrev = useCallback(() => {
    if (activeIndex !== null) {
      setActiveIndex((activeIndex - 1 + data.length) % data.length);
    }
  }, [activeIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (activeIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeIndex, goNext, goPrev]);

  const activeItem = activeIndex !== null ? data[activeIndex] : null;

  return (
    <DefaultLayout>
      <div className="mx-auto">
        <PageHeader
          backdrop={<ImageWall aspect="aspect-square" images={data.slice(0, 14).map((c) => c.localPath)} width="w-32 sm:w-44" />}
          description="Photographs from walks, trips and everything in between. Tap any frame to view it full size."
          stats={[{ value: data.length, label: "frames" }]}
          title="Clicks"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
          {data.map((item, index) => (
            <ClicksTile
              key={index}
              link={item.permalink}
              localPath={item.localPath}
              onClick={() => openLightbox(index)}
            />
          ))}
        </div>
      </div>

      {/* Lightbox overlay */}
      {activeItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          data-lenis-prevent
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-white text-3xl font-bold z-10 hover:text-gray-300 transition-colors w-10 h-10 flex items-center justify-center"
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            aria-label="Close"
          >
            ✕
          </button>

          {/* Previous button */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl font-bold z-10 hover:text-gray-300 transition-colors w-12 h-12 flex items-center justify-center"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            aria-label="Previous"
          >
            ‹
          </button>

          {/* Image - click opens Instagram */}
          <a
            href={`https://www.instagram.com/p/${activeItem.permalink}/`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="max-w-[90vw] max-h-[85vh] cursor-pointer"
          >
            <SmartImage
              src={activeItem.localPath}
              alt={activeItem.permalink}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              wrapperClassName="flex items-center justify-center rounded-lg"
              placeholderClassName="h-[60vh] w-[80vw] max-w-[90vw]"
            />
          </a>

          {/* Next button */}
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl font-bold z-10 hover:text-gray-300 transition-colors w-12 h-12 flex items-center justify-center"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            aria-label="Next"
          >
            ›
          </button>

          {/* Counter */}
          <div className="absolute bottom-4 text-white text-sm opacity-70">
            {activeIndex! + 1} / {data.length}
          </div>
        </div>
      )}
    </DefaultLayout>
  );
}

export function getStaticProps(): { props: { loader: LoaderData } } {
  const newest = [...(rawData as { localPath: string; timestamp?: string }[])].sort(
    (a, b) => (b.timestamp ?? "").localeCompare(a.timestamp ?? ""),
  )[0];

  return {
    props: {
      loader: {
        stats: [{ label: "frames", value: data.length }],
        image: newest?.localPath ?? null,
      },
    },
  };
}