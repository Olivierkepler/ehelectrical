import ContactForm from "@/components/ContactForm";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import { site } from "@/lib/site-data";

export default function ContactPage(){return <><section className="py-24"><div className="container-site grid gap-14 md:grid-cols-12"><div className="md:col-span-5"><p className="eyebrow">Contact</p><h1 className="display-md mt-5">Start the conversation.</h1><p className="mt-7 max-w-md text-lg text-black/60">Share what you&apos;re planning, what is not working, or what you need priced. We&apos;ll help identify the right next step.</p><div className="mt-10 space-y-5 border-t border-black/20 pt-6"><p><span className="eyebrow block text-black/40">Phone</span><span className="mt-2 block text-2xl">{site.phone}</span></p><p><span className="eyebrow block text-black/40">Email</span><span className="mt-2 block text-2xl">{site.email}</span></p></div></div><div className="md:col-span-7"><ContactForm/></div></div></section><FAQ/><CTA/></>}
