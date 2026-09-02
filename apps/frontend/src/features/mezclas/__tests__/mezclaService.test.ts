// apps/frontend/src/features/mezclas/__tests__/mezclaService.test.ts
import { mezclaService } from "../api/mezclaService";

jest.mock("@/lib/api/client-fetch", () => ({
  clientFetch: jest.fn(),
}));

import { clientFetch } from "@/lib/api/client-fetch";
const mockClientFetch = clientFetch as jest.MockedFunction<typeof clientFetch>;

describe("mezclaService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetchAll calls GET /mezcla", async () => {
    mockClientFetch.mockResolvedValue([]);
    await mezclaService.fetchAll();
    expect(mockClientFetch).toHaveBeenCalledWith("mezcla", { method: "GET" });
  });

  it("create calls POST /mezcla with body", async () => {
    const data = {
      sustrato1Id: "s1",
      porcentaje1: 60,
      sustrato2Id: null,
      porcentaje2: null,
      sustrato3Id: null,
      porcentaje3: null,
      sustrato4Id: null,
      porcentaje4: null,
    };
    mockClientFetch.mockResolvedValue({
      id: "1",
      ...data,
      sustrato1Nombre: "Turba",
      sustrato2Nombre: null,
      sustrato3Nombre: null,
      sustrato4Nombre: null,
      isActive: true,
      createdAt: new Date(),
    });
    await mezclaService.create(data);
    expect(mockClientFetch).toHaveBeenCalledWith("mezcla", {
      method: "POST",
      body: JSON.stringify(data),
    });
  });
});
