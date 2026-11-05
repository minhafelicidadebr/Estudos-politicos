import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Heart, GraduationCap, DollarSign, Gavel, Building2, Landmark, Leaf, ShieldAlert, Newspaper,
  ArrowLeftRight, Swords, Gem, Layers, BookMarked, Church, Users,
  UserCheck, Baby, Cpu, Building, Plane, Palette, Radio, TrendingDown, AlertTriangle, CloudSun, Briefcase, Sparkles,
} from "lucide-react";

const levels = [
  { id: "L1", label: "Arquitetura do Produto", color: "#3B82F6", summary: "O que este sistema existe para fazer", detail: "Define a missão, o público, os módulos e as interfaces. Garante que cada parte do produto serve a um propósito claro e auditável." },
  { id: "L2", label: "Arquitetura Metodológica", color: "#8B5CF6", summary: "Como adaptar o framework ao país", detail: "Adapta automaticamente eixos, fontes e pesos com base no regime político, maturidade estatística e contexto histórico de cada nação." },
  { id: "L3", label: "Arquitetura Analítica", color: "#06B6D4", summary: "O que os dados realmente sustentam", detail: "Aplica análise bayesiana de confiança, triangulação de fontes e declaração explícita de incerteza em cada afirmação." },
  { id: "L4", label: "Arquitetura Pedagógica", color: "#22C55E", summary: "Como transformar complexidade em compreensão", detail: "Estrutura o conteúdo em 3 camadas de profundidade (leigo, gestor, especialista) com narrativa adaptativa e gamificação epistêmica." },
  { id: "L5", label: "Arquitetura de Governança", color: "#F59E0B", summary: "Como garantir rastreabilidade e segurança", detail: "Cada análise carrega uma trilha de auditoria completa: prompt, modelo, fontes, confiança declarada e resultado de validação cruzada." },
  { id: "L6", label: "Arquitetura de Inovação", color: "#EC4899", summary: "Como o sistema aprende e evolui", detail: "Módulos de feedback, versionamento de prompts e AR+ garantem que o sistema melhora continuamente sem comprometer rigor." },
];

const axisA = [
  { name: "Saúde", icon: Heart },
  { name: "Educação", icon: GraduationCap },
  { name: "Economia", icon: DollarSign },
  { name: "Justiça", icon: Gavel },
  { name: "Infraestrutura", icon: Building2 },
  { name: "Governança", icon: Landmark },
  { name: "Ambiente", icon: Leaf },
  { name: "Segurança", icon: ShieldAlert },
  { name: "Informação Política", icon: Newspaper },
];

const axisB = [
  { name: "Transição Democrática", icon: ArrowLeftRight },
  { name: "Conflito", icon: Swords },
  { name: "Recursos Naturais", icon: Gem },
  { name: "Federalismo", icon: Layers },
  { name: "Pós-Colonial", icon: BookMarked },
  { name: "Religião-Estado", icon: Church },
  { name: "Diáspora", icon: Users },
];

const axisC = [
  { name: "Gênero", icon: UserCheck },
  { name: "Juventude", icon: Baby },
  { name: "Tecnologia", icon: Cpu },
  { name: "Urbanização", icon: Building },
  { name: "Migração", icon: Plane },
  { name: "Cultura", icon: Palette },
  { name: "Mídia", icon: Radio },
  { name: "Desigualdade", icon: TrendingDown },
  { name: "Corrupção", icon: AlertTriangle },
  { name: "Clima", icon: CloudSun },
  { name: "Trabalho", icon: Briefcase },
  { name: "Inovação Social", icon: Sparkles },
];

const axisMeta = {
  A: { label: "Universal", color: "#3B82F6", badge: "Todos os países", desc: "Aplicados a todos os 190+ países. Formam a espinha dorsal de qualquer análise.", axes: axisA },
  B: { label: "Estrutural", color: "#8B5CF6", badge: "Ativação automática", desc: "Ativados automaticamente com base no regime e contexto histórico do país.", axes: axisB },
  C: { label: "Modular", color: "#06B6D4", badge: "Seleção do usuário", desc: "Escolhidos pelo usuário para análise aprofundada. Máximo de 4 simultâneos.", axes: axisC },
};

const confidenceZones = [
  { label: "Alta", range: "≥ 0.85", color: "#22C55E", desc: "Dados oficiais, séries longas, fontes concordantes", barWidth: "92%" },
  { label: "Moderada", range: "0.65–0.84", color: "#F59E0B", desc: "Dados parciais, fontes limitadas mas coerentes", barWidth: "72%" },
  { label: "Baixa", range: "0.45–0.64", color: "#EF4444", desc: "Inferência necessária, dados conflitantes", barWidth: "48%" },
  { label: "Inconclusiva", range: "< 0.45", color: "#6B7280", desc: "Dados insuficientes para afirmação confiável", barWidth: "25%" },
];

