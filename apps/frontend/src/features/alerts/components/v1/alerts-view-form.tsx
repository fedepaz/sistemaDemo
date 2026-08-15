// src/features/alerts/components/v1/alerts-view-form.tsx
"use client";

import { MessageSquare } from "lucide-react";
import { UserAvatar } from "@/components/common/user-avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlertComments } from "@/features/alerts/hooks/useAlertComments";
import { useAuthContext } from "@/features/auth/providers/AuthProvider";
import { cn } from "@/lib/utils";
import type { AlertBaseDto } from "@vivero/shared";
import type { AlertType } from "@/features/alerts/types";
import { ALERT_TYPE_CONFIGS } from "./alert-type-config";
import { formatRelativeTime } from "../../utils/format-relative-time";
import { formatPartidaHeader } from "@/features/shared/utils/header";

interface AlertsViewFormProps {
  selectedAlert: AlertBaseDto;
  alertType: AlertType;
}

export function AlertsViewForm({
  selectedAlert,
  alertType,
}: AlertsViewFormProps) {
  const { userProfile } = useAuthContext();
  const config = ALERT_TYPE_CONFIGS[alertType];
  const { data: comments, isPending: commentsLoading } = useAlertComments(
    alertType,
    selectedAlert.partidaId,
    selectedAlert.anio,
    selectedAlert.indice,
  );

  if (!userProfile) return null;

  const TypeIcon = config.icon;

  return (
    <div className="flex flex-col gap-3 md:gap-6 animate-in fade-in duration-500 h-full max-h-[calc(100dvh-130px)] md:max-h-[calc(100dvh-140px)] overflow-hidden">
      {/* FIXED TOP SECTION: TYPE HEADER */}
      <div className="space-y-3 md:space-y-4 shrink-0">
        <div
          className={cn(
            "flex items-center justify-between bg-primary/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-primary/20 shadow-sm",
            config.bgColor,
            config.borderColor,
          )}
        >
          <div className="flex items-center gap-3 md:gap-4">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <TypeIcon className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div>
              <h2 className="text-base md:text-xl font-black tracking-tight leading-none text-foreground uppercase">
                {config.label}
              </h2>
              <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 md:mt-1.5">
                {formatPartidaHeader(selectedAlert)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Separator + Comments */}
      <Separator className="my-4" />

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            Comentarios {comments ? `(${comments.length})` : ""}
          </span>
        </div>

        {commentsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : comments && comments.length > 0 ? (
          comments.map((comment) => {
            const isMe = comment.userId === userProfile.id;
            return (
              <div
                key={comment.id}
                className={cn(
                  "flex items-start gap-3",
                  isMe && "flex-row-reverse",
                )}
              >
                <UserAvatar
                  name={
                    isMe
                      ? `${userProfile.firstName ?? ""} ${userProfile.lastName ?? ""}`
                      : comment.userName
                  }
                />
                <div
                  className={cn(
                    "flex-1 min-w-0",
                    isMe && "flex flex-col items-end",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-baseline gap-2",
                      isMe && "flex-row-reverse",
                    )}
                  >
                    <span className="text-[10px] font-mono text-muted-foreground">
                      @{comment.userName}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "mt-1 px-3 py-2 rounded-xl text-sm break-words max-w-[80%]",
                      isMe
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted rounded-tl-sm",
                    )}
                  >
                    {comment.content}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay comentarios aún
          </p>
        )}
      </div>
    </div>
  );
}
