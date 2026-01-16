import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock the entire next-intl module
vi.mock("next-intl", () => ({
  useTranslations: vi.fn((namespace) => (key) => `${namespace}.${key}`),
  NextIntlClientProvider: ({ children }) => children,
}));
