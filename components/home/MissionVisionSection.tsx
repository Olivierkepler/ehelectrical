// components/home/MissionVisionSection.tsx

export default function MissionVisionSection() {
    return (
      <section
        className="
          relative
          overflow-hidden
          bg-white
          py-24
          md:py-28
          lg:py-32
        "
      >
        {/* Subtle background detail */}
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
  
        <div
          className="
            container-site
            relative
            grid
            gap-16
            md:grid-cols-12
            md:gap-12
            lg:px-10
          "
        >
          {/* Main statement */}
          <div className="md:col-span-8">
            {/* <div className="flex items-center gap-3">
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
                Why we build
              </span>
            </div> */}
  
            <h2
              className="
                mt-8
                max-w-[950px]
                text-[clamp(2.2rem,4vw,3.8rem)]
                font-medium
                leading-[0.94]
                tracking-[-0.055em]
                text-[rgb(31,32,33)]
              "
            >
              To build systems and spaces so everyday life simply works{" "}
              <span className="text-orange-500">
                better.
              </span>
            </h2>
  
            <p
              className="
                mt-8
                max-w-[620px]
                text-[17px]
                leading-[1.75]
                tracking-[-0.01em]
                text-black/55
                md:text-[19px]
              "
            >
              We work with intention, transparency, and discipline because
              building performance is ultimately a human experience.
            </p>
          </div>
  
          {/* Mission / Vision */}
          <div
            className="
              space-y-12
              md:col-span-4
              md:pt-28
              lg:pt-36
            "
          >
            <div className="group border-t border-black/20 pt-6">
              <div className="flex items-center justify-between gap-4">
                <p
                  className="
                    text-[11px]
                    font-medium
                    uppercase
                    tracking-[0.18em]
                    text-orange-500
                  "
                >
                  Mission
                </p>
  
                <span className="text-[10px] tracking-[0.16em] text-black/25">
                  01
                </span>
              </div>
  
              <p
                className="
                  mt-5
                  text-[20px]
                  font-medium
                  leading-[1.45]
                  tracking-[-0.025em]
                  text-[rgb(31,32,33)]
                  md:text-[22px]
                "
              >
                Raise expectations for electrical and HVAC contracting through
                disciplined execution and trusted relationships.
              </p>
            </div>
  
            <div className="group border-t border-black/20 pt-6">
              <div className="flex items-center justify-between gap-4">
                <p
                  className="
                    text-[11px]
                    font-medium
                    uppercase
                    tracking-[0.18em]
                    text-orange-500
                  "
                >
                  Vision
                </p>
  
                <span className="text-[10px] tracking-[0.16em] text-black/25">
                  02
                </span>
              </div>
  
              <p
                className="
                  mt-5
                  text-[20px]
                  font-medium
                  leading-[1.45]
                  tracking-[-0.025em]
                  text-[rgb(31,32,33)]
                  md:text-[22px]
                "
              >
                Be the team owners call when the building has to work and
                communication has to be clear.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }