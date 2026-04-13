import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SignUpForm from "../SignUpForm";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  signIn: vi.fn(),
}));

vi.mock("next-auth/react", () => ({
  signIn: mocks.signIn,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
  useSearchParams: () => new URLSearchParams("inviteToken=token_1&callbackUrl=%2Forg_1%2Fitems"),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

describe("SignUpForm invite continuation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("accepts invite and redirects to org dashboard after signup", async () => {
    mocks.signIn.mockResolvedValue({ error: null, url: "/org_1/items" });

    const fetchMock = vi.spyOn(global, "fetch").mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/auth/signup") {
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      }
      if (url === "/api/invite/accept") {
        return new Response(JSON.stringify({ orgId: "org_1" }), { status: 200 });
      }
      if (url === "/api/organizations/select") {
        return new Response(null, { status: 200 });
      }
      return new Response(null, { status: 404 });
    });

    render(<SignUpForm />);

    fireEvent.change(screen.getByPlaceholderText("John Doe"), { target: { value: "Test User" } });
    fireEvent.change(screen.getByPlaceholderText("operator@company.com"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••••••"), {
      target: { value: "very-strong-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mocks.signIn).toHaveBeenCalledWith("credentials", {
        email: "test@example.com",
        password: "very-strong-password",
        callbackUrl: "/org_1/items",
        redirect: false,
      });
      expect(mocks.push).toHaveBeenCalledWith("/org_1/dashboard?inviteAccepted=1");
    });

    fetchMock.mockRestore();
  });

  it("shows fallback error when invite acceptance fails", async () => {
    mocks.signIn.mockResolvedValue({ error: null, url: "/org_1/items" });

    const fetchMock = vi.spyOn(global, "fetch").mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/auth/signup") {
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      }
      if (url === "/api/invite/accept") {
        return new Response("bad", { status: 500 });
      }
      return new Response(null, { status: 404 });
    });

    render(<SignUpForm />);

    fireEvent.change(screen.getByPlaceholderText("John Doe"), { target: { value: "Test User" } });
    fireEvent.change(screen.getByPlaceholderText("operator@company.com"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••••••"), {
      target: { value: "very-strong-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(
      await screen.findByText("Unable to accept invitation. Please sign in and try again."),
    ).toBeInTheDocument();
    expect(mocks.push).not.toHaveBeenCalledWith("/org_1/dashboard?inviteAccepted=1");

    fetchMock.mockRestore();
  });
});
