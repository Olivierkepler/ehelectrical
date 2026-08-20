import ServicesList from "@/components/ServicesList";
import Link from "next/link";

export default function ServicesSection() {
  return (
    <section className="overflow-hidden bg-[#ffffff] py-0 lg:py-10">
      <div
        className="
          container-site
          rounded-xl
          bg-[#e7edf0]
          p-6
          pt-20
          transition-transform
          duration-500
          sm:p-8
          sm:pt-20
          lg:translate-x-28
          lg:px-20
          lg:py-[120px]
          lg:pr-[120px]
        "
      >
        {/* Header */}
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-8">
<span className="text-2xl text-orange-500 font-normal  tracking-tight">Services</span>

            <h2
              className="
                
                max-w-4xl
                text-3xl
                font-normal
                leading-[1.1]
                tracking-[-0.03em]
                text-black/90
                sm:text-4xl
                lg:text-5xl
              "
            >
              Crafting systems and spaces that strengthen communities.
            </h2>
          </div>

          {/* Supporting copy */}
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
                Clear communication, accountable execution, and a process
                that keeps every stakeholder informed.
              </p>

              <br />
              <Link href="/services" className="bg-[#114a6b] hover:bg-[#114a6b]/80 transition-colors duration-300 text-white inline-block mt-4 text-sm font-medium tracking-tight px-4 py-2 ">View all services</Link>
  
            </div>
          
          </div>
        </div>

        {/* Services */}
        <ServicesList limit={5} />
          </div>
    </section>
  );
}