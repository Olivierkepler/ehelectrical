import type { Metadata } from "next";

import { AuthProvider } from "@/lib/kepler/AuthProvider";

export const metadata: Metadata = {
  title: "Sign in | Kepler",
  description: "Sign in to your Kepler workspace",
};

/**
 * Auth route group — no EH marketing chrome, no product shell.
 * Public URL: /login
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthProvider>{children}</AuthProvider>;
}
