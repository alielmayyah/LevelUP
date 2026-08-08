import { theme } from "@/config/theme";

export function BrandFooter() {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs font-medium tracking-[0.3em] text-white/40">
        {theme.app.tagline}
      </p>
      <div className="h-1 w-24 rounded-full bg-linear-to-r from-accent to-primary" />
    </div>
  );
}
