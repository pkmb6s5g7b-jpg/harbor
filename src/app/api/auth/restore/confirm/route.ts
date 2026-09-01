import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ENTITLEMENT_COOKIE } from "../../../../../config/pricing";
import { products } from "../../../../../data/products";
import {
  expandGrants,
  hasAccess,
  parseEntitlementCookie,
  serializeEntitlements,
} from "../../../../../lib/commerce/entitlements";
import { consumeRestoreToken } from "../../../../../lib/commerce/restore-tokens";

export async function POST(req: Request) {
  const body = (await req.json()) as { token?: string };
  const token = body.token?.trim() ?? "";
  if (!token) {
    return NextResponse.json({ error: "Missing restore link." }, { status: 400 });
  }

  const row = await consumeRestoreToken(token);
  if (!row) {
    return NextResponse.json(
      { error: "This restore link is invalid or has expired. Request a new one." },
      { status: 400 },
    );
  }

  const grants = expandGrants(row.grants);
  const jar = await cookies();
  const existing = parseEntitlementCookie(jar.get(ENTITLEMENT_COOKIE)?.value);
  const merged = expandGrants([...existing, ...grants]);
  jar.set(ENTITLEMENT_COOKIE, serializeEntitlements(merged), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  const files = products
    .filter((p) => p.fileName && hasAccess(merged, p.id))
    .map((p) => ({ id: p.id, name: p.name }));

  return NextResponse.json({
    ok: true,
    email: row.email,
    grants: merged,
    pro: merged.includes("pro"),
    files,
  });
}
