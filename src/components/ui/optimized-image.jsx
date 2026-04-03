import PropTypes from "prop-types"
import { useState } from "react"

import { cn } from "@/lib/utils"

/**
 * OptimizedImage Component
 *
 * A highly optimized image component with:
 * - Lazy loading
 * - Responsive images (srcset)
 * - Loading skeleton
 * - Error handling
 * - Modern format support (WebP, AVIF)
 * - Blur placeholder
 *
 * @example
 * <OptimizedImage
 *   src="/images/hero.jpg"
 *   alt="Hero image"
 *   width={800}
 *   height={600}
 *   sizes="(max-width: 768px) 100vw, 50vw"
 * />
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  loading = "lazy",
  sizes,
  srcSet,
  placeholderSrc,
  onLoad,
  onError,
  objectFit = "cover",
  priority = false,
  ...props
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = (e) => {
    setIsLoading(false)
    onLoad?.(e)
  }

  const handleError = (e) => {
    setIsLoading(false)
    setHasError(true)
    onError?.(e)
  }

  // Generate srcset for responsive images
  const generateSrcSet = (baseSrc) => {
    if (srcSet) return srcSet

    // Auto-generate srcset if CDN or image service is available
    // This is a placeholder - replace with your CDN/image service logic
    const widths = [320, 640, 768, 1024, 1280, 1920]
    return widths
      .map((w) => {
        // If using a CDN or image service, generate URLs like:
        // return `${baseSrc}?w=${w} ${w}w`
        return null
      })
      .filter(Boolean)
      .join(", ")
  }

  const imageSrcSet = generateSrcSet(src)

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ width, height }}
    >
      {/* Loading skeleton */}
      {isLoading && <div className="absolute inset-0 bg-muted animate-pulse" />}

      {/* Blur placeholder image */}
      {placeholderSrc && isLoading && (
        <img
          src={placeholderSrc}
          alt=""
          className="absolute inset-0 w-full h-full blur-sm"
          style={{ objectFit }}
          aria-hidden="true"
        />
      )}

      {/* Error state */}
      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center text-muted-foreground">
            <svg
              className="mx-auto h-12 w-12 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">Failed to load image</p>
          </div>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          srcSet={imageSrcSet}
          sizes={sizes}
          loading={priority ? "eager" : loading}
          decoding={priority ? "sync" : "async"}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
          )}
          style={{ objectFit }}
          {...props}
        />
      )}
    </div>
  )
}

OptimizedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string,
  loading: PropTypes.oneOf(["lazy", "eager"]),
  sizes: PropTypes.string,
  srcSet: PropTypes.string,
  placeholderSrc: PropTypes.string,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  objectFit: PropTypes.oneOf([
    "contain",
    "cover",
    "fill",
    "none",
    "scale-down",
  ]),
  priority: PropTypes.bool,
}

/**
 * Picture Component with modern format support
 * Automatically serves WebP/AVIF with fallback to original format
 */
export function PictureOptimized({
  src,
  alt,
  width,
  height,
  className,
  loading = "lazy",
  webpSrc,
  avifSrc,
  ...props
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Generate modern format URLs if not provided
  const getWebPUrl = (originalSrc) => {
    if (webpSrc) return webpSrc
    // Replace with your CDN/service logic
    // return originalSrc.replace(/\.(jpg|jpeg|png)$/, '.webp')
    return null
  }

  const getAVIFUrl = (originalSrc) => {
    if (avifSrc) return avifSrc
    // Replace with your CDN/service logic
    // return originalSrc.replace(/\.(jpg|jpeg|png)$/, '.avif')
    return null
  }

  const webpUrl = getWebPUrl(src)
  const avifUrl = getAVIFUrl(src)

  return (
    <div className={cn("relative", className)} style={{ width, height }}>
      {isLoading && <div className="absolute inset-0 bg-muted animate-pulse" />}

      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
          <span>Failed to load image</span>
        </div>
      ) : (
        <picture>
          {/* AVIF - most modern, best compression */}
          {avifUrl && <source srcSet={avifUrl} type="image/avif" />}

          {/* WebP - modern, good compression */}
          {webpUrl && <source srcSet={webpUrl} type="image/webp" />}

          {/* Fallback to original format */}
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading={loading}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false)
              setHasError(true)
            }}
            className={cn(
              "w-full h-full transition-opacity duration-300",
              isLoading ? "opacity-0" : "opacity-100",
            )}
            {...props}
          />
        </picture>
      )}
    </div>
  )
}

PictureOptimized.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string,
  loading: PropTypes.oneOf(["lazy", "eager"]),
  webpSrc: PropTypes.string,
  avifSrc: PropTypes.string,
}

/**
 * Background Image Component with lazy loading
 */
export function BackgroundImage({
  src,
  alt = "",
  className,
  children,
  loading = "lazy",
  ...props
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  return (
    <div className={cn("relative", className)} {...props}>
      {isLoading && <div className="absolute inset-0 bg-muted animate-pulse" />}

      <img
        src={src}
        alt={alt}
        loading={loading}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setHasError(true)
        }}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: -1 }}
      />

      {!hasError && (
        <div className={cn("relative", isLoading && "opacity-0")}>
          {children}
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <span className="text-muted-foreground">
            Background image unavailable
          </span>
        </div>
      )}
    </div>
  )
}

BackgroundImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
  loading: PropTypes.oneOf(["lazy", "eager"]),
}
