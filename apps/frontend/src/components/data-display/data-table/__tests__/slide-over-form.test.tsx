/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from "@testing-library/react";

// Mock useForm with controllable getValues
const mockGetValues = jest.fn();
const mockFormState = {
  isValid: true,
  isSubmitting: false,
  errors: {},
};
const mockTrigger = jest.fn().mockResolvedValue(true);

jest.mock("react-hook-form", () => ({
  ...jest.requireActual("react-hook-form"),
  useForm: () => ({
    control: {},
    handleSubmit: (fn: (data: Record<string, unknown>) => void) => (e: Event) => {
      e.preventDefault();
      fn({});
    },
    formState: mockFormState,
    reset: jest.fn(),
    setValue: jest.fn(),
    getValues: mockGetValues,
    watch: jest.fn(),
    register: jest.fn().mockReturnValue({ name: "", ref: jest.fn(), onChange: jest.fn(), onBlur: jest.fn() }),
    trigger: mockTrigger,
  }),
}));

// Mock formatShortDate
jest.mock("@/lib/date-utils", () => ({
  formatShortDate: jest.fn().mockReturnValue("10/09/26"),
}));

// Mock shadcn/ui components that may cause issues
jest.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="sheet">{children}</div> : null,
  SheetContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="alert-dialog">{children}</div> : null,
  AlertDialogAction: ({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
  AlertDialogCancel: ({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) => (
    <button disabled={disabled}>{children}</button>
  ),
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, variant }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; variant?: string }) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>{children}</button>
  ),
}));

import { SlideOverForm } from "../slide-over-form";
import type { ConfirmConfig } from "../slide-over-form";

describe("SlideOverForm - Confirmation Dialog Summary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetValues.mockReturnValue({});
    mockFormState.isValid = true;
    mockFormState.isSubmitting = false;
    mockFormState.errors = {};
  });

  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    title: "Test Form",
    formId: "test-form",
    children: <div>Form content</div>,
  };

  const renderWithConfirm = (
    confirm: ConfirmConfig,
    fieldLabels?: Record<string, string>,
    getValuesReturn?: Record<string, unknown>
  ) => {
    if (getValuesReturn) {
      mockGetValues.mockReturnValue(getValuesReturn);
    }
    const mockForm = {
      control: {},
      handleSubmit: jest.fn(),
      formState: mockFormState,
      reset: jest.fn(),
      setValue: jest.fn(),
      getValues: mockGetValues,
      watch: jest.fn(),
      register: jest.fn(),
      trigger: mockTrigger,
    };
    return render(
      <SlideOverForm
        {...defaultProps}
        confirm={confirm}
        fieldLabels={fieldLabels}
        form={mockForm as any}
      />
    );
  };

  const openConfirmDialog = () => {
    fireEvent.click(screen.getByText("Actualizar"));
  };

  it("renders summary section when summaryFields has entries", () => {
    renderWithConfirm(
      { title: "Confirm", description: "Are you sure?", summaryFields: ["name", "email"] },
      undefined,
      { name: "John", email: "john@test.com" }
    );
    openConfirmDialog();
    expect(screen.getByText("Resumen:")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("john@test.com")).toBeInTheDocument();
  });

  it("does NOT render summary when summaryFields is empty", () => {
    renderWithConfirm(
      { title: "Confirm", description: "Are you sure?", summaryFields: [] },
      undefined,
      {}
    );
    openConfirmDialog();
    expect(screen.queryByText("Resumen:")).not.toBeInTheDocument();
  });

  it("renders field labels from fieldLabels prop", () => {
    renderWithConfirm(
      { title: "Confirm", description: "Are you sure?", summaryFields: ["name"] },
      { name: "Nombre" },
      { name: "John" }
    );
    openConfirmDialog();
    expect(screen.getByText("Nombre")).toBeInTheDocument();
    expect(screen.getByText("John")).toBeInTheDocument();
  });

  it("falls back to Title Case for unknown labels", () => {
    renderWithConfirm(
      { title: "Confirm", description: "Are you sure?", summaryFields: ["firstName"] },
      {},
      { firstName: "John" }
    );
    openConfirmDialog();
    expect(screen.getByText("First Name")).toBeInTheDocument();
    expect(screen.getByText("John")).toBeInTheDocument();
  });

  it("formats boolean true as Si", () => {
    renderWithConfirm(
      { title: "Confirm", description: "Are you sure?", summaryFields: ["active"] },
      undefined,
      { active: true }
    );
    openConfirmDialog();
    expect(screen.getByText("Si")).toBeInTheDocument();
  });

  it("formats boolean false as No", () => {
    renderWithConfirm(
      { title: "Confirm", description: "Are you sure?", summaryFields: ["active"] },
      undefined,
      { active: false }
    );
    openConfirmDialog();
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  it("formats null as em dash", () => {
    renderWithConfirm(
      { title: "Confirm", description: "Are you sure?", summaryFields: ["note"] },
      undefined,
      { note: null }
    );
    openConfirmDialog();
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("formats empty string as em dash", () => {
    renderWithConfirm(
      { title: "Confirm", description: "Are you sure?", summaryFields: ["note"] },
      undefined,
      { note: "" }
    );
    openConfirmDialog();
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("formats ISO date string", () => {
    renderWithConfirm(
      { title: "Confirm", description: "Are you sure?", summaryFields: ["date"] },
      undefined,
      { date: "2026-09-10" }
    );
    openConfirmDialog();
    expect(screen.getByText("10/09/26")).toBeInTheDocument();
  });

  it("formats numbers", () => {
    renderWithConfirm(
      { title: "Confirm", description: "Are you sure?", summaryFields: ["count"] },
      undefined,
      { count: 450 }
    );
    openConfirmDialog();
    expect(screen.getByText("450")).toBeInTheDocument();
  });

  it("renders confirm title and description", () => {
    renderWithConfirm(
      { title: "Test", description: "Are you sure?", summaryFields: [] }
    );
    openConfirmDialog();
    expect(screen.getByText("Test")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });
});