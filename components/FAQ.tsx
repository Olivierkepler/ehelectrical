"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

import { faqs } from "@/lib/site-data";

export default function FAQ() {
  const [active, setActive] = useState<number | null>(0);

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-[#071F2D]
        py-24
        text-white
        md:py-28
        lg:py-32
      "
    >
      {/* Subtle vertical guide */}
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

      {/* Soft atmosphere */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_12%_20%,rgba(249,115,22,0.08),transparent_26%)]
        "
      />

      <div
        className="
          container-site
          relative
          z-10
          grid
          gap-16
          md:grid-cols-12
          md:gap-10
          lg:px-10
        "
      >
        {/* Left column */}
        <div className="md:col-span-4">
          <div className="md:sticky md:top-32">
            <p
              className="
                text-[10px]
                font-medium
                uppercase
                tracking-[0.2em]
                text-orange-500
              "
            >
              FAQ
            </p>

            <h2
              className="
                mt-7
                max-w-[420px]
                text-[clamp(2.2rem,4vw,3.8rem)]
                font-medium
                leading-[0.96]
                tracking-[-0.05em]
                text-white
              "
            >
              Frequently asked{" "}
              <span className="text-orange-500">
                questions.
              </span>
            </h2>

            <p
              className="
                mt-7
                max-w-[330px]
                text-[15px]
                leading-[1.75]
                text-white/55
              "
            >
              A few answers about our process, project approach,
              communication, and what it&apos;s like to work with our team.
            </p>

            <div className="mt-10 hidden max-w-[260px] items-center gap-3 md:flex">
              <span className="h-px flex-1 bg-white/15" />

              <span
                className="
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[0.18em]
                  text-white/30
                "
              >
                EH
              </span>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="md:col-span-8">
          <div className="border-b border-white/15">
            {faqs.map((item, index) => {
              const open = active === index;

              return (
                <div
                  key={item.question}
                  className="
                    group
                    relative
                    border-t
                    border-white/15
                  "
                >
                  {/* Active orange line */}
                  <span
                    aria-hidden="true"
                    className={`
                      absolute
                      left-0
                      top-0
                      h-[2px]
                      bg-orange-500
                      transition-all
                      duration-500
                      ease-[cubic-bezier(.22,1,.36,1)]
                      ${
                        open
                          ? "w-full"
                          : "w-0 group-hover:w-16"
                      }
                    `}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setActive(open ? null : index)
                    }
                    aria-expanded={open}
                    className="
                      w-full
                      cursor-pointer
                      py-7
                      text-left
                      md:py-8
                    "
                  >
                    <div
                      className="
                        grid
                        grid-cols-[36px_1fr_auto]
                        items-start
                        gap-3
                        md:grid-cols-[50px_1fr_auto]
                        md:gap-5
                      "
                    >
                      {/* Number */}
                      <span
                        className={`
                          pt-1
                          text-[10px]
                          font-medium
                          tracking-[0.16em]
                          transition-colors
                          duration-300
                          ${
                            open
                              ? "text-orange-500"
                              : "text-white/30"
                          }
                        `}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      {/* Question */}
                      <span
                        className={`
                          max-w-[680px]
                          text-[18px]
                          font-medium
                          leading-[1.25]
                          tracking-[-0.025em]
                          transition-colors
                          duration-300
                          md:text-[18px]
                          ${
                            open
                              ? "text-white"
                              : "text-white/75 group-hover:text-white"
                          }
                        `}
                      >
                        {item.question}
                      </span>

                      {/* Icon */}
                      <span
                        className={`
                          grid
                          h-10
                          w-10
                          shrink-0
                          place-items-center
                          border
                          transition-all
                          duration-300
                          md:h-11
                          md:w-11

                          ${
                            open
                              ? "border-orange-500 bg-orange-500 text-white"
                              : "border-white/20 text-white/60 group-hover:border-white group-hover:bg-white group-hover:text-[#071F2D]"
                          }
                        `}
                      >
                        {open ? (
                          <Minus size={17} />
                        ) : (
                          <Plus size={17} />
                        )}
                      </span>
                    </div>
                  </button>

                  {/* Animated answer */}
                  <div
                    className={`
                      grid
                      transition-[grid-template-rows,opacity]
                      duration-500
                      ease-[cubic-bezier(.22,1,.36,1)]
                      ${
                        open
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }
                    `}
                  >
                    <div className="overflow-hidden">
                      <div
                        className="
                          grid
                          grid-cols-[36px_1fr]
                          gap-3
                          pb-8
                          md:grid-cols-[50px_1fr]
                          md:gap-5
                          md:pb-10
                        "
                      >
                        <div />

                        <p
                          className="
                            max-w-[650px]
                            text-[15px]
                            leading-[1.8]
                            text-white/55
                            md:text-[16px]
                          "
                        >
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom note */}
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
                text-white/30
              "
            >
              {String(faqs.length).padStart(2, "0")} questions
            </p>

            <div className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />

              <span
                className="
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[0.18em]
                  text-white/30
                "
              >
                Clear answers. No guesswork.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}