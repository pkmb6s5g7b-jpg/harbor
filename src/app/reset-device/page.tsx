import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResetDevice } from "./ResetDevice";

export const metadata: Metadata = {
  title: "Reset this device",
  description: "Clear Pro and template unlocks in this browser so you can test checkout again.",
  robots: { index: false, follow: false },
};

export default function ResetDevicePage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <ResetDevice />;
}
