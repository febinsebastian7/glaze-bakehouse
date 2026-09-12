"use client";

import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type { Product } from "@/types/product";
import ProductImage from "@/components/products/ProductImage";
import ProductCartAction from "@/components/products/ProductCartAction";

interface ProductCarouselProps {
  products: Product[];
  viewAllHref: string;
  viewAllLabel: string;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export default function ProductCarousel({
  products,
  viewAllHref,
  viewAllLabel,
  isLoading = false,
  error = "",
  onRetry,
  emptyTitle = "Fresh batches are coming soon.",
  emptyDescription = "We are preparing something lovely for you.",
}: ProductCarouselProps) {
  /*
   * -------------------------------------------------------
   * LIMIT TO 10 PRODUCTS
   * -------------------------------------------------------
   */

  const items = products.slice(0, 10);

  const hasMultiple = items.length > 1;

  /*
   * -------------------------------------------------------
   * INFINITE DATA
   *
   * [LAST] [1] [2] [3] [4] [5] [FIRST]
   * -------------------------------------------------------
   */

  const slides = hasMultiple
    ? [
        items[items.length - 1],
        ...items,
        items[0],
      ]
    : items;

  /*
   * -------------------------------------------------------
   * STATE
   * -------------------------------------------------------
   */

  const [activeIndex, setActiveIndex] =
    useState(hasMultiple ? 1 : 0);

  const [animate, setAnimate] =
    useState(true);

  const [paused, setPaused] =
    useState(false);

  /*
   * -------------------------------------------------------
   * ACTUAL CAROUSEL WIDTH
   * -------------------------------------------------------
   */

  const viewportRef =
    useRef<HTMLDivElement>(null);

  const [viewportWidth, setViewportWidth] =
    useState(0);

  /*
   * -------------------------------------------------------
   * MEASURE THE REAL CONTAINER
   *
   * This is the important fix.
   *
   * We do NOT use vw.
   *
   * We measure the actual carousel width.
   * -------------------------------------------------------
   */

  useEffect(() => {
    const element = viewportRef.current;

    if (!element) return;

    const updateSize = () => {
      setViewportWidth(
        element.getBoundingClientRect().width
      );
    };

    updateSize();

    const observer =
      new ResizeObserver(updateSize);

    observer.observe(element);

    window.addEventListener(
      "resize",
      updateSize
    );

    return () => {
      observer.disconnect();

      window.removeEventListener(
        "resize",
        updateSize
      );
    };
  }, []);

  /*
   * -------------------------------------------------------
   * CAROUSEL GEOMETRY
   *
   * 70% = active slide
   * 15% = left peek
   * 15% = right peek
   *
   * The slide itself is 55% of the viewport.
   *
   * Why?
   *
   * Card width = 70%
   * Distance between card centers = 55%
   *
   * Therefore:
   *
   * 70 - 55 = 15%
   *
   * which gives us the desired overlap/peek.
   * -------------------------------------------------------
   */

const slideWidth =
  viewportWidth * 0.52;

  /*
   * The active card is centered by putting
   * its CENTER at the center of the viewport.
   *
   * Slide center is:
   *
   * slide start + slideWidth / 2
   *
   * Card is centered inside slide.
   */

  const centerOffset =
    viewportWidth / 2 -
    slideWidth / 2;

  /*
   * Track translation.
   */

  const translateX =
    centerOffset -
    activeIndex * slideWidth;

  /*
   * -------------------------------------------------------
   * NEXT
   * -------------------------------------------------------
   */

  const next = useCallback(() => {
    if (!hasMultiple) return;

    setAnimate(true);

    setActiveIndex(
      (current) => current + 1
    );
  }, [hasMultiple]);

  /*
   * -------------------------------------------------------
   * PREVIOUS
   * -------------------------------------------------------
   */

  const previous = useCallback(() => {
    if (!hasMultiple) return;

    setAnimate(true);

    setActiveIndex(
      (current) => current - 1
    );
  }, [hasMultiple]);

  /*
   * -------------------------------------------------------
   * AUTOPLAY
   *
   * 5 seconds.
   * -------------------------------------------------------
   */

  const autoplayRef =
    useRef<ReturnType<
      typeof setInterval
    > | null>(null);

  useEffect(() => {
    if (!hasMultiple || paused) {
      return;
    }

    autoplayRef.current =
      setInterval(() => {
        next();
      }, 5000);

    return () => {
      if (autoplayRef.current) {
        clearInterval(
          autoplayRef.current
        );
      }
    };
  }, [
    hasMultiple,
    paused,
    next,
  ]);

  /*
   * -------------------------------------------------------
   * INFINITE LOOP
   * -------------------------------------------------------
   */

  const resetTimerRef =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  useEffect(() => {
    if (!hasMultiple) return;

    /*
     * Reached cloned FIRST.
     *
     * [5] [1] [2] [3] [4] [5] [1]
     *                         ↑
     */

    if (
      activeIndex ===
      items.length + 1
    ) {
      resetTimerRef.current =
        setTimeout(() => {
          setAnimate(false);

          setActiveIndex(1);

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setAnimate(true);
            });
          });
        }, 700);
    }

    /*
     * Reached cloned LAST.
     *
     * [5] [1] [2] [3] [4] [5] [1]
     *  ↑
     */

    if (activeIndex === 0) {
      resetTimerRef.current =
        setTimeout(() => {
          setAnimate(false);

          setActiveIndex(
            items.length
          );

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setAnimate(true);
            });
          });
        }, 700);
    }

    return () => {
      if (resetTimerRef.current) {
        clearTimeout(
          resetTimerRef.current
        );
      }
    };
  }, [
    activeIndex,
    hasMultiple,
    items.length,
  ]);

  /*
   * -------------------------------------------------------
   * TOUCH SWIPE
   * -------------------------------------------------------
   */

  const touchStartX =
    useRef<number | null>(null);

  const touchStartY =
    useRef<number | null>(null);

  const handleTouchStart = (
    event: React.TouchEvent<HTMLDivElement>
  ) => {
    setPaused(true);

    touchStartX.current =
      event.touches[0].clientX;

    touchStartY.current =
      event.touches[0].clientY;
  };

  const handleTouchEnd = (
    event: React.TouchEvent<HTMLDivElement>
  ) => {
    setPaused(false);

    if (
      touchStartX.current === null ||
      touchStartY.current === null
    ) {
      return;
    }

    const endX =
      event.changedTouches[0].clientX;

    const endY =
      event.changedTouches[0].clientY;

    const deltaX =
      touchStartX.current - endX;

    const deltaY =
      touchStartY.current - endY;

    /*
     * Ignore vertical scrolling.
     */

    if (
      Math.abs(deltaX) >
      Math.abs(deltaY)
    ) {
      if (Math.abs(deltaX) > 45) {
        if (deltaX > 0) {
          next();
        } else {
          previous();
        }
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  /*
   * -------------------------------------------------------
   * DOTS
   * -------------------------------------------------------
   */

  const goTo = (index: number) => {
    setAnimate(true);

    setActiveIndex(index + 1);
  };

  /*
   * -------------------------------------------------------
   * REAL ACTIVE INDEX
   * -------------------------------------------------------
   */

  const realActiveIndex =
    hasMultiple
      ? (activeIndex -
          1 +
          items.length) %
        items.length
      : 0;

  if (isLoading) {
    return (
      <div role="status" className="rounded-[1.5rem] bg-[var(--cream-light)] px-6 py-12 text-center">
        <p className="font-display text-3xl">Preparing the collection…</p>
        <p className="mt-2 text-sm text-[var(--cocoa)]/55">Loading today&apos;s cakes and desserts.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="rounded-[1.5rem] border border-dashed border-[var(--cocoa)]/20 bg-[var(--cream-light)] px-6 py-12 text-center">
        <p className="font-display text-3xl">The collection needs a moment.</p>
        <p className="mt-2 text-sm text-[var(--cocoa)]/55">{error}</p>
        {onRetry && <button type="button" onClick={onRetry} className="glaze-outline-button mt-6 rounded-full px-5 py-3 text-[9px] font-semibold uppercase tracking-[.14em]">Try again</button>}
      </div>
    );
  }

  // `next/image` with `fill` needs a measured parent. Rendering a brief shell
  // avoids mounting image frames inside a zero-width carousel during startup.
  if (!viewportWidth) {
    return (
      <div ref={viewportRef} role="status" className="w-full rounded-[1.5rem] bg-[var(--cream-light)] px-6 py-12 text-center">
        <p className="font-display text-3xl">Preparing the collection…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-[var(--cocoa)]/20 bg-[var(--cream-light)] px-6 py-12 text-center">
        <p className="font-display text-3xl">{emptyTitle}</p>
        <p className="mt-2 text-sm text-[var(--cocoa)]/55">{emptyDescription}</p>
        <Link href={viewAllHref} className="glaze-outline-button mt-6 inline-flex rounded-full px-5 py-3 text-[9px] font-semibold uppercase tracking-[.14em]">{viewAllLabel}</Link>
      </div>
    );
  }

  /*
   * -------------------------------------------------------
   * RENDER
   * -------------------------------------------------------
   */

  return (
    <div className="w-full">
      {/* ===================================================
          CAROUSEL VIEWPORT
      =================================================== */}

      <div
        ref={viewportRef}
        className="
          relative
          w-full
          overflow-hidden
          py-2
        "
        onMouseEnter={() =>
          setPaused(true)
        }
        onMouseLeave={() =>
          setPaused(false)
        }
        onTouchStart={
          handleTouchStart
        }
        onTouchEnd={
          handleTouchEnd
        }
      >
        {/* =================================================
            TRACK
        ================================================= */}

        <div
          className={`
            flex
            items-start
            ${
              animate
                ? "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                : ""
            }
          `}
          style={{
            width: `${
              slides.length *
              slideWidth
            }px`,

            transform:
              viewportWidth > 0
                ? `translate3d(${translateX}px, 0, 0)`
                : "translate3d(0, 0, 0)",
          }}
        >
          {slides.map(
            (product, index) => {
              const distance =
                Math.abs(
                  index -
                    activeIndex
                );

              const isActive =
                index ===
                activeIndex;

              const isNeighbour =
                distance === 1;

              return (
                <div
                  key={`${product.id}-${index}`}
                  className="
                    flex
                    shrink-0
                    justify-center
                  "
                  style={{
                    width: `${slideWidth}px`,
                  }}
                >
                  {/* ===================================
                      PRODUCT CARD
                  =================================== */}

                  <article
  className={`
    origin-center
    overflow-hidden
    rounded-[1.35rem]
    bg-[#f7efe4]
    shadow-[0_12px_35px_rgba(74,42,25,0.10)]
    transition-all
    duration-500
    ease-out

    ${
      isActive
        ? `
          z-20
          scale-100
          opacity-100
          blur-0
        `
        : isNeighbour
          ? `
            z-10
            scale-[0.82]
            opacity-45
            blur-[3px]
          `
          : `
            z-0
            scale-[0.78]
            opacity-0
            blur-[5px]
          `
    }
  `}
  style={{
    /*
     * Smaller cards on mobile.
     * Slightly larger on desktop.
     */
    width: "min(64vw, 330px)",
  }}
>
  {/* =========================================
      PRODUCT IMAGE
  ========================================= */}

  <div
    className="
      relative
      aspect-[1/1]
      w-full
      overflow-hidden
      bg-[#eee4d7]
    "
  >
    <ProductImage product={product} />
  </div>

  {/* =========================================
      PRODUCT INFORMATION
  ========================================= */}

  <div
    className="
      px-4
      pb-4
      pt-3
      sm:px-5
      sm:pb-5
    "
  >
    {/* NAME + PRICE */}

    <div
      className="
        flex
        items-center
        justify-between
        gap-3
      "
    >
      <h3
        className="
          min-w-0
          truncate
          font-display
          text-[1rem]
          leading-tight
          text-[var(--cocoa)]
          sm:text-[1.1rem]
        "
      >
        {product.name}
      </h3>

      <span
        className="
          shrink-0
          text-[0.85rem]
          font-medium
          text-[var(--cocoa)]
        "
      >
        ₹
        {product.price.toLocaleString(
          "en-IN"
        )}
      </span>
    </div>

    {/* DESCRIPTION */}

    <p
      className="
        mt-1
        truncate
        text-[8px]
        uppercase
        tracking-[0.09em]
        text-[var(--cocoa)]/50
      "
      title={product.description}
    >
      {product.description}
    </p>

    {/* ADD TO CART */}

    <div className="mt-3">
      <ProductCartAction product={product} fullWidth />
    </div>
  </div>
</article>
                </div>
              );
            }
          )}
        </div>

        {/* =================================================
            PREVIOUS BUTTON
        ================================================= */}

        {hasMultiple && (
          <button
            type="button"
            onClick={previous}
            aria-label="Previous product"
            className="
              absolute
              left-3
              top-[38%]
              z-40
              hidden
              h-10
              w-10
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              border
              border-[var(--cocoa)]/15
              bg-[var(--vanilla)]/90
              text-[var(--cocoa)]
              shadow-sm
              backdrop-blur-sm
              transition
              hover:border-[var(--caramel)]
              hover:text-[var(--caramel)]
              md:flex
            "
          >
            <ChevronLeft
              size={16}
            />
          </button>
        )}

        {/* =================================================
            NEXT BUTTON
        ================================================= */}

        {hasMultiple && (
          <button
            type="button"
            onClick={next}
            aria-label="Next product"
            className="
              absolute
              right-3
              top-[38%]
              z-40
              hidden
              h-10
              w-10
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              border
              border-[var(--cocoa)]/15
              bg-[var(--vanilla)]/90
              text-[var(--cocoa)]
              shadow-sm
              backdrop-blur-sm
              transition
              hover:border-[var(--caramel)]
              hover:text-[var(--caramel)]
              md:flex
            "
          >
            <ChevronRight
              size={16}
            />
          </button>
        )}
      </div>

      {/* ===================================================
          DOTS
      =================================================== */}

      {hasMultiple && (
        <div
  className="
    mt-4
    flex
    justify-center
    gap-1.5
  "
>
          {items.map(
            (product, index) => (
              <button
                key={product.id}
                type="button"
                aria-label={`Go to ${product.name}`}
                onClick={() =>
                  goTo(index)
                }
                className={`
                  h-1.5
                  rounded-full
                  transition-all
                  duration-300

                  ${
                    realActiveIndex ===
                    index
                      ? "w-5 bg-[var(--caramel)]"
                      : "w-1.5 bg-[var(--cocoa)]/20"
                  }
                `}
              />
            )
          )}
        </div>
      )}

      {/* ===================================================
          VIEW ALL
      =================================================== */}

      <div
  className="
    mt-6
    flex
    justify-center
  "
>
        <Link
          href={viewAllHref}
          className="
            group
            inline-flex
            h-11
            items-center
            gap-3
            rounded-full
            border
            border-[var(--cocoa)]/20
            px-6
            text-[9px]
            font-semibold
            uppercase
            tracking-[0.16em]
            text-[var(--cocoa)]
            transition-all
            duration-300
            hover:border-[var(--caramel)]
            hover:text-[var(--caramel)]
          "
        >
          {viewAllLabel}

          <ArrowRight
            size={14}
            className="
              transition-transform
              duration-300
              group-hover:translate-x-1
            "
          />
        </Link>
      </div>
    </div>
  );
}
