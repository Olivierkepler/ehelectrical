import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WelcomeLoader from "@/components/WelcomeLoader";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <WelcomeLoader />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
