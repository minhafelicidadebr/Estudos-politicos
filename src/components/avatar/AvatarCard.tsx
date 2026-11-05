/**
 * AvatarCard — Displays the country's cultural AI avatar
 * @example <AvatarCard avatar={avatarProfile} variant="hero" />
 */
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AvatarProfile } from "@/types/aegis";
import { useState, useEffect } from "react";

interface AvatarCardProps {
  avatar: AvatarProfile;
  variant: 'hero' | 'sidebar' | 'chat' | 'mini';
  className?: string;
}

export function AvatarCard({ avatar, variant, className }: AvatarCardProps) {
  const [microtextIndex, setMicrotextIndex] = useState(0);

  useEffect(() => {
    if (variant !== 'hero') return;
    const interval = setInterval(() => {
      setMicrotextIndex((prev) => (prev + 1) % avatar.ux_microtexts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [avatar.ux_microtexts.length, variant]);

  if (variant === 'mini') {
    return (
      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-display text-sm", className)} style={{ background: `linear-gradient(135deg, ${avatar.symbolic_palette.primary}, ${avatar.symbolic_palette.secondary})` }} title={`${avatar.name} — ${avatar.welcome_message}`}>
        <span className="text-white font-semibold">{avatar.name[0]}</span>
      </div>
    );
  }

  if (variant === 'chat') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-display text-lg shrink-0" style={{ background: `linear-gradient(135deg, ${avatar.symbolic_palette.primary}, ${avatar.symbolic_palette.secondary})` }}>
          <span className="text-white font-semibold">{avatar.name[0]}</span>
        </div>
        <span className="text-body-sm font-semibold text-neutral-50">{avatar.name}</span>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className={cn("flex flex-col items-center text-center gap-3", className)}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center font-display text-4xl" style={{ background: `linear-gradient(135deg, ${avatar.symbolic_palette.primary}, ${avatar.symbolic_palette.secondary})` }}>
          <span className="text-white font-bold">{avatar.name[0]}</span>
        </div>
        <div>
          <h3 className="font-display text-heading-md text-neutral-50">{avatar.name}</h3>
          <span className="text-micro text-brand-accent font-medium">{avatar.archetype}</span>
        </div>
        <p className="text-body-sm text-neutral-400 line-clamp-3 leading-relaxed">{avatar.welcome_message}</p>
      </div>
    );
  }

  // variant === 'hero'
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      className={cn("rounded-2xl border border-neutral-700/50 p-8 overflow-hidden relative", className)}
      style={{ background: `linear-gradient(135deg, ${avatar.symbolic_palette.primary}15, ${avatar.symbolic_palette.secondary}10, transparent)` }}
    >
      {/* Decorative circle */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${avatar.symbolic_palette.accent}, transparent)` }} />

      <div className="relative flex flex-col sm:flex-row gap-6">
        <div className="w-20 h-20 rounded-full flex items-center justify-center font-display text-4xl shrink-0" style={{ background: `linear-gradient(135deg, ${avatar.symbolic_palette.primary}, ${avatar.symbolic_palette.secondary})` }}>
          <span className="text-white font-bold">{avatar.name[0]}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h3 className="font-display text-heading-lg text-neutral-50">{avatar.name}</h3>
            <span className="text-body-sm italic text-neutral-400">"{avatar.name_meaning}"</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 rounded-full text-micro font-semibold bg-brand-accent/10 text-brand-accent border border-brand-accent/30">
              {avatar.archetype}
            </span>
            {avatar.tone_adjectives.map((adj) => (
              <span key={adj} className="px-2.5 py-0.5 rounded-full text-micro text-neutral-400 bg-white/[0.04] border border-neutral-700/30">
                {adj}
              </span>
            ))}
          </div>
          <p className="text-body-md text-neutral-200 italic leading-relaxed mb-4 font-display">
            "{avatar.welcome_message}"
          </p>
          <div className="border-t border-neutral-700/30 pt-4">
            <p className="text-micro text-neutral-500 mb-1">Missão:</p>
            <p className="text-body-sm text-neutral-400 leading-relaxed">{avatar.mission_in_app}</p>
          </div>
          {/* Cycling microtexts */}
          <div className="mt-4 h-6 overflow-hidden">
            <motion.p
              key={microtextIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-micro text-brand-accent/70 italic"
            >
              💡 {avatar.ux_microtexts[microtextIndex]}
            </motion.p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
