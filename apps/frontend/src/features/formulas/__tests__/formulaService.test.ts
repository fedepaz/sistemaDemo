// apps/frontend/src/features/formulas/__tests__/formulaService.test.ts
import { formulaService } from "../api/formulaService";

jest.mock("@/lib/api/client-fetch", () => ({
  clientFetch: jest.fn(),
}));

import { clientFetch } from "@/lib/api/client-fetch";
const mockClientFetch = clientFetch as jest.MockedFunction<typeof clientFetch>;

describe("formulaService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetchAll calls GET /formula", async () => {
    mockClientFetch.mockResolvedValue([]);
    await formulaService.fetchAll();
    expect(mockClientFetch).toHaveBeenCalledWith("formula", { method: "GET" });
  });

  it("create calls POST /formula with body", async () => {
    const data = {
      producto1Id: "s1",
      porcentaje1: 60,
      producto2Id: null,
      porcentaje2: null,
      producto3Id: null,
      porcentaje3: null,
      producto4Id: null,
      porcentaje4: null,
    };
    mockClientFetch.mockResolvedValue({
      id: "1",
      ...data,
      producto1Nombre: "Turba",
      producto2Nombre: null,
      producto3Nombre: null,
      producto4Nombre: null,
      isActive: true,
      createdAt: new Date(),
    });
    await formulaService.create(data);
    expect(mockClientFetch).toHaveBeenCalledWith("formula", {
      method: "POST",
      body: JSON.stringify(data),
    });
  });
});
