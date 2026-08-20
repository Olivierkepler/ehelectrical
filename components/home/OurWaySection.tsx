"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";

import SectionIntro from "@/components/SectionIntro";
import { approach } from "@/lib/site-data";

export default function OurWaySection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const [visible, setVisible] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  /*
   * Reveal section once it enters the viewport.
   */
  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -80px 0px",
      },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  /*
   * Enable / disable carousel controls based on scroll position.
   */
  const updateScrollButtons = () => {
    const slider = sliderRef.current;

    if (!slider) return;

    const { scrollLeft, scrollWidth, clientWidth } = slider;

    setCanScrollLeft(scrollLeft > 8);

    setCanScrollRight(
      scrollLeft + clientWidth < scrollWidth - 8,
    );
  };

  useEffect(() => {
    const slider = sliderRef.current;

    if (!slider) return;

    updateScrollButtons();

    slider.addEventListener(
      "scroll",
      updateScrollButtons,
      {
        passive: true,
      },
    );

    window.addEventListener(
      "resize",
      updateScrollButtons,
    );

    return () => {
      slider.removeEventListener(
        "scroll",
        updateScrollButtons,
      );

      window.removeEventListener(
        "resize",
        updateScrollButtons,
      );
    };
  }, []);

  /*
   * Scroll exactly one card at a time.
   */
  const scrollCards = (
    direction: "left" | "right",
  ) => {
    const slider = sliderRef.current;

    if (!slider) return;

    const card =
      slider.querySelector<HTMLElement>(
        "[data-approach-card]",
      );

    const cardWidth = card?.offsetWidth ?? 380;
    const gap = 16;

    slider.scrollBy({
      left:
        direction === "right"
          ? cardWidth + gap
          : -(cardWidth + gap),

      behavior: "smooth",
    });
  };

  return (
    <section
      ref={sectionRef}
      className="
        relative
        overflow-hidden
        bg-[linear-gradient(to_bottom,#E7EDF0_0%,#EEF3F5_32%,#F7F9FA_68%,#FFFFFF_100%)]
        py-24
        md:py-32
        lg:py-10
      "
    >
      {/* Background guide */}
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
          bg-black/[0.04]
          xl:block
        "
      />

      {/* =============================== */}
      {/* INTRO */}
      {/* =============================== */}

      <div className="container-site relative lg:px-10 lg:py-20">
        <div
          className={`
            grid
            gap-12
            transition-all
            duration-1000
            ease-[cubic-bezier(.22,1,.36,1)]
            lg:grid-cols-12
            lg:items-end

            ${
              visible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }
          `}
        >
          <div className="lg:col-span-8">
            <SectionIntro
              eyebrow="Our way"
              title="How clients experience us."
              body=""
            />
          </div>

          <div className="hidden lg:col-span-4 lg:block">
            <div className="ml-auto max-w-[260px] border-t border-black/20 pt-5">
              <p
                className="
                  text-[11px]
                  font-medium
                  uppercase
                  tracking-[0.16em]
                  text-black/40
                "
              >
                Built around clarity
              </p>

              <p className="mt-4 text-[15px] leading-[1.65] text-black/55">
                Clear communication, accountable
                execution, and a process that keeps
                every stakeholder informed.
              </p>
            </div>
          </div>
        </div>

       
      </div>

      {/* =============================== */}
      {/* CAROUSEL */}
      {/* =============================== */}

      <div className="mt-8 container-site relative lg:px-10 ">
        <div
          ref={sliderRef}
          className="
            mx-auto
            
            flex
            w-full
            max-w-[1380px]
            snap-x
            snap-mandatory
            gap-4
            overflow-x-auto
            scroll-smooth
            px-4
            pb-16
            pt-2
            md:px-6
            lg:px-10
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {approach.map((item, index) => (
            <article
              key={item.title}
              data-approach-card
              style={{
                transitionDelay: visible
                  ? `${220 + index * 100}ms`
                  : "0ms",
              }}
              className={`
                group
                relative
                min-h-[430px]
                
                w-[84vw]
                shrink-0
                snap-start
                overflow-hidden
               my-0 lg:my-10
                bg-white/85
                hover:bg-[#c4f5f0]
                
                cursor-pointer
                shadow-[0_14px_50px_rgba(20,24,28,0.05)]
                backdrop-blur-sm
                transition-all
                duration-1000
                ease-[cubic-bezier(.22,1,.36,1)]

                hover:-translate-y-2
               
                hover:shadow-[0_28px_80px_rgba(20,24,28,0.13)]

                sm:w-[420px]
                md:w-[400px]
                lg:w-[390px]
                lg:p-8
                xl:w-[410px]

                ${
                  visible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-16 opacity-0"
                }
              `}
            >
              {/* =============================== */}
              {/* HOVER IMAGE */}
              {/* =============================== */}
              <span
                  className="
                    absolute
                    left-4
                    top-4
                    text-[11px]
                    font-medium
                    uppercase
                    tracking-[0.16em]
                    text-black/35
                    transition-colors
                    duration-500
                    group-hover:text-black/60
                  "
                  style={{ zIndex: 20 }}
                >
                  {String(index + 1).padStart(2, "0")} / {String(approach.length).padStart(2, "0")}
                </span>

 {/* =============================== */}
              {/* LARGE NUMBER */}
              {/* =============================== */}

              <span
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  right-4
                  top-0
                  z-[1]
                  text-[150px]
                  font-medium
                  leading-none
                  tracking-[-0.08em]
                  text-black/[0.025]
                  transition-all
                  duration-500
                  group-hover:translate-y-2
                  group-hover:opacity-0
                "
              >
                {String(index + 1).padStart(
                  2,
                  "0",
                )}
              </span>

              <div
  className={`
    inset-0
    z-10

    opacity-100

    transition-opacity
    duration-500
    pointer-events-none
    py-4

    md:opacity-0
    md:group-hover:opacity-100
  `}
>
  <Image
    src={item.image}
    alt=""
    width={1000}
    height={1000}
  />
</div>
        

              {/* Orange top reveal */}
              {/* <span
                aria-hidden="true"
                className="
                  absolute
                  left-0
                  top-0
                  z-20
                  h-[3px]
                  w-0
                  bg-orange-500
                  transition-all
                  duration-500
                  ease-out
                  group-hover:w-full
                "
              /> */}

             

              {/* =============================== */}
              {/* TOP BAR */}
              {/* =============================== */}

              <div
                className="
                  relative
                  z-10
                  flex
                  items-center
                  justify-between
               
                "
              >
               
           

                {/* <span
                  className="
                    grid
                    h-11
                    w-11
                    place-items-center
                    border
                    border-black/10
                    text-black/45
                    backdrop-blur-sm
                    transition-all
                    duration-300

                    group-hover:border-white/35
                    group-hover:bg-orange-500
                    group-hover:text-white
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
                </span> */}
              </div>

              {/* =============================== */}
              {/* CONTENT */}
              {/* =============================== */}

              <div className="relative z-10 ">
                <p
                  className="
                    mb-4
                    text-[10px]
                    font-medium
                    uppercase
                    tracking-[0.16em]
                    text-orange-500
                    px-4 
                  "
                >
                  Step{" "}
                  {String(index + 1).padStart(
                    2,
                    "0",
                  )}
                </p>

                <h3
                  className="
                    max-w-[320px]
                    text-[30px]
                    font-medium
                    leading-[1.08]
                    tracking-[-0.035em]
                    text-[rgb(31,32,33)]
                    transition-colors
                    duration-500
                    group-hover:text-black
                    lg:text-[34px]
                    px-4 
                  "
                >
                  {item.title}
                </h3>

                <p
                  className="
                    mt-5
                    max-w-[320px]
                    text-[15px]
                    leading-[1.7]
                    text-black/55
                    transition-colors
                    duration-500
                    group-hover:text-black/75
                    px-4 
                  "
                >
                  {item.body}
                </p>
              </div>

              {/* =============================== */}
              {/* BOTTOM MARKER */}
              {/* =============================== */}

              <div
                className="
                  absolute
                  bottom-7
                  left-7
                  right-7
                  z-10
                  flex
                  items-center
                  gap-3
                  lg:left-8
                  lg:right-8
                  px-4 
                  lg:block
                  hidden
                "
              >
                <span
                  className="
                    h-px
                    flex-1
                    bg-black/10
                    transition-colors
                    duration-500
                    group-hover:bg-white/30
                  "
                />

                <span
                  className="
                    text-[9px]
                    font-medium
                    uppercase
                    tracking-[0.16em]
                    text-black/30
                    transition-colors
                    duration-500
                    group-hover:text-white/50
                  
                   
                  "
                >
                  EH Process
                </span>
              </div>



              {/* Mobile only: displays on small screens */}
              <div
                className="
              my-4
                  flex
                  items-center
                  gap-3
                  px-4 
                  lg:hidden
                "
              >
                <span
                  className="
                    h-px
                    flex-1
                    bg-black/10
                    transition-colors
                    duration-500
                    group-hover:bg-white/30
                  "
                />

                <span
                  className="
                    text-[9px]
                    font-medium
                    uppercase
                    tracking-[0.16em]
                    text-black/30
                    transition-colors
                    duration-500
                    group-hover:text-white/50
                  "
                >
                  EH Process
                </span>
              </div>
        
            </article>
          ))}
        </div>
      </div>

      {/* =============================== */}
      {/* END CAROUSEL */}
      {/* =============================== */}

       {/* =============================== */}
        {/* SLIDER HEADER */}
        {/* =============================== */}

        <div
          className="
         
           container-site relative lg:px-10
            flex
            items-end
            justify-between
           
            pb-5
            
          "
        >
          {/* <div>
            <p
              className="
                text-[10px]
                font-medium
                uppercase
                tracking-[0.18em]
                text-black/40
              "
            >
              Our process
            </p>

            <p className="mt-2 text-[14px] text-black/55">
              Five principles. One consistent
              experience.
            </p>
          </div> */}

          {/* Controls */}
          <div className="flex items-center justify-end w-full">
            <button
              type="button"
              onClick={() => scrollCards("left")}
              disabled={!canScrollLeft}
              aria-label="Previous steps"
              className="
                cursor-pointer
                grid
                h-12
                w-12
                place-items-center
                border
                border-black/15
                text-black
                transition-all
                duration-300
                cursor-pointer
                hover:bg-[rgb(31,32,33)]
                hover:text-white
                disabled:cursor-not-allowed
                disabled:opacity-25
                disabled:hover:bg-transparent
                cursor-pointer
                disabled:hover:text-black
              "
            >
              <ArrowLeft size={17} />
            </button>

            <button
              type="button"
              onClick={() => scrollCards("right")}
              disabled={!canScrollRight}
              aria-label="Next steps"
              className="
                cursor-pointer
                grid
                h-12
                w-12
                place-items-center
                border-y
                border-r
                border-black/15
                text-black
                transition-all
                duration-300
                hover:bg-[rgb(31,32,33)]
                hover:text-white
                disabled:cursor-not-allowed
                disabled:opacity-25
                disabled:hover:bg-transparent
                disabled:hover:text-black
                cursor-pointer
              "
            >
              <ArrowRight size={17} />
            </button>
          </div>
     
        </div>




      {/* =============================== */}
      {/* CLOSING */}
      {/* =============================== */}

      {/* <div className="container-site relative lg:px-10">
        <div
          style={{
            transitionDelay: visible
              ? "780ms"
              : "0ms",
          }}
          className={`
            flex
            flex-col
            gap-8
            border-t
            border-black/15
            pt-8
            transition-all
            duration-1000
            ease-[cubic-bezier(.22,1,.36,1)]

            md:flex-row
            md:items-end
            md:justify-between

            ${
              visible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }
          `}
        >
          <div className="max-w-[680px]">
            <p
              className="
                text-[28px]
                font-medium
                leading-[1.15]
                tracking-[-0.035em]
                text-[rgb(31,32,33)]
                md:text-[36px]
              "
            >
              The process should feel as considered
              as the finished work.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-orange-500" />

            <span
              className="
                text-[10px]
                font-medium
                uppercase
                tracking-[0.16em]
                text-black/45
              "
            >
              Clear from start to finish
            </span>
          </div>
        </div>
      </div> */}
    </section>
  );
}