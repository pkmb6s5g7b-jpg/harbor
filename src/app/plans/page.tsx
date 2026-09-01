import type { Metadata } from "next";
import { PlansClient } from "./PlansClient";

export const metadata: Metadata = {
  title: "Saved plans",
  description: "Named calculator plans saved in this browser with Harbor Pro.",
};

export default function PlansPage() {
  return <PlansClient />;
}
