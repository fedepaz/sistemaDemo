import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AlertModalProvider, useAlertModal } from "@/providers/alert-modal-provider";
import { AlertModalDialog } from "../alert-modal-dialog";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function TestOpener() {
  const { openAlert } = useAlertModal();
  return (
    <button onClick={() => openAlert("info")}>
      Open alerts
    </button>
  );
}

function renderWithProvider(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      <AlertModalProvider>
        {ui}
        <AlertModalDialog />
      </AlertModalProvider>
    </QueryClientProvider>
  );
}

describe("AlertModalDialog", () => {
  it("opens with title Alertas", async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestOpener />);
    await user.click(screen.getByText("Open alerts"));
    expect(screen.getByRole("heading", { name: "Alertas" })).toBeInTheDocument();
  });

  it("renders inside dialog when triggered", async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestOpener />);
    await user.click(screen.getByText("Open alerts"));
    expect(screen.getByRole("heading", { name: "Alertas" })).toBeInTheDocument();
  });

  it("closes dialog on Escape key", async () => {
    const user = userEvent.setup();
    renderWithProvider(<TestOpener />);
    await user.click(screen.getByText("Open alerts"));
    expect(screen.getByRole("heading", { name: "Alertas" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("heading", { name: "Alertas" })).not.toBeInTheDocument();
  });
});
