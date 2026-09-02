// src/components/common/billboard-check.tsx
"use client";

import { useUnreadBillboard } from "@/features/billboard/hooks/useUnreadBillboard";
import { BillboardModal } from "@/features/billboard/components/BillboardModal";
import { BillboardModalSkeleton } from "@/features/billboard/components/BillboardModalSkeleton";
import { LoadingBoundary } from "@/components/common/loading-boundary";
import { useState } from "react";

export function BillboardCheck() {
  return (
    <LoadingBoundary skeleton={<BillboardModalSkeleton />} name="billboard">
      <BillboardCheckInner />
    </LoadingBoundary>
  );
}

function BillboardCheckInner() {
  const { data: messages } = useUnreadBillboard();
  const [dismissed, setDismissed] = useState(false);

  if (!messages?.length || dismissed) return null;

  return (
    <BillboardModal
      open={true}
      messages={messages}
      onClose={() => setDismissed(true)}
    />
  );
}
