import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, Scale, GraduationCap, X, BookOpen, Shield, Target, Lightbulb, type LucideIcon } from "lucide-react";
import { useState } from "react";

interface ValuePropCardProps {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  body: string;
  ctaLabel: string;
  index: number;
}

const ValuePropCard = ({ icon: Icon, iconColor, title, body, ctaLabel, index }: ValuePropCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
    className="group p-8 rounded-2xl border border-neutral-700/50 hover:border-brand-accent/30 transition-all duration-300 hover:-translate-y-1"
    style={{ background: 'rgba(255,255,255,0.06)' }}
  >
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
      style={{ backgroundColor: `${iconColor}26` }}
    >
      <Icon className="w-6 h-6" style={{ color: iconColor }} />
    </div>
    <h3 className="text-xl font-semibold text-neutral-50 mb-3">{title}</h3>
    <p className="text-base text-neutral-400 leading-relaxed mb-6">{body}</p>
    <button className="text-sm text-brand-accent hover:text-brand-accent-bright transition-colors">
      {ctaLabel}
    </button>
  </motion.div>
);

const cards = [
  {
    icon: FlaskConical, iconColor: "#3B82F6",
    title: "Análise com DNA de pesquisa",
    body: "Cada afirmação rastreada a uma fonte primária. Cada inferência com nível de confiança declarado. Cada comparação com par justificado metodologicamente.",
    ctaLabel: "Ver protocolo anti-alucinação →",
  },
  {
    icon: Scale, iconColor: "#8B5CF6",
    title: "Imparcialidade operacional",
    body: "Governos de esquerda, direita e centro analisados com o mesmo protocolo. Tese e antítese obrigatórias. Nenhuma narrativa ideológica privilegiada.",
    ctaLabel: "Como funciona o PIR+ →",
  },
  {
    icon: GraduationCap, iconColor: "#06B6D4",
    title: "Não apenas informa — ensina",
    body: "Três camadas de profundidade para leigos, gestores e especialistas. Trilhas de aprendizagem, tutor socrático e laboratório de contrafactuais.",
    ctaLabel: "Explorar trilhas de aprendizagem →",
  },
];

const modalContent = {
  title: "O método por trás da promessa",
  subtitle: "Como a Ágora transforma ruído político em compreensão estruturada",
  pillars: [
    {
      icon: Shield,
      color: "#3B82F6",
      title: "Protocolo Anti-Alucinação",
      description: "Cada afirmação gerada por IA passa por verificação cruzada contra fontes primárias. Se o dado não pode ser rastreado, o sistema declara incerteza — nunca inventa.",
    },
    {
      icon: Target,
      color: "#8B5CF6",
      title: "Imparcialidade Estrutural (PIR+)",
      description: "O mesmo framework analítico é aplicado a governos de qualquer espectro. Tese e antítese são obrigatórias. A plataforma é projetada para resistir a vieses — inclusive os dos seus criadores.",
    },
    {
      icon: BookOpen,
      color: "#06B6D4",
      title: "Pedagogia em 3 Camadas",
      description: "Cada análise pode ser lida como cidadão curioso (L1), gestor ou jornalista (L2), ou pesquisador (L3). Você escolhe a profundidade — sem perder o rigor.",
    },
    {
      icon: Lightbulb,
      color: "#F59E0B",
      title: "Auditoria Algorítmica (AR+)",
      description: "O módulo AR+ testa se sistemas de IA respondem de forma diferente sobre o mesmo país, dependendo do idioma, localidade ou perfil do usuário. Transparência radical.",
    },
  ],
  closing: "A Ágora não é uma plataforma de opinião. É uma infraestrutura epistêmica — desenhada para que democracias funcionem melhor quando cidadãos compreendem melhor.",
};

const MethodologyModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl border border-neutral-700/50"
          style={{ background: "linear-gradient(180deg, hsl(216 55% 13%) 0%, hsl(216 60% 10%) 100%)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full border border-neutral-700 text-neutral-400 hover:text-neutral-50 hover:border-neutral-400 transition-all"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-brand-accent/8 blur-[100px] pointer-events-none" />

          <div className="relative p-8 sm:p-10">
            {/* Header */}
            <p className="text-xs uppercase tracking-[0.25em] text-brand-accent font-medium mb-3">
              Nosso compromisso metodológico
            </p>
            <h2 className="font-display text-heading-xl text-neutral-50 mb-2">
              {modalContent.title}
            </h2>
            <p className="text-neutral-400 text-sm mb-10 max-w-xl">
              {modalContent.subtitle}
            </p>

            {/* Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
              {modalContent.pillars.map((pillar, i) => (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  className="p-6 rounded-xl border border-neutral-700/40"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${pillar.color}18` }}
                  >
                    <pillar.icon className="w-5 h-5" style={{ color: pillar.color }} />
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-50 mb-2">{pillar.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">{pillar.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Closing */}
            <div className="border-t border-neutral-700/40 pt-6">
              <p className="text-sm text-neutral-200 leading-relaxed italic font-display">
                "{modalContent.closing}"
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const ValuePropSection = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section className="py-[clamp(5rem,10vw,9rem)]">
        <div className="max-w-[1280px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="font-display text-display-lg text-neutral-50 mb-4">
              O debate político afogou-se em ruído. Nós trouxemos o método de volta.
            </h2>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 text-sm text-brand-accent hover:text-brand-accent-bright transition-colors underline underline-offset-4 decoration-brand-accent/30 hover:decoration-brand-accent"
            >
              <BookOpen className="w-4 h-4" />
              Entenda nosso compromisso metodológico
            </button>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {cards.map((card, i) => (
              <ValuePropCard key={card.title} {...card} index={i} />
            ))}
          </div>
        </div>
      </section>
      <MethodologyModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default ValuePropSection;
