import { readFile } from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ENTITLEMENT_COOKIE } from "../../../../config/pricing";
import { DOWNLOAD_FILES, hasAccess, parseEntitlementCookie } from "../../../../lib/commerce/entitlements";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const fileName = DOWNLOAD_FILES[slug];
  if (!fileName) {
    return NextResponse.json({ error: "Unknown template" }, { status: 404 });
  }

  const jar = await cookies();
  const owned = parseEntitlementCookie(jar.get(ENTITLEMENT_COOKIE)?.value);
  if (!hasAccess(owned, slug)) {
    return NextResponse.json(
      { error: "Payment required", buy: `/spreadsheets#${slug}` },
      { status: 402 },
    );
  }

  const filePath = path.join(process.cwd(), "content", "spreadsheets", fileName);
  const buf = await readFile(filePath);
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
