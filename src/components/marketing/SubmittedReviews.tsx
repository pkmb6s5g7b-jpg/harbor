"use client";

import { useSyncExternalStore } from "react";
import { EMPTY_REVIEWS, listCustomerReviews } from "../../lib/storage/reviews";
import { ReviewCard } from "./Reviews";

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("harbor-review", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("harbor-review", cb);
    window.removeEventListener("storage", cb);
  };
}

export function SubmittedReviews() {
  const reviews = useSyncExternalStore(subscribe, listCustomerReviews, () => EMPTY_REVIEWS);
  if (reviews.length === 0) return null;
  return (
    <div className="mt-10">
      <h2 className="font-serif text-2xl tracking-tight">Your review</h2>
      <p className="mt-1 text-sm text-muted">Saved in this browser until we publish a public list.</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}
