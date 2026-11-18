import React, { useEffect, useState } from "react";

export type SmartImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
  srcSetSizes?: string;
};

const DEFAULT_FALLBACK =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='12'%3EImage%20unavailable%3C/text%3E%3C/svg%3E";

/**
 * SmartImage
 * - lazy loads by default
 * - supports responsive sizes via sizes/srcSet (consumer should provide if needed)
 * - graceful fallback on error
 */
export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  className,
  loading = "lazy",
  decoding = "async",
  fallbackSrc = DEFAULT_FALLBACK,
  srcSet,
  sizes,
  srcSetSizes,
  ...rest
}) => {
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(src as string);
  const handleError = () => {
    if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
  };

  // keep internal src in sync with prop changes (e.g., image sliders)
  useEffect(() => {
    setCurrentSrc(src as string);
  }, [src]);

  // If dev forgot alt, avoid a11y violation
  const safeAlt = alt ?? "";

  return (
    <img
      src={currentSrc}
      alt={safeAlt}
      className={className}
      loading={loading}
      decoding={decoding as "async" | "auto" | "sync"}
      srcSet={srcSet}
      sizes={sizes ?? srcSetSizes}
      onError={handleError}
      {...rest}
    />
  );
};

export default SmartImage;
