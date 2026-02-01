import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders products page title", () => {
  render(<App />);
  const title = screen.getByText(/products/i);
  expect(title).toBeInTheDocument();
});
