// src/components/user-profile/user-edit.tsx
"use client";

import { useAuthContext } from "@/features/auth/providers/AuthProvider";
import { useUpdateUserProfile } from "@/features/users/hooks/usersHooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateUserProfileDto, UpdateUserProfileSchema } from "@vivero/shared";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface UserProfileEditProps {
  onClose: () => void;
}

export function UserProfileEdit({ onClose }: UserProfileEditProps) {
  const { userProfile } = useAuthContext();
  const { mutateAsync, isPending } = useUpdateUserProfile();

  const form = useForm<UpdateUserProfileDto>({
    resolver: zodResolver(UpdateUserProfileSchema),
    defaultValues: {
      firstName: userProfile?.firstName || "",
      lastName: userProfile?.lastName || "",
      email: userProfile?.email || "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    form.reset({
      firstName: userProfile?.firstName || "",
      lastName: userProfile?.lastName || "",
      email: userProfile?.email || "",
    });
  }, [userProfile, form]);

  async function onSubmit(values: UpdateUserProfileDto) {
    try {
      await mutateAsync({
        userUpdate: values,
      });
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch {}
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 font-serif"
      >
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-sans">Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Nombre" {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-sans">Apellido</FormLabel>
              <FormControl>
                <Input placeholder="Apellido" {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-sans">Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full bg-primary rounded p-2 cursor-pointer"
          disabled={isPending || !form.formState.isDirty}
        >
          Actualizar
        </Button>
      </form>
    </Form>
  );
}
