import ContactForm from "@/components/ContactForm";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import { site } from "@/lib/site-data";

export default function ContactPage() {
  return (
    <>
      <section className="py-24">
        <div className="container-site grid gap-14 md:grid-cols-12">
          {/* Contact Details */}
          <div className="md:col-span-5">
            <p className="eyebrow">Contact</p>

            <h1 className="text-2xl md:text-6xl font-semibold mt-5">
              Start the conversation.
            </h1>

       

            <p className="mt-7 max-w-md text-lg leading-relaxed text-black/60">
              Tell us about your project, what&apos;s not working, or what you
              need priced. We&apos;ll listen, understand the scope, and help
              determine the right next step.
            </p>

            <div className="mt-10 space-y-6 border-t border-black/20 pt-6">
              <div>
                <p className="eyebrow text-black/40">Phone</p>
                <a
                  href={`tel:${site.phone}`}
                  className="mt-2 inline-block text-2xl transition-opacity hover:opacity-60"
                >
                  {site.phone}
                </a>
              </div>

              <div>
                <p className="eyebrow text-black/40">Email</p>
                <a
                  href={`mailto:${site.email}`}
                  className="mt-2 inline-block break-all text-2xl transition-opacity hover:opacity-60"
                >
                  {site.email}
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-7">
            <ContactForm />
          </div>
        </div>
      </section>

      <FAQ />
      <CTA />
    </>
  );
}