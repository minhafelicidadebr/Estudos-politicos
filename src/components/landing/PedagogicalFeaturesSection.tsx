import { motion } from "framer-motion";
import { Clock, GitBranch, MessageSquare, Radar, Library, Award } from "lucide-react";

const features = [
  { icon: Clock, title: "Atlas de Trajetórias", description: "Linha do tempo interativa de cada país — marcos, crises, reformas, transições de poder." },
  { icon: GitBranch, title: "Laboratório de Contrafactuais", description: "Explore 'e se?' com rigor — nunca como previsão, sempre como ferramenta pedagógica de sensibilidade a políticas." },
  { icon: MessageSquare, title: "Tutor Socrático", description: "A IA não responde — ela questiona. Ajuda você a interpretar dados, não apenas lê-los." },
  { icon: Radar, title: "Radar de Polarização", description: "Analisa se sua leitura está excessivamente ideológica e oferece correções epistêmicas com delicadeza." },
  { icon: Library, title: "Oficina de Evidência", description: "Aprenda a ler fontes primárias, entender conflitos entre dados e avaliar robustez metodológica." },
  { icon: Award, title: "Trilhas e Certificação", description: "Microlições, quizzes de raciocínio (não memorização) e certificados por trilha temática." },
];

const PedagogicalFeaturesSection = () => (
  <section className="py-[clamp(5rem,10vw,9rem)]">
    <div className="max-w-[1280px] mx-auto px-6">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-display text-display-lg text-neutral-50 text-center mb-16"
      >
        Aprender política nunca foi assim.
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feat, i) => (
          <motion.div
            key={feat.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="p-6 rounded-xl border border-neutral-700/50 hover:border-brand-accent/20 transition-all"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <feat.icon className="w-6 h-6 text-brand-accent mb-4" />
            <h3 className="text-lg font-semibold text-neutral-50 mb-2">{feat.title}</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">{feat.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default PedagogicalFeaturesSection;
