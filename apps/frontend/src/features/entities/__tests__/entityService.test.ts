// apps/frontend/src/features/entities/__tests__/entityService.test.ts
import { entityService } from "../api/entityService";

// Mock clientFetch
jest.mock("@/lib/api/client-fetch", () => ({
  clientFetch: jest.fn(),
}));

import { clientFetch } from "@/lib/api/client-fetch";
const mockClientFetch = clientFetch as jest.MockedFunction<typeof clientFetch>;

describe("entityService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetchAll calls GET /entities/tables", async () => {
    mockClientFetch.mockResolvedValue([]);
    await entityService.fetchAll();
    expect(mockClientFetch).toHaveBeenCalledWith("entities/tables", {
      method: "GET",
    });
  });

  it("fetchById calls GET /entities/:id", async () => {
    mockClientFetch.mockResolvedValue({ id: "1" });
    await entityService.fetchById("1");
    expect(mockClientFetch).toHaveBeenCalledWith("entities/1", {
      method: "GET",
    });
  });

  it("create calls POST /entities/entity with body", async () => {
    const data = { name: "products", label: "Productos", permissionType: "CRUD" };
    mockClientFetch.mockResolvedValue({ id: "1", ...data });
    await entityService.create(data);
    expect(mockClientFetch).toHaveBeenCalledWith("entities/entity", {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

  it("update calls PATCH /entities/:id with body", async () => {
    const data = { label: "Productos Nuevos", permissionType: "READ_ONLY" };
    mockClientFetch.mockResolvedValue({ id: "1", name: "products", ...data });
    await entityService.update("1", data);
    expect(mockClientFetch).toHaveBeenCalledWith("entities/1", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  });

  it("delete calls DELETE /entities/:id", async () => {
    mockClientFetch.mockResolvedValue(undefined);
    await entityService.delete("1");
    expect(mockClientFetch).toHaveBeenCalledWith("entities/1", {
      method: "DELETE",
    });
  });
});
