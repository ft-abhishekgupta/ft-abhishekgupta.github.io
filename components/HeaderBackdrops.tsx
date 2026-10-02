import VelocityMarquee from "@/components/motion/VelocityMarquee";
import SmartImage from "@/components/SmartImage";

/** Looping, muted background clip for a page header. */
export function VideoBackdrop({
  src,
  className = "",
}: {
  src: string;
  className?: string;
}) {
  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      aria-hidden="true"
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
      preload="metadata"
      src={src}
    />
  );
}

/**
 * Two tilted rows of artwork drifting in opposite directions (and reacting to
 * scroll velocity) behind a page title.
 */
export function ImageWall({
  images,
  aspect = "aspect-[2/3]",
  width = "w-28 sm:w-36",
}: {
  images: string[];
  aspect?: string;
  width?: string;
}) {
  const half = Math.ceil(images.length / 2);
  const rows = [images.slice(0, half), images.slice(half)];

  return (
    <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 -rotate-6 scale-110 flex-col gap-3">
      {rows.map((row, r) => (
        <VelocityMarquee key={r} copies={3} reverse={r === 1} speed={22}>
          {row.map((src) => (
            <div key={src} className={`mr-3 shrink-0 overflow-hidden rounded-lg ${width}`}>
              <SmartImage alt="" className={`${aspect} w-full object-cover`} loading="lazy" src={src} wrapperClassName={`${aspect} w-full`} />
            </div>
          ))}
        </VelocityMarquee>
      ))}
    </div>
  );
}
