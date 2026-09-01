import type { Metadata } from "next";
import { Suspense } from "react";
import { SuccessClient } from "./SuccessClient";

export const metadata: Metadata = {
  title: "Payment successful",
  description: "Your spreadsheet templates are ready to download.",
};

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessClient />
    </Suspense>
  );
}
