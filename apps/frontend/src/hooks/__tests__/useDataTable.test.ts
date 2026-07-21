import { renderHook, act } from "@testing-library/react";
import { useDataTableActions } from "../useDataTable";

// Mock sonner
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("useDataTableActions", () => {
  const defaultProps = {
    entityName: "usuario",
    onDelete: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, "confirm").mockReturnValue(true);
    // Mock URL.createObjectURL
    jest.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
    jest.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("initializes with modals closed", () => {
    const { result } = renderHook(() => useDataTableActions(defaultProps));
    expect(result.current.isCreateModalOpen).toBe(false);
    expect(result.current.isEditModalOpen).toBe(false);
    expect(result.current.selectedEntity).toBeNull();
  });

  it("handleAdd opens create modal", () => {
    const { result } = renderHook(() => useDataTableActions(defaultProps));
    act(() => {
      result.current.handleAdd();
    });
    expect(result.current.isCreateModalOpen).toBe(true);
    expect(result.current.selectedEntity).toBeNull();
  });

  it("handleEdit opens edit modal with entity", () => {
    const { result } = renderHook(() => useDataTableActions(defaultProps));
    const entity = { id: "1", name: "Test" };
    act(() => {
      result.current.handleEdit(entity as { id: string; name: string });
    });
    expect(result.current.isEditModalOpen).toBe(true);
    expect(result.current.selectedEntity).toEqual(entity);
  });

  it("closeCreateModal closes create modal", () => {
    const { result } = renderHook(() => useDataTableActions(defaultProps));
    act(() => {
      result.current.handleAdd();
    });
    expect(result.current.isCreateModalOpen).toBe(true);
    act(() => {
      result.current.closeCreateModal();
    });
    expect(result.current.isCreateModalOpen).toBe(false);
  });

  it("closeEditModal closes edit modal and clears selected entity", () => {
    const { result } = renderHook(() => useDataTableActions(defaultProps));
    act(() => {
      result.current.handleEdit({ id: "1" } as { id: string });
    });
    expect(result.current.isEditModalOpen).toBe(true);
    act(() => {
      result.current.closeEditModal();
    });
    expect(result.current.isEditModalOpen).toBe(false);
    expect(result.current.selectedEntity).toBeNull();
  });

  it("handleDelete calls onDelete when confirmed", async () => {
    const onDelete = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useDataTableActions({ entityName: "usuario", onDelete })
    );
    await act(async () => {
      await result.current.handleDelete({ id: "1" } as { id: string });
    });
    expect(window.confirm).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalledWith("1");
  });

  it("handleDelete does not call onDelete when cancelled", async () => {
    jest.spyOn(window, "confirm").mockReturnValue(false);
    const onDelete = jest.fn();
    const { result } = renderHook(() =>
      useDataTableActions({ entityName: "usuario", onDelete })
    );
    await act(async () => {
      await result.current.handleDelete({ id: "1" } as { id: string });
    });
    expect(onDelete).not.toHaveBeenCalled();
  });
});
