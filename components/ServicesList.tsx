import { services } from "@/lib/site-data";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function ServicesList({ limit }: { limit?: number }) {
  return <div className="mt-16">{services.slice(0, limit ?? services.length).map((item) => (
    <div key={item.number} className="group grid gap-5 border-t border-black/20 py-8 md:grid-cols-12 md:items-start">
      <div className="text-sm md:col-span-2">{item.number}</div>
      <h3 className="text-2xl font-medium tracking-tight md:col-span-4 md:text-2xl">{item.title}</h3>
      <p className="max-w-xl leading-relaxed text-black/60 md:col-span-5">{item.description}</p>
<Link href={`/services`} className="text-sm text-orange-500 hover:text-orange-600">
<ArrowUpRight className="transition group-hover:translate-x-1 group-hover:-translate-y-1 md:justify-self-end"/>
</Link>
    </div>
  ))}</div>;
}
