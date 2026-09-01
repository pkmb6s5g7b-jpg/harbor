import type { Metadata } from "next";
import { DownloadsClient } from "./DownloadsClient";

export const metadata: Metadata = {
  title: "Payment successful / Download your templates",
  description: "Download the Excel and Google Sheets templates you purchased.",
};

export default function DownloadsPage() {
  return <DownloadsClient />;
}
