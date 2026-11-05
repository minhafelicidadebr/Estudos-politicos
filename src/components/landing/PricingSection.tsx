import { motion } from "framer-motion";
import { Check } from "lucide-react";

const tiers = [
  {
    id: "free", name: "Explorador", price: "Grátis", description: "Para quem quer começar a entender política com método",
    features: ["3 análises por mês", "Camada 1 (leigos)", "5 países", "PDF básico"],
    cta: "Começar grátis", featured: false,
  },
  {
    id: "pro", name: "Analista", price: "R$ 59", period: "/mês", description: "Para jornalistas, gestores e pesquisadores",
    features: ["Análises ilimitadas", "Camadas 1, 2 e 3", "Todos os países e capitais", "PDF premium + infográfico + slides", "Trilhas de aprendizagem", "Exportação multimodal"],
    cta: "Começar 14 dias grátis", featured: true,
  },
  {
    id: "institutional", name: "Institucional", price: "Sob consulta", description: "Para universidades, think tanks, agências e organizações",
    features: ["Tudo do Analista", "Módulo AR+ completo", "API access", "White-label disponível", "Suporte dedicado", "Treinamento da equipe"],
    cta: "Falar com o time", featured: false,
  },
];

const PricingSection = () => (
  <section className="py-[clamp(5rem,10vw,9rem)]" id="pricing">
    <div className="max-w-[1280px] mx-auto px-6">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-display text-display-lg text-neutral-50 text-center mb-4"
      >
        Planos
      </motion.h2>
      <p className="text-center text-neutral-400 mb-16 max-w-xl mx-auto">
        Comece grátis. Evolua quando precisar de mais profundidade.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {tiers.map((tier, i) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-2xl p-8 border ${
              tier.featured
                ? "border-brand-accent/50 shadow-glow-accent"
                : "border-neutral-700/50"
            }`}
            style={{ background: tier.featured ? "rgba(201,168,76,0.05)" : "rgba(255,255,255,0.03)" }}
          >
            {tier.featured && (
              <span className="text-xs uppercase tracking-widest text-brand-accent font-semibold mb-4 block">
                Mais popular
              </span>
            )}
            <h3 className="text-xl font-semibold text-neutral-50 mb-1">{tier.name}</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-3xl font-bold text-neutral-50">{tier.price}</span>
              {tier.period && <span className="text-sm text-neutral-400">{tier.period}</span>}
            </div>
            <p className="text-sm text-neutral-400 mb-6">{tier.description}</p>
            <ul className="space-y-3 mb-8">
              {tier.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-neutral-200">
                  <Check className="w-4 h-4 text-brand-accent shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              className={`w-full py-3 rounded-full text-sm font-semibold transition-all ${
                tier.featured
                  ? "bg-brand-accent text-brand-primary hover:scale-105"
                  : "border border-neutral-700 text-neutral-200 hover:border-brand-accent hover:text-brand-accent"
              }`}
            >
              {tier.cta}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default PricingSection;
