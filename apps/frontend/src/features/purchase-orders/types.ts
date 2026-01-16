//src/features/purchase-orders/types.ts

import { z } from "zod";

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  items: number;
  totalAmount: number;
  status: "pending" | "approved" | "received" | "cancelled";
  orderDate: string;
  deliveryDate: string;
}

interface CreatePurchaseOrderDto {
  orderNumber: string;
  supplier: string;
  items: number;
  totalAmount: number;
  status: "pending" | "approved" | "received" | "cancelled";
  orderDate: string;
  deliveryDate: string;
}

interface UpdatePurchaseOrderDto {
  orderNumber?: string;
  supplier?: string;
  items?: number;
  totalAmount?: number;
  status?: "pending" | "approved" | "received" | "cancelled";
  orderDate?: string;
  deliveryDate?: string;
}

const purchaseOrderSchema = z.object({
  orderNumber: z.string().min(1, "Order number is required"),
  supplier: z.string().min(1, "Supplier name is required"),
  items: z.number().positive("Items must be positive"),
  totalAmount: z.number().positive("Total amount must be positive"),
  status: z.enum(["pending", "approved", "received", "cancelled"]),
  orderDate: z.string(),
  deliveryDate: z.string(),
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

export type {
  PurchaseOrder,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  PurchaseOrderFormData,
};
export { purchaseOrderSchema };
