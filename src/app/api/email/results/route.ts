import { NextResponse } from "next/server";
import { isEmail, normalizeEmail } from "../../../../lib/commerce/email";
import { sendPlan } from "../../../../lib/email/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      email?: string;
      name?: string;
      tool?: string;
      summary?: string;
    };
    const email = normalizeEmail(body.email ?? "");
    const tool = (body.tool ?? "").trim().slice(0, 80);
    const summary = (body.summary ?? "").trim().slice(0, 8000);
    const name = (body.name ?? "").trim().slice(0, 80);
    if (!isEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    }
    if (!tool || !summary) {
      return NextResponse.json({ error: "Nothing to email yet. Run a plan first." }, { status: 400 });
    }
    await sendPlan({ email, name: name || undefined, tool, summary });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not send that email.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
