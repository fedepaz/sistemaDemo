import React from "react";
import { render, screen } from "@testing-library/react";
import { KPICard } from "../kpi-card";

describe("KPICard", () => {
  it("renders title and value", () => {
    render(<KPICard title="Total Users" value={42} />);
    expect(screen.getByText("Total Users")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders string value", () => {
    render(<KPICard title="Status" value="Active" />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<KPICard title="Revenue" value="$1000" description="vs last month" />);
    expect(screen.getByText("vs last month")).toBeInTheDocument();
  });

  it("does not render description when not provided", () => {
    render(<KPICard title="Revenue" value="$1000" />);
    expect(screen.queryByText("vs last month")).not.toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    const MockIcon = () => <svg data-testid="mock-icon" />;
    render(<KPICard title="Users" value={100} icon={MockIcon} />);
    expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
  });

  it("renders positive trend", () => {
    render(
      <KPICard
        title="Growth"
        value={100}
        trend={{ value: 12, label: "vs last month", isPositive: true }}
      />
    );
    expect(screen.getByText("+12%")).toBeInTheDocument();
    expect(screen.getByText("vs last month")).toBeInTheDocument();
  });

  it("renders negative trend", () => {
    render(
      <KPICard
        title="Decline"
        value={50}
        trend={{ value: 5, label: "vs last month", isPositive: false }}
      />
    );
    expect(screen.getByText("5%")).toBeInTheDocument();
  });

  it("renders trend without isPositive as negative", () => {
    render(
      <KPICard
        title="Change"
        value={50}
        trend={{ value: 3, label: "change" }}
      />
    );
    expect(screen.getByText("3%")).toBeInTheDocument();
  });
});
