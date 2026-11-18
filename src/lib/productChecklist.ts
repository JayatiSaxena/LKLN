import type { Product } from "./api/services/products";

export type ChecklistInput = Partial<Pick<Product,
  "name" | "description" | "price" | "category" | "sku" | "brand" | "sizes" | "colors" |
  "material" | "fit" | "care_instructions" | "image_url" | "images" | "stock_quantity">>;

export interface ChecklistItem { key: string; label: string; done: boolean }

const filled = (v?: string | null, min = 1) => (v ?? "").trim().length >= min;

export const getChecklist = (p: ChecklistInput): ChecklistItem[] => {
  const imgs = new Set([...(p.images ?? []), ...(p.image_url ? [p.image_url] : [])].filter(Boolean));
  return [
    { key: "name", label: "Product name (3+ characters)", done: filled(p.name, 3) },
    { key: "description", label: "Description (60+ characters)", done: filled(p.description, 60) },
    { key: "price", label: "Price greater than 0", done: Number(p.price) > 0 },
    { key: "category", label: "Category selected", done: filled(p.category) },
    { key: "sku", label: "SKU assigned", done: filled(p.sku) },
    { key: "brand", label: "Brand", done: filled(p.brand) },
    { key: "sizes", label: "At least one size", done: (p.sizes ?? []).length > 0 },
    { key: "colors", label: "At least one colour", done: (p.colors ?? []).length > 0 },
    { key: "material", label: "Material / fabric", done: filled(p.material) },
    { key: "fit", label: "Fit", done: filled(p.fit) },
    { key: "care", label: "Care instructions", done: filled(p.care_instructions) },
    { key: "images", label: "Main image + 1 gallery image (2+ images)", done: imgs.size >= 2 },
    { key: "stock", label: "Stock available", done: Number(p.stock_quantity) > 0 },
  ];
};

export const getCompletion = (p: ChecklistInput) => {
  const items = getChecklist(p);
  const done = items.filter((i) => i.done).length;
  return { items, done, total: items.length, percent: Math.round((done / items.length) * 100) };
};
