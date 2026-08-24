import clsx from "clsx";
import React, { useCallback, useEffect, useRef, useState } from "react";

type Status = "loading" | "loaded" | "error";

export interface SmartImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "onLoad" | "onError"> {
  src?: string;
  alt: string;
  /** Optional WebP variant served through <picture> when the browser supports it. */
  webpSrc?: string;
  /** Classes for the wrapper that hosts the shimmer placeholder. */
  wrapperClassName?: string;
  wrapperStyle?: React.CSSProperties;
  /** Extra wrapper classes applied only while loading, used to reserve space. */
  placeholderClassName?: string;
  /** Render nothing instead of a broken-image badge when the source fails. */
  hideOnError?: boolean;
}

const BrokenIcon = () => (
  <svg
    aria-hidden="true"
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1.6}
    viewBox="0 0 24 24"
  >
    <rect height="16" rx="3" width="18" x="3" y="4" />
    <path d="m3 15 4-4 3.5 3.5M14 13l2.5-2.5L21 15" />
    <circle cx="9" cy="9" r="1.4" />
  </svg>
);

/**
 * Image wrapper that shows an animated shimmer placeholder until the bitmap has
 * decoded, then cross-fades the picture in. Falls back to a muted badge when the
 * source cannot be loaded.
 */
export default function SmartImage({
  src,
  alt,
  webpSrc,
  className,
  wrapperClassName,
  wrapperStyle,
  placeholderClassName,
  hideOnError = false,
  ...imgProps
}: SmartImageProps) {
  const [status, setStatus] = useState<Status>("loading");
  const ref = useRef<HTMLImageElement>(null);

  // Cached or pre-hydration images can finish loading before React attaches its
  // handlers, so reconcile against the element's own state on mount.
  useEffect(() => {
    setStatus("loading");

    const img = ref.current;

    if (!src || !img || !img.complete) return;

    setStatus(img.naturalWidth > 0 ? "loaded" : "error");
  }, [src, webpSrc]);

  const handleLoad = useCallback(() => setStatus("loaded"), []);
  const handleError = useCallback(() => setStatus("error"), []);

  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...imgProps}
      ref={ref}
      alt={alt}
      className={clsx(
        "transition-opacity duration-500 ease-out",
        status === "loaded" ? "opacity-100" : "opacity-0",
        className,
      )}
      src={src}
      onError={handleError}
      onLoad={handleLoad}
    />
  );

  return (
    <div
      className={clsx(
        "relative overflow-hidden",
        wrapperClassName,
        status === "loading" && placeholderClassName,
      )}
      style={wrapperStyle}
    >
      {status === "loading" && (
        <span
          aria-hidden="true"
          className="img-shimmer pointer-events-none absolute inset-0 z-[1] bg-default-100"
        />
      )}

      {status === "error" && !hideOnError && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center bg-default-100 text-default-400"
        >
          <BrokenIcon />
        </span>
      )}

      {webpSrc ? (
        <picture>
          <source srcSet={webpSrc} type="image/webp" />
          {image}
        </picture>
      ) : (
        image
      )}
    </div>
  );
}
