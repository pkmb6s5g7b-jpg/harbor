import { NextResponse } from "next/server";
import { isEmail, normalizeEmail } from "../../../../lib/commerce/email";
import { grantsForEmail } from "../../../../lib/commerce/lookup";
import { issueRestoreToken } from "../../../../lib/commerce/restore-tokens";
import { emailService } from "../../../../lib/email/service";
import { siteOrigin } from "../../../../lib/stripe";

export async function POST(req: Request) {
  const body = (await req.json()) as { email?: string };
  const email = normalizeEmail(body.email ?? "");
  if (!isEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  const grants = await grantsForEmail(email);
  // Same response whether or not we found a purchase — don't leak.
  const generic = {
    ok: true,
    message: "If we find a purchase for that email, you’ll get a restore link. It expires in 30 minutes.",
  };

  if (grants.length === 0) {
    return NextResponse.json(generic);
  }

  const token = await issueRestoreToken(email, grants);
  const origin = siteOrigin(req);
  const url = `${origin}/restore/confirm?token=${token}`;
  const sent = await emailService.sendRestoreLink({ email, url });

  return NextResponse.json({
    ...generic,
    emailed: sent.sent,
    // Shown only when email isn't configured so you can still restore locally.
    restoreUrl: sent.sent ? undefined : url,
  });
}
