export const INQUIRY_TYPES = [
  "Corporate Gifting",
  "Wholesale/Retail",
  "Private Label",
  "Press",
  "Other",
] as const;

export type InquiryType = (typeof INQUIRY_TYPES)[number];

export type BusinessInquiryPayload = {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  inquiryType: InquiryType;
  estimatedQuantity: string;
  message: string;
};

export type FieldErrors = Partial<Record<keyof BusinessInquiryPayload, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateBusinessInquiry(payload: Partial<BusinessInquiryPayload>): FieldErrors {
  const errors: FieldErrors = {};

  if (!payload.companyName?.trim()) errors.companyName = "Company name is required.";
  if (!payload.contactName?.trim()) errors.contactName = "Contact name is required.";
  if (!payload.email?.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_RE.test(payload.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!payload.inquiryType || !INQUIRY_TYPES.includes(payload.inquiryType as InquiryType)) {
    errors.inquiryType = "Select an inquiry type.";
  }
  if (!payload.estimatedQuantity?.trim()) errors.estimatedQuantity = "Estimated quantity is required.";
  if (!payload.message?.trim() || payload.message.trim().length < 10) {
    errors.message = "Tell us a little more (10 characters minimum).";
  }

  return errors;
}
