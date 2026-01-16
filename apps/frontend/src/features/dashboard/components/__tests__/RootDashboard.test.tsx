import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RootDashboard } from "../RootDashboard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

describe("RootDashboard Component", () => {
  it("should render KPI skeletons on initial load", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <RootDashboard />
      </QueryClientProvider>
    );

    const skeletons = await screen.findAllByTestId("kpi-card-skeleton");
    expect(skeletons).toHaveLength(4);
  });
});
