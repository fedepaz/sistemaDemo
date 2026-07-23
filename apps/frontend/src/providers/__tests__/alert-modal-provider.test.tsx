import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AlertModalProvider, useAlertModal } from "../alert-modal-provider";

function TestConsumer() {
  const { openAlert, closeAlert, state } = useAlertModal();
  return (
    <div>
      <span data-testid="is-open">{String(state.isOpen)}</span>
      <span data-testid="alert-type">{state.alertType ?? "null"}</span>
      <button onClick={() => openAlert("critical", { id: 1 })}>
        Open Critical
      </button>
      <button onClick={() => openAlert("warning")}>Open Warning</button>
      <button data-testid="btn-close" onClick={closeAlert}>Close</button>
    </div>
  );
}

function renderWithProvider(ui: React.ReactElement) {
  return render(<AlertModalProvider>{ui}</AlertModalProvider>);
}

describe("AlertModalProvider", () => {
  it("renders children", () => {
    renderWithProvider(<div>test child</div>);
    expect(screen.getByText("test child")).toBeInTheDocument();
  });

  it("starts with isOpen false and alertType null", () => {
    renderWithProvider(<TestConsumer />);
    expect(screen.getByTestId("is-open")).toHaveTextContent("false");
    expect(screen.getByTestId("alert-type")).toHaveTextContent("null");
  });

  it("sets isOpen to true and alertType on openAlert", async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestConsumer />);
    await user.click(screen.getByText("Open Critical"));
    expect(screen.getByTestId("is-open")).toHaveTextContent("true");
    expect(screen.getByTestId("alert-type")).toHaveTextContent("critical");
  });

  it("resets state on closeAlert", async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestConsumer />);
    await user.click(screen.getByText("Open Critical"));
    expect(screen.getByTestId("is-open")).toHaveTextContent("true");
    // fireEvent.click avoids pointer-events:auto on Radix Dialog overlay
    // that prevents userEvent from reaching the close button
    fireEvent.click(screen.getByTestId("btn-close"));
    expect(screen.getByTestId("is-open")).toHaveTextContent("false");
    expect(screen.getByTestId("alert-type")).toHaveTextContent("null");
  });
});

describe("useAlertModal", () => {
  it("throws when used outside provider", () => {
    function BadComponent() {
      useAlertModal();
      return null;
    }
    expect(() => render(<BadComponent />)).toThrow(
      "useAlertModal must be used within an AlertModalProvider"
    );
  });
});
