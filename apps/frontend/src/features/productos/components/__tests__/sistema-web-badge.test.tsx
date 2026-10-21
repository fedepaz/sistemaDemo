// apps/frontend/src/features/productos/components/__tests__/sistema-web-badge.test.tsx
import { render, screen } from "@testing-library/react";
import { SistemaWebBadge } from "../sistema-web-badge";

jest.mock("lucide-react", () => ({
  Sparkles: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="sparkles-icon" {...props} />
  ),
}));

jest.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TooltipContent: () => null,
}));

describe("SistemaWebBadge", () => {
  it("renders an accessible icon-only badge labeled Sistema Web", () => {
    render(<SistemaWebBadge />);

    const badge = screen.getByLabelText("Sistema Web");
    expect(badge).toBeInTheDocument();
    expect(screen.getByTestId("sparkles-icon")).toBeInTheDocument();
  });

  it("has no visible text", () => {
    render(<SistemaWebBadge />);

    expect(screen.queryByText("Sistema Web")).toBeNull();
  });
});
