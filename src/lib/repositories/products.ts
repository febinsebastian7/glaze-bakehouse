import "server-only";

import { ProductAvailability, ProductCategory, type Product as DatabaseProduct, type Flavour } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { cloudinaryConfiguration, deleteCloudinaryImage } from "@/lib/services/cloudinary";
import type { Availability, Product, ProductCategory as StorefrontCategory } from "@/types/product";

type ProductWithFlavour = DatabaseProduct & { flavour: Flavour | null };

export type ProductWriteInput = {
  slug: string;
  name: string;
  description: string;
  price: number;
  category: StorefrontCategory;
  flavour?: string;
  size?: string;
  preparationTime?: string;
  image?: string;
  imagePublicId?: string;
  availability: Availability;
  featured: boolean;
  freshToday: boolean;
  displayOrder: number;
};

function mapProduct(product: ProductWithFlavour): Product {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.primaryImageUrl ?? undefined,
    imagePublicId: product.primaryImagePublicId ?? undefined,
    category: product.category === ProductCategory.CAKE ? "cake" : "dessert",
    flavour: product.flavour?.name,
    size: product.baseSize ?? undefined,
    preparationTime: product.preparationTime ?? undefined,
    availability: product.availability as Availability,
    featured: product.featured,
    freshToday: product.freshToday,
    displayOrder: product.displayOrder,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

async function flavourId(name: string | undefined) {
  const trimmedName = name?.trim();
  if (!trimmedName) return null;
  const flavour = await prisma.flavour.upsert({ where: { name: trimmedName }, create: { name: trimmedName }, update: {} });
  return flavour.id;
}

function dataFor(input: ProductWriteInput, flavourIdValue: string | null) {
  return {
    slug: input.slug,
    name: input.name.trim(),
    description: input.description.trim(),
    price: input.price,
    category: input.category === "cake" ? ProductCategory.CAKE : ProductCategory.DESSERT,
    flavourId: flavourIdValue,
    primaryImageUrl: input.image?.trim() || null,
    primaryImagePublicId: input.imagePublicId?.trim() || null,
    availability: input.availability as ProductAvailability,
    featured: input.featured,
    freshToday: input.freshToday,
    displayOrder: input.displayOrder,
    preparationTime: input.preparationTime?.trim() || null,
    baseSize: input.size?.trim() || null,
  };
}

export async function listProducts() {
  const products = await prisma.product.findMany({ include: { flavour: true }, orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] });
  return products.map(mapProduct);
}

/** Public catalogue data deliberately excludes hidden products. */
export async function listPublicProducts() {
  const products = await prisma.product.findMany({
    where: { availability: { not: ProductAvailability.HIDDEN } },
    include: { flavour: true },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });
  return products.map(mapProduct);
}

export async function createProduct(input: ProductWriteInput) {
  const product = await prisma.product.create({ data: dataFor(input, await flavourId(input.flavour)), include: { flavour: true } });
  return mapProduct(product);
}

export async function updateProduct(id: string, input: ProductWriteInput) {
  const product = await prisma.product.update({ where: { id }, data: dataFor(input, await flavourId(input.flavour)), include: { flavour: true } });
  return mapProduct(product);
}

/** Permanently remove the catalogue record. Historical order lines keep their snapshots. */
export async function deleteProduct(id: string) {
  const product = await prisma.product.delete({ where: { id }, include: { flavour: true } });
  const mapped = mapProduct(product);

  // Database deletion is authoritative. Image cleanup is deliberately best effort:
  // a Cloudinary outage must not make a successful permanent deletion look failed.
  let imageCleanupFailed = false;
  if (mapped.imagePublicId && cloudinaryConfiguration().configured) {
    try {
      await deleteCloudinaryImage(mapped.imagePublicId);
    } catch (error) {
      imageCleanupFailed = true;
      console.error("Product image cleanup failed after permanent product deletion.", error);
    }
  }
  return { product: mapped, imageCleanupFailed };
}
