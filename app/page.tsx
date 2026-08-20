import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import SectionIntro from "@/components/SectionIntro";
import ServicesList from "@/components/ServicesList";
import ProjectFlow from "@/components/ProjectFlow";
import StatsBand from "@/components/StatsBand";
import PortfolioGrid from "@/components/PortfolioGrid";
import Values from "@/components/Values";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import ButtonLink from "@/components/ButtonLink";
import ButtonLinkDark from "@/components/ButtonLinkDark";
import PortfolioSection from "@/components/home/PortfolioSection";
import MissionVisionSection from "@/components/home/MissionVisionSection";

import HeroImageGrid, {
  type HeroSlide,
} from "@/components/home/HeroImageGrid";

import OurWaySection from "@/components/home/OurWaySection";
import ServicesSection from "@/components/home/ServicesSection";

const heroSlides: readonly HeroSlide[] = [
  {
    src: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1800&q=90",
    title: "Built for performance. Designed for everyday life.",
    category: "Electrical Infrastructure",
    location: "Boston, MA",
    alt: "Modern electrical infrastructure project",
  },
  {
    src: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1800&q=90",
    title: "Building systems engineered around the people inside.",
    category: "Mechanical Systems",
    location: "Cambridge, MA",
    alt: "Commercial mechanical and HVAC project",
  },
  {
    src: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1800&q=90",
    title: "Complex infrastructure. Clear execution.",
    category: "Commercial",
    location: "Massachusetts",
    alt: "Commercial construction infrastructure",
  },
  {
    src: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1800&q=90",
    title: "Spaces that work as beautifully as they look.",
    category: "Modernization",
    location: "New England",
    alt: "Modern commercial building project",
  },
  {
    src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=90",
    title: "Where thoughtful planning meets lasting performance.",
    category: "Commercial Interiors",
    location: "Boston, MA",
    alt: "Modern commercial interior project",
  },
];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#E7EDF0] pb-6 pt-12 md:pt-16 lg:pt-20">
        <div className="container-site lg:px-10">
          {/* Main statement */}
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8 xl:col-span-9">
              <h1
                className="
                  max-w-[800px]
                  text-[clamp(2rem,3.2vw,3.5rem)]
                  font-medium
                  leading-[1.05]
                  tracking-[-0.045em]
                  text-[rgb(31,32,33)]
                "
              >
                We build so working
                <br className="hidden md:block" /> and living feel{" "}
                <span
                  className="
                    relative
                    inline-block
                    font-normal
                    italic
                    tracking-[-0.045em]
                    text-orange-500
                  "
                  style={{
                    fontFamily: 'cambon, "cambon Fallback"',
                  }}
                >
                  better.

                  <span
                    aria-hidden="true"
                    className="
                      absolute
                      -bottom-1
                      left-[3%]
                      h-[3px]
                      w-[94%]
                      origin-left
                      rotate-[-1deg]
                      bg-orange-500/80
                      md:-bottom-2
                    "
                  />
                </span>
              </h1>
            </div>

            {/* Descriptor */}
            <div className="hidden lg:col-span-4 lg:block xl:col-span-3">
              <p className="max-w-[270px] text-[13px] leading-[1.65] text-black/45">
                Electrical and mechanical systems delivered with precision,
                accountability, and respect for the people who depend on them.
              </p>
            </div>
          </div>

          {/* Supporting copy + actions */}
          <div
            className="
              mt-12
              flex
              flex-col
              gap-8
              border-t
              border-black/15
              pt-6
              md:mt-16
              md:flex-row
              md:items-end
              md:justify-between
              lg:mt-20
            "
          >
            <div className="flex gap-5">
              <span
                className="
                  mt-[7px]
                  hidden
                  h-10
                  w-px
                  bg-orange-500
                  sm:block
                "
              />

              <p
                className="
                  max-w-[520px]
                  text-[20px]
                  font-normal
                  leading-[1.35]
                  tracking-[-0.025em]
                  text-black/65
                  md:text-[23px]
                "
              >
                Modern building systems.
                <br />
                Human service.{" "}
                <span className="text-black">
                  Lasting results.
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <ButtonLinkDark href="/contact">
                Become a client
              </ButtonLinkDark>

              <ButtonLink href="/contact/consultation">
                Request a consultation
              </ButtonLink>
            </div>
          </div>
        </div>

        <HeroImageGrid
          slides={heroSlides}
          autoplay
          interval={6500}
        />
      </section>

     

      {/* OUR WAY */}
      <OurWaySection />
      <ServicesSection />
    

      <ProjectFlow />

      <StatsBand />

      {/* PORTFOLIO */}
    {/* PORTFOLIO */}
<PortfolioSection />

      <Values />

      {/* MISSION / VISION */}
      {/* <MissionVisionSection /> */}

      <FAQ />

      <CTA />
    </>
  );
}