export type Review = {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: 1 | 2 | 3 | 4 | 5;
  product: string;
};

/** Launch testimonials. Swap these for real quotes as they come in. */
export const reviews: Review[] = [
  {
    id: "maya",
    name: "Maya R.",
    role: "Nurse, bi-weekly pay",
    quote:
      "I finally saw leftover after bills, not after a monthly guess. $199 isn’t a lot — but it’s a number I can actually keep.",
    rating: 5,
    product: "Paycheck Budget",
  },
  {
    id: "jordan",
    name: "Jordan P.",
    role: "Paying off six debts",
    quote:
      "Snowball vs Avalanche on the same debts. I picked the date I could live with, then bought the spreadsheet so I could log the extra $200.",
    rating: 5,
    product: "Debt Payoff",
  },
  {
    id: "priya",
    name: "Priya S.",
    role: "Freelance designer",
    quote:
      "The cash flow chart showed a red month I would have walked into. I moved a client invoice up two weeks. That was the whole product, for me.",
    rating: 5,
    product: "Cash Flow",
  },
  {
    id: "chris",
    name: "Chris L.",
    role: "Uses the spreadsheet every payday",
    quote:
      "The calculator got me in. The paycheck workbook is what I still open. Bills hit the right check. I don’t argue with it.",
    rating: 5,
    product: "Paycheck spreadsheet",
  },
  {
    id: "dana",
    name: "Dana M.",
    role: "Harbor Pro",
    quote:
      "I saved a $100-extra plan and a $200-extra plan and emailed myself both. Nineteen dollars, once. I would have paid that for the comparison table alone.",
    rating: 5,
    product: "Harbor Pro",
  },
  {
    id: "sam",
    name: "Sam K.",
    role: "Etsy shop, nights and weekends",
    quote:
      "I thought I was making money. The seller tracker showed fees and shipping eating the cute months. I raised one price. Net went up.",
    rating: 5,
    product: "Seller Profit spreadsheet",
  },
];

export const featuredReviewIds = ["maya", "jordan", "priya"] as const;

export const featuredReviews = reviews.filter((r) =>
  (featuredReviewIds as readonly string[]).includes(r.id),
);

export const pricingReviews = reviews.filter((r) =>
  ["dana", "jordan", "chris"].includes(r.id),
);
