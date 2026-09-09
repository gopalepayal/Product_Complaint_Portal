import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const brands = [
  { name: "Samsung", slug: "samsung", category: "Electronics" },
  { name: "Apple", slug: "apple", category: "Electronics" },
  { name: "LG", slug: "lg", category: "Home Appliances" },
  { name: "Philips", slug: "philips", category: "Personal Care" },
  { name: "Bajaj", slug: "bajaj", category: "Home Appliances" },
  { name: "HP", slug: "hp", category: "Computing" },
];
const products = [
  { brand: "Samsung", name: "Galaxy A55", type: "Smartphone", category: "Electronics", modelName: "Galaxy A55", modelNumber: "SM-A556E" },
  { brand: "Apple", name: "iPhone 15", type: "Smartphone", category: "Electronics", modelName: "iPhone 15", modelNumber: "A3090" },
  { brand: "LG", name: "6.5 kg Front Load Washer", type: "Washing Machine", category: "Home Appliances", modelName: "FHM1065", modelNumber: "FHM1065" },
  { brand: "Philips", name: "OneBlade Trimmer", type: "Trimmer", category: "Personal Care", modelName: "OneBlade", modelNumber: "QP2525" },
  { brand: "HP", name: "Pavilion 14", type: "Laptop", category: "Computing", modelName: "Pavilion 14", modelNumber: "14-dv2014TU" },
];

async function main() {
  const brandMap = new Map<string, string>();
  for (const brand of brands) {
    const saved = await prisma.brand.upsert({ where: { slug: brand.slug }, update: { category: brand.category }, create: brand });
    brandMap.set(saved.name, saved.id);
  }
  for (const product of products) {
    const brandId = brandMap.get(product.brand);
    if (!brandId) continue;
    const existing = await prisma.product.findFirst({ where: { brandId, modelNumber: product.modelNumber } });
    if (!existing) await prisma.product.create({ data: { brandId, name: product.name, type: product.type, category: product.category, modelName: product.modelName, modelNumber: product.modelNumber, description: "Development catalogue record for the Product Complaint Portal." } });
  }
  console.log("Generic development brands and products seeded.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
