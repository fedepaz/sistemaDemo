import { render, screen, fireEvent } from "@testing-library/react";

jest.mock("../employee-search", () => ({
  EmployeeSearch: () => <div data-testid="employee-search" />,
}));

import { TaskShift } from "../taskShift";

describe("TaskShift", () => {
  it("shows the chosen work date in the hint", () => {
    render(
      <TaskShift
        startTime=""
        endTime=""
        employees={[]}
        workDate="2026-10-16"
        onStartTimeChange={jest.fn()}
        onEndTimeChange={jest.fn()}
        onEmployeesChange={jest.fn()}
      />,
    );
    expect(screen.getByText(/2026-10-16/)).toBeInTheDocument();
  });

  it("stamps start time on the passed workDate, not today", () => {
    const onStartTimeChange = jest.fn();
    render(
      <TaskShift
        startTime=""
        endTime=""
        employees={[]}
        workDate="2026-10-16"
        onStartTimeChange={onStartTimeChange}
        onEndTimeChange={jest.fn()}
        onEmployeesChange={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByText("Iniciar"));
    expect(onStartTimeChange).toHaveBeenCalledWith(
      expect.stringMatching(/^2026-10-16T/),
    );
  });

  it("falls back to today when workDate is not provided", () => {
    const onStartTimeChange = jest.fn();
    render(
      <TaskShift
        startTime=""
        endTime=""
        employees={[]}
        onStartTimeChange={onStartTimeChange}
        onEndTimeChange={jest.fn()}
        onEmployeesChange={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByText("Iniciar"));
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    expect(onStartTimeChange).toHaveBeenCalledWith(
      expect.stringMatching(new RegExp(`^${yyyy}-${mm}-${dd}T`)),
    );
  });
});
