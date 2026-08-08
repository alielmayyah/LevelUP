import { Bell, Flame } from "lucide-react";

interface GreetingHeaderProps {
  greeting: string;
  subtitle: string;
  streakDays: number;
}

export function GreetingHeader({ greeting, subtitle, streakDays }: GreetingHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{greeting}</h1>
          <p className="mt-1 text-sm text-white/50">{subtitle}</p>
        </div>
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70"
        >
          <Bell size={18} />
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>
      </div>

      <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-3 py-1.5 text-sm font-semibold text-warning">
        <Flame size={14} />
        {streakDays}-day streak
      </div>
    </div>
  );
}
