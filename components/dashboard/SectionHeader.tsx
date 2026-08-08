import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  href?: string;
}

export function SectionHeader({ title, href }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
        {title}
      </p>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-0.5 text-xs font-medium text-white/60"
        >
          View details
          <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}
