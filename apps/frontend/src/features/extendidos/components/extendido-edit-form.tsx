// src/features/extendidos/components/extendido-edit-form.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";

import {
  Package,
  Calendar,
  Hash,
  Activity,
  Hammer,
  Clock,
  MapPin,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { format } from "date-fns";
import { useDepositos } from "../hooks/useDepositos";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { AsignarUbicacionDto } from "@vivero/shared";

import { UseFormReturn } from "react-hook-form";
import { Form } from "@/components/ui/form";

interface ExtendidosEditFormProps {
  onSubmit: (data: AsignarUbicacionDto) => Promise<void>;
  onCancel: () => void;
  form: UseFormReturn<AsignarUbicacionDto>;
}

export function ExtendidosEditForm({
  onSubmit,
  onCancel,
  form,
}: ExtendidosEditFormProps) {
  const { data: depositos } = useDepositos();

  return (
    <Form {...form}>
      <form
        id="extendido-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
      ></form>
    </Form>
  );
}
