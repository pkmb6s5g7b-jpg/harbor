import Link from "next/link";
import { brand } from "../../config/brand";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 text-navy ${className}`}>
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden>
        <rect width="32" height="32" rx="8" fill="#1B4F72" />
        <path d="M6 22c4-7 16-7 20 0" stroke="#E8F5F2" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M16 8v10" stroke="#5FBFB0" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="16" cy="8" r="1.6" fill="#E8F5F2" />
      </svg>
      <span className="font-serif text-xl tracking-tight">{brand.name}</span>
    </Link>
  );
}