const MethodologyVisualSection = () => {
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);
  const [activeAxis, setActiveAxis] = useState<"A" | "B" | "C">("A");

  const currentAxis = axisMeta[activeAxis];

  return (
    <section id="methodology" className="py-[clamp(5rem,10vw,9rem)]">
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <p className="text-xs uppercase tracking-[0.25em] text-brand-accent font-medium mb-4">
            Rigor que você pode auditar
          </p>
          <h2 className="font-display text-display-lg text-neutral-50">A Metodologia</h2>
        </motion.div>

        {/* Subsection 1 — ToT Visualizer */}
        <div className="mb-28">
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-display text-heading-xl text-neutral-50 mb-2"
          >
            Como a análise é construída
          </motion.h3>
          <p className="text-neutral-400 mb-10">Um framework de 6 camadas que nenhum viés consegue atravessar inteiro.</p>

          <div className="space-y-3">
            {levels.map((level, i) => (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl border overflow-hidden cursor-pointer transition-all duration-300"
                style={{
                  borderColor: expandedLevel === level.id ? `${level.color}80` : "rgba(45,45,45,0.5)",
                  background: expandedLevel === level.id ? `${level.color}08` : "rgba(255,255,255,0.03)",
                }}
                onClick={() => setExpandedLevel(expandedLevel === level.id ? null : level.id)}
              >
                <div className="flex items-center gap-4 p-5">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ backgroundColor: `${level.color}20`, color: level.color }}
                  >
                    {level.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-neutral-50">{level.label}</span>
                    <p className="text-xs text-neutral-400 mt-0.5 hidden sm:block">{level.summary}</p>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedLevel === level.id ? 180 : 0 }}
                    className="text-neutral-400 shrink-0"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  </motion.div>
                </div>
                <AnimatePresence>
                  {expandedLevel === level.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 text-sm text-neutral-300 border-t pt-4" style={{ borderColor: `${level.color}20` }}>
                        {level.detail}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Subsection 2 — Axis System — REDESIGNED */}
        <div className="mb-28">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
          >
            <div>
              <h3 className="font-display text-heading-xl text-neutral-50 mb-2">
                28 Eixos de Análise
              </h3>
              <p className="text-neutral-400">Três camadas: universal, estrutural e modular.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-neutral-50">28</span>
              <div className="flex flex-col text-xs text-neutral-400">
                <span>eixos</span>
                <span>analíticos</span>
              </div>
            </div>
          </motion.div>

          {/* Axis tabs — pill style */}
          <div className="flex flex-wrap gap-2 mb-8">
            {(Object.keys(axisMeta) as Array<"A" | "B" | "C">).map((key) => {
              const layer = axisMeta[key];
              const isActive = activeAxis === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveAxis(key)}
                  className="relative px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 border"
                  style={{
                    borderColor: isActive ? layer.color : "rgba(45,45,45,0.5)",
                    backgroundColor: isActive ? `${layer.color}12` : "transparent",
                    color: isActive ? layer.color : "hsl(0 0% 54%)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: layer.color, opacity: isActive ? 1 : 0.4 }} />
                    <span>Camada {key}</span>
                    <span className="text-xs opacity-60">— {layer.label}</span>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="axis-indicator"
                      className="absolute -bottom-px left-4 right-4 h-0.5 rounded-full"
                      style={{ backgroundColor: layer.color }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active axis content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeAxis}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="rounded-2xl border p-8"
              style={{
                borderColor: `${currentAxis.color}25`,
                background: `linear-gradient(135deg, ${currentAxis.color}06 0%, transparent 60%)`,
              }}
            >
              {/* Meta bar */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span
                  className="px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: `${currentAxis.color}18`, color: currentAxis.color }}
                >
                  {currentAxis.badge}
                </span>
                <span className="text-sm text-neutral-400">
                  {currentAxis.axes.length} eixos
                </span>
                <span className="text-xs text-neutral-600 hidden sm:block">•</span>
                <span className="text-xs text-neutral-400 hidden sm:block">{currentAxis.desc}</span>
              </div>

              {/* Axis grid — visual cards */}
              <div className={`grid gap-3 ${
                activeAxis === "C" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" :
                activeAxis === "A" ? "grid-cols-3 lg:grid-cols-9" :
                "grid-cols-2 sm:grid-cols-3 lg:grid-cols-7"
              }`}>
                {currentAxis.axes.map((axis, i) => {
                  const Icon = axis.icon;
                  return (
                    <motion.div
                      key={axis.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                      className="group flex flex-col items-center gap-2.5 py-4 px-3 rounded-xl border border-neutral-700/30 hover:border-opacity-60 transition-all duration-300 cursor-default"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                        style={{ backgroundColor: `${currentAxis.color}12` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: currentAxis.color }} />
                      </div>
                      <span className="text-[11px] text-neutral-300 text-center leading-tight font-medium">
                        {axis.name}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Subsection 3 — Confidence System — REDESIGNED */}
        <div>
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-display text-heading-xl text-neutral-50 mb-2"
          >
            Cada afirmação tem um endereço.
          </motion.h3>
          <p className="text-neutral-400 mb-10">Sistema de confiança bayesiana + cadeia de custódia de evidência.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {confidenceZones.map((zone, i) => (
              <motion.div
                key={zone.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-neutral-700/40 p-6 hover:border-opacity-80 transition-all group"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: zone.color, boxShadow: `0 0 12px ${zone.color}40` }} />
                  <span className="font-semibold text-neutral-50">{zone.label}</span>
                </div>
                {/* Visual bar */}
                <div className="w-full h-1.5 rounded-full bg-neutral-800 mb-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: zone.barWidth }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: zone.color }}
                  />
                </div>
                <p className="text-xs text-neutral-400 mb-2 font-mono">{zone.range}</p>
                <p className="text-sm text-neutral-400">{zone.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MethodologyVisualSection;
