//src/features/purchase-orders/api/mockPurchaseOrderSevice.ts
"server-only";

import {
  PurchaseOrder,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
} from "../types";

const generatePurchaseOrders = (count: number): PurchaseOrder[] => {
  const statuses: PurchaseOrder["status"][] = [
    "pending",
    "approved",
    "received",
    "cancelled",
  ];
  const suppliers = [
    "Seeds & Supplies Co",
    "Agricultural Equipment Ltd",
    "Fertilizer Direct",
    "Packaging Solutions",
    "Transport Services",
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `po-${i + 1}`,
    orderNumber: `PO-${String(i + 1).padStart(4, "0")}`,
    supplier: suppliers[Math.floor(Math.random() * suppliers.length)],
    items: Math.floor(Math.random() * 50) + 1,
    totalAmount: Math.round((Math.random() * 50000 + 1000) * 100) / 100,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    orderDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    deliveryDate: new Date(
      Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split("T")[0],
  }));
};
// Replace with your actual API call
// For example, you could fetch purchase orders from a database or an API endpoint
// For now we'll just generate some mock data

const purchaseOrdersData = generatePurchaseOrders(300);

export const mockPurchaseOrderSevice = {
  async fetchPurchaseOrders(): Promise<PurchaseOrder[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000)); // Replace API response with purchase orders
    // Simulate receiving purchase orders from the API
    return purchaseOrdersData;
  },

  async fetchPurchaseOrderById(id: string): Promise<PurchaseOrder | null> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // Replace API response with purchase order
    // Simulate receiving purchase order from the API
    return (
      purchaseOrdersData.find((purchaseOrder) => purchaseOrder.id === id) ||
      null
    );
  },

  async createPurchaseOrder(
    purchaseOrderCreate: CreatePurchaseOrderDto
  ): Promise<PurchaseOrder> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // Replace API response with purchase order
    // Simulate creating purchase order in the database
    const newPurchaseOrder = {
      ...purchaseOrderCreate,
      id: `po-${Date.now()}`,
    };
    purchaseOrdersData.push(newPurchaseOrder);
    return newPurchaseOrder;
  },

  async updatePurchaseOrder(
    id: string,
    purchaseOrderUpdate: UpdatePurchaseOrderDto
  ): Promise<PurchaseOrder> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // Replace API response with purchase order
    // Simulate updating purchase order in the database
    const existingPurchaseOrder = purchaseOrdersData.find(
      (purchaseOrder) => purchaseOrder.id === id
    );
    if (!existingPurchaseOrder) throw new Error("Purchase order not found");
    const updatedPurchaseOrder = {
      ...existingPurchaseOrder,
      ...purchaseOrderUpdate,
    };
    purchaseOrdersData.splice(
      purchaseOrdersData.indexOf(existingPurchaseOrder),
      1,
      updatedPurchaseOrder
    );
    return updatedPurchaseOrder;
  },

  async deletePurchaseOrder(id: string): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // Replace API response with purchase order
    // Simulate deleting purchase order from the database
    const existingPurchaseOrder = purchaseOrdersData.find(
      (purchaseOrder) => purchaseOrder.id === id
    );
    if (!existingPurchaseOrder) throw new Error("Purchase order not found");
    purchaseOrdersData.splice(
      purchaseOrdersData.indexOf(existingPurchaseOrder),
      1
    );
    return;
  },
};
