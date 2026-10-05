import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("axios", () => ({
  defaults: { headers: { common: {} } },
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

test("renders the admin sign-in screen for a signed-out session", () => {
  localStorage.clear();
  render(<App />);
  expect(screen.getByRole("heading", { name: /admin login/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
});
