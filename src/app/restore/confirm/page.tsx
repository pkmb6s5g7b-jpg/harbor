import type { Metadata } from "next";
import { Suspense } from "react";
import { RestoreConfirm } from "./RestoreConfirm";

export const metadata: Metadata = {
  title: "Restoring purchase",
};

export default function RestoreConfirmPage() {
  return (
    <Suspense>
      <RestoreConfirm />
    </Suspense>
  );
}
