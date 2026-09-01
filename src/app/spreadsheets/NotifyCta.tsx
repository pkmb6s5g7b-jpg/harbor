"use client";

import { Button } from "../../components/ui/Button";
import { useHarbor } from "../../components/providers/HarborProvider";

export function NotifyCta() {
  const { openEmail } = useHarbor();
  return (
    <Button
      variant="teal"
      onClick={() =>
        openEmail({
          tool: "Cash Flow spreadsheet",
          summary: "Notify me when the cash flow workbook is ready.",
        })
      }
    >
      Email me when it’s ready
    </Button>
  );
}
