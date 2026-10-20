/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AsignarUbiSiembraCompletaDtoSchema,
  type AsignarUbiSiembraCompletaDto,
  type SiembraPartidaDto,
} from "@vivero/shared";
import { ASembrarEditForm } from "../a-sembrar-edit-form";

jest.mock("react-hook-form", () => ({
  ...jest.requireActual("react-hook-form"),
  useForm: jest.requireActual("react-hook-form").useForm,
}));

jest.mock("@/features/extendidos", () => ({
  useDepositos: () => ({ data: [] }),
}));

jest.mock("@/features/programacionSiembra/components/tratamientoSearch", () => ({
  TratamientoSearch: () => <div data-testid="tratamiento-search" />,
}));

jest.mock("@/features/programacionSiembra/components/sustratoSearch", () => ({
  SustratoSearch: () => <div data-testid="sustrato-search" />,
}));

jest.mock("@/features/taskshift/components/taskShift", () => {
  const React = jest.requireActual("react");
  return {
    TaskShift: ({
      workDate,
      onStartTimeChange,
      onEndTimeChange,
    }: {
      workDate?: string;
      onStartTimeChange?: (v: string) => void;
      onEndTimeChange?: (v: string) => void;
    }) => {
      React.useEffect(() => {
        onStartTimeChange?.("08:00");
        onEndTimeChange?.("10:00");
      }, [onStartTimeChange, onEndTimeChange]);
      return <div data-testid="taskshift" data-work-date={workDate ?? ""} />;
    },
  };
});

jest.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TooltipContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TooltipProvider: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

const selectedPartida = {
  id: "1",
  partidaId: 1,
  anio: 2026,
  indice: 1,
  nombreEspecie: "Pino",
  codigoEspecie: "PIN",
} as unknown as SiembraPartidaDto;

function TestHost({
  defaultValues,
  onSubmit = jest.fn(),
}: {
  defaultValues: Record<string, unknown>;
  onSubmit?: jest.Mock;
}) {
  const form = useForm<AsignarUbiSiembraCompletaDto>({
    resolver: zodResolver(AsignarUbiSiembraCompletaDtoSchema),
    defaultValues: defaultValues as any,
  });
  return (
    <ASembrarEditForm
      form={form}
      onSubmit={onSubmit as any}
      onCancel={jest.fn()}
      selectedPartida={selectedPartida}
    />
  );
}

describe("ASembrarEditForm — fecha de siembra", () => {
  it("renders a date input with the 14-day min and today max", () => {
    const { container: c } = render(
      <TestHost defaultValues={{ fSiembra: undefined }} />,
    );
    const input = c.querySelector('input[type="date"]');
    expect(input).not.toBeNull();

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    expect(input!.getAttribute("max")).toBe(`${yyyy}-${mm}-${dd}`);

    const min = new Date();
    min.setDate(min.getDate() - 14);
    const minYyyy = min.getFullYear();
    const minMm = String(min.getMonth() + 1).padStart(2, "0");
    const minDd = String(min.getDate()).padStart(2, "0");
    expect(input!.getAttribute("min")).toBe(`${minYyyy}-${minMm}-${minDd}`);
  });

  it("binds the prefilled fSiembra value into the input", () => {
    const { container: c } = render(
      <TestHost defaultValues={{ fSiembra: "2026-10-16" }} />,
    );
    const input = c.querySelector('input[type="date"]') as HTMLInputElement;
    expect(input.value).toBe("2026-10-16");
  });

  it("passes fSiembra to TaskShift as workDate", () => {
    const { getByTestId } = render(
      <TestHost defaultValues={{ fSiembra: "2026-10-16" }} />,
    );
    expect(getByTestId("taskshift").getAttribute("data-work-date")).toBe(
      "2026-10-16",
    );
  });

  it("submits a prefilled out-of-window fSiembra as-is (form noValidate)", async () => {
    const old = new Date(Date.now() - 30 * 86_400_000);
    const oldDateStr = `${old.getFullYear()}-${String(old.getMonth() + 1).padStart(2, "0")}-${String(old.getDate()).padStart(2, "0")}`;

    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { container } = render(
      <TestHost
        onSubmit={onSubmit}
        defaultValues={{
          partidaId: 1,
          anio: 2026,
          indice: 1,
          cg: 92,
          cantidaNroCont: 120,
          detalleExtendido: "Test",
          lote: 1001,
          anoLote: 2025,
          item: 1,
          semxgr: 2352,
          cantidadGrs: 2.58,
          fSiembra: oldDateStr,
          metodoMaquina: true,
          prensadoSustrato: 2,
          profundidadSemilla: "1.5",
          tratamientoSemilla: "TRAT",
          sustrato: "SUST",
          entityId: "clx1234567890abcdef123478",
        }}
      />,
    );

    // The date input carries native min/max; requestSubmit() (used by
    // SlideOverForm) runs native constraint validation, so the form must be
    // noValidate or a legacy date older than 14 days can never be submitted.
    const formEl = container.querySelector("#a-sembrar-form") as HTMLFormElement;
    expect(formEl.hasAttribute("novalidate")).toBe(true);

    fireEvent.submit(formEl);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toEqual(
      expect.objectContaining({ fSiembra: oldDateStr }),
    );
  });
});
