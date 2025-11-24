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

  const hasStripePrice = Boolean(product.stripePriceId);
  const inlineAmount =
    typeof (product as { price?: unknown }).price === "number" ? (product as { price: number }).price : null;

  if (mode === "subscription" && !hasStripePrice) {
    return NextResponse.json({ error: "Produit Stripe manquant pour l'abonnement" }, { status: 400 });
  }

  if (!hasStripePrice && inlineAmount === null) {
    return NextResponse.json({ error: "Aucun prix configuré pour ce produit" }, { status: 400 });
  }

  const session = await createCheckoutSession(
    hasStripePrice
      ? {
          mode,
          productId: product.stripePriceId,
          calendarId,
          metadata: { product_id: product.id }
        }
      : {
          mode: "payment",
          inlineAmountCents: inlineAmount!,
          productName: "name" in product ? product.name : product.id,
          calendarId,
          metadata: { product_id: product.id }
        }
  );
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
