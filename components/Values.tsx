"use client";

import { values } from "@/lib/site-data";
import { ArrowUpRight } from "lucide-react";

export default function Values() {
  return (
    <section
      className="
        relative
        overflow-hidden
       bg-[#26383D]
        py-24
        text-white
        md:py-28
        lg:py-32
      "
    >
      {/* Subtle background atmosphere */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_80%_10%,rgba(249,115,22,0.10),transparent_26%)]
        "
      />

      {/* Architectural guide */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-0
          hidden
          h-full
          w-px
          -translate-x-1/2
          bg-white/[0.05]
          xl:block
        "
      />

      <div className="container-site relative z-10 lg:px-10">
        <div
          className="
            grid
            gap-14
            lg:grid-cols-12
            lg:gap-16
          "
        >
          {/* Sticky intro */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              {/* <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-orange-500" />

                <p
                  className="
                    text-[10px]
                    font-medium
                    uppercase
                    tracking-[0.2em]
                    text-white/40
                  "
                >
                  Our values, your peace of mind
                </p>
              </div> */}

              <h2
                className="
                  mt-8
                  max-w-[650px]
                  text-[clamp(2.2rem,4vw,4rem)]
             
                  font-medium
                  leading-[0.93]
                  tracking-[-0.055em]
                "
              >
                Built on discipline.
                <br />
                Driven by{" "}
                <span className="text-orange-500">
                  integrity.
                </span>
              </h2>

              <p
                className="
                  mt-8
                  max-w-[420px]
                  text-[16px]
                  leading-[1.75]
                  text-white/50
                  md:text-[17px]
                "
              >
                The way we work matters as much as the finished result.
                These principles guide how we plan, communicate, and deliver.
              </p>

              <div className="mt-12 hidden max-w-[320px] items-center gap-4 lg:flex">
                <span className="h-px flex-1 bg-white/15" />

                <span
                  className="
                    text-[9px]
                    font-medium
                    uppercase
                    tracking-[0.18em]
                    text-white/25
                  "
                >
                  EH Standards
                </span>
              </div>
            </div>
          </div>

          {/* Values */}
          <div className="lg:col-span-7">
            <div className="border-b border-white/15">
              {values.map(([title, body], index) => (
                <article
                  key={title}
                  className="
                    group
                    relative
                    overflow-hidden
                    border-t
                    border-white/15
                    py-8
                    transition-all
                    duration-500
                    ease-[cubic-bezier(.22,1,.36,1)]
                    md:py-10
                    cursor-pointer
                  "
                >
                  {/* Hover background */}
                  <div
                    aria-hidden="true"
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      translate-y-full
                      bg-white/50
                      transition-transform
                      duration-500
                      ease-[cubic-bezier(.22,1,.36,1)]
                      group-hover:translate-y-0
                    "
                  />

                  {/* Orange top line */}
                  <span
                    aria-hidden="true"
                    className="
                      absolute
                      left-0
                      top-0
                      z-20
                      h-[2px]
                      w-0
                      bg-orange-500
                      transition-all
                      duration-500
                      group-hover:w-full
                    "
                  />

                  <div
                    className="
                      relative
                      z-10
                      grid
                      gap-6
                      md:grid-cols-[70px_1fr_48px]
                      md:items-start
                    "
                  >
                    {/* Number */}
                    <span
                      className="
                        text-[11px]
                        font-medium
                        tracking-[0.18em]
                        text-orange-500
                      "
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {/* Content */}
                    <div>
                      <h3
                        className="
                          text-[30px]
                          font-medium
                          leading-[1.05]
                          tracking-[-0.04em]
                          text-white
                          transition-colors
                          duration-300
                          group-hover:text-[rgb(31,32,33)]
                          md:text-[36px]
                        "
                      >
                        {title}
                      </h3>

                      <p
                        className="
                          mt-5
                          max-w-[620px]
                          text-[15px]
                          leading-[1.75]
                          text-white/55
                          transition-colors
                          duration-300
                          group-hover:text-black/60
                          md:text-[16px]
                        "
                      >
                        {body}
                      </p>
                    </div>

                    {/* Icon */}
                    {/* <div
                      className="
                        hidden
                        h-11
                        w-11
                        place-items-center
                        border
                        border-white/15
                        text-white/50
                        transition-all
                        duration-300
                        group-hover:border-orange-500
                        group-hover:bg-orange-500
                        group-hover:text-white
                        md:grid
                      "
                    >
                      <ArrowUpRight
                        size={16}
                        className="
                          transition-transform
                          duration-300
                          group-hover:translate-x-0.5
                          group-hover:-translate-y-0.5
                        "
                      />
                    </div> */}
                  </div>

                  {/* Large background index */}
                  <span
                    aria-hidden="true"
                    className="
                      pointer-events-none
                      absolute
                      right-0
                      top-1/2
                      -translate-y-1/2
                      text-[110px]
                      font-medium
                      leading-none
                      tracking-[-0.08em]
                      text-white/[0.025]
                      transition-all
                      duration-500
                     
                      group-hover:-translate-x-4
                      group-hover:text-black/[0.035]
                    "
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </article>
              ))}
            </div>

            {/* Footer line */}
            <div
              className="
                mt-8
                flex
                items-center
                justify-between
                gap-6
              "
            >
              <p
                className="
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[0.18em]
                  text-white/25
                "
              >
                {String(values.length).padStart(2, "0")} core values
              </p>

              <div className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />

                <span
                  className="
                    text-[9px]
                    font-medium
                    uppercase
                    tracking-[0.18em]
                    text-white/25
                  "
                >
                  Built into every project
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}