import { renderHook, waitFor } from "@testing-library/react";
import { useHasAlerts } from "../hooks/useHasAlerts";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockFetchSiembraRetrasada = jest.fn();
const mockFetchFaltaGerminacion = jest.fn();
const mockFetchFaltantePlantas = jest.fn();
const mockFetchFaltaPreExpedicion = jest.fn();

jest.mock("@/features/alerts/api/alertService", () => ({
  alertService: {
    fetchSiembraRetrasada: (...args: unknown[]) => mockFetchSiembraRetrasada(...args),
    fetchFaltaGerminacion: (...args: unknown[]) => mockFetchFaltaGerminacion(...args),
    fetchFaltantePlantas: (...args: unknown[]) => mockFetchFaltantePlantas(...args),
    fetchFaltaPreExpedicion: (...args: unknown[]) => mockFetchFaltaPreExpedicion(...args),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "QueryWrapper";
  return Wrapper;
};

describe("useHasAlerts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchSiembraRetrasada.mockResolvedValue([]);
    mockFetchFaltaGerminacion.mockResolvedValue([]);
    mockFetchFaltantePlantas.mockResolvedValue([]);
    mockFetchFaltaPreExpedicion.mockResolvedValue([]);
  });

  it("returns hasAlerts false when all alert types return empty arrays", async () => {
    const { result } = renderHook(() => useHasAlerts(true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasAlerts).toBe(false);
  });

  it("returns hasAlerts true when at least one alert type has data", async () => {
    mockFetchSiembraRetrasada.mockResolvedValue([{ id: 1 }]);

    const { result } = renderHook(() => useHasAlerts(true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasAlerts).toBe(true);
  });

  it("does not fetch when canRead is false", () => {
    renderHook(() => useHasAlerts(false), {
      wrapper: createWrapper(),
    });

    expect(mockFetchSiembraRetrasada).not.toHaveBeenCalled();
    expect(mockFetchFaltaGerminacion).not.toHaveBeenCalled();
    expect(mockFetchFaltantePlantas).not.toHaveBeenCalled();
    expect(mockFetchFaltaPreExpedicion).not.toHaveBeenCalled();
  });
});
