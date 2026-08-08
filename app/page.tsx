"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { theme } from "@/config/theme";
import { StarField } from "@/components/StarField";
import { SoundToggle } from "@/components/SoundToggle";
import { BrandFooter } from "@/components/BrandFooter";

export default function SplashScreen() {
  const router = useRouter();
  const [entering, setEntering] = useState(false);

  const handleBegin = () => {
    if (entering) return;
    setEntering(true);
    setTimeout(() => router.push("/login"), 450);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-1 items-center justify-center overflow-hidden bg-background">
      <StarField />
      <SoundToggle />

      <AnimatePresence>
        {!entering && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center px-6"
          >
            <motion.button
              type="button"
              onClick={handleBegin}
              whileTap={{ scale: 0.96 }}
              className="flex w-[320px] max-w-[86vw] flex-col items-center gap-6 rounded-3xl border border-white/10 bg-white/3 px-8 py-10 text-center shadow-[0_0_60px_-15px_var(--tw-shadow-color)] shadow-primary/35 backdrop-blur-md"
            >
              <div className="lu-ring-pulse flex h-40 w-40 items-center justify-center rounded-full border border-primary/40 bg-black/40 p-4">
                <Image
                  src={theme.logo.src}
                  alt={theme.logo.alt}
                  width={200}
                  height={173}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>

              <div className="flex flex-col items-center gap-2">
                <p className="text-xl font-semibold text-white">
                  Tap to{" "}
                  <span className="bg-linear-to-r from-accent to-primary bg-clip-text text-transparent">
                    Begin
                  </span>
                </p>
                <p className="text-sm text-white/50">{theme.app.welcomeMessage}</p>
              </div>
            </motion.button>

            <div className="mt-10">
              <BrandFooter />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
