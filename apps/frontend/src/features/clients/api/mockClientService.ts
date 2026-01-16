//src/features/users/api/mockUserService.ts
"server-only";

import { Client, CreateClientDto, UpdateClientDto } from "../types";

const generateClients = (count: number): Client[] => {
  const names: string[] = [
    "John Doe",
    "Jane Doe",
    "Bob Smith",
    "Alice Johnson",
    "David Williams",
    "Sarah Brown",
    "Michael Johnson",
    "Emily Davis",
  ];
  const contactPersons: string[] = ["John Doe", "Jane Doe", "Bob Smith"];
  const emails: string[] = [
    "johndoe@example.com",
    "janedoe@example.com",
    "bobsmith@example.com",
  ];
  const phones: string[] = ["123-456-7890", "987-654-3210", "555-555-5555"];
  const statuses: Client["status"][] = ["active", "inactive", "prospect"];
  const totalOrders: number[] = [100, 200, 300];
  const totalRevenue: number[] = [1000, 2000, 3000];
  const lastOrders: string[] = ["2023-01-01", "2023-02-01", "2023-03-01"];

  return Array.from({ length: count }, (_, i) => {
    const index = Math.floor(Math.random() * names.length);
    return {
      id: `client-${i + 1}`,
      name: names[index],
      contactPerson: contactPersons[index],
      email: emails[index],
      phone: phones[index],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      totalOrders: totalOrders[Math.floor(Math.random() * totalOrders.length)],
      totalRevenue:
        totalRevenue[Math.floor(Math.random() * totalRevenue.length)],
      lastOrder: lastOrders[Math.floor(Math.random() * lastOrders.length)],
    };
  });
};
// Replace with your actual API call
// For example, you could fetch users from a database or an API endpoint
// For now we'll just generate some mock data
const clientsData = generateClients(50);

export const mockClientService = {
  async fetchClients(): Promise<Client[]> {
    // Simulate network delay
    //Random delay between 1000 and 3000 milliseconds
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000));

    // Replace API response with users
    // Simulate receiving users from the API
    return clientsData;
  },

  async fetchClientById(id: string): Promise<Client | null> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // Replace API response with user
    // Simulate receiving user from the API
    return clientsData.find((user) => user.id === id) || null;
  },

  async createClient(clientCreate: CreateClientDto): Promise<Client> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // Replace API response with user
    // Simulate creating user in the database

    const newClient = {
      ...clientCreate,
      id: `client-${Date.now()}`,
    };
    clientsData.push(newClient);
    return newClient;
  },

  async updateClient(
    id: string,
    clientUpdate: UpdateClientDto
  ): Promise<Client> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Replace API response with user
    // Simulate updating user in the database
    const existingClient = clientsData.find((user) => user.id === id);
    if (!existingClient) throw new Error("User not found");
    const updatedClient = { ...existingClient, ...clientUpdate };
    clientsData.splice(clientsData.indexOf(existingClient), 1, updatedClient);
    return updatedClient;
  },

  async deleteClient(id: string): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Replace API response with user
    // Simulate deleting user from the database
    const existingClient = clientsData.find((user) => user.id === id);
    if (!existingClient) throw new Error("User not found");
    clientsData.splice(clientsData.indexOf(existingClient), 1);
    return;
  },
};
