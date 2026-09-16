/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, act, fireEvent } from "@testing-library/react";
import type { UserProfileDto } from "@vivero/shared";

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

jest.mock("@/hooks/useDataTable", () => ({
  useDataTableActions: () => ({
    isCreateModalOpen: false,
    isEditModalOpen: false,
    selectedEntity: null,
    handleAdd: jest.fn(),
    handleEdit: jest.fn(),
    handleDelete: jest.fn(),
    closeCreateModal: jest.fn(),
    closeEditModal: jest.fn(),
  }),
}));

jest.mock("../../hooks/usersHooks", () => ({
  useUsers: () => ({
    data: [
      { username: "user1", firstName: "Juan", lastName: "Pérez", email: "juan@test.com" },
    ],
  }),
  useUsersToActivate: () => ({ data: [] }),
  useUpdateUser: () => ({
    mutateAsync: jest.fn().mockResolvedValue(undefined),
    isPending: false,
  }),
  useDeleteUser: () => ({
    mutateAsync: jest.fn().mockResolvedValue(undefined),
  }),
}));

jest.mock("@/hooks/usePermission", () => ({
  usePermission: () => ({
    canUpdate: true,
    canCreate: true,
  }),
}));

jest.mock("@/features/auth/providers/AuthProvider", () => ({
  useAuthContext: () => ({
    userProfile: { id: "current-user" },
  }),
}));

jest.mock("react-hook-form", () => ({
  ...jest.requireActual("react-hook-form"),
  useForm: () => ({
    control: {
      _getWatch: jest.fn().mockReturnValue(true),
      _formValues: {},
      _subjects: { watch: { next: jest.fn() } },
    },
    handleSubmit: (fn: (data: Record<string, unknown>) => void) => (e: Event) => {
      e.preventDefault();
      fn({});
    },
    formState: { isValid: true, isSubmitting: false },
    reset: jest.fn(),
    setValue: jest.fn(),
    getValues: jest.fn().mockReturnValue({}),
    watch: jest.fn(),
    register: jest.fn().mockReturnValue({ name: "", ref: jest.fn(), onChange: jest.fn(), onBlur: jest.fn() }),
  }),
}));

jest.mock("../user-edit-form", () => ({
  UserEditForm: ({ onSubmit, onCancel }: any) => (
    <div data-testid="user-edit-form">
      <button onClick={() => onSubmit({})}>Submit</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

jest.mock("../restore-password-button", () => ({
  RestorePasswordButton: () => <div data-testid="restore-password-button" />,
}));

jest.mock("../activate-user-button", () => ({
  ActivateUserButton: () => <div data-testid="activate-user-button" />,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: any) => <span>{children}</span>,
}));

jest.mock("lucide-react", () => ({
  UserCheck: () => null,
  UserPlus: () => null,
}));

let capturedProps: any = null;

jest.mock("@/components/data-display/data-table", () => ({
  DataTable: ({ title, onEdit }: any) => (
    <div data-testid="data-table">
      <h1>{title}</h1>
      <button onClick={() => onEdit(mockUsers[0])}>Edit Row</button>
    </div>
  ),
  SlideOverForm: (props: any) => {
    capturedProps = props;
    return props.open ? <div data-testid="slide-over">{props.children}</div> : null;
  },
}));

import { UsersDataTable } from "../user-data-table";

const mockUsers: UserProfileDto[] = [
  {
    username: "user1",
    firstName: "Juan",
    lastName: "Pérez",
    email: "juan@test.com",
    id: "u1",
  } as UserProfileDto,
];

describe("UsersDataTable", () => {
  beforeEach(() => {
    capturedProps = null;
  });

  it("renders DataTable with correct title", () => {
    render(<UsersDataTable />);
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
    expect(screen.getByText("Usuarios")).toBeInTheDocument();
  });

  it("passes correct summaryFields to SlideOverForm", () => {
    render(<UsersDataTable />);

    act(() => {
      fireEvent.click(screen.getByText("Edit Row"));
    });

    expect(capturedProps).not.toBeNull();
    expect(capturedProps.confirm.summaryFields).toEqual([
      "firstName",
      "lastName",
      "email",
    ]);
  });
});
