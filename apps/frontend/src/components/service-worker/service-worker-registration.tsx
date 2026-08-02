// src/components/service-worker/service-worker-registration.tsx

"use client";

import { useEffect } from "react";
import { Serwist } from "@serwist/window";

let serwistInstance: Serwist | null = null;

export function getServwist() {
  return serwistInstance;
}

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => reg.unregister());
      });
      return;
    }

    const serwist = new Serwist("/sw.js", { scope: "/", type: "classic" });
    serwistInstance = serwist;

    serwist.addEventListener("waiting", () => {
      window.dispatchEvent(new Event("sw-update-available"));
    });

    serwist.addEventListener("controlling", () => {
      window.location.reload();
    });

    void serwist.register();
  }, []);

  return null;
}
