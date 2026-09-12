"use client";

import ProductCarousel from "@/components/products/ProductCarousel";
import { useStore } from "@/components/store/StoreProvider";

export default function OurCollection() {
  const { products, productsError, productsLoading, refreshProducts } = useStore();
  // Every visible cake belongs in this collection. "Featured" remains useful
  // for future editorial placements, but must not hide new admin-added cakes.
  const cakes = products.filter((product) => product.category === "cake" && product.availability !== "HIDDEN").sort((a, b) => a.displayOrder - b.displayOrder);
  return (
    <section className="pt-12 pb-16 md:pt-16 md:pb-20">
      <div className="container-glaze">

        <div className="mb-8 text-center">
          <p className="glaze-eyebrow text-[var(--caramel)]">
            Our collection
          </p>

          <h2 className="mt-2 font-display text-4xl text-[var(--cocoa)] md:text-5xl">
            Find your{" "}
            <span className="font-script text-[var(--caramel)]">
              perfect
            </span>{" "}
            slice.
          </h2>
        </div>

        <ProductCarousel
          key={cakes.map((cake) => cake.id).join(":") || "empty-cakes"}
          products={cakes}
          viewAllHref="/cakes"
          viewAllLabel="View All Cakes"
          isLoading={productsLoading}
          error={productsError}
          onRetry={() => { void refreshProducts(); }}
          emptyTitle="Our next cake collection is coming soon."
          emptyDescription="Please check back shortly for new celebration cakes."
        />

      </div>
    </section>
  );
}
