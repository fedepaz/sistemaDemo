//src/features/users/types.ts

import { z } from "zod";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "worker";
  status: "active" | "inactive";
  lastLogin: string;
  department: string;
}

interface CreateUserDto {
  name: string;
  email: string;
  role: "admin" | "manager" | "worker";
  status: "active" | "inactive";
  lastLogin: string;
  department: string;
}

interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: "admin" | "manager" | "worker";
  status?: "active" | "inactive";
  lastLogin?: string;
  department?: string;
}

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  role: z.enum(["admin", "manager", "worker"]),
  status: z.enum(["active", "inactive"]),
  lastLogin: z.string(),
  department: z.string().min(1, "Department is required"),
});

type UserFormData = z.infer<typeof userSchema>;

export type { User, CreateUserDto, UpdateUserDto, UserFormData };
export { userSchema };
