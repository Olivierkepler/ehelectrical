"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function WelcomeLoader() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const exitTimer = window.setTimeout(() => {
      setLeaving(true);
    }, 1800);

    const removeTimer = window.setTimeout(() => {
      setVisible(false);
    }, 2500);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`
        fixed
        inset-0
        z-[9999]
        flex
        items-center
        justify-center
        overflow-hidden
        bg-[#071F2D]
        text-white
        transition-all
        duration-700
        ease-[cubic-bezier(.22,1,.36,1)]
        ${
          leaving
            ? "pointer-events-none -translate-y-full"
            : "translate-y-0"
        }
      `}
    >
      {/* Background atmosphere */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.12),transparent_35%)]
        "
      />

      {/* Vertical guides */}
      <div
        aria-hidden="true"
        className="
          absolute
          inset-y-0
          left-[12%]
          hidden
          w-px
          bg-white/[0.05]
          md:block
        "
      />

      <div
        aria-hidden="true"
        className="
          absolute
          inset-y-0
          right-[12%]
          hidden
          w-px
          bg-white/[0.05]
          md:block
        "
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* Logo */}
        <div
          className="
            animate-[welcomeReveal_900ms_cubic-bezier(.22,1,.36,1)_both]
          "
        >
          <Image
            src="/ehelectrical.png"
            alt="EH Electric & HVAC"
            width={180}
            height={180}
            priority
            className="
              h-auto
              w-[140px]
            
              md:w-[165px]
            "
          />
        </div>

        {/* Brand statement */}
        <div
          className="
            mt-10
            overflow-hidden
          "
        >
          <h1
            className="
              animate-[welcomeText_900ms_300ms_cubic-bezier(.22,1,.36,1)_both]
              text-[clamp(2rem,4vw,4.5rem)]
              font-medium
              leading-[0.96]
              tracking-[-0.05em]
            "
          >
            Built around{" "}
            <span className="text-orange-500">
              performance.
            </span>
          </h1>
        </div>

        {/* Loading indicator */}
        <div className="mt-12 w-[220px]">
          <div className="flex items-center justify-between">
            <span
              className="
                text-[9px]
                font-medium
                uppercase
                tracking-[0.2em]
                text-white/40
              "
            >
              Loading experience
            </span>

            <span
              className="
                text-[9px]
                font-medium
                uppercase
                tracking-[0.2em]
                text-orange-500
              "
            >
              EH
            </span>
          </div>

          <div className="mt-4 h-px overflow-hidden bg-white/15">
            <div
              className="
                h-full
                w-full
                origin-left
                animate-[welcomeProgress_1800ms_cubic-bezier(.65,0,.35,1)_forwards]
                bg-orange-500
              "
            />
          </div>
        </div>
      </div>

      {/* Bottom labels */}
      <div
        className="
          absolute
          bottom-7
          left-6
          right-6
          flex
          items-center
          justify-between
          text-[8px]
          font-medium
          uppercase
          tracking-[0.18em]
          text-white/25
          md:bottom-10
          md:left-10
          md:right-10
        "
      >
        <span>EH Electric & HVAC</span>

        <span>Massachusetts</span>
      </div>
    </div>
  );
}