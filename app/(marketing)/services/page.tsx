import SectionIntro from "@/components/SectionIntro";
import ServicesList from "@/components/ServicesList";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";

export default function ServicesPage() {
  return <><section className="py-24"><div className="container-site"><SectionIntro eyebrow="Services" title="Electrical and HVAC services built around real operating needs." body="From early pricing through field coordination and closeout, we help owners move complex building-system work forward with fewer surprises."/><ServicesList/></div></section><FAQ/><CTA/></>;
}
