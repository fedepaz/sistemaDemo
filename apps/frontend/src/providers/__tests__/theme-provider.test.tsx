import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "../theme-provider";

// Mock next-themes
jest.mock("next-themes", () => ({
  ThemeProvider: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => (
    <div data-testid="next-themes-provider" data-props={JSON.stringify(props)}>
      {children}
    </div>
  ),
  useTheme: () => ({ theme: "light", setTheme: jest.fn() }),
}));

describe("ThemeProvider", () => {
  it("renders children", () => {
    render(
      <ThemeProvider>
        <div>Test content</div>
      </ThemeProvider>
    );
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("wraps children in NextThemesProvider", () => {
    render(
      <ThemeProvider>
        <div>Content</div>
      </ThemeProvider>
    );
    expect(screen.getByTestId("next-themes-provider")).toBeInTheDocument();
  });

  it("passes correct theme configuration", () => {
    render(
      <ThemeProvider>
        <div>Content</div>
      </ThemeProvider>
    );
    const provider = screen.getByTestId("next-themes-provider");
    const props = JSON.parse(provider.getAttribute("data-props") || "{}");
    expect(props.attribute).toBe("class");
    expect(props.enableSystem).toBe(false);
    expect(props.defaultTheme).toBe("light");
    expect(props.forcedTheme).toBe("light");
  });
});
