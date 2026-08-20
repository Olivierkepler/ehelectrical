import ButtonLink from "./ButtonLink";

export default function CTA() {
  return (
    <section
      className="
        relative
        overflow-hidden
        bg-[#071F2D]
        py-24
        text-white
        md:py-32
        lg:py-20
      "
    >
      {/* Subtle atmospheric glow */}
      {/* <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_85%_20%,rgba(249,115,22,0.10),transparent_28%)]
        "
      /> */}

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
          bg-white/[0.06]
          xl:block
        "
      />

      <div className="container-site relative z-10 lg:px-10">
        {/* Top label */}
        {/* <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-orange-500" />

          <p
            className="
              text-[10px]
              font-medium
              uppercase
              tracking-[0.2em]
              text-white/45
            "
          >
            Talk to us
          </p>
        </div> */}

        {/* Main content */}
        <div
          className="
            mt-10
            grid
            gap-12
            lg:grid-cols-12
            lg:items-end
          "
        >
          {/* Headline */}
          <div className="lg:col-span-8">
            <h2
              className="
                max-w-[800px]
                w-2/3
                text-[clamp(2.2rem,4vw,3.2rem)]
                font-medium
                leading-[0.93]
                tracking-[-0.055em]
              "
            >
              Let&apos;s build a space that truly serves{" "}
              <span className="text-orange-500">
                you.
              </span>
            </h2>
          </div>

          {/* Supporting copy */}
          <div className="lg:col-span-4 lg:pb-2">
            <p
              className="
                max-w-[420px]
                text-[16px]
                leading-[1.75]
                text-white/55
                md:text-[18px]
              "
            >
              Bring us the constraints, the goals, and the details.
              We&apos;ll help define a practical path forward.
            </p>
          </div>
        </div>

        {/* Bottom action area */}
        <div
          className="
            mt-16
            flex
            flex-col
            gap-8
            border-t
            border-white/15
            pt-8
            md:mt-20
            md:flex-row
            md:items-center
            md:justify-between
          "
        >
          {/* Buttons */}
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/contact" dark>
              Start your project
            </ButtonLink>

            <ButtonLink href="/contact/consultation" dark>
              Request a consultation
            </ButtonLink>
          </div>

          {/* Detail */}
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span
                className="
                  absolute
                  inline-flex
                  h-full
                  w-full
                  animate-ping
                  rounded-full
                  bg-orange-500
                  opacity-40
                "
              />

              <span
                className="
                  relative
                  inline-flex
                  h-2
                  w-2
                  rounded-full
                  bg-orange-500
                "
              />
            </span>

            <span
              className="
                text-[9px]
                font-medium
                uppercase
                tracking-[0.18em]
                text-white/35
              "
            >
              Ready when you are
            </span>
          </div>
        </div>

        {/* Bottom signature */}
        {/* <div className="mt-20 md:mt-28">
          <div
            className="
              flex
              items-center
              justify-between
              gap-6
              border-t
              border-white/[0.07]
              pt-5
            "
          >
            <span
              className="
                text-[9px]
                font-medium
                uppercase
                tracking-[0.18em]
                text-white/25
              "
            >
              EH Electric & HVAC
            </span>

            <span
              className="
                text-[9px]
                font-medium
                uppercase
                tracking-[0.18em]
                text-white/25
              "
            >
              Built around people
            </span>
          </div>
        </div> */}
      </div>
    </section>
  );
}