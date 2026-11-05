import { motion } from "framer-motion";

const partners = [
  { name: "Banco Mundial", abbr: "WB" },
  { name: "FMI", abbr: "IMF" },
  { name: "V-Dem Institute", abbr: "V-Dem" },
  { name: "Transparency International", abbr: "TI" },
  { name: "World Justice Project", abbr: "WJP" },
  { name: "PNUD", abbr: "UNDP" },
  { name: "OCDE", abbr: "OECD" },
  { name: "WHO", abbr: "OMS" },
];

const SocialProofBar = () => (
  <motion.section
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="py-14 mt-8"
  >
    <div className="max-w-[1280px] mx-auto px-6">
      {/* Label */}
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-medium text-center mb-8">
        Dados e metodologias de
      </p>

      {/* Desktop — cards grid */}
      <div className="hidden md:grid grid-cols-4 lg:grid-cols-8 gap-3">
        {partners.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="flex flex-col items-center justify-center py-4 px-3 rounded-xl border border-neutral-700/40 hover:border-brand-accent/30 transition-all duration-300 group"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <span className="text-[10px] font-mono text-brand-accent/60 mb-1 group-hover:text-brand-accent transition-colors">
              {p.abbr}
            </span>
            <span className="text-xs text-neutral-200 font-medium text-center leading-tight">
              {p.name}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Mobile marquee */}
      <div className="md:hidden overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...partners, ...partners].map((p, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 mx-4 px-4 py-2 rounded-lg border border-neutral-700/40 text-xs text-neutral-200 font-medium"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <span className="text-brand-accent/60 font-mono text-[10px]">{p.abbr}</span>
              {p.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  </motion.section>
);

export default SocialProofBar;
