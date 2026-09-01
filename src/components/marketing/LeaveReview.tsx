"use client";

import { useState } from "react";
import { localStorageAdapter } from "../../lib/storage/local";
import { addCustomerReview } from "../../lib/storage/reviews";
import { Button } from "../ui/Button";
import { Field, Input, Select } from "../ui/Input";
import { Card } from "../ui/Card";

const PRODUCTS = [
  "Paycheck Budget",
  "Debt Payoff",
  "Cash Flow",
  "Harbor Pro",
  "A spreadsheet",
];

export function LeaveReview() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [product, setProduct] = useState(PRODUCTS[0]);
  const [rating, setRating] = useState("5");
  const [quote, setQuote] = useState("");
  const [done, setDone] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (email.includes("@")) localStorageAdapter.addEmail(email.trim(), name.trim() || undefined);
    addCustomerReview({
      name: name.trim(),
      role: role.trim() || "Harbor customer",
      quote: quote.trim(),
      rating: Number(rating) as 1 | 2 | 3 | 4 | 5,
      product,
    });
    setDone(true);
    window.dispatchEvent(new Event("harbor-review"));
  }

  if (done) {
    return (
      <Card className="p-6">
        <h2 className="font-serif text-2xl text-ink">Thank you, {name.trim() || "friend"}.</h2>
        <p className="mt-2 text-sm text-muted">
          We saved your review. Public quotes are curated — if we use yours, we’ll keep your first name and the tool
          you mentioned.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="font-serif text-2xl text-ink">Leave a review</h2>
      <p className="mt-1 text-sm text-muted">
        One honest paragraph helps the next person decide. No account required.
      </p>
      <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="First name">
          <Input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </Field>
        <Field label="What you use Harbor for" hint="Optional context, e.g. bi-weekly pay">
          <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Teacher, side hustle, paying off cards…" />
        </Field>
        <Field label="Product">
          <Select value={product} onChange={(e) => setProduct(e.target.value)}>
            {PRODUCTS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Rating">
          <Select value={rating} onChange={(e) => setRating(e.target.value)}>
            <option value="5">5 — I’d recommend it</option>
            <option value="4">4 — Solid</option>
            <option value="3">3 — Mixed</option>
            <option value="2">2 — Missed</option>
            <option value="1">1 — Not for me</option>
          </Select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Your review">
            <textarea
              required
              minLength={24}
              rows={4}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink shadow-sm placeholder:text-muted/70 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20"
              placeholder="What did you see, and what did you do next?"
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Button type="submit">Submit review</Button>
          <p className="mt-2 text-xs text-muted">We’ll email you only if we have a question. No newsletter unless you already asked.</p>
        </div>
      </form>
    </Card>
  );
}
