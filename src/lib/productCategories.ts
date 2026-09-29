export const PRODUCT_CATEGORIES = [
  "Electronics",
  "Home Appliances",
  "Computing",
  "Mobile & Tablets",
  "Personal Care",
  "Cosmetics & Beauty",
  "Pharmaceutical",
  "Nutraceutical",
  "Medical Devices",
  "Automotive",
  "Food & Beverages",
  "Household Products",
  "Clothing & Accessories",
  "Shoes / Footwear",
  "Ayurvedic",
  "Surgical",
  "Diagnostic",
  "Other",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];