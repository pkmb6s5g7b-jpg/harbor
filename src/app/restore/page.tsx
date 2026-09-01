import type { Metadata } from "next";
import { RestoreForm } from "./RestoreForm";

export const metadata: Metadata = {
  title: "Restore purchase",
  description: "Use the email from your Stripe receipt to restore Harbor Pro or spreadsheet templates on this device.",
};

export default function RestorePage() {
  return <RestoreForm />;
}
