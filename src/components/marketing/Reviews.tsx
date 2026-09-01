import Link from "next/link";
import type { Review } from "../../data/reviews";
import { Container } from "../layout/Container";
import { Card } from "../ui/Card";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 20 20"
          aria-hidden
          className={i < rating ? "text-teal" : "text-line"}
        >
          <path
            fill="currentColor"
            d="M10 1.8 12.5 7l5.8.8-4.2 4.1 1 5.8L10 15.2 4.9 17.7l1-5.8L1.7 7.8 7.5 7 10 1.8z"
          />
        </svg>
      ))}
    </div>
  );
}

export function ReviewCard({ review }: { review: Review }) {
  return (
    <Card className="flex h-full flex-col p-6">
      <Stars rating={review.rating} />
      <blockquote className="mt-3 flex-1 font-serif text-lg leading-snug text-ink">
        “{review.quote}”
      </blockquote>
      <footer className="mt-4">
        <p className="text-sm font-medium text-ink">{review.name}</p>
        <p className="text-xs text-muted">
          {review.role}
          <span className="px-1.5 text-line">·</span>
          {review.product}
        </p>
      </footer>
    </Card>
  );
}

export function ReviewsSection({
  reviews,
  eyebrow = "Reviews",
  title = "What people say after they run the numbers.",
  intro = "Specific leftover. A debt-free date they can live with. A red month they still had time to fix.",
  footerLink = true,
  contained = true,
}: {
  reviews: Review[];
  eyebrow?: string;
  title?: string;
  intro?: string;
  footerLink?: boolean;
  contained?: boolean;
}) {
  const inner = (
    <>
      <p className="text-sm font-medium uppercase tracking-wide text-teal">{eyebrow}</p>
      <h2 className="mt-2 font-serif text-3xl tracking-tight">{title}</h2>
      {intro ? <p className="mt-2 max-w-2xl text-muted">{intro}</p> : null}
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
      {footerLink ? (
        <p className="mt-6 text-sm">
          <Link href="/reviews" className="font-medium text-navy hover:underline">
            Read all reviews and leave yours →
          </Link>
        </p>
      ) : null}
    </>
  );

  if (!contained) return inner;
  return (
    <section className="border-y border-line-soft bg-white">
      <Container className="py-14">{inner}</Container>
    </section>
  );
}
