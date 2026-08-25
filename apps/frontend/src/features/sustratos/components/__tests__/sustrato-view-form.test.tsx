// apps/frontend/src/features/sustratos/components/__tests__/sustrato-view-form.test.tsx
import { render, screen } from "@testing-library/react";
import { SustratoViewForm } from "../sustrato-view-form";
import type { SustratoDto } from "@vivero/shared";

describe("SustratoViewForm", () => {
  const mockSustrato: SustratoDto = {
    id: "1",
    nombre: "Sustrato Test",
    createdAt: "2024-03-15T00:00:00.000Z",
  };

  it("should display sustrato nombre in header", () => {
    render(<SustratoViewForm selectedSustrato={mockSustrato} />);
    const headers = screen.getAllByText("Sustrato Test");
    expect(headers.length).toBeGreaterThanOrEqual(1);
  });

  it("should display formatted creation date", () => {
    render(<SustratoViewForm selectedSustrato={mockSustrato} />);
    expect(screen.getByText("14/3/2024")).toBeInTheDocument();
  });
});
