"use client";

import { goToStripeCheckout, startStripeCheckout } from "../../lib/commerce/start-checkout";
import { Button } from "../ui/Button";
import { useHarbor } from "../providers/HarborProvider";

export function ResultsActions({
  tool,
  summary,
  onSave,
  onExport,
  onPrint,
}: {
  tool: string;
  summary: string;
  onSave?: () => void;
  onExport?: () => void;
  onPrint?: () => void;
}) {
  const { isPro, openEmail } = useHarbor();

  return (
    <div className="no-print flex flex-wrap gap-2">
      <Button variant="secondary" size="sm" onClick={() => openEmail({ tool, summary })}>
        Email me my results
      </Button>
      {isPro ? (
        <>
          {onSave ? (
            <Button variant="secondary" size="sm" onClick={onSave}>
              Save plan
            </Button>
          ) : null}
          {onExport ? (
            <Button variant="secondary" size="sm" onClick={onExport}>
              Export CSV
            </Button>
          ) : null}
          {onPrint ? (
            <Button variant="ghost" size="sm" onClick={onPrint}>
              Print report
            </Button>
          ) : null}
        </>
      ) : (
        <Button
          size="sm"
          onClick={async () => {
            const { url } = await startStripeCheckout("pro");
            if (url) goToStripeCheckout(url);
          }}
        >
          Unlock Pro to save
        </Button>
      )}
    </div>
  );
}
