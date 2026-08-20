"use client";

import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

export type HeroSlide = {
  src: string;
  title: string;
  category?: string;
  location?: string;
  alt?: string;
};

type HeroImageCarouselProps = {
  slides: readonly HeroSlide[];
  autoplay?: boolean;
  interval?: number;
};

export default function HeroImageCarousel({
  slides,
  autoplay = true,
  interval = 6500,
}: HeroImageCarouselProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const total = slides.length;

  const nextSlide = useCallback(() => {
    setActive((current) => (current + 1) % total);
  }, [total]);

  const previousSlide = useCallback(() => {
    setActive((current) =>
      current === 0 ? total - 1 : current - 1,
    );
  }, [total]);

  useEffect(() => {
    if (!autoplay || paused || total <= 1) return;

    const timer = window.setInterval(
      nextSlide,
      interval,
    );

    return () => window.clearInterval(timer);
  }, [
    autoplay,
    paused,
    interval,
    nextSlide,
    total,
  ]);

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        nextSlide();
      }

      if (event.key === "ArrowLeft") {
        previousSlide();
      }
    };

    window.addEventListener("keydown", handleKeyboard);

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyboard,
      );
  }, [nextSlide, previousSlide]);

  if (!slides.length) return null;

  const currentSlide = slides[active];
  const nextIndex = (active + 1) % total;
  const nextPreview = slides[nextIndex];

  const currentNumber = String(active + 1).padStart(
    2,
    "0",
  );

  const totalNumber = String(total).padStart(2, "0");

  return (
    <section
      className="container-site mt-12  lg:px-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured projects"
    >
      {/* ============================= */}
      {/* DESKTOP / TABLET */}
      {/* ============================= */}

      <div
        className="
          relative
          hidden
          min-h-[560px]
          grid-cols-12
          gap-[6px]
          overflow-hidden
          md:grid
          lg:h-[70vh]
          lg:min-h-[620px]
          lg:max-h-[850px]
        "
      >
        {/* PRIMARY IMAGE */}
        <div
          className="
            group
            relative
            col-span-8
            overflow-hidden
            bg-neutral-900
          "
        >
          <div
            key={`main-${active}`}
            className="
              absolute
              inset-0
              animate-[heroReveal_.8s_cubic-bezier(.22,1,.36,1)]
            "
          >
            <Image
              src={currentSlide.src}
              alt={
                currentSlide.alt ??
                currentSlide.title
              }
              fill
              priority={active === 0}
              className="
                object-cover
                transition-transform
                duration-[1800ms]
                ease-out
                group-hover:scale-[1.025]
              "
              sizes="(min-width: 1024px) 67vw, 70vw"
            />
          </div>

          {/* subtle cinematic gradient */}
          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-t
              from-black/75
              via-black/5
              to-transparent
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-r
              from-black/20
              via-transparent
              to-transparent
            "
          />

          {/* COUNTER */}
          <div
            className="
              absolute
              left-7
              top-7
              z-10
              flex
              items-center
              gap-2
              text-[12px]
              font-medium
              uppercase
              tracking-[0.16em]
              text-white
              lg:left-9
              lg:top-9
            "
          >
            <span>{currentNumber}</span>

            <span className="h-px w-8 bg-white/50" />

            <span className="text-white/55">
              {totalNumber}
            </span>
          </div>

          {/* PROJECT INFORMATION */}
          <div
            className="
              absolute
              bottom-0
              left-0
              z-10
              w-full
              p-7
              text-white
              lg:p-10
            "
          >
            <div
              key={`text-${active}`}
              className="
                max-w-2xl
                animate-[heroContent_.8s_cubic-bezier(.22,1,.36,1)]
              "
            >
              <div
                className="
                  mb-5
                  flex
                  items-center
                  gap-3
                  text-[11px]
                  font-medium
                  uppercase
                  tracking-[0.17em]
                  text-white/70
                "
              >
                {currentSlide.category && (
                  <span>
                    {currentSlide.category}
                  </span>
                )}

                {currentSlide.category &&
                  currentSlide.location && (
                    <span className="h-[3px] w-[3px] rounded-full bg-orange-400" />
                  )}

                {currentSlide.location && (
                  <span>
                    {currentSlide.location}
                  </span>
                )}
              </div>

              <h2
                className="
                  max-w-[760px]
                  text-[38px]
                  font-medium
                  leading-[1.06]
                  tracking-[-0.04em]
                  lg:text-[52px]
                  xl:text-[60px]
                "
              >
                {currentSlide.title}
              </h2>
            </div>
          </div>

          {/* VIEW PROJECT */}
          <button
            type="button"
            className="
              absolute
              cursor-pointer
              bottom-9
              right-9
              z-20
              hidden
              h-14
              w-14
              items-center
              justify-center
              rounded-full
              border
              border-white/30
              bg-white/10
              text-white
              backdrop-blur-md
              transition-all
              duration-300
              hover:rotate-45
              hover:bg-white
              hover:text-black
              lg:flex
            "
            aria-label="View featured project"
          >
            <ArrowUpRight size={19} />
          </button>
        </div>

        {/* ============================= */}
        {/* NEXT PROJECT */}
        {/* ============================= */}

        <button
          type="button"
          onClick={nextSlide}
          className="
            group
            relative
            col-span-4
            overflow-hidden
            bg-neutral-900
            text-left
            cursor-pointer
          "
          aria-label={`Next project: ${nextPreview.title}`}
        >
          <Image
            key={`preview-${nextIndex}`}
            src={nextPreview.src}
            alt={nextPreview.alt ?? nextPreview.title}
            fill
            className="
              object-cover
              transition-transform
              duration-[1200ms]
              ease-out
              group-hover:scale-[1.04]
            "
            sizes="33vw"
          />

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-t
              from-black/80
              via-black/5
              to-black/10
            "
          />

          {/* NEXT LABEL */}
          <div
            className="
              absolute
              left-7
              top-7
              z-10
              text-[11px]
              font-medium
              uppercase
              tracking-[0.16em]
              text-white/65
            "
          >
            Up next
          </div>

          {/* NEXT PROJECT */}
          <div
            className="
              absolute
              bottom-0
              left-0
              z-10
              w-full
              p-7
              text-white
              lg:p-8
            "
          >
            <div className="mb-4 overflow-hidden">
              <ArrowRight
                size={31}
                className="
                  transition-transform
                  duration-500
                  group-hover:translate-x-2
                  cursor-pointer
                "
              />
            </div>

            {nextPreview.category && (
              <p
                className="
                  mb-3
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.17em]
                  text-white/60
                "
              >
                {nextPreview.category}
              </p>
            )}

            <h3
              className="
                max-w-[300px]
                text-[24px]
                font-medium
                leading-[1.13]
                tracking-[-0.03em]
                lg:text-[29px]
              "
            >
              {nextPreview.title}
            </h3>
          </div>
        </button>
      </div>

      {/* ============================= */}
      {/* CONTROLS */}
      {/* ============================= */}

      <div
        className="
          hidden
          items-center
          justify-between
          
          py-5
          md:flex
        "
      >
        {/* PROGRESS */}
        <div className="flex flex-1 items-center gap-2 pr-10">
          {slides.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => setActive(index)}
              className="
                relative
                h-[2px]
                flex-1
                overflow-hidden
                bg-black/15
              "
              aria-label={`Go to slide ${index + 1}`}
            >
              {index < active && (
                <span className="absolute inset-0 bg-orange-500" />
              )}

              {index === active && (
                <span
                  key={`progress-${active}`}
                  className={`
                    absolute
                    inset-y-0
                    left-0
                    bg-black
                    ${
                      autoplay && !paused
                        ? "animate-[carouselProgress_6500ms_linear_forwards]"
                        : "w-full"
                    }
                  `}
                />
              )}
            </button>
          ))}
        </div>

        {/* ARROWS */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={previousSlide}
            aria-label="Previous project"
            className="
              grid
              h-12
              w-12
              place-items-center
              border
              border-black/20
              transition-colors
              duration-300
              hover:bg-[rgb(31,32,33)]
              hover:text-orange-500
              cursor-pointer
            "
          >
            <ArrowLeft size={17} />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next project"
            className="
              grid
              h-12
              w-12
              place-items-center
              border-y
              border-r
              border-black/20
              transition-colors
              duration-300
              hover:bg-[rgb(31,32,33)]
              hover:text-orange-500
              cursor-pointer
            "
          >
            <ArrowRight size={17} />
          </button>
        </div>
      </div>

      {/* ============================= */}
      {/* MOBILE */}
      {/* ============================= */}

      <div className="md:hidden">
        <div
          className="
            group
            relative
            h-[68vh]
            min-h-[520px]
            overflow-hidden
            bg-neutral-900
          "
        >
          <Image
            key={`mobile-${active}`}
            src={currentSlide.src}
            alt={
              currentSlide.alt ??
              currentSlide.title
            }
            fill
            priority={active === 0}
            className="
              animate-[heroReveal_.7s_ease-out]
              object-cover
            "
            sizes="100vw"
          />

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-t
              from-black/80
              via-transparent
              to-black/10
            "
          />

          <div
            className="
              absolute
              left-5
              top-5
              flex
              items-center
              gap-2
              text-[11px]
              font-medium
              tracking-[0.14em]
              text-white
            "
          >
            {currentNumber}

            <span className="h-px w-6 bg-white/50" />

            <span className="text-white/55">
              {totalNumber}
            </span>
          </div>

          <div
            className="
              absolute
              bottom-0
              left-0
              w-full
              p-6
              text-white
            "
          >
            {(currentSlide.category ||
              currentSlide.location) && (
              <p
                className="
                  mb-4
                  text-[10px]
                  uppercase
                  tracking-[0.17em]
                  text-white/65
                "
              >
                {currentSlide.category}

                {currentSlide.category &&
                  currentSlide.location &&
                  " · "}

                {currentSlide.location}
              </p>
            )}

            <h2
              className="
                text-[34px]
                font-medium
                leading-[1.07]
                tracking-[-0.04em]
              "
            >
              {currentSlide.title}
            </h2>
          </div>
        </div>

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-black/15
            py-4
          "
        >
          <p
            className="
              text-[10px]
              font-medium
              uppercase
              tracking-[0.15em]
              text-black/50
            "
          >
            Featured projects
          </p>

          <div className="flex">
            <button
              onClick={previousSlide}
              type="button"
              aria-label="Previous project"
              className="
                grid
                h-11
                w-11
                place-items-center
                border
                border-black/20
              "
            >
              <ArrowLeft size={16} />
            </button>

            <button
              onClick={nextSlide}
              type="button"
              aria-label="Next project"
              className="
                grid
                h-11
                w-11
                place-items-center
                border-y
                border-r
                border-black/20
              "
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}