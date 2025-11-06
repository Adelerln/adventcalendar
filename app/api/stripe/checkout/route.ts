import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe";
import { PRODUCTS } from "@/lib/pricing";

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  const isForm = contentType.includes("application/x-www-form-urlencoded");
  const body = isForm ? Object.fromEntries(await req.formData()) : await req.json();
  const productId = String((body as any).productId || "");
  const calendarId = (body as any).calendarId ? String((body as any).calendarId) : undefined;

  if (!productId || !(productId in PRODUCTS)) {
    return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  }

  const priceId = PRODUCTS[productId as keyof typeof PRODUCTS].stripePriceId;
  const mode = PRODUCTS[productId as keyof typeof PRODUCTS].type === "subscription" ? "subscription" : "payment";

  const session = await createCheckoutSession({ mode, productId: priceId, calendarId });
  return NextResponse.json({ url: session.url });
}


