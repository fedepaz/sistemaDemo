// apps/frontend/src/features/productos/__tests__/productoService.test.ts
import { productoService } from "../api/productoService";

// Mock clientFetch
jest.mock("@/lib/api/client-fetch", () => ({
  clientFetch: jest.fn(),
}));

import { clientFetch } from "@/lib/api/client-fetch";
const mockClientFetch = clientFetch as jest.MockedFunction<typeof clientFetch>;

describe("productoService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetchAll calls GET /productos", async () => {
    mockClientFetch.mockResolvedValue([]);
    await productoService.fetchAll();
    expect(mockClientFetch).toHaveBeenCalledWith("productos", { method: "GET" });
  });

  it("create calls POST /productos with body", async () => {
    const data = { nombre: "Producto Test" };
    mockClientFetch.mockResolvedValue({ id: "1", ...data, createdAt: "" });
    await productoService.create(data);
    expect(mockClientFetch).toHaveBeenCalledWith("productos", {
      method: "POST",
      body: JSON.stringify(data),
    });
  });
});
