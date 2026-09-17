import type { AnchorHTMLAttributes } from "react";
import { withBase } from "../lib/url";

type Variant = "primary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 border-3 px-7 py-[1.1rem] text-[1.05rem] font-bold brutal-4 transition duration-100 hover:-translate-0.75 motion-reduce:transition-none";

const variants: Record<Variant, string> = {
  primary: "border-pumpkin bg-pumpkin text-black hover:brutal-8",
  ghost: "border-fg bg-transparent text-fg brutal-color-fg hover:bg-fg hover:text-black hover:brutal-7",
};

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant;
}

export function ButtonLink({ variant = "primary", className = "", href, ...props }: ButtonLinkProps) {
  return <a href={href && withBase(href)} className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
