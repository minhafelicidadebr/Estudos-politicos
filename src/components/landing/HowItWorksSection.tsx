import { motion } from "framer-motion";
import { Globe, Users, BarChart3, Download } from "lucide-react";

const steps = [
  {
    number: "01", title: "Escolha seu país",
    description: "Selecione entre 190+ países. O sistema identifica automaticamente a capital, o regime, os ciclos históricos e adapta todo o framework.",
    icon: Globe,
  },
  {
    number: "02", title: "Conheça o avatar",
    description: "Cada país tem um guia cultural de IA — com nome, narrativa e tom inspirados naquela sociedade. Intelectualmente convidativo, nunca folclórico.",
    icon: Users,
  },
  {
    number: "03", title: "Explore com profundidade",
    description: "Analise eixos, compare governos, explore a capital, confronte indicadores com fontes primárias. Em três camadas: leigo, gestor ou especialista.",
    icon: BarChart3,
  },
  {
    number: "04", title: "Exporte e compartilhe",
    description: "Gere relatórios, PDFs premium, infográficos, apresentações ou roteiros de vídeo. Cada output com trilha de auditoria completa.",
    icon: Download,
  },
];

const HowItWorksSection = () => (
  <section className="py-[clamp(5rem,10vw,9rem)] border-t border-neutral-700/30">
    <div className="max-w-[1280px] mx-auto px-6">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-display text-display-lg text-neutral-50 text-center mb-16"
      >
        Em 4 passos, de dúvida a compreensão.
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, duration: 0.5 }}
            className="relative"
          >
            <span className="font-display text-5xl text-brand-accent/20 font-light">{step.number}</span>
            <div className="mt-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: 'rgba(201,168,76,0.1)' }}>
                <step.icon className="w-5 h-5 text-brand-accent" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-50 mb-2">{step.title}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
