import { randomBytes } from "crypto";

export function generateComplaintNumber(): string {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const random = randomBytes(4).toString("hex").toUpperCase();

  return `CMP-${year}${month}${day}-${random}`;
}