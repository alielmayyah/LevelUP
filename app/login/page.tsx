"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Headphones, TrendingUp, User } from "lucide-react";
import { theme } from "@/config/theme";
import { StarField } from "@/components/StarField";
import { SoundToggle } from "@/components/SoundToggle";
import { BrandFooter } from "@/components/BrandFooter";

export default function LoginPage() {
  const router = useRouter();
  const [fitId, setFitId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!fitId.trim()) {
      setError("Enter your Fit ID to continue");
      return;
    }
    setError("");
    router.push("/dashboard");
  };

  return (
    <div className="relative flex min-h-screen w-full flex-1 items-center justify-center overflow-hidden bg-background">
      <StarField />
      <SoundToggle />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex w-full max-w-sm flex-col items-center gap-8 px-6 py-16"
      >
        <div className="flex flex-col items-center gap-6">
          <Image
            src={theme.logo.src}
            alt={theme.logo.alt}
            width={140}
            height={121}
            priority
          />

          <div className="flex flex-col items-center gap-3 text-center">
            <h1 className="text-3xl font-bold leading-tight text-white">
              Continue Your
              <br />
              <span className="bg-linear-to-r from-accent to-primary bg-clip-text text-transparent">
                Journey
              </span>
            </h1>
            <p className="text-sm text-white/50">
              Enter your Fit ID to pick up right where you left off.
            </p>
          </div>
        </div>

        <div className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/3 px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <TrendingUp size={16} />
          </div>
          <p className="text-sm text-white/70">
            Thousands of members leveling up every day
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="fitId"
              className="text-xs font-semibold uppercase tracking-widest text-primary"
            >
              Fit ID
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 transition focus-within:border-primary/60">
              <User size={18} className="shrink-0 text-white/40" />
              <input
                id="fitId"
                name="fitId"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="10482"
                value={fitId}
                onChange={(event) => {
                  setFitId(event.target.value);
                  if (error) setError("");
                }}
                className="w-full bg-transparent text-base text-white placeholder-white/30 outline-none"
              />
            </div>
            {error && <p className="text-xs text-danger">{error}</p>}
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-between rounded-2xl bg-linear-to-r from-accent to-primary px-6 py-4 font-semibold text-white transition active:scale-[0.98]"
          >
            <span>Continue</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Headphones size={16} />
            <span>Need help?</span>
          </div>
          <p className="text-sm font-medium text-primary">
            Ask at the front desk
          </p>
        </div>

        <BrandFooter />
      </motion.div>
    </div>
  );
}
