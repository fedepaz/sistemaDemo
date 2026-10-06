// __tests__/volumeCalculator.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { VolumeCalculator } from "../volumeCalculator";

describe("VolumeCalculator", () => {
  it("shows default unit 1 and derived total for qty", () => {
    render(<VolumeCalculator qty={200} totalQty="10" />);

    expect(screen.getByLabelText("Valor Unitario (L)")).toHaveValue("1");
    expect(screen.getByLabelText("Valor Total Por Bandeja (L)")).toHaveValue("200");
  });

  it("recomputes total when the unit is typed (comma accepted)", () => {
    render(<VolumeCalculator qty={200} totalQty="10" />);

    fireEvent.change(screen.getByLabelText("Valor Unitario (L)"), {
      target: { value: "0,740" },
    });

    expect(screen.getByLabelText("Valor Total Por Bandeja (L)")).toHaveValue("148");
  });

  it("recomputes unit when the total is typed", () => {
    render(<VolumeCalculator qty={200} totalQty="10" />);

    fireEvent.change(screen.getByLabelText("Valor Total Por Bandeja (L)"), {
      target: { value: "126" },
    });

    expect(screen.getByLabelText("Valor Unitario (L)")).toHaveValue("0,63");
  });

  it("disables inputs and shows a hint when qty is null", () => {
    render(<VolumeCalculator qty={null} totalQty="10" />);

    expect(screen.getByLabelText("Valor Unitario (L)")).toBeDisabled();
    expect(screen.getByLabelText("Valor Total Por Bandeja (L)")).toBeDisabled();
    expect(screen.getByLabelText("Valor Unitario (L)")).toHaveValue("1");
    expect(screen.getByLabelText("Valor Total Por Bandeja (L)")).toHaveValue("—");
    expect(screen.getByText("Sin cantidad de contenedor")).toBeInTheDocument();
  });

  it("shows the approximate warning only on the derived side", () => {
    render(<VolumeCalculator qty={3} totalQty="10" />);

    fireEvent.change(screen.getByLabelText("Valor Total Por Bandeja (L)"), {
      target: { value: "100" },
    });

    expect(screen.getByLabelText("Valor Unitario (L)")).toHaveValue(
      "33,333",
    );
    const warnings = screen.getAllByLabelText(
      "Valor aproximado (redondeado a 3 decimales)",
    );
    expect(warnings).toHaveLength(1);
    const unitRow = screen.getByLabelText("Valor Unitario (L)").closest("div");
    expect(unitRow).toContainElement(warnings[0]);
  });

  it("computes Valor Total Partida as per-band total times containers", () => {
    render(<VolumeCalculator qty={200} totalQty="10" />);

    const row = screen.getByText("Valor Total Partida (L)").closest("div");
    expect(row).toHaveTextContent("2000");
  });

  it("shows a dash for Valor Total Partida when containers are missing", () => {
    render(<VolumeCalculator qty={200} totalQty={null} />);

    const row = screen.getByText("Valor Total Partida (L)").closest("div");
    expect(row).toHaveTextContent("—");
  });

  it("computes partida total when containers arrive as a number", () => {
    render(<VolumeCalculator qty={200} totalQty={10} />);

    const row = screen.getByText("Valor Total Partida (L)").closest("div");
    expect(row).toHaveTextContent("2000");
  });
});
