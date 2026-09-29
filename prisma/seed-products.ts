import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type BrandSeed = {
  name: string;
  officialWebsite: string;
  category: string;
};

type ProductSeed = {
  brand: string;
  name: string;
  type: string;
  category: string;
  modelName?: string;
  modelNumber?: string;
  imageUrl?: string;
  description?: string;
};

const brands: BrandSeed[] = [
  {
    name: "Samsung",
    officialWebsite: "https://www.samsung.com",
    category: "Electronics",
  },
  {
    name: "Apple",
    officialWebsite: "https://www.apple.com",
    category: "Electronics",
  },
  {
    name: "LG",
    officialWebsite: "https://www.lg.com",
    category: "Home Appliances",
  },
  {
    name: "Sony",
    officialWebsite: "https://www.sony.com",
    category: "Electronics",
  },
  {
    name: "OnePlus",
    officialWebsite: "https://www.oneplus.com",
    category: "Mobile & Tablets",
  },
  {
    name: "HP",
    officialWebsite: "https://www.hp.com",
    category: "Computing",
  },
  {
    name: "Dell",
    officialWebsite: "https://www.dell.com",
    category: "Computing",
  },
  {
    name: "Lenovo",
    officialWebsite: "https://www.lenovo.com",
    category: "Computing",
  },
  {
    name: "Philips",
    officialWebsite: "https://www.philips.com",
    category: "Personal Care",
  },
  {
    name: "Bosch",
    officialWebsite: "https://www.bosch.com",
    category: "Home Appliances",
  },
  {
    name: "Whirlpool",
    officialWebsite: "https://www.whirlpool.com",
    category: "Home Appliances",
  },
  {
    name: "NIVEA",
    officialWebsite: "https://www.nivea.com",
    category: "Personal Care",
  },
  {
    name: "L'Oréal Paris",
    officialWebsite: "https://www.loreal-paris.com",
    category: "Cosmetics & Beauty",
  },
  {
    name: "Maybelline New York",
    officialWebsite: "https://www.maybelline.com",
    category: "Cosmetics & Beauty",
  },
  {
    name: "Himalaya",
    officialWebsite: "https://www.himalayawellness.in",
    category: "Personal Care",
  },
  {
    name: "Dabur",
    officialWebsite: "https://www.dabur.com",
    category: "Pharmaceutical",
  },
  {
    name: "Dettol",
    officialWebsite: "https://www.dettol.co.in",
    category: "Household Products",
  },
  {
    name: "Puma",
    officialWebsite: "https://in.puma.com",
    category: "Clothing & Accessories",
  },
  {
    name: "Nike",
    officialWebsite: "https://www.nike.com",
    category: "Clothing & Accessories",
  },
  {
    name: "Hyundai",
    officialWebsite: "https://www.hyundai.com",
    category: "Automotive",
  },
  {
    name: "Maruti Suzuki",
    officialWebsite: "https://www.marutisuzuki.com",
    category: "Automotive",
  },
  {
    name: "Tata Motors",
    officialWebsite: "https://www.tatamotors.com",
    category: "Automotive",
  },
  {
    name: "Nestlé",
    officialWebsite: "https://www.nestle.com",
    category: "Food & Beverages",
  },
  {
    name: "Coca-Cola",
    officialWebsite: "https://www.coca-cola.com",
    category: "Food & Beverages",
  },
  {
    name: "Britannia",
    officialWebsite: "https://www.britannia.co.in",
    category: "Food & Beverages",
  },
  {
    name: "Pampers",
    officialWebsite: "https://www.pampers.com",
    category: "Household Products",
  },
  {
    name: "Medtronic",
    officialWebsite: "https://www.medtronic.com",
    category: "Medical Devices",
  },
  {
    name: "Abbott",
    officialWebsite: "https://www.abbott.com",
    category: "Pharmaceutical",
  },
  {
    name: "Cipla",
    officialWebsite: "https://www.cipla.com",
    category: "Pharmaceutical",
  },
  {
    name: "HealthKart",
    officialWebsite: "https://www.healthkart.com",
    category: "Nutraceutical",
  },
];

