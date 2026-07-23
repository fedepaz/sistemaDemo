import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { NotFoundPage } from "../not-found";

jest.mock("next/link", () => {
  const MockLink = ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

describe("NotFoundPage", () => {
  it("renders the 404 heading", () => {
    render(<NotFoundPage />);
    expect(screen.getByText("Error 404")).toBeInTheDocument();
  });

  it("renders the 'not found' message", () => {
    render(<NotFoundPage />);
    expect(screen.getByText("Página no encontrada")).toBeInTheDocument();
  });

  it("renders the description", () => {
    render(<NotFoundPage />);
    expect(
      screen.getByText(/no pudimos encontrar la página/),
    ).toBeInTheDocument();
  });

  it("renders a link to home", () => {
    render(<NotFoundPage />);
    const link = screen.getByRole("link", { name: /volver/i });
    expect(link).toHaveAttribute("href", "/");
  });
});
