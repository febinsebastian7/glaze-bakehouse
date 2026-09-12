"use client";

import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import ProductCard from "@/components/products/ProductCard";
import { useStore } from "@/components/store/StoreProvider";
import type { ProductCategory } from "@/types/product";

export default function CataloguePage({
  category,
}: {
  category: ProductCategory;
}) {
  const { products, productsError, productsLoading } = useStore();

  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("search") === "1";
  });

  const searchInput = useRef<HTMLInputElement>(null);
  const [flavour, setFlavour] = useState("All flavours");
  const [availability, setAvailability] = useState("All");

  const label =
    category === "cake" ? "Celebration cakes" : "Daily desserts";

  const title =
    category === "cake" ? (
      <>
        Find your{" "}
        <span className="font-script text-[var(--caramel)]">perfect</span>{" "}
        slice.
      </>
    ) : (
      <>
        Sweet things,{" "}
        <span className="font-script text-[var(--caramel)]">made today.</span>
      </>
    );

  const categoryProducts = useMemo(
    () =>
      products
        .filter(
          (product) =>
            product.category === category &&
            product.availability !== "HIDDEN",
        )
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [products, category],
  );

  const flavours = [
    ...new Set(
      categoryProducts.map((product) => product.flavour).filter(Boolean),
    ),
  ];

  const normalizedSearch = search.trim().toLowerCase();

  const filtered = categoryProducts.filter((product) => {
    const searchable = [
      product.name,
      product.description,
      product.flavour,
      product.category,
      label,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      (!normalizedSearch || searchable.includes(normalizedSearch)) &&
      (flavour === "All flavours" || product.flavour === flavour) &&
      (availability === "All" || product.availability === availability)
    );
  });

  useEffect(() => {
    if (searchOpen) {
      searchInput.current?.focus();
    }
  }, [searchOpen]);

  const toggleSearch = () => {
    if (searchOpen) {
      setSearch("");
    }

    setSearchOpen((open) => !open);
  };

  const emptyMessage = categoryProducts.length
    ? ["Nothing sweet found.", "Try another search or clear a filter."]
    : [
        "Fresh batches are coming soon.",
        "Our next treats are being prepared with care.",
      ];

  return (
    <main className="min-h-screen bg-[var(--vanilla)]">
      <section className="container-glaze pb-7 pt-12 md:pb-10 md:pt-20">
        <p className="glaze-eyebrow text-[var(--caramel)]">{label}</p>

        <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[0.9] tracking-[-0.04em] md:text-7xl">
          {title}
        </h1>

        <p className="mt-5 max-w-xl text-sm leading-6 text-[var(--cocoa)]/60">
          Browse what Glaze is making now. Add cakes and desserts to the same
          bag, then choose delivery or pickup at checkout.
        </p>
      </section>

      <section className="border-y border-[var(--cocoa)]/10 bg-[#f4ebdf]">
        <div className="container-glaze flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex w-full min-w-0 gap-2 sm:w-auto">
            <button
              type="button"
              aria-label={
                searchOpen
                  ? "Close search and clear query"
                  : `Search ${label.toLowerCase()}`
              }
              aria-expanded={searchOpen}
              aria-controls={`${category}-catalogue-search`}
              onClick={toggleSearch}
              className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--cocoa)]/16 bg-white/55 px-3 text-[9px] font-semibold uppercase tracking-[.13em] text-[var(--cocoa)] transition hover:border-[var(--caramel)] hover:text-[var(--caramel)]"
            >
              <Search size={16} strokeWidth={1.7} />
              <span className="hidden sm:inline">Search</span>
            </button>

            {searchOpen && (
              <label className="relative min-w-0 flex-1 sm:w-72">
                <span className="sr-only">
                  Search {label.toLowerCase()}
                </span>

                <Search
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--cocoa)]/45"
                />

                <input
                  ref={searchInput}
                  id={`${category}-catalogue-search`}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={`Search ${label.toLowerCase()}`}
                  className="glaze-field glaze-search-field h-11 w-full pr-10"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-[var(--cocoa)]/50 hover:text-[var(--caramel)]"
                  >
                    <X size={15} />
                  </button>
                )}
              </label>
            )}
          </div>

          <div className="grid w-full grid-cols-1 gap-3 sm:w-auto sm:grid-cols-2">
            <label className="relative sm:w-44">
              <span className="sr-only">Filter by flavour</span>

              <SlidersHorizontal
                size={14}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--cocoa)]/45"
              />

              <select
                value={flavour}
                onChange={(event) => setFlavour(event.target.value)}
                className="glaze-field glaze-select-with-leading-icon h-11 w-full appearance-none"
              >
                <option>All flavours</option>

                {flavours.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>

              <ChevronDown
                size={15}
                aria-hidden="true"
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--cocoa)]/50"
              />
            </label>

            <label className="relative sm:w-40">
              <span className="sr-only">Filter by availability</span>

              <select
                value={availability}
                onChange={(event) => setAvailability(event.target.value)}
                className="glaze-field glaze-select-with-trailing-icon h-11 w-full appearance-none"
              >
                <option value="All">All items</option>
                <option value="AVAILABLE">Available</option>
                <option value="SOLD_OUT">Sold out</option>
              </select>

              <ChevronDown
                size={15}
                aria-hidden="true"
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--cocoa)]/50"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="container-glaze py-10 md:py-14">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--cocoa)]/55">
            {productsLoading
              ? "Loading treats"
              : `${filtered.length} ${
                  filtered.length === 1 ? "item" : "items"
                }`}
          </p>

          <p className="hidden text-[9px] font-semibold uppercase tracking-[0.13em] text-[var(--cocoa)]/45 md:block">
            Made carefully, for your moment
          </p>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="aspect-[.76] animate-pulse rounded-[1.4rem] bg-[var(--cream-light)]"
              />
            ))}
          </div>
        ) : productsError ? (
          <div className="rounded-[1.5rem] border border-dashed border-[var(--cocoa)]/20 bg-[var(--cream-light)] px-6 py-16 text-center">
            <p className="font-display text-3xl">
              The catalogue needs a moment.
            </p>

            <p className="mt-2 text-sm text-[var(--cocoa)]/55">
              Please refresh and try again.
            </p>
          </div>
        ) : filtered.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-[var(--cocoa)]/20 bg-[var(--cream-light)] px-6 py-16 text-center">
            <p className="font-display text-3xl">{emptyMessage[0]}</p>

            <p className="mt-2 text-sm text-[var(--cocoa)]/55">
              {emptyMessage[1]}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}