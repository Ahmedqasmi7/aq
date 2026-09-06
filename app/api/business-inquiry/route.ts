import { NextResponse } from "next/server";
import { validateBusinessInquiry, type BusinessInquiryPayload } from "@/lib/business-inquiry";

export async function POST(request: Request) {
  let body: Partial<BusinessInquiryPayload>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const errors = validateBusinessInquiry(body);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ message: "Please correct the highlighted fields.", errors }, { status: 422 });
  }

  const submission = {
    ...body,
    receivedAt: new Date().toISOString(),
  };

  // TODO: connect to CRM or email service (e.g. HubSpot, Klaviyo, or a
  // transactional email provider). For now the submission is logged so it
  // isn't silently dropped.
  console.log("[velario:business-inquiry]", submission);

  return NextResponse.json({ message: "Inquiry received." }, { status: 200 });
}
