// src/features/alerts/components/v1/alert-edit-form.tsx
"use client";

import { MessageSquare } from "lucide-react";
import { UserAvatar } from "@/components/common/user-avatar";
import { Textarea } from "@/components/ui/textarea";
import { useAuthContext } from "@/features/auth/providers/AuthProvider";
import { useAlertComments } from "@/features/alerts/hooks/useAlertComments";
import { cn } from "@/lib/utils";
import type { AlertBaseDto, CreateAlertCommentDto } from "@vivero/shared";
import type { AlertType } from "@/features/alerts/types";
import { ALERT_TYPE_CONFIGS } from "./alert-type-config";
import { formatRelativeTime } from "../../utils/format-relative-time";
import { UseFormReturn } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface AlertEditFormProps {
  selectedAlert: AlertBaseDto;
  alertType: AlertType;
  form: UseFormReturn<CreateAlertCommentDto>;
  onSubmit: (data: CreateAlertCommentDto) => void;
}

export function AlertEditForm({
  selectedAlert,
  alertType,
  form,
  onSubmit,
}: AlertEditFormProps) {
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
    <Form {...form}>
      <form
        id="alert-comment-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full max-h-[calc(100dvh-130px)] md:max-h-[calc(100dvh-140px)] overflow-y-auto no-scrollbar pb-6"
      >
        {/* Type-specific header */}
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
                  Partida #{selectedAlert.partidaId}/{selectedAlert.indice} ·
                  Año {selectedAlert.anio}
                </p>
                <p className="text-[9px] md:text-[10px] font-mono text-primary mt-0.5">
                  {selectedAlert.codigoEspecie} · {selectedAlert.nombreEspecie}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Conversation message thread */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              Comentarios {comments ? `(${comments.length})` : ""}
            </span>
          </div>

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
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay comentarios. Escribe el primero.
            </p>
          )}
        </div>

        {/* Form field for new comment */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="space-y-2 md:space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                </div>
                <FormLabel className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground">
                  Nuevo Comentario
                </FormLabel>
              </div>
              <FormControl>
                <Textarea
                  placeholder="Escribe tu comentario..."
                  className="min-h-[80px] md:min-h-[120px] rounded-xl border-border/60 bg-background shadow-sm text-sm md:text-base p-4 leading-relaxed focus:ring-primary/20"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
