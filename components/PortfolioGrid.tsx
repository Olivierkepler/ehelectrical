import Image from "next/image";
import { projects } from "@/lib/site-data";

export default function PortfolioGrid({ limit }: { limit?: number }) {
  return <div className="mt-14 grid gap-x-4 gap-y-10 md:grid-cols-2 lg:grid-cols-3">{projects.slice(0, limit ?? projects.length).map((p, i) => (
    <article key={p.title} className={i % 5 === 0 ? "md:col-span-2 lg:col-span-2" : ""}>
      <div className="relative aspect-[4/3] overflow-hidden bg-black/10"><Image src={p.image} alt={p.title} fill className="object-cover transition duration-700 hover:scale-[1.025]" sizes="(max-width:768px) 100vw, 50vw" /></div>
      <p className="mt-4 text-xs uppercase tracking-[.08em] text-white/50">{p.meta}</p>
      <h3 className="mt-2 text-2xl font-medium tracking-tight">{p.title}</h3>
    </article>
  ))}</div>;
}
