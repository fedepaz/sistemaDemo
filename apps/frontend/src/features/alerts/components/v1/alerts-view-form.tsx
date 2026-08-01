// src/features/alerts/components/v1/alerts-view-form.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import {
  MessageSquare,
  Hash,
  Leaf,
  Package,
  Scissors,
  Calendar,
  Truck,
  Flag,
  Percent,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import type { AlertBaseDto, AlertCommentDto } from "@vivero/shared";
import { alertCommentsService } from "../../api/alertCommentsService";
import { alertCommentsQueryKeys } from "@/lib/queryKeys";

// ============================================================================
// Types
// ============================================================================

interface AlertsViewFormProps {
  selectedAlert: AlertBaseDto;
  alertType: string;
}

interface SpecItem {
  icon: React.ElementType;
  label: string;
  value: string | number;
}

interface DetailRow {
  icon: React.ElementType;
  label: string;
  value: string | number;
}

// ============================================================================
// Date formatting
// ============================================================================

function formatCommentDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);

  if (diffMins < 1) return "ahora";
  if (diffMins < 60) return `hace ${diffMins}m`;
  if (diffHours < 24) return `hace ${diffHours}h`;

  const day = date.getDate();
  const monthNames = [
    "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sep", "oct", "nov", "dic",
  ];
  const month = monthNames[date.getMonth()];
  const hours = String(date.getHours()).padStart(2, "0");
  const mins = String(date.getMinutes()).padStart(2, "0");

  if (date.getFullYear() === now.getFullYear()) {
    return `${day} ${month} ${hours}:${mins}`;
  }

  return `${day} ${month} ${date.getFullYear()} ${hours}:${mins}`;
}

// ============================================================================
// Field mapping — split into grid items + detail rows
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getField(alert: AlertBaseDto, key: string): any {
  return (alert as Record<string, unknown>)[key];
}

function getSharedSpecGrid(alert: AlertBaseDto): SpecItem[] {
  return [
    { icon: Hash, label: "Código", value: getField(alert, "codigoEspecie") },
    { icon: Leaf, label: "Especie", value: getField(alert, "nombreEspecie") },
    { icon: Package, label: "Contenedor", value: getField(alert, "contenedor") },
    { icon: Package, label: "Nro", value: getField(alert, "nrocont") },
  ];
}

function getTypeSpecificRows(
  alert: AlertBaseDto,
  alertType: string,
): DetailRow[] {
  switch (alertType) {
    case "siembra-retrasada":
      return [
        { icon: Scissors, label: "Injerto", value: getField(alert, "injerto") },
        { icon: Calendar, label: "Sem Siembra", value: getField(alert, "semSiembra") },
        { icon: Calendar, label: "Fecha Sug. Siembra", value: getField(alert, "fechaSugeridaSiembra") },
        { icon: Truck, label: "Sem Entrega", value: getField(alert, "semEntrega") },
        { icon: Flag, label: "Estado", value: getField(alert, "estado") },
      ];
    case "falta-germinacion":
      return [
        { icon: Scissors, label: "Injerto", value: getField(alert, "injerto") },
        { icon: Calendar, label: "Fecha Primer", value: getField(alert, "fPrimer") },
        { icon: Percent, label: "PR", value: getField(alert, "pr") },
      ];
    case "faltante-plantas":
      return [
        { icon: Hash, label: "HAI", value: getField(alert, "hai") },
        { icon: Package, label: "Solicitadas", value: getField(alert, "solicito") },
        { icon: Calendar, label: "Fecha Primer", value: getField(alert, "fPrimer") },
        { icon: Percent, label: "PR", value: getField(alert, "pr") },
        { icon: Package, label: "ST Ini PR", value: getField(alert, "stIniPr") },
        { icon: Percent, label: "Por PR", value: getField(alert, "porPr") },
      ];
    case "falta-pre-expedicion":
      return [
        { icon: Scissors, label: "Injerto", value: getField(alert, "injerto") },
        { icon: Calendar, label: "Fecha Pre-Exp", value: getField(alert, "fPreexp") },
        { icon: Percent, label: "PE", value: getField(alert, "pe") },
      ];
    default:
      return [];
  }
}

