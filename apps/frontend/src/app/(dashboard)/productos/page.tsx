// apps/frontend/src/app/(dashboard)/productos/page.tsx

import { ProductosDashboard } from "@/features/productos";

export const dynamic = "force-dynamic";

export default function ProductosPage() {
  return <ProductosDashboard />;
}
