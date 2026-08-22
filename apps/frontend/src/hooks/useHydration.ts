// src/hooks/useHydration.ts

import { useSyncExternalStore } from "react";

function subscribe() {
  // no hay ninguna fuente externa a la que suscribirse — nunca "cambia"
  return () => {};
}

function getSnapshot() {
  return true; // en el cliente, después de hydratar
}

function getServerSnapshot() {
  return false; // en el servidor (y en el primer paint del cliente)
}

export function useHydration() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
