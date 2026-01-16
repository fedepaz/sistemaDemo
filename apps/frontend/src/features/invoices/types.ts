//src/features/invoices/types.ts

import { z } from "zod";

interface Invoice {
  id: string;
  invoiceNumber: string;
  client: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  dueDate: string;
  createdDate: string;
}

interface CreateInvoiceDto {
  invoiceNumber: string;
  client: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  dueDate: string;
  createdDate: string;
}
interface UpdateInvoiceDto {
  invoiceNumber?: string;
  client?: string;
  amount?: number;
  status?: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  dueDate?: string;
  createdDate?: string;
}

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  client: z.string().min(1, "Client name is required"),
  amount: z.number().positive("Amount must be positive"),
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]),
  dueDate: z.string(),
  createdDate: z.string(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

export type { Invoice, CreateInvoiceDto, UpdateInvoiceDto, InvoiceFormData };
export { invoiceSchema };