// ============================================================================
// Sub-components
// ============================================================================

function SpecGridCell({ icon: Icon, label, value }: SpecItem) {
  return (
    <div className="bg-background border border-border/60 p-1.5 md:p-2.5 rounded-lg md:rounded-xl flex items-center gap-1.5 md:gap-2.5 shadow-sm overflow-hidden">
      <div className="p-1 md:p-1.5 bg-muted rounded-md shrink-0">
        <Icon className="h-2.5 w-2.5 md:h-3 md:w-3 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-[7px] md:text-[8px] font-bold uppercase leading-none mb-0.5">
          {label}
        </p>
        <p className="text-[10px] md:text-xs truncate uppercase font-bold">
          {value ?? "-"}
        </p>
      </div>
    </div>
  );
}

function DetailInfoRow({ icon: Icon, label, value }: DetailRow) {
  return (
    <div className="flex items-center gap-3 md:gap-4 py-2 md:py-2.5 border-b border-border/40 last:border-0">
      <div className="p-1.5 md:p-2 bg-primary/5 rounded-lg border border-primary/10">
        <Icon className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
          {label}
        </p>
        <p className="text-xs md:text-sm font-bold truncate text-foreground">
          {value ?? "-"}
        </p>
      </div>
    </div>
  );
}

function CommentBubble({ comment }: { comment: AlertCommentDto }) {
  const initials = comment.userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex gap-3 py-3">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {comment.userName}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {formatCommentDate(comment.createdAt)}
          </span>
        </div>
        <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">
          {comment.content}
        </p>
      </div>
    </div>
  );
}

function CommentEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="p-3 rounded-full bg-muted mb-3">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-bold text-foreground">Sin comentarios</p>
      <p className="text-xs text-muted-foreground mt-1">
        Usa el botón &quot;Agregar Comentario&quot; para agregar el primero
      </p>
    </div>
  );
}

// ============================================================================
// Main component
// ============================================================================

export function AlertsViewForm({ selectedAlert, alertType }: AlertsViewFormProps) {
  const { data: comments = [], isLoading } = useQuery({
    queryKey: alertCommentsQueryKeys.byPartida(
      alertType,
      selectedAlert.partidaId,
      selectedAlert.anio,
      selectedAlert.indice,
    ),
    queryFn: () =>
      alertCommentsService.fetchComments(
        alertType,
        selectedAlert.partidaId,
        selectedAlert.anio,
        selectedAlert.indice,
      ),
    enabled: !!selectedAlert,
  });

  const specGrid = getSharedSpecGrid(selectedAlert);
  const detailRows = getTypeSpecificRows(selectedAlert, alertType);

  return (
    <div className="space-y-3 md:space-y-4 animate-in fade-in duration-500">
      {/* Compact Spec Grid — shared fields */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {specGrid.map((item) => (
          <SpecGridCell key={item.label} {...item} />
        ))}
      </div>

      {/* Type-specific detail rows */}
      {detailRows.length > 0 && (
        <div className="space-y-1">
          <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground">
            Detalle
          </h3>
          <div className="rounded-xl border border-border/40 bg-card/40 shadow-sm p-2 md:p-3">
            {detailRows.map((row) => (
              <DetailInfoRow key={row.label} {...row} />
            ))}
          </div>
        </div>
      )}

      <Separator className="bg-border/40" />

      {/* Comments Section */}
      <div className="space-y-2">
        <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground">
          Comentarios{" "}
          {comments.length > 0 && (
            <span className="text-muted-foreground/60">({comments.length})</span>
          )}
        </h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-1 divide-y divide-border/30">
            {comments.map((comment) => (
              <CommentBubble key={comment.id} comment={comment} />
            ))}
          </div>
        ) : (
          <CommentEmptyState />
        )}
      </div>
    </div>
  );
}
