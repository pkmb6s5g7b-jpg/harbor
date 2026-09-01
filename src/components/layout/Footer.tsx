import Link from "next/link";
import { brand } from "../../config/brand";
import { tools } from "../../data/tools";
import { Container } from "./Container";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line-soft bg-white">
      <Container className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted">{brand.tagline}</p>
          <p className="mt-4 max-w-sm text-xs text-muted">
            Plans stay in this browser unless you email them. Harbor is a planning tool, not financial advice.
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Tools</p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/tools" className="text-sm text-ink hover:text-navy">
                All tools
              </Link>
            </li>
            {tools.map((t) => (
              <li key={t.slug}>
                <Link href={t.href} className="text-sm text-ink hover:text-navy">
                  {t.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">More</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/spreadsheets" className="text-ink hover:text-navy">
                Templates
              </Link>
            </li>
            <li>
              <Link href="/plans" className="text-ink hover:text-navy">
                Saved plans
              </Link>
            </li>
            <li>
              <Link href="/downloads" className="text-ink hover:text-navy">
                Downloads
              </Link>
            </li>
            <li>
              <Link href="/restore" className="text-ink hover:text-navy">
                Restore purchase
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="text-ink hover:text-navy">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/reviews" className="text-ink hover:text-navy">
                Reviews
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-ink hover:text-navy">
                About
              </Link>
            </li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-line-soft">
        <Container className="flex flex-col gap-2 py-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {brand.name}</span>
          <span>Free calculators. Paid spreadsheet templates. Bundle is the best value.</span>
        </Container>
      </div>
    </footer>
  );
}
