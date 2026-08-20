import Image from "next/image";
import { stats } from "@/lib/site-data";

const partners = [
  {
    src: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=700&q=85",
    alt: "Industry partner",
  },
  {
    src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=700&q=85",
    alt: "Construction partner",
  },
  {
    src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=700&q=85",
    alt: "Business partner",
  },
  {
    src: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=700&q=85",
    alt: "Engineering partner",
  },
  {
    src: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=700&q=85",
    alt: "Construction partner",
  },
];

export default function StatsBand() {
  const firstRow = stats.slice(0, 4);
  const secondRow = stats.slice(4, 8);

  const firstLoop = [...firstRow, ...firstRow];
  const secondLoop = [...secondRow, ...secondRow];

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-white
        py-20
        md:py-28
        lg:py-40
      "
    >
      {/* subtle background architecture */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[linear-gradient(to_bottom,#FFFFFF_0%,#F8FAFB_55%,#FFFFFF_100%)]
        "
      />

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
          lg:block
        "
      />

      {/* Intro */}
      <div className="container-site relative z-10 lg:px-10">
        <div className="mx-auto max-w-[950px] text-center">
          {/* <div className="mb-7 flex items-center justify-center gap-3">
            <span className="h-2 w-2 rounded-full bg-orange-500" />

            <span
              className="
                text-[10px]
                font-medium
                uppercase
                tracking-[0.2em]
                text-black/40
              "
            >
              Proven performance
            </span>
          </div> */}

          <h2
            className="
              text-[clamp(2.2rem,4vw,4.1rem)]
         
              font-medium
              leading-[0.96]
              tracking-[-0.055em]
              text-[rgb(31,32,33)]
            "
          >
            Credibility you can{" "}
            <span className="text-orange-500">
              see.
            </span>
            <br />
            Trust you can feel.
          </h2>

          {/* <p
            className="
              mx-auto
              mt-7
              max-w-[580px]
              text-[15px]
              leading-[1.7]
              text-black/50
              md:text-[17px]
            "
          >
            Performance measured by the work, the relationships,
            and the standards we bring to every project.
          </p> */}
        </div>

        {/* Partner imagery */}
        <div
          className="
            mx-auto
            mt-16
            grid
            max-w-[1050px]
            grid-cols-2
            gap-3
            sm:grid-cols-3
            md:mt-20
            md:grid-cols-5
          "
        >
          {partners.map((partner, index) => (
            <div
              key={`${partner.alt}-${index}`}
              className="
                group
                relative
                h-[82px]
                overflow-hidden
                bg-[#F1F4F5]
              "
            >
              <Image
                src={partner.src}
                alt={partner.alt}
                fill
                sizes="200px"
                className="
                  scale-[1.04]
                  object-cover
                  grayscale
                  opacity-45
                  transition-all
                  duration-700
                  ease-[cubic-bezier(.22,1,.36,1)]
                  group-hover:scale-100
                  group-hover:grayscale-0
                  group-hover:opacity-100
                "
              />

              <div
                className="
                  absolute
                  inset-0
                  bg-white/20
                  transition-opacity
                  duration-500
                  group-hover:opacity-0
                "
              />

              <span
                className="
                  absolute
                  bottom-2
                  right-2
                  text-[8px]
                  font-medium
                  tracking-[0.15em]
                  text-white/70
                "
              >
                0{index + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats wall */}
      <div className="relative z-10 mt-20 md:mt-28">
        {/* fade edges */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-y-0
            left-0
            z-20
            w-16
            bg-gradient-to-r
            from-white
            to-transparent
            md:w-32
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-y-0
            right-0
            z-20
            w-16
            bg-gradient-to-l
            from-white
            to-transparent
            md:w-32
          "
        />

        <div className="space-y-4">
          {/* Row 1 */}
          <div className="group overflow-hidden">
            <div className="stats-marquee-left flex w-max gap-4">
              {firstLoop.map(([value, label], index) => (
                <StatCard
                  key={`row1-${value}-${index}`}
                  value={value}
                  label={label}
                  index={index}
                  dark={index % 4 === 2}
                  wide={index % 3 === 1}
                />
              ))}
            </div>
          </div>

          {/* Row 2 */}
          <div className="group overflow-hidden">
            <div className="stats-marquee-right flex w-max gap-4">
              {secondLoop.map(([value, label], index) => (
                <StatCard
                  key={`row2-${value}-${index}`}
                  value={value}
                  label={label}
                  index={index}
                  dark={index % 4 === 1}
                  wide={index % 3 === 0}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer detail */}
      {/* <div className="container-site relative z-10 mt-14 lg:px-10">
        <div className="flex items-center gap-5">
          <span className="h-px flex-1 bg-black/10" />

          <span
            className="
              whitespace-nowrap
              text-[9px]
              font-medium
              uppercase
              tracking-[0.2em]
              text-black/35
            "
          >
            Built on measurable performance
          </span>

          <span className="h-px flex-1 bg-black/10" />
        </div>
      </div> */}
    </section>
  );
}

function StatCard({
  value,
  label,
  index,
  dark = false,
  wide = false,
}: {
  value: string;
  label: string;
  index: number;
  dark?: boolean;
  wide?: boolean;
}) {
  return (
    <article
      className={`
        group/card
        relative
        flex
        h-[165px]
        shrink-0
        items-center
        overflow-hidden
        px-7
        transition-all
        duration-500
        ease-[cubic-bezier(.22,1,.36,1)]

        hover:-translate-y-1

        md:h-[175px]
        md:px-8

        ${
          wide
            ? "w-[390px] md:w-[440px]"
            : "w-[320px] md:w-[355px]"
        }

        ${
          dark
            ? "bg-[rgb(31,32,33)] text-white"
            : "bg-[#EAF0F2] text-[rgb(31,32,33)]"
        }
      `}
    >
      {/* giant faint index */}
      <span
        aria-hidden="true"
        className={`
          pointer-events-none
          absolute
          -right-1
          -top-7
          text-[120px]
          font-medium
          leading-none
          tracking-[-0.08em]
          transition-transform
          duration-700
          group-hover/card:-translate-x-2
          ${
            dark
              ? "text-white/[0.035]"
              : "text-black/[0.025]"
          }
        `}
      >
        {String((index % 4) + 1).padStart(2, "0")}
      </span>

      {/* accent line */}
      <span
        aria-hidden="true"
        className="
          absolute
          left-0
          top-0
          h-[3px]
          w-0
          bg-orange-500
          transition-all
          duration-500
          group-hover/card:w-full
        "
      />

      <div
        className="
          relative
          z-10
          flex
          w-full
          items-center
          gap-6
        "
      >
        <div
          className="
            shrink-0
            text-[clamp(2.8rem,3.8vw,4.5rem)]
            font-medium
            leading-none
            tracking-[-0.06em]
          "
        >
          {value}
        </div>

        <div className="h-10 w-px bg-current opacity-15" />

        <p
          className={`
            max-w-[190px]
            text-[14px]
            leading-[1.4]
            tracking-[-0.02em]
            md:text-[15px]
            ${
              dark
                ? "text-white/65"
                : "text-black/65"
            }
          `}
        >
          {label}
        </p>
      </div>
    </article>
  );
}