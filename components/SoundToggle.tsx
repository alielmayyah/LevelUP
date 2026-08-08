"use client";

import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export function SoundToggle() {
  const [muted, setMuted] = useState(true);

  return (
    <button
      type="button"
      onClick={() => setMuted((m) => !m)}
      aria-label={muted ? "Unmute" : "Mute"}
      className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 backdrop-blur-sm transition hover:bg-white/10 hover:text-white"
    >
      {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
    </button>
  );
}
