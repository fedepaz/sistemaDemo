// src/components/service-worker/update-notification.tsx

"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { getServwist } from "./service-worker-registration";

export function UpdateNotification() {
  useEffect(() => {
    const handleUpdate = () => {
      toast.info("Nueva versión disponible", {
        description: "Recargá la página para usar la última versión.",
        duration: Infinity,
        action: {
          label: "Recargar",
          onClick: () => {
            getServwist()?.messageSkipWaiting();
          },
        },
      });
    };

    window.addEventListener("sw-update-available", handleUpdate);
    return () =>
      window.removeEventListener("sw-update-available", handleUpdate);
  }, []);

  return null;
}
