// src/components/user-profile/user-edit.tsx
"use client";

import { useAuthContext } from "@/features/auth/providers/AuthProvider";
import { useUpdateUserProfile } from "@/features/users/hooks/usersHooks";
import { useEffect } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateUserProfileSchema } from "@vivero/shared";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { z } from "zod";

type UserProfileFormValues = z.infer<typeof UpdateUserProfileSchema>;

export function UserProfileEdit() {
  const { userProfile } = useAuthContext();
  const { mutateAsync, isPending } = useUpdateUserProfile();

  const form = useForm<UserProfileFormValues>({
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

  async function onSubmit(values: UserProfileFormValues) {
    await mutateAsync({
      userUpdate: values,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
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
              <FormLabel>Apellido</FormLabel>
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full bg-primary text-white rounded p-2"
          disabled={isPending || !form.formState.isDirty}
        >
          Guardar
        </Button>
      </form>
    </Form>
  );
}
