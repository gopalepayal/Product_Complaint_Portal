/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * MSG91 Server-Side Mobile OTP Integration
 *
 * Environment Configuration Required:
 * - MSG91_AUTH_KEY
 * - MSG91_OTP_TEMPLATE_ID
 */

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  const lower = value.trim().toLowerCase();
  return (
    lower.includes("your_msg91") ||
    lower.includes("actual-msg91") ||
    lower.includes("your-msg91") ||
    lower.includes("placeholder") ||
    lower.includes("example")
  );
}

export function normalizePhone(phone: string): string {
  if (!phone) return "";
  let digitsOnly = phone.replace(/\D/g, "");

  // Remove leading zeros
  while (digitsOnly.startsWith("0")) {
    digitsOnly = digitsOnly.slice(1);
  }

  // Handle accidental double '91' prefix (e.g. 91919876543210 -> 919876543210)
  if (digitsOnly.length === 14 && digitsOnly.startsWith("9191")) {
    digitsOnly = digitsOnly.slice(2);
  }

  // If 10-digit Indian phone number, prepend '91'
  if (digitsOnly.length === 10) {
    return `91${digitsOnly}`;
  }

  // If 12-digit starting with '91', return as is
  if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
    return digitsOnly;
  }

  return digitsOnly;
}

