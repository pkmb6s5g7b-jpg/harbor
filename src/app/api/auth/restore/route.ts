import { NextResponse } from "next/server";
import { isEmail, normalizeEmail } from "../../../../lib/commerce/email";
import { grantsForEmail } from "../../../../lib/commerce/lookup";
import { issueRestoreToken } from "../../../../lib/commerce/restore-tokens";
import { siteOrigin } from "../../../../lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string };
    const email = normalizeEmail(body.email ?? "");
    if (!isEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    }

    const grants = await grantsForEmail(email);
    if (grants.length === 0) {
      return NextResponse.json({
        ok: true,
        message: "If we find a purchase for that email, you’ll get a restore link here.",
      });
    }

    const token = await issueRestoreToken(email, grants);
    const origin = siteOrigin(req);
    const url = `${origin}/restore/confirm?token=${encodeURIComponent(token)}`;

    return NextResponse.json({
      ok: true,
      message: "We found a purchase. Open the link below on this device. It expires in 30 minutes.",
      restoreUrl: url,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not start restore.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
