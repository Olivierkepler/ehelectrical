import Image from "next/image";
import StatsBand from "@/components/StatsBand";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";

const timeline = [
  { year: "Early years", title: "Learning the trade", body: "The foundation was built in the field: listening to experienced tradespeople, understanding systems, and learning that dependable work starts with disciplined habits.", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80" },
  { year: "Growth", title: "Building under pressure", body: "Complex projects sharpened the importance of planning, communication, and accountability. Details mattered because every shutdown, delivery, and decision affected someone else's work.", image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1200&q=80" },
  { year: "Today", title: "A company centered on service", body: "EH Electric & HVAC continues to grow around a simple idea: clients should get strong technical work and a project experience they can trust at the same time.", image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80" },
];

export default function FounderStoryPage(){return <><section className="py-24"><div className="container-site"><p className="eyebrow">Founder&apos;s story</p><h1 className="display mt-5 max-w-6xl">Built one decision, one relationship, and one project at a time.</h1></div></section><section className="pb-24"><div className="container-site">{timeline.map((item,i)=><article key={item.title} className="grid gap-8 border-t border-black/20 py-12 md:grid-cols-12"><div className="md:col-span-2"><p className="text-2xl font-medium">{item.year}</p></div><div className={`md:col-span-5 ${i%2 ? "md:order-3" : ""}`}><h2 className="heading">{item.title}</h2><p className="mt-6 max-w-xl text-lg leading-relaxed text-black/60">{item.body}</p></div><div className={`relative aspect-[4/3] overflow-hidden md:col-span-5 ${i%2 ? "md:order-2" : ""}`}><Image src={item.image} alt={item.title} fill className="object-cover"/></div></article>)}</div></section><StatsBand/><FAQ/><CTA/></>}
