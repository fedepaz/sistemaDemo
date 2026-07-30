import React from "react";
import { render, screen } from "@testing-library/react";
import { ReactClientProvider } from "../query-client-provider";

jest.mock("@tanstack/react-query", () => {
  const actual = jest.requireActual("@tanstack/react-query");
  return {
    ...actual,
    QueryClientProvider: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="query-client-provider">{children}</div>
    ),
  };
});

jest.mock("@/features/auth/providers/AuthProvider", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

jest.mock("../error-provider", () => ({
  useError: () => ({ handleError: jest.fn() }),
}));

describe("ReactClientProvider", () => {
  it("renders children", () => {
    render(
      <ReactClientProvider>
        <div>Test content</div>
      </ReactClientProvider>
    );
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("wraps children in AuthProvider", () => {
    render(
      <ReactClientProvider>
        <div>Content</div>
      </ReactClientProvider>
    );
    expect(screen.getByTestId("auth-provider")).toBeInTheDocument();
  });
});
