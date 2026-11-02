import type { Metadata } from "next";
import DashboardOverview from "@/components/kepler/dashboard/DashboardOverview";

export const metadata: Metadata = {
  title: "Overview | Kepler",
  description: "Kepler construction command center",
};

export default function DashboardPage() {
  return <DashboardOverview />;
}
