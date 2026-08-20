import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import "./globals.css";

import WelcomeLoader from "@/components/WelcomeLoader";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EH Electric & HVAC | Building Systems That Work Better",
  description:
    "Electrical and HVAC construction, retrofit, renovation, and service across Greater Boston.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        {/* Welcome / loading experience */}
        <WelcomeLoader />

        {/* Main website */}
        <Header />

        <main>{children}</main>

        <Footer />
      </body>
    </html>
  );
} 