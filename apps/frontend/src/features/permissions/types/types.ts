import { Eye, Pencil, Plus, Trash2 } from "lucide-react";

const CRUD_COLUMNS = [
  { key: "canRead" as const, label: "Leer", icon: Eye, color: "text-primary" },
  {
    key: "canCreate" as const,
    label: "Crear",
    icon: Plus,
    color: "text-primary",
  },
  {
    key: "canUpdate" as const,
    label: "Editar",
    icon: Pencil,
    color: "text-accent-foreground",
  },
  {
    key: "canDelete" as const,
    label: "Eliminar",
    icon: Trash2,
    color: "text-destructive",
  },
] as const;

export type CrudColumn = (typeof CRUD_COLUMNS)[number];
