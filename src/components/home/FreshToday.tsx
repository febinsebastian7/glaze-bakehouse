"use client";

import ProductCarousel from "@/components/products/ProductCarousel";
import { useStore } from "@/components/store/StoreProvider";

export default function FreshToday() {
  const { products, productsError, productsLoading, refreshProducts } = useStore();
  const desserts = products.filter((product) => product.freshToday && product.availability !== "HIDDEN").sort((a, b) => a.displayOrder - b.displayOrder);
  return (
    <section className="section-glaze pb-12 md:pb-16">
      <div className="container-glaze">
        <div className="mb-8">
          <p className="glaze-eyebrow text-[var(--caramel)]">
            Fresh from the kitchen
          </p>

          <h2 className="mt-2 font-display text-4xl text-[var(--cocoa)] md:text-5xl">
            Fresh Today
          </h2>
        </div>

        <ProductCarousel
          key={desserts.map((dessert) => dessert.id).join(":") || "empty-fresh-today"}
          products={desserts}
          viewAllHref="/desserts"
          viewAllLabel="View All Desserts"
          isLoading={productsLoading}
          error={productsError}
          onRetry={() => { void refreshProducts(); }}
          emptyTitle="Fresh batches are coming soon."
          emptyDescription="We are preparing something lovely for you."
        />
      </div>
    </section>
  );
}
