import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WizardModalProvider, useWizard } from "../wizard-modal-provider";
import type { WizardConfig } from "../wizard-modal-types";

const mockConfig: WizardConfig = {
  title: "Test Wizard",
  steps: [
    { id: "step1", label: "Step 1", component: () => <div>Step 1</div> },
    { id: "step2", label: "Step 2", component: () => <div>Step 2</div> },
  ],
  onComplete: jest.fn(),
};

function TestConsumer() {
  const { openWizard, closeWizard, state } = useWizard();
  return (
    <div>
      <span data-testid="is-open">{String(state.isOpen)}</span>
      <button onClick={() => openWizard(mockConfig)}>Open Wizard</button>
      <button data-testid="wizard-btn-close" onClick={closeWizard}>Close</button>
    </div>
  );
}

function renderWithProvider(ui: React.ReactElement) {
  return render(<WizardModalProvider>{ui}</WizardModalProvider>);
}

describe("WizardModalProvider", () => {
  it("renders children", () => {
    renderWithProvider(<div>test child</div>);
    expect(screen.getByText("test child")).toBeInTheDocument();
  });

  it("starts with isOpen false", () => {
    renderWithProvider(<TestConsumer />);
    expect(screen.getByTestId("is-open")).toHaveTextContent("false");
  });

  it("sets isOpen to true on openWizard", async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestConsumer />);
    await user.click(screen.getByText("Open Wizard"));
    expect(screen.getByTestId("is-open")).toHaveTextContent("true");
  });

  it("resets state on closeWizard", async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestConsumer />);
    await user.click(screen.getByText("Open Wizard"));
    expect(screen.getByTestId("is-open")).toHaveTextContent("true");
    fireEvent.click(screen.getByTestId("wizard-btn-close"));
    expect(screen.getByTestId("is-open")).toHaveTextContent("false");
  });
});

describe("useWizard", () => {
  it("throws when used outside provider", () => {
    function BadComponent() {
      useWizard();
      return null;
    }
    expect(() => render(<BadComponent />)).toThrow(
      "useWizard must be used within a WizardModalProvider"
    );
  });
});
