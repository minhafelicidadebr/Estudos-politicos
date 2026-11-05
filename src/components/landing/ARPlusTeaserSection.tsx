import { motion } from "framer-motion";

const ARPlusTeaserSection = () => (
  <section className="py-[clamp(5rem,10vw,9rem)] border-t border-neutral-700/30">
    <div className="max-w-[1280px] mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs uppercase tracking-[0.25em] text-brand-accent font-medium mb-4">Módulo AR+</p>
          <h2 className="font-display text-heading-xl text-neutral-50 mb-4 leading-tight">
            E se a IA estiver te mostrando política diferente do que mostra para outra pessoa?
          </h2>
          <p className="text-neutral-400 leading-relaxed mb-8">
            O módulo AR+ audita assimetrias de resposta em sistemas de IA — por idioma, localidade, perfil cultural e contexto político.
          </p>
          <button className="border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-brand-primary transition-all px-6 py-3 rounded-full text-sm font-medium">
            Entender o módulo AR+
          </button>
        </motion.div>

        {/* Visual — Symmetry diagram */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 gap-4"
        >
          {["Perfil A — São Paulo, BR", "Perfil B — Berlin, DE"].map((profile, i) => (
            <div
              key={profile}
              className="rounded-xl border border-neutral-700/50 p-5"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <p className="text-xs text-neutral-400 mb-3 font-mono">{profile}</p>
              <div className="space-y-2">
                <div className="h-2 rounded-full" style={{ width: i === 0 ? "80%" : "60%", backgroundColor: i === 0 ? "#3B82F6" : "#8B5CF6" }} />
                <div className="h-2 rounded-full" style={{ width: i === 0 ? "65%" : "85%", backgroundColor: i === 0 ? "#3B82F6" : "#8B5CF6" }} />
                <div className="h-2 rounded-full" style={{ width: i === 0 ? "70%" : "45%", backgroundColor: i === 0 ? "#3B82F6" : "#8B5CF6" }} />
              </div>
              <p className="text-xs text-neutral-600 mt-3">
                {i === 0 ? "Resposta enfatiza estabilidade" : "Resposta enfatiza desafios"}
              </p>
            </div>
          ))}
          <div className="col-span-2 text-center">
            <span className="text-xs text-brand-accent font-mono">Δ assimetria detectada: 23.4%</span>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default ARPlusTeaserSection;
