// src/features/alerts/components/v1/alert-edit-form.tsx
"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuthContext } from "@/features/auth/providers/AuthProvider";
import { useAlertComments } from "@/features/alerts/hooks/useAlertComments";
import { useAlertCommentsMutation } from "@/features/alerts/hooks/useAlertCommentsMutation";
import { cn } from "@/lib/utils";
import type { AlertBaseDto } from "@vivero/shared";
import type { AlertType } from "@/features/alerts/types";
import { ALERT_TYPE_CONFIGS } from "./alert-type-config";

interface AlertEditFormProps {
  alert: AlertBaseDto | null;
  alertType: AlertType;
  onSubmitted?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin}m`;
  if (diffH < 24) return `hace ${diffH}h`;
  return `hace ${diffD}d`;
}

export function AlertEditForm({
  alert,
  alertType,
  onSubmitted,
}: AlertEditFormProps) {
  const { userProfile } = useAuthContext();
  const [message, setMessage] = useState("");
  const config = ALERT_TYPE_CONFIGS[alertType];

  const { data: comments, isPending: commentsLoading } = useAlertComments(
    alertType,
    alert?.partidaId ?? 0,
    alert?.anio ?? 0,
    alert?.indice ?? 0,
  );

  const { mutate: createComment, isPending } = useAlertCommentsMutation();

  if (!alert || !userProfile) return null;

  const handleSubmit = () => {
    if (!message.trim()) return;

    createComment(
      {
        alertType,
        partidaId: alert.partidaId,
        anio: alert.anio,
        indice: alert.indice,
        content: message.trim(),
      },
      {
        onSuccess: () => {
          setMessage("");
          onSubmitted?.();
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const TypeIcon = config.icon;

  return (
    <div className="flex flex-col h-full">
      {/* Type-specific header */}
      <div className={cn("px-6 py-4 border-b shrink-0", config.bgColor)}>
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", config.bgColor)}>
            <TypeIcon className={cn("h-5 w-5", config.color)} />
          </div>
          <div>
            <h3 className={cn("text-base font-semibold", config.color)}>
              {config.label}
            </h3>
            <p className="text-xs text-muted-foreground">
              Partida #{alert.partidaId}/{alert.indice} · Año {alert.anio}
            </p>
          </div>
        </div>
      </div>

      {/* Message thread */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {commentsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-3",
                  i % 2 === 0 ? "" : "flex-row-reverse",
                )}
              >
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
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
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback
                    className={cn(
                      "text-xs",
                      isMe ? "bg-primary text-primary-foreground" : "bg-muted",
                    )}
                  >
                    {getInitials(comment.userName)}
                  </AvatarFallback>
                </Avatar>
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
                    <span className="text-sm font-medium truncate">
                      {isMe ? "Yo" : comment.userName}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
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
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay comentarios. Escribe el primero.
          </p>
        )}
      </div>

      {/* Input area */}
      <div className="border-t px-6 py-4 shrink-0 bg-background">
        <div className="flex items-end gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu comentario..."
            className="min-h-[40px] max-h-[120px] resize-none"
            rows={1}
          />
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!message.trim() || isPending}
            className="shrink-0"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          Enter para enviar
        </p>
      </div>
    </div>
  );
}
