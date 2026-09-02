// src/components/common/billboard-check.tsx
"use client";

import { useUnreadBillboard } from "@/features/billboard/hooks/useUnreadBillboard";
import { BillboardModal } from "@/features/billboard/components/BillboardModal";
import { useState } from "react";

export function BillboardCheck() {
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
