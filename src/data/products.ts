import type { Product, ReviewRecord } from "@/types/product";

const now = "2026-08-17T00:00:00.000Z";

export const cakeProducts: Product[] = [
  { id: "cake-1", slug: "chocolate-indulgence", name: "Chocolate Indulgence", description: "Rich chocolate cake with silky ganache and a soft, deeply cocoa sponge.", price: 1299, image: "/images/cakes/cake-01.webp", category: "cake", flavour: "Chocolate", size: "1 kg", preparationTime: "48 hours", availability: "AVAILABLE", featured: true, freshToday: false, displayOrder: 1, createdAt: now, updatedAt: now },
  { id: "cake-2", slug: "fruity-bliss", name: "Fruity Bliss", description: "Fresh berries layered with delicate cream for a light celebration centrepiece.", price: 1499, image: "/images/cakes/cake-02.webp", category: "cake", flavour: "Vanilla & berries", size: "1 kg", preparationTime: "48 hours", availability: "AVAILABLE", featured: true, freshToday: false, displayOrder: 2, createdAt: now, updatedAt: now },
  { id: "cake-3", slug: "floral-elegance", name: "Floral Elegance", description: "Elegant vanilla cake finished with fresh florals and delicate buttercream.", price: 1699, image: "/images/cakes/cake-03.webp", category: "cake", flavour: "Vanilla", size: "1 kg", preparationTime: "72 hours", availability: "AVAILABLE", featured: true, freshToday: false, displayOrder: 3, createdAt: now, updatedAt: now },
  { id: "cake-4", slug: "kids-collection", name: "Kids Collection", description: "A joyful handcrafted cake for little celebrations and big smiles.", price: 1399, image: "/images/cakes/cake-04.webp", category: "cake", flavour: "Chocolate or vanilla", size: "1 kg", preparationTime: "72 hours", availability: "AVAILABLE", featured: true, freshToday: false, displayOrder: 4, createdAt: now, updatedAt: now },
  { id: "cake-5", slug: "caramel-dreams", name: "Caramel Dreams", description: "Soft sponge finished with golden caramel, a little sea salt and lots of warmth.", price: 1299, image: "/images/cakes/cake-05.webp", category: "cake", flavour: "Caramel", size: "1 kg", preparationTime: "48 hours", availability: "AVAILABLE", featured: true, freshToday: false, displayOrder: 5, createdAt: now, updatedAt: now },
];

// Dessert photographs have not been supplied yet. The storefront intentionally
// renders a refined photo placeholder until the owner uploads the real assets.
export const dessertProducts: Product[] = [
  { id: "dessert-1", slug: "chocolate-truffle", name: "Chocolate Truffle", description: "Rich, smooth and deeply chocolatey — made fresh for today.", price: 699, category: "dessert", flavour: "Chocolate", availability: "AVAILABLE", featured: true, freshToday: true, displayOrder: 1, createdAt: now, updatedAt: now },
  { id: "dessert-2", slug: "strawberry-bliss", name: "Strawberry Bliss", description: "Fresh strawberries folded through delicate vanilla cream.", price: 749, category: "dessert", flavour: "Strawberry", availability: "AVAILABLE", featured: true, freshToday: true, displayOrder: 2, createdAt: now, updatedAt: now },
  { id: "dessert-3", slug: "caramel-cup", name: "Caramel Cup", description: "Golden caramel layered with soft sponge and a hint of sea salt.", price: 599, category: "dessert", flavour: "Caramel", availability: "AVAILABLE", featured: true, freshToday: true, displayOrder: 3, createdAt: now, updatedAt: now },
  { id: "dessert-4", slug: "pistachio-delight", name: "Pistachio Delight", description: "A gently nutty, creamy dessert for pistachio lovers.", price: 749, category: "dessert", flavour: "Pistachio", availability: "SOLD_OUT", featured: false, freshToday: true, displayOrder: 4, createdAt: now, updatedAt: now },
];

export const seedProducts = [...cakeProducts, ...dessertProducts];

export const seedReviews: ReviewRecord[] = [];

export const availableFlavours = ["Chocolate", "Vanilla", "Strawberry", "Caramel", "Pistachio"];
