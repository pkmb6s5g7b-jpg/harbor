import type { Metadata } from "next";
import { LeaveReview } from "../../components/marketing/LeaveReview";
import { ReviewsSection } from "../../components/marketing/Reviews";
import { SubmittedReviews } from "../../components/marketing/SubmittedReviews";
import { Container } from "../../components/layout/Container";
import { reviews } from "../../data/reviews";

export const metadata: Metadata = {
  title: "Reviews",
  description: "What people say after they run a Harbor plan — leftover, debt-free dates, and the months they caught in time.",
};

export default function ReviewsPage() {
  return (
    <Container className="py-14">
      <ReviewsSection
        reviews={reviews}
        contained={false}
        footerLink={false}
        intro="Launch quotes from people who ran a plan, bought a spreadsheet, or unlocked Pro. Leave yours at the bottom — we read them."
      />
      <SubmittedReviews />
      <div className="mt-12">
        <LeaveReview />
      </div>
    </Container>
  );
}
