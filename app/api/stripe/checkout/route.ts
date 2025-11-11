import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe";
import { PRODUCTS } from "@/lib/pricing";

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  const isForm = contentType.includes("application/x-www-form-urlencoded");
  const body: Record<string, unknown> = isForm ? Object.fromEntries(await req.formData()) : await req.json();
  const { productId, calendarId } = parseCheckoutPayload(body);

  if (!isValidProduct(productId)) {
    return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  }

  const product = PRODUCTS[productId];
  const mode = product.type === "subscription" ? "subscription" : "payment";
  const session = await createCheckoutSession({
    mode,
    productId: product.stripePriceId,
    calendarId
  });
  return NextResponse.json({ url: session.url });
}

function parseCheckoutPayload(body: Record<string, unknown>) {
  const rawProductId = body.productId;
  const rawCalendarId = body.calendarId;

  const productId = typeof rawProductId === "string" ? rawProductId : "";
  const calendarId = typeof rawCalendarId === "string" && rawCalendarId.length > 0 ? rawCalendarId : undefined;

  return { productId, calendarId };
}

function isValidProduct(productId: string): productId is keyof typeof PRODUCTS {
  return productId.length > 0 && productId in PRODUCTS;
}

