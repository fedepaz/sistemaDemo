import { render, screen, fireEvent } from "@testing-library/react";

const mockSetTheme = jest.fn();

jest.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: mockSetTheme,
  }),
}));

jest.mock("@/hooks/useIsMounted", () => ({
  useIsMounted: () => true,
}));

jest.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: React.ComponentProps<"button">) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));

import { ThemeToggle } from "../theme-toggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders a button", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("shows 'Modo oscuro' aria-label when theme is light", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Modo oscuro");
  });

  it("calls setTheme with 'dark' when clicked in light mode", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });
});
