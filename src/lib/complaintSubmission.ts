import { prisma } from "@/lib/prisma";
import { ComplaintStatus } from "@prisma/client";
import { generateComplaintNumber } from "@/lib/complaintNumber";
import { sendComplaintNotification } from "@/lib/notifications";

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function dateOrNull(value: unknown): Date | null {
  const raw = text(value);

  if (!raw) {
    return null;
  }

  const parsed = new Date(raw);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function slugFor(name: string): string {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "brand";

  return `${base}-${Date.now().toString(36)}`;
}

export async function createComplaintFromData(
  data: Record<string, unknown>
) {
  const legalName = text(data.consumerName);
  const email = text(data.consumerEmail).toLowerCase();
  const authenticatedConsumerId = text(data.authenticatedConsumerId);

  const brandName = text(data.brandName);
  const productName = text(data.productName);
  const productId = text(data.productId);

  const title = text(data.title);
  const description = text(data.description);

  const productType = text(data.productType) || "Other";
  const productCategory = text(data.productCategory) || "Other";
  const modelName = text(data.modelName);
  const modelNumber = text(data.modelNumber);

  // --------------------------------------------------
  // Validate required complaint information
  // --------------------------------------------------

  if (
    !legalName ||
    !email ||
    !brandName ||
    !productName ||
    !title ||
    !description
  ) {
    throw new Error("Missing required complaint data.");
  }

  // --------------------------------------------------
  // Find / verify consumer
  // --------------------------------------------------

  // --------------------------------------------------
  // Find / verify consumer (only if authenticated)
  // --------------------------------------------------

  let existingConsumer = null;

  if (authenticatedConsumerId) {
    existingConsumer = await prisma.user.findUnique({
      where: {
        id: authenticatedConsumerId,
      },
    });

    if (!existingConsumer || existingConsumer.role !== "CONSUMER") {
      throw new Error(
        "The authenticated consumer account could not be verified."
      );
    }
  }

  const mobileText = text(data.consumerMobile) || null;
  const contactEmailText = email || null;


  // No OTP verification required for consumer complaint submission.
  // Consumers submit directly; notification is sent via their chosen preference.

  // --------------------------------------------------
  // Find product by explicit productId first
  // --------------------------------------------------

  let selectedProduct = productId
    ? await prisma.product.findUnique({
        where: {
          id: productId,
        },
        include: {
          brand: true,
        },
      })
    : null;

  let brand = selectedProduct?.brand ?? null;

  // --------------------------------------------------
  // Find or create brand dynamically
  //
  // There is NO fixed brand list.
  //
  // Any brand entered by a consumer can be created.
  // Existing brands are reused.
  //
  // --------------------------------------------------

  if (!brand) {
    const normalizedBrandName = normalize(brandName);

    const existingBrands = await prisma.brand.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        category: true,
        officialWebsite: true,
        verificationStatus: true,
        verifiedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    brand =
      existingBrands.find(
        (item) => normalize(item.name) === normalizedBrandName
      ) ?? null;

    if (!brand) {
      brand = await prisma.brand.create({
        data: {
          name: brandName,
          slug: slugFor(brandName),
          verificationStatus: "PENDING",
        },
      });
    }
  }

  // --------------------------------------------------
  // Validate explicit productId against selected brand
  // --------------------------------------------------

  if (selectedProduct && selectedProduct.brandId !== brand.id) {
    throw new Error(
      "The selected product does not belong to the selected brand."
    );
  }

  // --------------------------------------------------
  // Find existing product for this brand
  //
  // Product grouping priority:
  //
  // 1. Explicit productId
  // 2. Brand + model number
  // 3. Brand + model name + product name
  // 4. Brand + product name + type + category
  //
  // If an existing product is found, the complaint is linked
  // to that product instead of creating a duplicate.
  //
  // --------------------------------------------------

  if (!selectedProduct) {
    const brandProducts = await prisma.product.findMany({
      where: {
        brandId: brand.id,
      },
      select: {
        id: true,
        brandId: true,
        name: true,
        type: true,
        category: true,
        modelName: true,
        modelNumber: true,
      },
    });

    const normalizedProductName = normalize(productName);
    const normalizedProductType = normalize(productType);
    const normalizedProductCategory = normalize(productCategory);
    const normalizedModelName = normalize(modelName);
    const normalizedModelNumber = normalize(modelNumber);

    // ------------------------------------------------
    // Match by model number
    // ------------------------------------------------

    if (normalizedModelNumber) {
      const modelNumberMatch = brandProducts.find(
        (item) =>
          normalize(item.modelNumber || "") === normalizedModelNumber
      );

      if (modelNumberMatch) {
        selectedProduct = await prisma.product.findUnique({
          where: {
            id: modelNumberMatch.id,
          },
          include: {
            brand: true,
          },
        });
      }
    }

    // ------------------------------------------------
    // Match by model name + product name
    // ------------------------------------------------

    if (!selectedProduct && normalizedModelName) {
      const modelNameMatch = brandProducts.find(
        (item) =>
          normalize(item.modelName || "") === normalizedModelName &&
          normalize(item.name) === normalizedProductName
      );

      if (modelNameMatch) {
        selectedProduct = await prisma.product.findUnique({
          where: {
            id: modelNameMatch.id,
          },
          include: {
            brand: true,
          },
        });
      }
    }

    // ------------------------------------------------
    // Match by product name + type + category
    // ------------------------------------------------

    if (!selectedProduct) {
      const productIdentityMatch = brandProducts.find(
        (item) =>
          normalize(item.name) === normalizedProductName &&
          normalize(item.type) === normalizedProductType &&
          normalize(item.category) === normalizedProductCategory
      );

      if (productIdentityMatch) {
        selectedProduct = await prisma.product.findUnique({
          where: {
            id: productIdentityMatch.id,
          },
          include: {
            brand: true,
          },
        });
      }
    }
  }

  // --------------------------------------------------
  // Create product only when it does not already exist
  // --------------------------------------------------

  if (!selectedProduct) {
    selectedProduct = await prisma.product.create({
      data: {
        brandId: brand.id,
        name: productName,
        type: productType,
        category: productCategory,
        modelName: modelName || null,
        modelNumber: modelNumber || null,
        description: text(data.productDescription) || null,
        purchaseLocation: text(data.purchaseLocation) || null,
      },
      include: {
        brand: true,
      },
    });
  }

  // --------------------------------------------------
  // Normalize severity
  // --------------------------------------------------

  const severityValue = text(data.severity).toUpperCase();

  const severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" =
    ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(severityValue)
      ? (severityValue as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL")
      : "MEDIUM";

  // --------------------------------------------------
  // Create complaint
  // --------------------------------------------------

  const complaint = await prisma.complaint.create({
    data: {
      complaintNumber: await generateComplaintNumber(),

      consumerId: existingConsumer ? existingConsumer.id : null,
      contactEmail: contactEmailText,
      contactPhone: mobileText,

      productId: selectedProduct.id,

      brandId: brand.id,

      title,

      description,

      incidentDate: dateOrNull(data.incidentDate),

      purchaseDate: dateOrNull(data.purchaseDate),

      retailer:
        text(data.retailer) ||
        text(data.purchaseLocation) ||
        null,

      purchaseCity: text(data.purchaseCity) || null,

      purchaseState: text(data.purchaseState) || null,

      purchaseCountry:
        text(data.purchaseCountry) || "India",

      issueCategory:
        text(data.issueCategory) || "Other",

      severity,

      desiredResolution:
        text(data.desiredResolution) ||
        text(data.expectedResolution) ||
        null,

      isAnonymous: data.isAnonymous === true,

        displayName: text(data.displayName) || null,



        statusHistory: {
          create: {
            status: ComplaintStatus.UNDER_REVIEW,
            note: "Complaint submitted and is under review.",
          },
        },
    },
  });

  // --------------------------------------------------
  // Send notification via consumer's preferred channel
  //
  // The complaint is already saved. Notification failure
  // must NEVER delete or invalidate the complaint.
  // --------------------------------------------------

  const notifyResult = await sendComplaintNotification({
    email: contactEmailText,
    phone: mobileText,
    consumerName: legalName,
    complaintNumber: complaint.complaintNumber,
    complaintTitle: title,
    productName: selectedProduct.name,
    brandName: brand.name,
    submittedAt: complaint.createdAt,
  });
  
  if (notifyResult.emailSent) {
    console.log(`[EMAIL] Complaint notification sent successfully to ${contactEmailText} for ${complaint.complaintNumber}`);
  }
  if (notifyResult.smsSent) {
    console.log(`[SMS] Complaint notification sent successfully to ${mobileText} for ${complaint.complaintNumber}`);
  }

  return complaint;
}