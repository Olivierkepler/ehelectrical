"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { site } from "@/lib/site-data";

const nav = [
  ["Services", "/services"],
  ["Portfolio", "/portfolio"],
  ["About", "/about"],
] as const;

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 18);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={`
          sticky top-0 z-50
           lg:px-14
    
          border-b
          transition-all
          duration-500
          ease-[cubic-bezier(.22,1,.36,1)]
          ${
            scrolled
              ? "border-black/10 bg-white/72 shadow-[0_10px_40px_rgba(0,0,0,0.06)] backdrop-blur-2xl"
              : "border-transparent bg-transparent"
          }
        `}
      >
        <div
          className={`
            container-site
            flex
            items-center
            justify-between
       
            gap-8
            transition-all
            duration-500
            ease-[cubic-bezier(.22,1,.36,1)]
            ${
              scrolled
                ? "h-[76px]"
                : "h-[96px]"
            }
          `}
        >
          {/* Logo */}
          <Link
            href="/"
            aria-label="EH Electric & HVAC home"
            className="
              group
              relative
              flex
              items-center
            "
          >
            <Image
              src="/ehelectrical.png"
              alt="EH Electric & HVAC"
              width={150}
              height={150}
              priority
              className="
                h-auto
                w-[128px]
                transition-transform
                duration-500
                ease-out
                group-hover:scale-[1.025]
                lg:w-[142px]
              "
            />
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="
              hidden
              items-center
              gap-8
              text-[14px]
              font-medium
              uppercase
              tracking-[0.14em]
              lg:flex
            "
          >
            {nav.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="
                  group
                  relative
                  py-2
                  text-black/85
                  transition-colors
                  duration-300
                  hover:text-black
                "
              >
                {label}

                <span
                  className="
                    absolute
                    bottom-0
                    left-0
                    h-px
                    w-full
                    origin-left
                    scale-x-0
                    bg-black
                    transition-transform
                    duration-300
                    ease-out
                    group-hover:scale-x-100
                  "
                />
              </Link>
            ))}

            {/* Opportunities */}
            <div className="group relative">
              <button
                type="button"
                className="
                  flex
                  items-center
                  gap-1.5
                  py-2
                  text-black/85
                  transition-colors
                  duration-300
                  hover:text-black

                "
              >
                Opportunities

                <ChevronDown
                  size={14}
                  strokeWidth={1.8}
                  className="
                    transition-transform
                    duration-300
                    group-hover:rotate-180
                  "
                />
              </button>

              <div
                className="
                  invisible
                  absolute
                  right-0
                  top-[calc(100%+18px)]
                  w-[320px]
                  translate-y-2
                  border
                  border-black/10
                  bg-white/95
                  p-2
                  opacity-0
                  shadow-[0_24px_70px_rgba(0,0,0,0.12)]
                  backdrop-blur-2xl
                  transition-all
                  duration-300
                  ease-out
                  group-hover:visible
                  group-hover:translate-y-0
                  group-hover:opacity-100
                "
              >
                <a
                  href={site.careersUrl}
                  className="
                    group/item
                    flex
                    items-center
                    justify-between
                    px-4
                    py-4
                    transition-colors
                    duration-300
                    hover:bg-[rgb(31,32,33)]
                    hover:text-white
                  "
                >
                  <div>
                    <p className="text-[13px] font-medium uppercase tracking-[0.12em]">
                      Careers
                    </p>

                    <p className="mt-1 text-xs text-black/45 transition-colors group-hover/item:text-white/60">
                      Join the team
                    </p>
                  </div>

                  <ArrowUpRight
                    size={16}
                    className="
                      transition-transform
                      duration-300
                      group-hover/item:translate-x-1
                      group-hover/item:-translate-y-1
                    "
                  />
                </a>

                <Link
                  href="/opportunity"
                  className="
                    group/item
                    flex
                    items-center
                    justify-between
                    px-4
                    py-4
                    transition-colors
                    duration-300
                    hover:bg-[rgb(31,32,33)]
                    hover:text-white
                  "
                >
                  <div>
                    <p className="text-[13px] font-medium uppercase tracking-[0.12em]">
                      Trade Partners
                    </p>

                    <p className="mt-1 text-xs text-black/45 transition-colors group-hover/item:text-white/60">
                      Work with EH
                    </p>
                  </div>

                  <ArrowUpRight
                    size={16}
                    className="
                      transition-transform
                      duration-300
                      group-hover/item:translate-x-1
                      group-hover/item:-translate-y-1
                    "
                  />
                </Link>
              </div>
            </div>

            <Link
              href="/founder/story"
              className="
                group
                relative
                py-2
                text-black/85
                transition-colors
                duration-300
                hover:text-black
              "
            >
              Founder&apos;s Story

              <span
                className="
                  absolute
                  bottom-0
                  left-0
                  h-px
                  w-full
                  origin-left
                  scale-x-0
                  bg-black
                  transition-transform
                  duration-300
                  group-hover:scale-x-100
                "
              />
            </Link>
          </nav>

          {/* CTA */}
          <div className="hidden lg:block">
            <Link
              href="/contact/consultation"
              className="
                group
                inline-flex
                items-center
                gap-3
                bg-[rgb(31,32,33)]
                px-5
                py-4
                text-[13px]
                hover:text-orange-500
                hover:bg-[rgb(31,32,33)]/80
                uppercase
                tracking-[0.14em]
                text-white
                transition-all
                duration-300
                hover:bg-black
                rounded-sm
              "
            >
              Start a Project

              <ArrowUpRight
                size={16}
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                  group-hover:-translate-y-1
                "
              />
            </Link>
          </div>

          {/* Mobile Button */}
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="
              relative
              grid
              h-11
              w-11
              place-items-center
              border
              border-black/15
              bg-white/60
              backdrop-blur-xl
              transition-all
              duration-300
              hover:bg-black
              hover:text-white
              lg:hidden
            "
          >
            {open ? (
              <X size={20} strokeWidth={1.8} />
            ) : (
              <Menu size={20} strokeWidth={1.8} />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`
          fixed
          inset-0
          z-40
          bg-[rgb(31,32,33)]
          text-white
          transition-all
          duration-500
          ease-[cubic-bezier(.22,1,.36,1)]
          lg:hidden
          ${
            open
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-4 opacity-0"
          }
        `}
      >
        <div className="container-site flex h-full flex-col pt-[110px]">
          <div className="flex-1">
            {[
              ...nav,
              ["Trade Partners", "/opportunity"] as const,
              ["Founder’s Story", "/founder/story"] as const,
              ["Contact", "/contact"] as const,
            ].map(([label, href], index) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="
                  group
                  flex
                  items-center
                  justify-between
                  border-b
                  border-white/15
                  py-5
                "
              >
                <div className="flex items-center gap-4">
                  <span className="text-[10px] tracking-[0.15em] text-white/35">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span
                    className="
                      text-[28px]
                      font-medium
                      tracking-[-0.03em]
                      sm:text-[34px]
                    "
                  >
                    {label}
                  </span>
                </div>

                <ArrowUpRight
                  size={20}
                  className="
                    text-white/50
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                    group-hover:-translate-y-1
                    group-hover:text-white
                  "
                />
              </Link>
            ))}
          </div>

          <div className="pb-8 pt-8">
            <Link
              href="/contact/consultation"
              onClick={() => setOpen(false)}
              className="
                group
                flex
                items-center
                justify-between
                bg-white
                px-5
                py-5
                text-[12px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-black
                 rounded-sm
              "
            >
              Start a Project

              <ArrowUpRight
                size={17}
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                  group-hover:-translate-y-1
                "
              />
            </Link>

            <div className="mt-6 flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-white/35">
              <span>EH Electric & HVAC</span>
              <span>Massachusetts</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}