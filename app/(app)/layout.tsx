import type { ReactNode } from "react";
import { BottomNav } from "@/components/nav/BottomNav";
import { StarField } from "@/components/StarField";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-primary/20 blur-[100px]" />
      <StarField count={18} intensity={0.4} glow={false} />
      <div className="lu-noise pointer-events-none absolute inset-0" />
      <div className="relative mx-auto w-full max-w-sm px-5 pb-28 pt-6">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
