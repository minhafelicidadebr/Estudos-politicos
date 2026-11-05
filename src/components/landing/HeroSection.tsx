import { motion } from "framer-motion";
import { Globe, ArrowDown, Shield, Scale, Globe2, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { CountrySelectorModal } from "@/components/country/CountrySelectorModal";

const trustItems = [
  { icon: Shield, text: "Protocolo anti-alucinação auditável" },
  { icon: Scale, text: "Imparcialidade metodológica" },
  { icon: Globe2, text: "20 países com dados curados — e qualquer país via IA" },
];

const HeroSection = () => {
  const [showScroll, setShowScroll] = useState(true);
  const [selectorOpen, setSelectorOpen] = useState(false);

  useEffect(() => {
    const handler = () => setShowScroll(window.scrollY < 100);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-16" id="main-content">
      <div className="max-w-[1280px] mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">
        {/* Left column — 60% */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="uppercase tracking-[0.25em] text-xs text-brand-accent font-medium"
          >
            Inteligência Política Comparada
          </motion.p>

          {/* Headline */}
          <div>
            {[
              { text: "Democracia começa", className: "font-display text-display-2xl text-neutral-50 font-light" },
              { text: "com compreensão", className: "font-display text-display-2xl text-brand-accent font-light" },
              { text: "baseada em evidência.", className: "font-display text-display-xl text-neutral-400 font-light" },
            ].map((line, i) => (
              <motion.h1
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.15, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className={line.className}
              >
                {line.text}
              </motion.h1>
            ))}
          </div>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-body-lg text-neutral-400 leading-relaxed max-w-prose"
          >
            Ágora analisa governos, capitais e políticas públicas com rigor acadêmico,
            fontes rastreáveis e imparcialidade metodológica — em qualquer país do mundo.
          </motion.p>

          {/* CTA Group */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.4 }}
            className="flex flex-wrap items-center gap-6"
          >
            <button
              onClick={() => setSelectorOpen(true)}
              className="flex items-center gap-3 bg-brand-accent text-brand-primary font-semibold px-7 py-4 rounded-full hover:scale-105 transition-transform text-sm"
            >
              <Globe className="w-5 h-5" />
              Escolher um país para analisar
            </button>
            <a
              href="#methodology"
              className="flex items-center gap-2 text-neutral-400 hover:text-neutral-50 underline underline-offset-4 text-sm transition-colors"
            >
              <ArrowDown className="w-4 h-4" />
              Ver como funciona a metodologia
            </a>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.4 }}
            className="flex flex-wrap gap-6"
          >
            {trustItems.map((item) => (
              <span key={item.text} className="flex items-center gap-2 text-xs text-neutral-400">
                <item.icon className="w-3.5 h-3.5" />
                {item.text}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Right column — Globe placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="lg:col-span-2 flex items-center justify-center"
        >
          <div className="relative aspect-square w-full max-w-lg">
            {/* Glow */}
            <div className="absolute inset-0 rounded-full bg-brand-secondary/20 blur-3xl" />
            {/* Globe SVG placeholder */}
            <svg
              viewBox="0 0 400 400"
              className="w-full h-full animate-[spin_60s_linear_infinite] opacity-60"
              fill="none"
              stroke="hsl(42, 52%, 54%)"
              strokeWidth="0.5"
            >
              <circle cx="200" cy="200" r="150" strokeOpacity="0.3" />
              <ellipse cx="200" cy="200" rx="150" ry="60" strokeOpacity="0.2" />
              <ellipse cx="200" cy="200" rx="60" ry="150" strokeOpacity="0.2" />
              <ellipse cx="200" cy="200" rx="110" ry="150" strokeOpacity="0.15" />
              <line x1="50" y1="200" x2="350" y2="200" strokeOpacity="0.1" />
              <line x1="200" y1="50" x2="200" y2="350" strokeOpacity="0.1" />
              {[
                [180, 120], [220, 160], [160, 230], [250, 200], [140, 170],
                [270, 140], [190, 260], [230, 110], [150, 290], [210, 240],
              ].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="2.5" fill="hsl(42, 52%, 54%)" fillOpacity={0.6 + i * 0.04} stroke="none" />
              ))}
            </svg>
          </div>
        </motion.div>
      </div>

      {/* Scroll hint */}
      {showScroll && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-neutral-600 text-xs"
        >
          <span>Explorar</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </motion.div>
      )}
      <CountrySelectorModal isOpen={selectorOpen} onClose={() => setSelectorOpen(false)} />
    </section>
  );
};

export default HeroSection;
