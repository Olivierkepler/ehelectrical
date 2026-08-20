import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { projectFlows } from "@/lib/site-data";

const flowColors = [
  "#1F2021", // 01 — charcoal
  "#26383D", // 02 — deep steel blue
  "#455653", // 03 — architectural green-gray
  "#C65D32", // 04 — burnt orange
];

export default function ProjectFlow() {
  return (
    <section className="relative bg-[rgb(31,32,33)] text-white">
      {/* Intro */}
      <div className="container-site px-4 pb-16 pt-24 md:pb-24 md:pt-32 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.18em] text-orange-500">
              Project lifecycle
            </p>

            <h2
              className="
                max-w-[1000px]
                text-[clamp(2.8rem,6vw,6.5rem)]
                font-medium
                leading-[0.92]
                tracking-[-0.055em]
              "
            >
              What we do & how projects{" "}
              <span className="text-orange-500">
                flow.
              </span>
            </h2>
          </div>

          <div className="hidden lg:col-span-4 lg:block">
            <p className="ml-auto max-w-[280px] text-[14px] leading-[1.7] text-white/50">
              From improving existing environments to restoring what matters,
              each scope is approached with clarity, coordination, and respect
              for the building around it.
            </p>
          </div>
        </div>
      </div>

      {/* Sticky stacked cards */}
      <div className="relative">
        {projectFlows.map((item, index) => {
          const number = String(index + 1).padStart(2, "0");
          const total = String(projectFlows.length).padStart(2, "0");

          return (
            <article
              key={item.title}
              style={{
                top: `calc(76px + ${index * 24}px)`,
                zIndex: 10 + index,
                backgroundColor:
                  flowColors[index % flowColors.length],
              }}
              className="
                sticky
                min-h-[88vh]
                border-t
                border-white/15
                shadow-[0_-20px_60px_rgba(0,0,0,0.18)]
              "
            >
              <div
                className="
                  container-site
                  grid
                  min-h-[72vh]
                  gap-10
                  px-4
                  py-10
                  md:grid-cols-12
                  md:gap-8
                  md:py-12
                  lg:px-10
                "
              >
                {/* Number */}
                <div className="md:col-span-1">
                  <span
                    className="
                      text-[11px]
                      font-medium
                      uppercase
                      tracking-[0.18em]
                      text-orange-400
                    "
                  >
                    {number}
                  </span>
                </div>

                {/* Title */}
                <div className="md:col-span-4">
                  <div className="flex h-full flex-col justify-between">
                    <div>
                      <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.18em] text-white/35">
                        Project type
                      </p>

                      <h3
                        className="
                          max-w-[420px]
                          text-[clamp(2.7rem,4vw,5rem)]
                          font-medium
                          leading-[0.95]
                          tracking-[-0.05em]
                        "
                      >
                        {item.title}
                      </h3>
                    </div>

                    <div className="mt-12 hidden items-center gap-3 md:flex">
                      <span className="h-2 w-2 rounded-full bg-orange-400" />

                      <span className="text-[10px] uppercase tracking-[0.16em] text-white/35">
                        EH Electric & HVAC
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="md:col-span-3">
                  <div className="flex h-full flex-col justify-between">
                    <div className="space-y-10">
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/35">
                          What it means
                        </p>

                        <p className="mt-4 text-[16px] leading-[1.7] text-white/75">
                          {item.meaning}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/35">
                          Why it matters
                        </p>

                        <p className="mt-4 text-[16px] leading-[1.7] text-white/75">
                          {item.why}
                        </p>
                      </div>
                    </div>

                    <div className="mt-10 hidden md:block">
                      <div
                        className="
                          inline-flex
                          h-12
                          w-12
                          items-center
                          justify-center
                          border
                          border-white/20
                          text-white/60
                          transition-all
                          duration-300
                          hover:border-white/40
                          hover:bg-white
                          hover:text-black
                        "
                      >
                        <ArrowUpRight size={17} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image */}
                <div
                  className="
                    group
                    relative
                    min-h-[320px]
                    overflow-hidden
                    md:col-span-4
                    md:min-h-0
                  "
                >
                  <Image
                    src={item.image}
                    alt={`${item.title} construction project`}
                    fill
                    sizes="(max-width: 768px) 100vw, 34vw"
                    className="
                      object-cover
                      grayscale
                      transition-all
                      duration-[1200ms]
                      ease-[cubic-bezier(.22,1,.36,1)]
                      group-hover:scale-[1.035]
                      group-hover:grayscale-0
                      cursor-pointer
                    "
                  />

                  {/* Image overlay */}
                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-black/35
                      via-transparent
                      to-transparent
                    "
                  />

                  {/* Image number */}
                  <span
                    className="
                      absolute
                      bottom-5
                      right-5
                      text-[11px]
                      font-medium
                      tracking-[0.18em]
                      text-white/70
                    "
                  >
                    {number} / {total}
                  </span>
                </div>
              </div>
            </article>
          );
        })}

        {/* Space for final sticky card */}
        <div className="h-[15vh]" />
      </div>
    </section>
  );
}