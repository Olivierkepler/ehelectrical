import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import SectionIntro from "@/components/SectionIntro";
import PortfolioGrid from "@/components/PortfolioGrid";

export default function PortfolioSection() {
  return (
    <section
      className="
        relative
        overflow-hidden
        bg-[#071f2d]
        py-24
        text-white
        md:py-28
        lg:py-40
      "
    >
      {/* Subtle background atmosphere */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_80%_15%,rgba(255,255,255,0.06),transparent_28%)]
        "
      />

      {/* Vertical guide */}
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
        {/* Intro */}
        <div className="mb-16 md:mb-20 lg:mb-24">
          <SectionIntro
            dark
            eyebrow="Selected work"
            title="A portfolio built on purpose, precision, and people."
            body="A sample of the kinds of environments and scopes our team is prepared to coordinate and deliver."
          />
        </div>

        {/* Projects */}
        <PortfolioGrid limit={6} />

        {/* Footer CTA */}
        {/* <div
          className="
            mt-14
            flex
            flex-col
            gap-6
            border-t
            border-white/15
            pt-7
            sm:flex-row
            sm:items-center
            sm:justify-between
            md:mt-20
          "
        >
          <p
            className="
              text-[10px]
              font-medium
              uppercase
              tracking-[0.18em]
              text-white/40
            "
          >
            Explore selected projects
          </p>

          <Link
            href="/portfolio"
            className="
              group
              inline-flex
              w-fit
              items-center
              gap-4
              text-[12px]
              font-medium
              uppercase
              tracking-[0.15em]
              text-white
              transition-colors
              duration-300
              hover:text-orange-500
            "
          >
            View full portfolio

            <span
              className="
                grid
                h-11
                w-11
                place-items-center
                border
                border-white/20
                transition-all
                duration-300
                ease-[cubic-bezier(.22,1,.36,1)]
                group-hover:border-orange-500
                group-hover:bg-orange-500
                group-hover:text-white
              "
            >
              <ArrowUpRight
                size={16}
                className="
                  transition-transform
                  duration-300
                  ease-[cubic-bezier(.22,1,.36,1)]
                  group-hover:translate-x-0.5
                  group-hover:-translate-y-0.5
                "
              />
            </span>
          </Link>
        </div> */}
      </div>
    </section>
  );
}