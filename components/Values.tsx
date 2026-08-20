import { values } from "@/lib/site-data";

export default function Values() {
  return <section className="bg-[var(--accent)] py-24"><div className="container-site"><p className="eyebrow">Our values, your peace of mind</p><h2 className="display-md mt-6 max-w-5xl">Built on discipline. Driven by integrity.</h2><div className="mt-16">{values.map(([title, body], i) => <div key={title} className="grid border-t border-black/25 py-7 md:grid-cols-12"><div className="md:col-span-1">0{i+1}</div><h3 className="text-3xl font-medium md:col-span-3">{title}</h3><p className="mt-3 max-w-2xl text-black/65 md:col-span-7 md:mt-0">{body}</p></div>)}</div></div></section>;
}
