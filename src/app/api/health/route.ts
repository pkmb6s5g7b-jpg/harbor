import { NextResponse } from "next/server";
import { readEnv } from "../../../lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function present(name: string) {
  return readEnv(name).length > 0;
}

/** Presence only — never returns secret values. */
export async function GET() {
  return NextResponse.json({
    stripeSecret: present("STRIPE_SECRET_KEY"),
    prices: {
      debt: present("STRIPE_PRICE_DEBT"),
      paycheck: present("STRIPE_PRICE_PAYCHECK"),
      cashflow: present("STRIPE_PRICE_CASHFLOW"),
      bundle: present("STRIPE_PRICE_BUNDLE"),
      pro: present("STRIPE_PRICE_PRO"),
      seller: present("STRIPE_PRICE_SELLER"),
      reconcile: present("STRIPE_PRICE_RECONCILE"),
      project: present("STRIPE_PRICE_PROJECT"),
    },
    siteUrl: present("NEXT_PUBLIC_SITE_URL"),
  });
}
