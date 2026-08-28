// apps/frontend/src/features/mezclas/components/__tests__/mezcla-view-form.test.tsx
import { render, screen } from "@testing-library/react";
import { MezclaViewForm } from "../mezcla-view-form";
import type { MezclaDto } from "@vivero/shared";

const mockMezcla: MezclaDto = {
  id: "1",
  sustrato1Id: "s1",
  sustrato1Nombre: "Turba",
  porcentaje1: 60,
  sustrato2Id: "s2",
  sustrato2Nombre: "Perlita",
  porcentaje2: 40,
  sustrato3Id: null,
  sustrato3Nombre: null,
  porcentaje3: null,
  sustrato4Id: null,
  sustrato4Nombre: null,
  porcentaje4: null,
  isActive: true,
  createdAt: new Date("2024-03-14"),
};

describe("MezclaViewForm", () => {
  it("should display sustrato names and percentages", () => {
    render(<MezclaViewForm selectedMezcla={mockMezcla} />);
    expect(screen.getByText("Turba")).toBeInTheDocument();
    expect(screen.getByText("Perlita")).toBeInTheDocument();
    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
  });

  it("should display active badge", () => {
    render(<MezclaViewForm selectedMezcla={mockMezcla} />);
    expect(screen.getByText("Activo")).toBeInTheDocument();
  });

  it("should display formatted creation date", () => {
    render(<MezclaViewForm selectedMezcla={mockMezcla} />);
    expect(screen.getByText(/de marzo de 2024/i)).toBeInTheDocument();
  });

  it("should show dash for empty slots", () => {
    render(<MezclaViewForm selectedMezcla={mockMezcla} />);
    const dashes = screen.getAllByText("-");
    expect(dashes.length).toBe(4);
  });
});
