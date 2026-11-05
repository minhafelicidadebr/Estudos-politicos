import { motion } from "framer-motion";
import { Globe } from "lucide-react";

const FinalCTASection = () => (
  <section className="py-[clamp(5rem,10vw,9rem)] relative overflow-hidden">
    {/* Background glow */}
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="w-[500px] h-[500px] rounded-full bg-brand-accent/5 blur-[120px]" />
    </div>

    <div className="max-w-[1280px] mx-auto px-6 relative z-10 text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-display text-display-lg text-neutral-50 max-w-3xl mx-auto mb-4"
      >
        A qualidade da democracia começa na qualidade da compreensão.
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="text-neutral-400 text-body-lg mb-10"
      >
        Não precisamos de mais opiniões. Precisamos de mais método.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap justify-center gap-6"
      >
        <button className="flex items-center gap-3 bg-brand-accent text-brand-primary font-semibold px-8 py-4 rounded-full hover:scale-105 transition-transform">
          <Globe className="w-5 h-5" />
          Começar a analisar — é grátis
        </button>
        <a
          href="/library"
          className="flex items-center text-neutral-400 hover:text-neutral-50 underline underline-offset-4 text-sm transition-colors px-4 py-4"
        >
          Explorar a biblioteca pública
        </a>
      </motion.div>
    </div>
  </section>
);

export default FinalCTASection;
