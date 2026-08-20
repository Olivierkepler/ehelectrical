import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { site } from "@/lib/site-data";

export default function Footer() {
  const links = [
    ["About us", "/about"],
    ["Contact", "/contact"],
    ["Portfolio", "/portfolio"],
    ["Trade partners", "/opportunity"],
    ["Founder story", "/founder/story"],
    ["Consultation", "/contact/consultation"],
    ["Privacy", "/privacy"],
    ["Terms", "/terms"],
  ] as const;

  return (
    <footer
      className="
        relative
        overflow-hidden
        bg-[#071F2D]
        py-16
        text-white
        md:py-20
        lg:py-24
      "
    >
      {/* subtle atmosphere */}
      {/* <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_10%_10%,rgba(249,115,22,0.06),transparent_26%)]
        "
      /> */}

      <div className="container-site relative z-10 lg:px-10">
        {/* Top */}
        <div
          className="
            grid
            gap-12
            lg:grid-cols-12
            lg:gap-10
          "
        >
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link
              href="/"
              aria-label="EH Electric & HVAC home"
              className="group inline-flex items-center"
            >
              <Image
                src="/ehelectrical.png"
                alt="EH Electric & HVAC"
                width={160}
                height={160}
                priority
                className="
                  h-auto
                  w-[132px]
                  transition-transform
                  duration-500
                  ease-[cubic-bezier(.22,1,.36,1)]
                  group-hover:scale-[1.025]
                  lg:w-[148px]
                "
              />
            </Link>

            <p
              className="
                mt-8
                text-[10px]
                font-medium
                uppercase
                tracking-[0.18em]
                text-orange-500
              "
            >
              About {site.name}
            </p>

            <p
              className="
                mt-5
                max-w-[360px]
                text-[15px]
                leading-[1.75]
                text-white/55
              "
            >
              A Greater Boston electrical and HVAC contractor focused on clear
              coordination, reliable execution, and long-term building
              performance.
            </p>
          </div>

          {/* Shortcuts */}
          <div className="lg:col-span-2">
            <h3
              className="
                text-[10px]
                font-medium
                uppercase
                tracking-[0.18em]
                text-white/40
              "
            >
              Shortcuts
            </h3>

            <div className="mt-6 grid gap-3">
              {links.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="
                    group
                    flex
                    w-fit
                    items-center
                    gap-2
                    text-[14px]
                    text-white/65
                    transition-colors
                    duration-300
                    hover:text-white
                  "
                >
                  {label}

                  <ArrowUpRight
                    size={13}
                    className="
                      opacity-40
                      transition-all
                      duration-300
                      group-hover:translate-x-0.5
                      group-hover:-translate-y-0.5
                      group-hover:opacity-100
                    "
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-3">
            <h3
              className="
                text-[10px]
                font-medium
                uppercase
                tracking-[0.18em]
                text-white/40
              "
            >
              Let&apos;s keep in touch
            </h3>

            <p className="mt-6 max-w-[280px] text-[14px] leading-[1.65] text-white/50">
              Occasional project updates, company news, and useful building
              insights.
            </p>

            <form
              className="
                mt-7
                flex
                items-center
                gap-4
                border-b
                border-white/20
                pb-3
                transition-colors
                duration-300
                focus-within:border-orange-500
              "
            >
              <input
                type="email"
                aria-label="Email address"
                placeholder="your@email.com"
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  text-[14px]
                  text-white
                  outline-none
                  placeholder:text-white/30
                "
              />

              <button
                type="submit"
                className="
                  group
                  inline-flex
                  items-center
                  gap-2
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.16em]
                  text-white
                  transition-colors
                  duration-300
                  hover:text-orange-500
                "
              >
                Submit

                <ArrowUpRight
                  size={13}
                  className="
                    transition-transform
                    duration-300
                    group-hover:translate-x-0.5
                    group-hover:-translate-y-0.5
                  "
                />
              </button>
            </form>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h3
              className="
                text-[10px]
                font-medium
                uppercase
                tracking-[0.18em]
                text-white/40
              "
            >
              Contact us
            </h3>

            <div className="mt-6 space-y-6">
              <div>
                <span className="text-[9px] uppercase tracking-[0.16em] text-white/30">
                  Location
                </span>

                <p className="mt-2 text-[14px] leading-[1.6] text-white/65">
                  {site.address}
                </p>
              </div>

              <div>
                <span className="text-[9px] uppercase tracking-[0.16em] text-white/30">
                  Phone
                </span>

                <p className="mt-2 text-[14px] text-white/75">
                  {site.phone}
                </p>
              </div>

              <div>
                <span className="text-[9px] uppercase tracking-[0.16em] text-white/30">
                  Email
                </span>

                <p className="mt-2 break-all text-[14px] text-white/75">
                  {site.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div
          className="
            mt-16
            flex
            flex-col
            gap-5
            border-t
            border-white/12
            pt-6
            text-[9px]
            font-medium
            uppercase
            tracking-[0.16em]
            text-white/30
            md:mt-20
            md:flex-row
            md:items-center
            md:justify-between
          "
        >
          <span>
            © {new Date().getFullYear()} {site.name}
          </span>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>Licensed</span>
            <span className="h-1 w-1 rounded-full bg-orange-500" />
            <span>Insured</span>
            <span className="h-1 w-1 rounded-full bg-orange-500" />
            <span>Safety focused</span>
          </div>
        </div>
      </div>
    </footer>
  );
}