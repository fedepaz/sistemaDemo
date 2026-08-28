// apps/frontend/src/features/sustratos/__tests__/sustratoService.test.ts
import { sustratoService } from "../api/sustratoService";

// Mock clientFetch
jest.mock("@/lib/api/client-fetch", () => ({
  clientFetch: jest.fn(),
}));

import { clientFetch } from "@/lib/api/client-fetch";
const mockClientFetch = clientFetch as jest.MockedFunction<typeof clientFetch>;

describe("sustratoService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetchAll calls GET /sustratos", async () => {
    mockClientFetch.mockResolvedValue([]);
    await sustratoService.fetchAll();
    expect(mockClientFetch).toHaveBeenCalledWith("sustratos", { method: "GET" });
  });

  it("create calls POST /sustratos with body", async () => {
    const data = { nombre: "Sustrato Test" };
    mockClientFetch.mockResolvedValue({ id: "1", ...data, createdAt: "" });
    await sustratoService.create(data);
    expect(mockClientFetch).toHaveBeenCalledWith("sustratos", {
      method: "POST",
      body: JSON.stringify(data),
    });
  });
});
