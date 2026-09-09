import { prisma } from "@/lib/prisma";
import { generateComplaintNumber } from "@/lib/complaintNumber";
import { sendComplaintConfirmation } from "@/lib/notifications";

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function dateOrNull(value: unknown): Date | null {
  const parsed = new Date(text(value));
  return text(value) && !Number.isNaN(parsed.getTime()) ? parsed : null;
}

function slugFor(name: string): string {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;
}

export async function createComplaintFromData(data: Record<string, unknown>) {
  const legalName = text(data.consumerName);
  const email = text(data.consumerEmail).toLowerCase();
  const authenticatedConsumerId = text(data.authenticatedConsumerId);
  const brandName = text(data.brandName);
  const productName = text(data.productName);
  const productId = text(data.productId);
  if (!legalName || !email || !brandName || !productName || !text(data.title) || !text(data.description)) throw new Error("Missing required complaint data.");

  const existingConsumer = authenticatedConsumerId
    ? await prisma.user.findUnique({ where: { id: authenticatedConsumerId } })
    : await prisma.user.findUnique({ where: { email } });
  if (authenticatedConsumerId && (!existingConsumer || existingConsumer.email !== email || existingConsumer.role !== "CONSUMER")) {
    throw new Error("The authenticated consumer account could not be verified.");
  }
  if (existingConsumer && existingConsumer.role !== "CONSUMER") {
    throw new Error("This email belongs to an administrator or brand account and cannot be used for a consumer complaint.");
  }
  const consumer = existingConsumer || await prisma.user.create({
    data: { legalName, email, displayName: text(data.displayName) || null, role: "CONSUMER", isVerified: true, verifiedAt: new Date() },
  });
  const product = productId ? await prisma.product.findUnique({ where: { id: productId }, include: { brand: true } }) : null;
  const brand = product
    ? product.brand
    : await prisma.brand.upsert({ where: { name: brandName }, update: {}, create: { name: brandName, slug: slugFor(brandName) } });
  const selectedProduct = product || await prisma.product.create({ data: { brandId: brand.id, name: productName, type: text(data.productType) || "Other", category: text(data.productCategory) || "Other", modelName: text(data.modelName) || null, modelNumber: text(data.modelNumber) || null, description: text(data.productDescription) || null, purchaseLocation: text(data.purchaseLocation) || null } });

  const complaint = await prisma.complaint.create({
    data: {
      complaintNumber: await generateComplaintNumber(), consumerId: consumer.id, productId: selectedProduct.id, brandId: brand.id,
      title: text(data.title), description: text(data.description), incidentDate: dateOrNull(data.incidentDate), purchaseDate: dateOrNull(data.purchaseDate),
      retailer: text(data.retailer) || text(data.purchaseLocation) || null, purchaseCity: text(data.purchaseCity) || null, purchaseState: text(data.purchaseState) || null, purchaseCountry: text(data.purchaseCountry) || "India",
      issueCategory: text(data.issueCategory) || "Other", severity: ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(text(data.severity).toUpperCase()) ? text(data.severity).toUpperCase() as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" : "MEDIUM",
      desiredResolution: text(data.desiredResolution) || text(data.expectedResolution) || null, isAnonymous: data.isAnonymous === true, displayName: text(data.displayName) || null, status: "PENDING_REVIEW",
      statusHistory: { create: { status: "PENDING_REVIEW", note: "Complaint submitted and queued for moderation." } },
    },
  });
  if (email) await sendComplaintConfirmation({ to: email, consumerName: text(data.displayName) || legalName, complaintNumber: complaint.complaintNumber, complaintTitle: complaint.title, productName: selectedProduct.name, submittedAt: complaint.createdAt });
  return complaint;
}
