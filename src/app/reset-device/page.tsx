import type { Metadata } from "next";
import { ResetDevice } from "./ResetDevice";

export const metadata: Metadata = {
  title: "Reset this device",
  description: "Clear Pro and template unlocks in this browser so you can test checkout again.",
};

export default function ResetDevicePage() {
  return <ResetDevice />;
}
