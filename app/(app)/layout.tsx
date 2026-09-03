import type { Metadata } from "next";

import DashboardShell from "@/components/kepler/DashboardShell";
import ProductAuthGate from "@/components/kepler/ProductAuthGate";
import { AuthProvider } from "@/lib/kepler/AuthProvider";

export const metadata: Metadata = {
  title: "Kepler",
  description: "Kepler construction operations workspace",
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <ProductAuthGate>
        <DashboardShell>{children}</DashboardShell>
      </ProductAuthGate>
    </AuthProvider>
  );
}
