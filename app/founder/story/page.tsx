import Image from "next/image";

import StatsBand from "@/components/StatsBand";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";

const timeline = [
  {
    year: "Early Years",
    title: "Learning the Trade",
    body: "The foundation was built in the field—learning from experienced tradespeople, understanding how systems work, and discovering that dependable service begins with discipline, attention to detail, and pride in the work.",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
  },
  {
    year: "Growth",
    title: "Building Under Pressure",
    body: "As projects became more complex, so did the responsibility. Planning, communication, and accountability became essential. Every shutdown, delivery, and decision mattered because great work depends on everyone being able to rely on the person beside them.",
    image:
      "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1200&q=80",
  },
  {
    year: "Today",
    title: "A Company Built Around Service",
    body: "Today, EH Electric & HVAC continues to grow around a simple principle: exceptional technical work should come with an equally dependable experience. From the first conversation to the final walkthrough, clients should always know they're in capable hands.",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function FounderStoryPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-24">
        <div className="container-site">
          <p className="eyebrow">Founder&apos;s Story</p>

          <h1 className="text-2xl md:text-3xl font-semibold mt-5 max-w-3xl">
            Built one decision, one relationship, and one project at a time.
          </h1>
     
        </div>
      </section>

      {/* Timeline */}
      <section className="pb-24">
        <div className="container-site">
          {timeline.map((item, index) => (
            <article
              key={item.title}
              className="grid gap-8 border-t border-black/20 py-12 md:grid-cols-12"
            >
              <div className="md:col-span-2">
                <p className="text-2xl font-medium">{item.year}</p>
              </div>

              <div
                className={`md:col-span-5 ${
                  index % 2 ? "md:order-3" : ""
                }`}
              >
                <h2 className="heading">{item.title}</h2>

                <p className="mt-6 max-w-xl text-lg leading-relaxed text-black/60">
                  {item.body}
                </p>
              </div>

              <div
                className={`relative aspect-[4/3] overflow-hidden md:col-span-5 ${
                  index % 2 ? "md:order-2" : ""
                }`}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(min-width: 768px) 42vw, 100vw"
                  className="object-cover"
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <StatsBand />
      <FAQ />
      <CTA />
    </>
  );
}