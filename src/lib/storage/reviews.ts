import type { Review } from "../../data/reviews";
import { storageKeys } from "../../config/brand";

export type CustomerReview = Review & { at: string };

export const EMPTY_REVIEWS: CustomerReview[] = [];

let cacheRaw: string | null = null;
let cache: CustomerReview[] = EMPTY_REVIEWS;

export function listCustomerReviews(): CustomerReview[] {
  if (typeof window === "undefined") return EMPTY_REVIEWS;
  try {
    const raw = window.localStorage.getItem(storageKeys.reviews);
    if (raw === cacheRaw) return cache;
    cacheRaw = raw;
    cache = raw ? (JSON.parse(raw) as CustomerReview[]) : EMPTY_REVIEWS;
    return cache;
  } catch {
    return EMPTY_REVIEWS;
  }
}

export function addCustomerReview(review: Omit<CustomerReview, "id" | "at">) {
  const next: CustomerReview = {
    ...review,
    id: `local-${Date.now()}`,
    at: new Date().toISOString(),
  };
  const list = [next, ...listCustomerReviews()];
  const raw = JSON.stringify(list);
  window.localStorage.setItem(storageKeys.reviews, raw);
  cacheRaw = raw;
  cache = list;
  return next;
}
