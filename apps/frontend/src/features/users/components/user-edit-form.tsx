// src/features/users/components/user-form.tsx

import { UseFormReturn } from "react-hook-form";
import { User } from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { UpdateUserProfileDto, UserProfileDto } from "@vivero/shared";

interface FormProps {
  onSubmit: (data: UpdateUserProfileDto) => Promise<void>;
  onCancel: () => void;
  formId: string;
  form: UseFormReturn<UpdateUserProfileDto>;
  user?: UserProfileDto;
}

export function UserEditForm({ onSubmit, formId, form, user }: FormProps) {
  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-3 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-4 md:pb-6"
      >
        {user && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="space-y-1.5 md:space-y-2">
                <FormLabel className="text-[10px] md:text-sm font-black uppercase tracking-widest text-foreground">Nombre</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Nombre" 
                    autoFocus 
                    className="h-10 md:h-12 rounded-xl border-border/60 bg-background shadow-sm text-sm md:text-base px-4 font-bold"
                  />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="space-y-1.5 md:space-y-2">
                <FormLabel className="text-[10px] md:text-sm font-black uppercase tracking-widest text-foreground">Apellido</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Apellido" 
                    className="h-10 md:h-12 rounded-xl border-border/60 bg-background shadow-sm text-sm md:text-base px-4 font-bold"
                  />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-1.5 md:space-y-2">
              <FormLabel className="text-[10px] md:text-sm font-black uppercase tracking-widest text-foreground">Correo electrónico</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Correo electrónico"
                  className="h-10 md:h-12 rounded-xl border-border/60 bg-background shadow-sm text-sm md:text-base px-4 font-bold"
                />
              </FormControl>
              <FormDescription className="text-[9px] md:text-[10px] font-medium italic opacity-60">Email oficial para notificaciones.</FormDescription>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
