import Image from "next/image";
import SectionIntro from "@/components/SectionIntro";
import PortfolioGrid from "@/components/PortfolioGrid";
import Values from "@/components/Values";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";

export default function AboutPage() {
  return <>
    <section className="py-24"><div className="container-site"><SectionIntro title="Built on integrity. Trusted in complex environments." body="We plan, install, renovate, and maintain critical electrical and HVAC systems with respect for the people living and working around the construction."/><div className="relative mt-14 aspect-[16/7] overflow-hidden"><Image src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1800&q=80" alt="Construction team" fill className="object-cover" priority/></div></div></section>
    <section className="bg-black py-24 text-white"><div className="container-site grid gap-12 md:grid-cols-12"><div className="md:col-span-7"><h2 className="display-md">A mission-driven contractor delivering disciplined execution.</h2></div><div className="space-y-7 text-lg text-white/65 md:col-span-5 md:pt-16"><p>Our team combines field experience, preconstruction discipline, safety planning, and modern project controls to support complicated scopes inside active buildings.</p><p>We focus on the details owners feel most: predictable communication, thoughtful shutdown planning, clean handoffs, and systems that perform as intended.</p></div></div></section>
    <section className="py-24"><div className="container-site"><p className="eyebrow">Our people and capabilities</p><div className="mt-7 grid gap-3 md:grid-cols-4">{[1,2,3,4].map((n)=><div key={n} className="relative aspect-[4/5] overflow-hidden bg-black/10"><Image src={`https://images.unsplash.com/photo-${["1531835551805-16d864c8d311","1521737604893-d14cc237f11d","1516321318423-f06f85e504b3","1551836022-d5d88e9218df"][n-1]}?auto=format&fit=crop&w=900&q=80`} alt="Team capability" fill className="object-cover grayscale"/></div>)}</div><p className="mt-8 max-w-2xl text-lg text-black/60">Our capabilities include estimating, scheduling, field supervision, controls coordination, equipment planning, commissioning support, service, and project closeout.</p></div></section>
    <section className="bg-[var(--sand)] py-24"><div className="container-site grid gap-10 md:grid-cols-12"><h2 className="display-md md:col-span-8">To build systems and spaces so working and living feel better.</h2><div className="md:col-span-4 md:pt-20"><p className="eyebrow">Mission</p><p className="mt-4 text-xl">Elevate what clients expect from building-system contractors through strong planning, good people, and reliable delivery.</p><p className="eyebrow mt-10">Vision</p><p className="mt-4 text-xl">Make high-quality project experiences the standard, not the exception.</p></div></div></section>
    <section className="py-24"><div className="container-site"><SectionIntro title="Recent and representative work." actions={false}/><PortfolioGrid limit={6}/></div></section>
    <Values/><FAQ/><CTA/>
  </>;
}
