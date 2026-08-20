import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function ButtonLinkDark({
  href,
  children,
  dark = false,
}: {
  href: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`
        inline-flex items-center gap-3
        bg-[rgb(31,32,33)]
        px-5 py-4
        text-[14px] font-normal uppercase
        tracking-[0.13em]
        text-white
        rounded-sm
        transition-colors duration-300
        ${
          dark
            ? "border border-white/35 hover:bg-white hover:text-black"
            : "border border-black/25 hover:bg-[rgb(31,32,33)]/80"
        }
      `}
    >
      {children}
      <ArrowUpRight size={15} />
    </Link>
  );
}