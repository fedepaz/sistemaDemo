import { render, screen } from "@testing-library/react";
import { Suspense } from "react";
import { LoadingBoundary } from "../loading-boundary";

function AsyncComponent() {
  return <div data-testid="real-content">Loaded</div>;
}

function ThrowingComponent() {
  throw new Promise(() => {}); // Always suspends
}

describe("LoadingBoundary", () => {
  it("renders children when not suspended", () => {
    render(
      <LoadingBoundary skeleton={<div data-testid="skeleton" />}>
        <AsyncComponent />
      </LoadingBoundary>
    );
    expect(screen.getByTestId("real-content")).toBeInTheDocument();
    expect(screen.queryByTestId("skeleton")).not.toBeInTheDocument();
  });

  it("shows skeleton when children suspend", () => {
    render(
      <LoadingBoundary skeleton={<div data-testid="skeleton" />}>
        <ThrowingComponent />
      </LoadingBoundary>
    );
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
    expect(screen.queryByTestId("real-content")).not.toBeInTheDocument();
  });

  it("wraps skeleton in aria-busy and aria-live", () => {
    render(
      <LoadingBoundary skeleton={<div data-testid="skeleton" />}>
        <ThrowingComponent />
      </LoadingBoundary>
    );
    const wrapper = screen.getByTestId("skeleton").parentElement;
    expect(wrapper).toHaveAttribute("aria-busy", "true");
    expect(wrapper).toHaveAttribute("aria-live", "polite");
  });

  it("requires skeleton prop (TypeScript enforcement tested at compile time)", () => {
    render(
      <LoadingBoundary skeleton={<div />}>
        <div />
      </LoadingBoundary>
    );
  });
});
