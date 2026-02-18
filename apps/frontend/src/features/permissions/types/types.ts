import { Pencil, Plus, Trash2 } from "lucide-react";

const CRUD_COLUMNS = [
  { key: "canRead" as const, label: "Leer", icon: Eye, color: "text-blue-500" },
  {
    key: "canCreate" as const,
    label: "Crear",
    icon: Plus,
    color: "text-emerald-500",
  },
  {
    key: "canUpdate" as const,
    label: "Editar",
    icon: Pencil,
    color: "text-amber-500",
  },
  {
    key: "canDelete" as const,
    label: "Eliminar",
    icon: Trash2,
    color: "text-red-500",
  },
] as const;

export type CrudColumn = (typeof CRUD_COLUMNS)[number];
