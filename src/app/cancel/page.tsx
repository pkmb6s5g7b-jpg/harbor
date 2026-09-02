import type { Metadata } from "next";
import { Container } from "../../components/layout/Container";
import { ButtonLink } from "../../components/ui/Button";

export const metadata: Metadata = {
  title: "Checkout canceled",
  description: "Your spreadsheet purchase was canceled. Nothing was charged.",
};

export default function CancelPage() {
  return (
    <Container className="py-14">
      <p className="text-sm font-medium uppercase tracking-wide text-muted">Checkout canceled</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">No charge. You can try again whenever you’re ready.</h1>
      <p className="mt-3 max-w-xl text-muted">
        Stripe Checkout was closed before payment. The three calculators stay free. The templates are still there if
        you want them.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/templates">Back to templates</ButtonLink>
        <ButtonLink href="/pricing" variant="secondary">
          See pricing
        </ButtonLink>
      </div>
    </Container>
  );
}