export async function sendMobileOTP(
  phone: string,
  otp: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  const authKey = process.env.MSG91_AUTH_KEY?.trim();
  const templateId = process.env.MSG91_OTP_TEMPLATE_ID?.trim();

  const normalized = normalizePhone(phone);
  const maskedPhone = normalized.length >= 4 ? `******${normalized.slice(-4)}` : "invalid";

  if (!normalized || normalized.length < 10) {
    return { success: false, error: "Please enter a valid mobile number." };
  }

  // Validate credentials exist and are not placeholders
  if (!authKey || isPlaceholder(authKey) || !templateId || isPlaceholder(templateId)) {
    console.error(`[MSG91 Configuration Error] Mobile OTP request for ${maskedPhone} failed: MSG91_AUTH_KEY or MSG91_OTP_TEMPLATE_ID not configured in .env`);
    return {
      success: false,
      error: "Unable to send mobile OTP. SMS service credentials (MSG91_AUTH_KEY / MSG91_OTP_TEMPLATE_ID) are missing or not configured in .env.",
    };
  }

  console.log(`[MSG91 Request Initiated] Mobile: ${maskedPhone}, Template: ${templateId}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const url = new URL("https://control.msg91.com/api/v5/otp");
    url.searchParams.append("template_id", templateId);
    url.searchParams.append("mobile", normalized);
    if (otp) {
      url.searchParams.append("otp", otp);
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        authkey: authKey,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    let data: any = {};
    try {
      data = await response.json();
    } catch {
      data = { message: `HTTP status ${response.status}` };
    }

    console.log(`[MSG91 Response Status] HTTP ${response.status} for ${maskedPhone}:`, data);

    if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        error: "MSG91 SMS Gateway authentication failed. Please check your MSG91_AUTH_KEY in .env.",
      };
    }

    if (response.status === 429) {
      return {
        success: false,
        error: "Too many SMS requests sent. Please try again later.",
      };
    }

    if (!response.ok || data.type === "error") {
      const errorMsg = data.message || `MSG91 SMS Gateway returned HTTP ${response.status}`;
      console.error(`[MSG91 OTP Request Failed] Mobile: ${maskedPhone}, Status: ${response.status}, Error: ${errorMsg}`);
      return {
        success: false,
        error: `Unable to send mobile OTP: ${errorMsg}`,
      };
    }

    console.log(`[MSG91 OTP Request Accepted] Mobile: ${maskedPhone}`);
    return { success: true, message: "OTP sent to your mobile via SMS!" };
  } catch (err: any) {
    const isTimeout = err.name === "AbortError";
    const errorDetail = isTimeout ? "Request timed out after 10 seconds" : (err.message || String(err));
    console.error(`[MSG91 Network Error] Mobile: ${maskedPhone}:`, errorDetail);
    return {
      success: false,
      error: `Network error connecting to MSG91 SMS gateway: ${errorDetail}`,
    };
  }
}

export async function verifyMobileOTP(
  phone: string,
  otp: string
): Promise<{ success: boolean; error?: string }> {
  const authKey = process.env.MSG91_AUTH_KEY?.trim();
  const normalized = normalizePhone(phone);
  const maskedPhone = normalized.length >= 4 ? `******${normalized.slice(-4)}` : "invalid";

  if (!normalized || !otp) {
    return { success: false, error: "Mobile number and OTP are required." };
  }

  if (!authKey || isPlaceholder(authKey)) {
    return { success: false, error: "MSG91 authentication key is not configured in .env." };
  }

  try {
    const url = new URL("https://control.msg91.com/api/v5/otp/verify");
    url.searchParams.append("otp", otp);
    url.searchParams.append("mobile", normalized);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        authkey: authKey,
      },
    });

    const data = await response.json();

    if (!response.ok || data.type === "error" || data.message !== "OTP verified success") {
      console.warn(`[MSG91 Verify Failed] Mobile: ${maskedPhone}, Provider message: ${data.message}`);
      return {
        success: false,
        error: data.message || "Invalid mobile OTP. Please try again.",
      };
    }

    console.log(`[MSG91 Verify Success] Mobile: ${maskedPhone}`);
    return { success: true };
  } catch (err: any) {
    console.error(`[MSG91 Verify Network Error] Mobile: ${maskedPhone}:`, err);
    return {
      success: false,
      error: `Failed to verify mobile OTP via MSG91: ${err.message || String(err)}`,
    };
  }
}

/**
 * Send a plain transactional SMS (non-OTP) via MSG91.
 *
 * Required env vars:
 *   MSG91_AUTH_KEY              – same key used for OTP
 *   MSG91_TRANSACTIONAL_SENDER  – 6-char sender ID registered on MSG91 (default: CMPRTL)
 *
 * Never throws — SMS failure must NEVER break complaint save.
 */
export async function sendTransactionalSMS(
  phone: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const authKey = process.env.MSG91_AUTH_KEY?.trim();
  const senderId = (
    process.env.MSG91_TRANSACTIONAL_SENDER || "CMPRTL"
  ).trim();

  const normalized = normalizePhone(phone);
  const maskedPhone =
    normalized.length >= 4 ? `******${normalized.slice(-4)}` : "invalid";

  if (!normalized || normalized.length < 10) {
    return { success: false, error: "Invalid phone number for SMS." };
  }

  if (!authKey || isPlaceholder(authKey)) {
    console.warn(
      `[MSG91 SMS] Skipped for ${maskedPhone}: MSG91_AUTH_KEY not configured.`
    );
    return {
      success: false,
      error: "SMS service not configured. Please set MSG91_AUTH_KEY in .env.",
    };
  }

  console.log(
    `[MSG91 SMS] Sending to ${maskedPhone} via sender "${senderId}"`
  );

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch("https://control.msg91.com/api/v5/flow/", {
      method: "POST",
      headers: {
        authkey: authKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: senderId,
        short_url: "0",
        mobiles: normalized,
        message,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    let data: Record<string, unknown> = {};
    try {
      data = await response.json();
    } catch {
      data = { message: `HTTP ${response.status}` };
    }

    if (!response.ok || data["type"] === "error") {
      const errMsg =
        (data["message"] as string) ||
        `MSG91 returned HTTP ${response.status}`;
      console.error(`[MSG91 SMS Failed] ${maskedPhone}: ${errMsg}`);
      return { success: false, error: errMsg };
    }

    console.log(`[MSG91 SMS Sent] ${maskedPhone}`);
    return { success: true };
  } catch (err: unknown) {
    const isTimeout =
      err instanceof Error && err.name === "AbortError";
    const detail = isTimeout
      ? "Request timed out after 10 seconds"
      : err instanceof Error
      ? err.message
      : String(err);
    console.error(`[MSG91 SMS Network Error] ${maskedPhone}: ${detail}`);
    return { success: false, error: detail };
  }
}
