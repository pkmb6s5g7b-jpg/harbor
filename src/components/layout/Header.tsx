"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { tools } from "../../data/tools";
import { goToStripeCheckout, startStripeCheckout } from "../../lib/commerce/start-checkout";
import { useHarbor } from "../providers/HarborProvider";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Container } from "./Container";
import { Logo } from "./Logo";

const links = [
  { href: "/tools", label: "Tools" },
  { href: "/plans", label: "Plans" },
  { href: "/templates", label: "Templates" },
  { href: "/pricing", label: "Pricing" },
  { href: "/downloads", label: "Downloads" },
  { href: "/restore", label: "Restore" },
  { href: "/reviews", label: "Reviews" },
  { href: "/about", label: "About" },
];

export function Header() {
  const pathname = usePathname();
  const { isPro } = useHarbor();
  const [open, setOpen] = useState(false);
  const [proBusy, setProBusy] = useState(false);

  async function buyPro() {
    setProBusy(true);
    const { url } = await startStripeCheckout("pro");
    if (url) goToStripeCheckout(url);
    else setProBusy(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line-soft bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                l.href === "/tools"
                  ? pathname.startsWith("/tools")
                    ? "text-navy"
                    : "text-muted hover:text-ink"
                  : pathname === l.href
                    ? "text-navy"
                    : "text-muted hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {isPro ? (
            <Badge tone="teal">Pro</Badge>
          ) : (
            <Button size="sm" className="hidden sm:inline-flex" disabled={proBusy} onClick={buyPro}>
              {proBusy ? "Redirecting…" : "Unlock Pro"}
            </Button>
          )}
          <button
            type="button"
            className="rounded-lg p-2 text-ink md:hidden"
            aria-label="Open menu"
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </Container>
      {open ? (
        <div className="border-t border-line-soft bg-white md:hidden">
          <Container className="flex flex-col gap-1 py-3">
            <Link
              href="/tools"
              className="rounded-lg px-2 py-2 text-sm font-medium text-ink"
              onClick={() => setOpen(false)}
            >
              Tools
            </Link>
            {tools.map((t) => (
              <Link
                key={t.slug}
                href={t.href}
                className="rounded-lg px-2 py-2 pl-4 text-sm text-muted"
                onClick={() => setOpen(false)}
              >
                {t.shortName}
              </Link>
            ))}
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-2 py-2 text-sm font-medium text-ink"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            {!isPro ? (
              <Button
                className="mt-2"
                onClick={() => {
                  setOpen(false);
                  buyPro();
                }}
              >
                Unlock Pro — $19
              </Button>
            ) : null}
          </Container>
        </div>
      ) : null}
    </header>
  );
}