const products: ProductSeed[] = [
  // --------------------------------------------------
  // ELECTRONICS
  // --------------------------------------------------

  {
    brand: "Samsung",
    name: "Samsung Galaxy Buds3 Pro",
    type: "Wireless Earbuds",
    category: "Electronics",
    modelName: "Galaxy Buds3 Pro",
    description: "Premium true wireless earbuds from Samsung.",
  },

  {
    brand: "Sony",
    name: "Sony WH-1000XM5",
    type: "Wireless Headphones",
    category: "Electronics",
    modelName: "WH-1000XM5",
    description: "Wireless noise cancelling headphones from Sony.",
  },

  {
    brand: "Apple",
    name: "Apple AirPods Pro (2nd Generation)",
    type: "Wireless Earbuds",
    category: "Electronics",
    modelName: "AirPods Pro 2",
    description: "Apple true wireless earbuds with active noise cancellation.",
  },

  // --------------------------------------------------
  // HOME APPLIANCES
  // --------------------------------------------------

  {
    brand: "LG",
    name: "LG 9kg Front Load Washing Machine",
    type: "Washing Machine",
    category: "Home Appliances",
    modelName: "9kg Front Load Washing Machine",
    description: "Front load washing machine from LG.",
  },

  {
    brand: "Samsung",
    name: "Samsung 8kg Front Load Washing Machine",
    type: "Washing Machine",
    category: "Home Appliances",
    modelName: "8kg Front Load Washing Machine",
    description: "Front load washing machine from Samsung.",
  },

  {
    brand: "Bosch",
    name: "Bosch 8kg Front Load Washing Machine",
    type: "Washing Machine",
    category: "Home Appliances",
    modelName: "8kg Front Load Washing Machine",
    description: "Front load washing machine from Bosch.",
  },

  // --------------------------------------------------
  // COMPUTING
  // --------------------------------------------------

  {
    brand: "HP",
    name: "HP Pavilion 14",
    type: "Laptop",
    category: "Computing",
    modelName: "Pavilion 14",
    description: "HP Pavilion series laptop.",
  },

  {
    brand: "Dell",
    name: "Dell Inspiron 15",
    type: "Laptop",
    category: "Computing",
    modelName: "Inspiron 15",
    description: "Dell Inspiron series laptop.",
  },

  {
    brand: "Lenovo",
    name: "Lenovo IdeaPad Slim 3",
    type: "Laptop",
    category: "Computing",
    modelName: "IdeaPad Slim 3",
    description: "Lenovo IdeaPad Slim series laptop.",
  },

  // --------------------------------------------------
  // MOBILE & TABLETS
  // --------------------------------------------------

  {
    brand: "Apple",
    name: "Apple iPhone 15",
    type: "Smartphone",
    category: "Mobile & Tablets",
    modelName: "iPhone 15",
    description: "Apple iPhone 15 smartphone.",
  },

  {
    brand: "Samsung",
    name: "Samsung Galaxy S24",
    type: "Smartphone",
    category: "Mobile & Tablets",
    modelName: "Galaxy S24",
    description: "Samsung Galaxy S24 smartphone.",
  },

  {
    brand: "OnePlus",
    name: "OnePlus 12",
    type: "Smartphone",
    category: "Mobile & Tablets",
    modelName: "OnePlus 12",
    description: "OnePlus flagship smartphone.",
  },

  // --------------------------------------------------
  // PERSONAL CARE
  // --------------------------------------------------

  {
    brand: "Philips",
    name: "Philips OneBlade",
    type: "Personal Grooming Device",
    category: "Personal Care",
    modelName: "OneBlade",
    description: "Personal grooming device from Philips.",
  },

  {
    brand: "NIVEA",
    name: "NIVEA Men Deep Impact Fresh Deodorant",
    type: "Deodorant",
    category: "Personal Care",
    description: "Men's deodorant from NIVEA.",
  },

  {
    brand: "Himalaya",
    name: "Himalaya Purifying Neem Face Wash",
    type: "Face Wash",
    category: "Personal Care",
    description: "Neem based face cleansing product.",
  },

  // --------------------------------------------------
  // COSMETICS & BEAUTY
  // --------------------------------------------------

  {
    brand: "L'Oréal Paris",
    name: "L'Oréal Paris Revitalift Crystal Micro-Essence",
    type: "Face Essence",
    category: "Cosmetics & Beauty",
    description: "Facial essence from L'Oréal Paris.",
  },

  {
    brand: "Maybelline New York",
    name: "Maybelline Fit Me Matte + Poreless Foundation",
    type: "Foundation",
    category: "Cosmetics & Beauty",
    description: "Face foundation from Maybelline New York.",
  },

  {
    brand: "L'Oréal Paris",
    name: "L'Oréal Paris Hyaluron Expert Serum",
    type: "Face Serum",
    category: "Cosmetics & Beauty",
    description: "Hyaluronic acid based facial serum.",
  },

  // --------------------------------------------------
  // PHARMACEUTICAL
  // --------------------------------------------------

  {
    brand: "Abbott",
    name: "Duphalac Oral Solution",
    type: "Oral Solution",
    category: "Pharmaceutical",
    description: "Lactulose oral solution product.",
  },

  {
    brand: "Cipla",
    name: "Budecort Respules",
    type: "Respules",
    category: "Pharmaceutical",
    description: "Respiratory medicine product from Cipla.",
  },

  {
    brand: "Abbott",
    name: "Digene Gel",
    type: "Antacid",
    category: "Pharmaceutical",
    description: "Antacid product from Abbott.",
  },

  // --------------------------------------------------
  // NUTRACEUTICAL
  // --------------------------------------------------

  {
    brand: "HealthKart",
    name: "MuscleBlaze Biozyme Performance Whey",
    type: "Protein Supplement",
    category: "Nutraceutical",
    description: "Protein supplement product.",
  },

  {
    brand: "Himalaya",
    name: "Himalaya Ashvagandha",
    type: "Herbal Supplement",
    category: "Nutraceutical",
    description: "Herbal supplement product from Himalaya.",
  },

  {
    brand: "Himalaya",
    name: "Himalaya Triphala",
    type: "Herbal Supplement",
    category: "Nutraceutical",
    description: "Herbal supplement product from Himalaya.",
  },

  // --------------------------------------------------
  // MEDICAL DEVICES
  // --------------------------------------------------

  {
    brand: "Medtronic",
    name: "Medtronic MiniMed 780G",
    type: "Insulin Pump",
    category: "Medical Devices",
    modelName: "MiniMed 780G",
    description: "Insulin pump system from Medtronic.",
  },

  {
    brand: "Medtronic",
    name: "Medtronic Guardian 4 Sensor",
    type: "Glucose Sensor",
    category: "Medical Devices",
    modelName: "Guardian 4",
    description: "Continuous glucose monitoring sensor.",
  },

  {
    brand: "Philips",
    name: "Philips DreamStation 2",
    type: "CPAP Device",
    category: "Medical Devices",
    modelName: "DreamStation 2",
    description: "CPAP therapy device.",
  },

  // --------------------------------------------------
  // AUTOMOTIVE
  // --------------------------------------------------

  {
    brand: "Hyundai",
    name: "Hyundai Creta",
    type: "SUV",
    category: "Automotive",
    modelName: "Creta",
    description: "SUV from Hyundai.",
  },

  {
    brand: "Maruti Suzuki",
    name: "Maruti Suzuki Swift",
    type: "Hatchback",
    category: "Automotive",
    modelName: "Swift",
    description: "Hatchback from Maruti Suzuki.",
  },

  {
    brand: "Tata Motors",
    name: "Tata Nexon",
    type: "SUV",
    category: "Automotive",
    modelName: "Nexon",
    description: "SUV from Tata Motors.",
  },

  // --------------------------------------------------
  // FOOD & BEVERAGES
  // --------------------------------------------------

  {
    brand: "Nestlé",
    name: "Nestlé MAGGI 2-Minute Noodles",
    type: "Instant Noodles",
    category: "Food & Beverages",
    description: "Instant noodle product from Nestlé.",
  },

  {
    brand: "Coca-Cola",
    name: "Coca-Cola Original Taste",
    type: "Soft Drink",
    category: "Food & Beverages",
    description: "Carbonated soft drink.",
  },

  {
    brand: "Britannia",
    name: "Britannia Good Day Butter Cookies",
    type: "Biscuits",
    category: "Food & Beverages",
    description: "Butter cookies from Britannia.",
  },

  // --------------------------------------------------
  // HOUSEHOLD PRODUCTS
  // --------------------------------------------------

  {
    brand: "Dettol",
    name: "Dettol Antiseptic Liquid",
    type: "Antiseptic Liquid",
    category: "Household Products",
    description: "Antiseptic liquid product.",
  },

  {
    brand: "Pampers",
    name: "Pampers Premium Care Diapers",
    type: "Diapers",
    category: "Household Products",
    description: "Baby diaper product from Pampers.",
  },

  {
    brand: "Dettol",
    name: "Dettol Liquid Handwash",
    type: "Handwash",
    category: "Household Products",
    description: "Liquid handwash product.",
  },

  // --------------------------------------------------
  // CLOTHING & ACCESSORIES
  // --------------------------------------------------

  {
    brand: "Puma",
    name: "Puma Suede Classic",
    type: "Shoes",
    category: "Clothing & Accessories",
    modelName: "Suede Classic",
    description: "Classic footwear from Puma.",
  },

  {
    brand: "Nike",
    name: "Nike Air Force 1 '07",
    type: "Shoes",
    category: "Clothing & Accessories",
    modelName: "Air Force 1 '07",
    description: "Classic footwear from Nike.",
  },

  {
    brand: "Puma",
    name: "Puma Essentials Logo T-Shirt",
    type: "T-Shirt",
    category: "Clothing & Accessories",
    description: "Casual T-shirt from Puma.",
  },

  // --------------------------------------------------
  // OTHER
  // --------------------------------------------------

  {
    brand: "Apple",
    name: "Apple AirTag",
    type: "Bluetooth Tracker",
    category: "Other",
    modelName: "AirTag",
    description: "Bluetooth item tracker from Apple.",
  },

  {
    brand: "Samsung",
    name: "Samsung SmartTag2",
    type: "Bluetooth Tracker",
    category: "Other",
    modelName: "SmartTag2",
    description: "Bluetooth item tracker from Samsung.",
  },

  {
    brand: "Sony",
    name: "Sony PlayStation 5",
    type: "Gaming Console",
    category: "Other",
    modelName: "PlayStation 5",
    description: "Gaming console from Sony.",
  },
];

function createSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  console.log("======================================");
  console.log("Product Complaint Portal - DB Seed");
  console.log("======================================");

  const brandsCreated = 0;
  const brandsExisting = 0;
  let productsCreated = 0;
  let productsExisting = 0;

  // --------------------------------------------------
  // CREATE / UPDATE BRANDS
  // --------------------------------------------------

  console.log("\nPreparing brands...");

  const brandMap = new Map<string, string>();

  for (const brandData of brands) {
    const slug = createSlug(brandData.name);

    const brand = await prisma.brand.upsert({
      where: {
        name: brandData.name,
      },
      update: {
        officialWebsite: brandData.officialWebsite,
        category: brandData.category,
      },
      create: {
        name: brandData.name,
        slug,
        officialWebsite: brandData.officialWebsite,
        category: brandData.category,
        verificationStatus: "PENDING",
      },
    });

    brandMap.set(brandData.name, brand.id);

    const existingBrand = await prisma.brand.findUnique({
      where: {
        id: brand.id,
      },
      select: {
        createdAt: true,
      },
    });

    if (existingBrand) {
      // The upsert succeeded. Counts are informational only.
      console.log(`✓ Brand ready: ${brandData.name}`);
    }
  }

  console.log(`\nBrands ready: ${brandMap.size}`);

  // --------------------------------------------------
  // CREATE PRODUCTS
  // --------------------------------------------------

  console.log("\nPreparing products...");

  for (const productData of products) {
    const brandId = brandMap.get(productData.brand);

    if (!brandId) {
      console.error(
        `✗ Brand not found for product: ${productData.name}`
      );
      continue;
    }

    const existingProduct = await prisma.product.findFirst({
      where: {
        brandId,
        name: productData.name,
        category: productData.category,
      },
    });

    if (existingProduct) {
      productsExisting++;

      console.log(`↳ Product already exists: ${productData.name}`);

      continue;
    }

    await prisma.product.create({
      data: {
        brandId,
        name: productData.name,
        type: productData.type,
        category: productData.category,
        modelName: productData.modelName ?? null,
        modelNumber: productData.modelNumber ?? null,
        imageUrl: productData.imageUrl ?? null,
        description: productData.description ?? null,
      },
    });

    productsCreated++;

    console.log(`✓ Product created: ${productData.name}`);
  }

  // --------------------------------------------------
  // FINAL DATABASE COUNT
  // --------------------------------------------------

  const totalBrands = await prisma.brand.count();

  const totalProducts = await prisma.product.count({
    where: {
      mergedIntoId: null,
    },
  });

  console.log("\n======================================");
  console.log("SEED COMPLETED");
  console.log("======================================");

  console.log(`Brands in seed list: ${brands.length}`);
  console.log(`Brands ready in database: ${totalBrands}`);

  console.log(`Products in seed list: ${products.length}`);
  console.log(`Products created: ${productsCreated}`);
  console.log(`Products already existing: ${productsExisting}`);
  console.log(`Products currently in database: ${totalProducts}`);

  console.log("======================================");
}

main()
  .catch((error) => {
    console.error("\nSeed failed:");
    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });