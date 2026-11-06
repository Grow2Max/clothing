import Link from "next/link";
import { Reveal } from "./Reveal";
import { TitleOrnament } from "./tamil/Ornaments";

export function SectionHeading({
  title,
  subtitle,
  viewAllHref,
}: {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
}) {
  return (
    <Reveal>
      <div className="mb-8 text-center">
        <h2 className="section-title">{title}</h2>
        <TitleOrnament className="mx-auto mt-3 h-4 w-32" />
        {subtitle && <p className="mx-auto mt-3 max-w-xl text-sm text-ink-soft">{subtitle}</p>}
        {viewAllHref && (
          <Link href={viewAllHref} className="mt-4 inline-block text-xs font-semibold uppercase tracking-[0.15em] text-silk underline-offset-4 hover:underline">
            View all
          </Link>
        )}
      </div>
    </Reveal>
  );
}
