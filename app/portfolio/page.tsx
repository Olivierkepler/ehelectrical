import SectionIntro from "@/components/SectionIntro";
import PortfolioGrid from "@/components/PortfolioGrid";
import ProjectFlow from "@/components/ProjectFlow";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";

export default function PortfolioPage() { return <><section className="py-24"><div className="container-site"><SectionIntro title="A portfolio built on purpose, precision, and people." body="Representative electrical, HVAC, retrofit, and renovation work across commercial and institutional environments."/><PortfolioGrid/></div></section><ProjectFlow/><FAQ/><CTA/></>; }
