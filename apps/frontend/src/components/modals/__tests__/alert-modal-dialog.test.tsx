import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AlertModalProvider, useAlertModal } from "@/providers/alert-modal-provider";
import { AlertModalDialog } from "../alert-modal-dialog";

function TestOpener({ alertType = "critical" as const }) {
  const { openAlert } = useAlertModal();
  return (
    <button onClick={() => openAlert(alertType)}>
      Open {alertType}
    </button>
  );
}

function renderWithProvider(ui: React.ReactElement) {
  return render(
    <AlertModalProvider>
      {ui}
      <AlertModalDialog />
    </AlertModalProvider>
  );
}

describe("AlertModalDialog", () => {
  it("shows correct title for critical alerts", async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestOpener alertType="critical" />);
    await user.click(screen.getByText("Open critical"));
    expect(screen.getByText("Alertas Críticas")).toBeInTheDocument();
  });

  it("shows correct title for warning alerts", async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestOpener alertType="warning" />);
    await user.click(screen.getByText("Open warning"));
    expect(screen.getByText("Alertas")).toBeInTheDocument();
  });

  it("shows correct title for info alerts", async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestOpener alertType="info" />);
    await user.click(screen.getByText("Open info"));
    expect(screen.getByText("Información")).toBeInTheDocument();
  });
});
