export function formatMobile(mobile: string): string | null {
  // Simple normalization: keep digits and leading +
  const cleaned = mobile.replace(/[^+\d]/g, '');
  if (!cleaned) return null;
  return cleaned;
}

export function validateEmail(email: string): boolean {
  // Basic email regex
  const re = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  return re.test(email);
}
