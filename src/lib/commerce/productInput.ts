import type { ProductWriteInput } from "@/lib/repositories/products";
import type { Availability, ProductCategory } from "@/types/product";

const availability = new Set<Availability>(["AVAILABLE", "SOLD_OUT", "HIDDEN"]);
const categories = new Set<ProductCategory>(["cake", "dessert"]);

function requiredString(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} is required.`);
  return value.trim();
}

function optionalString(value: unknown) {
  return typeof value === "string" ? value.trim() || undefined : undefined;
}

function wholeNumber(value: unknown, label: string, min = 0) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min) throw new Error(`${label} must be a whole number.`);
  return value;
}

export function validateProductInput(value: unknown): ProductWriteInput {
  if (!value || typeof value !== "object") throw new Error("A product payload is required.");
  const input = value as Record<string, unknown>;
  const category = input.category;
  const productAvailability = input.availability;
  if (typeof category !== "string" || !categories.has(category as ProductCategory)) throw new Error("A valid product category is required.");
  if (typeof productAvailability !== "string" || !availability.has(productAvailability as Availability)) throw new Error("A valid availability value is required.");
  return {
    slug: requiredString(input.slug, "Slug").toLowerCase(),
    name: requiredString(input.name, "Name"),
    description: requiredString(input.description, "Description"),
    price: wholeNumber(input.price, "Price"),
    category: category as ProductCategory,
    flavour: optionalString(input.flavour),
    size: optionalString(input.size),
    preparationTime: optionalString(input.preparationTime),
    image: optionalString(input.image),
    imagePublicId: optionalString(input.imagePublicId),
    availability: productAvailability as Availability,
    featured: input.featured === true,
    freshToday: input.freshToday === true,
    displayOrder: wholeNumber(input.displayOrder, "Display order"),
  };
}
