import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function ButtonLink({ href, children, dark = false }: { href: string; children: React.ReactNode; dark?: boolean }) {
  return <Link href={href} className={`inline-flex  rounded-sm items-center gap-3 text-orange-500  px-5 py-4 text-[15px] font-semibold uppercase tracking-[.13em] transition ${dark ? "border-white/35 text-white hover:bg-white hover:text-black" : "border-[rgb(31, 32, 33);]  hover:text-orange-500/70"}`}>{children}<ArrowUpRight size={15}/></Link>;
}
