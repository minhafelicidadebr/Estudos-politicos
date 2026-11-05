/**
 * MethodologyPage — Full framework visualization
 * Sprint 10: TOT Visualizer, SIB Protocol, PIR+ Framework, VCO Pipeline
 */
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Brain, Layers, Shield, Scale, Eye, Cpu, Zap,
  ChevronRight, ArrowRight, Check, AlertTriangle,
  BookOpen, Target, FlaskConical, GitCompare,
  Database, FileCheck, BarChart3, Lock,
} from "lucide-react";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import { AISkillsPanel } from "@/components/comparative/AISkillsPanel";

/* ── TOT 6-Layer Pipeline ─────────────────────────── */
const totLayers = [
  { id: 1, icon: Layers, title: "Arquitetura do Produto", desc: "O que este sistema existe para fazer", color: "hsl(var(--axis-a))", detail: "Define a missão, público-alvo e propostas de valor. Garante que cada funcionalidade serve ao objetivo central: compreensão política qualificada." },
  { id: 2, icon: Target, title: "Arquitetura Metodológica", desc: "Como adaptar o framework ao país", color: "hsl(var(--axis-b))", detail: "Configura automaticamente eixos de análise (A, B, C), identifica o regime político, estrutura territorial e maturidade estatística." },
  { id: 3, icon: FlaskConical, title: "Arquitetura Analítica", desc: "O que os dados realmente sustentam", color: "hsl(var(--confidence-high))", detail: "Aplica o protocolo PIR+ (Tese → Antítese → Julgamento), cadeia de custódia de evidências e score de confiança bayesiano SIB." },
  { id: 4, icon: BookOpen, title: "Arquitetura Pedagógica", desc: "Como transformar complexidade em compreensão", color: "hsl(var(--axis-c))", detail: "Três camadas de profundidade (Leigo/Gestor/Especialista), avatares culturais, trilhas de aprendizagem e tutor socrático." },
  { id: 5, icon: Lock, title: "Arquitetura de Governança", desc: "Como garantir rastreabilidade e segurança", color: "hsl(var(--confidence-medium))", detail: "Validação cruzada VCO (GPT-4o), trilha de auditoria imutável, protocolo anti-alucinação e cadeia de custódia de dados." },
  { id: 6, icon: Zap, title: "Arquitetura de Inovação", desc: "Como o sistema aprende e evolui", color: "hsl(var(--brand-accent))", detail: "Módulo AR+ de auditoria algorítmica, versionamento de prompts, detecção de assimetria e transparência radical." },
];

/* ── SIB Confidence Pipeline ──────────────────────── */
const sibStages = [
  { icon: Database, label: "Dado bruto", desc: "Coleta de fontes primárias (WB, FMI, V-Dem...)" },
  { icon: FileCheck, label: "Validação de fonte", desc: "Classificação de tipo, data, instituição" },
  { icon: Layers, label: "Cadeia de custódia", desc: "Rastreabilidade completa de cada afirmação" },
  { icon: BarChart3, label: "Score SIB", desc: "Confiança bayesiana + cobertura + base" },
  { icon: Shield, label: "Anti-alucinação", desc: "Verificação contra fontes primárias" },
  { icon: GitCompare, label: "Validação VCO", desc: "Cross-validation com modelo independente" },
  { icon: Eye, label: "Output ao usuário", desc: "Com badges de confiança inline" },
];

const confidenceZones = [
  { min: 0.85, label: "Alta (≥0.85)", color: "hsl(var(--confidence-high))", desc: "Dados sustentam solidamente", example: "O PIB do Brasil cresceu 2.9% em 2023 (FMI WEO, out/2023)." },
  { min: 0.65, label: "Moderada (0.65–0.84)", color: "hsl(var(--confidence-medium))", desc: "Dados apontam com ressalvas", example: "A reforma tributária pode reduzir a complexidade em até 40% (estimativa TCU, dados parciais)." },
  { min: 0.45, label: "Baixa (0.45–0.64)", color: "hsl(var(--confidence-low))", desc: "Inferência plausível mas frágil", example: "A digitalização pode ter correlação com menor corrupção municipal (inferência cruzada, sem série robusta)." },
  { min: 0, label: "Inconclusiva (<0.45)", color: "hsl(var(--confidence-inconclusive))", desc: "Dados insuficientes", example: "Não há dados suficientes para avaliar o impacto em comunidades ribeirinhas." },
];

/* ── PIR+ Framework ───────────────────────────────── */
const pirStages = [
  { phase: "Tese", icon: ArrowRight, color: "hsl(var(--axis-a))", desc: "A posição sustentada pelos dados mais fortes. Baseada em fontes primárias verificadas." },
  { phase: "Antítese", icon: GitCompare, color: "hsl(var(--axis-b))", desc: "A posição contrária obrigatória. Garante que o outro lado do argumento sempre é apresentado." },
  { phase: "Julgamento", icon: Scale, color: "hsl(var(--brand-accent))", desc: "Síntese fundamentada que pesa ambos os lados. Nunca 'a verdade' — sempre 'o que os dados sustentam'." },
];

const MethodologyPage = () => {
  const [activeTot, setActiveTot] = useState(0);
  const [hoveredZone, setHoveredZone] = useState<number | null>(null);

  return (
    <>
      <NavBar />
      <main className="min-h-screen pt-16">
        {/* Header */}
        <section className="py-20 border-b border-neutral-700/30">
          <div className="max-w-[1280px] mx-auto px-6">
            <nav className="flex items-center gap-2 text-body-sm text-neutral-500 mb-8" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-neutral-200 transition-colors">Início</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-neutral-200">Metodologia</span>
            </nav>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="uppercase tracking-[0.25em] text-xs text-brand-accent font-medium mb-4">Framework completo</p>
              <h1 className="font-display text-display-2xl text-neutral-50 mb-4">A Metodologia Ágora</h1>
              <p className="text-body-lg text-neutral-400 max-w-2xl leading-relaxed">
                Um framework de 6 camadas, 28 eixos analíticos e protocolos de verificação cruzada
                que garantem que nenhum viés consegue atravessar o sistema inteiro.
              </p>
            </motion.div>
          </div>
        </section>

        {/* TOT Visualizer */}
        <section className="py-20" id="tot">
          <div className="max-w-[1280px] mx-auto px-6">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <h2 className="font-display text-display-lg text-neutral-50 mb-3">Como a análise é construída</h2>
              <p className="text-body-md text-neutral-400 mb-12 max-w-xl">Um framework de 6 camadas que nenhum viés consegue atravessar inteiro.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Left: Layer list */}
              <div className="space-y-3">
                {totLayers.map((layer, i) => (
                  <motion.button
                    key={layer.id}
                    onClick={() => setActiveTot(i)}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className={`w-full text-left p-5 rounded-xl border transition-all duration-300 ${
                      activeTot === i
                        ? 'border-brand-accent/40 bg-brand-accent/5'
                        : 'border-neutral-700/30 hover:border-neutral-600/50 bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${layer.color}15` }}
                      >
                        <layer.icon className="w-5 h-5" style={{ color: layer.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono text-micro text-neutral-600">0{layer.id}</span>
                          <h3 className="text-body-sm font-semibold text-neutral-50">{layer.title}</h3>
                        </div>
                        <p className="text-micro text-neutral-400">{layer.desc}</p>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${activeTot === i ? 'text-brand-accent rotate-90' : 'text-neutral-600'}`} />
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Right: Detail */}
              <motion.div
                key={activeTot}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:sticky lg:top-24 p-8 rounded-2xl border border-neutral-700/30"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${totLayers[activeTot].color}15` }}>
                  {(() => { const Icon = totLayers[activeTot].icon; return <Icon className="w-7 h-7" style={{ color: totLayers[activeTot].color }} />; })()}
                </div>
                <p className="font-mono text-micro text-neutral-600 mb-1">Camada 0{totLayers[activeTot].id} de 06</p>
                <h3 className="font-display text-heading-xl text-neutral-50 mb-3">{totLayers[activeTot].title}</h3>
                <p className="text-body-md text-neutral-300 leading-relaxed mb-6">{totLayers[activeTot].detail}</p>
                <div className="w-full h-1.5 rounded-full bg-neutral-700/50 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: totLayers[activeTot].color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${((activeTot + 1) / 6) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* PIR+ Framework */}
        <section className="py-20 border-t border-neutral-700/30" id="pir">
          <div className="max-w-[1280px] mx-auto px-6">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <p className="uppercase tracking-[0.25em] text-xs text-brand-accent font-medium mb-4">Protocolo de imparcialidade</p>
              <h2 className="font-display text-display-lg text-neutral-50 mb-3">PIR+ — Imparcialidade Radical</h2>
              <p className="text-body-md text-neutral-400 mb-12 max-w-xl">Cada análise apresenta obrigatoriamente tese, antítese e julgamento fundamentado.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {pirStages.map((stage, i) => (
                <motion.div
                  key={stage.phase}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className="relative p-8 rounded-2xl border border-neutral-700/30"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: `${stage.color}15` }}>
                    <stage.icon className="w-6 h-6" style={{ color: stage.color }} />
                  </div>
                  <h3 className="font-display text-heading-lg text-neutral-50 mb-3">{stage.phase}</h3>
                  <p className="text-body-sm text-neutral-400 leading-relaxed">{stage.desc}</p>
                  {i < pirStages.length - 1 && (
                    <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                      <ArrowRight className="w-6 h-6 text-neutral-600" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Example PIR */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl border border-brand-accent/20 bg-brand-accent/5"
            >
              <p className="text-micro text-brand-accent font-semibold uppercase tracking-wider mb-4">Exemplo PIR+ — Capital Humano (Brasil)</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-body-sm">
                <div>
                  <p className="text-neutral-50 font-semibold mb-1">Tese</p>
                  <p className="text-neutral-400 leading-relaxed">Expansão significativa do acesso ao ensino superior — de 11% (2001) para 21% (2019).</p>
                </div>
                <div>
                  <p className="text-neutral-50 font-semibold mb-1">Antítese</p>
                  <p className="text-neutral-400 leading-relaxed">Indicadores de qualidade estagnados: 50% dos jovens abaixo do nível básico em matemática (PISA 2022).</p>
                </div>
                <div>
                  <p className="text-neutral-50 font-semibold mb-1">Julgamento</p>
                  <p className="text-neutral-400 leading-relaxed">Progresso real em acesso, gargalo crítico em qualidade e equidade regional.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SIB Confidence Pipeline */}
        <section className="py-20 border-t border-neutral-700/30" id="sib">
          <div className="max-w-[1280px] mx-auto px-6">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <p className="uppercase tracking-[0.25em] text-xs text-brand-accent font-medium mb-4">Sistema de confiança</p>
              <h2 className="font-display text-display-lg text-neutral-50 mb-3">Cada afirmação tem um endereço.</h2>
              <p className="text-body-md text-neutral-400 mb-12 max-w-xl">Sistema de confiança bayesiana + cadeia de custódia de evidência.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Pipeline */}
              <div className="space-y-0">
                {sibStages.map((stage, i) => (
                  <motion.div
                    key={stage.label}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-4 relative"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full border border-neutral-700/50 bg-white/[0.04] flex items-center justify-center shrink-0 z-10">
                        <stage.icon className="w-4.5 h-4.5 text-brand-accent" />
                      </div>
                      {i < sibStages.length - 1 && (
                        <div className="w-px h-8 border-l border-dashed border-neutral-700/50" />
                      )}
                    </div>
                    <div className="pb-8">
                      <p className="text-body-sm font-semibold text-neutral-50">{stage.label}</p>
                      <p className="text-micro text-neutral-400">{stage.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Confidence scale */}
              <div>
                <h3 className="text-heading-md font-semibold text-neutral-50 mb-6">Escala de Confiança</h3>
                <div className="space-y-3">
                  {confidenceZones.map((zone, i) => (
                    <motion.div
                      key={zone.label}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      onMouseEnter={() => setHoveredZone(i)}
                      onMouseLeave={() => setHoveredZone(null)}
                      className="p-4 rounded-xl border border-neutral-700/30 bg-white/[0.02] cursor-pointer transition-all hover:border-neutral-600/50"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: zone.color }} />
                        <span className="text-body-sm font-semibold text-neutral-50">{zone.label}</span>
                      </div>
                      <p className="text-micro text-neutral-400 mb-2">{zone.desc}</p>
                      {hoveredZone === i && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-2 p-3 rounded-lg bg-white/[0.03] border border-neutral-700/30"
                        >
                          <p className="text-micro text-neutral-500 mb-1 font-semibold">Exemplo:</p>
                          <p className="text-micro text-neutral-300 italic font-mono">"{zone.example}"</p>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Example inline badge */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="mt-6 p-4 rounded-xl border border-confidence-medium/30 bg-confidence-medium/5"
                >
                  <p className="text-micro text-neutral-500 font-semibold uppercase tracking-wider mb-2">Exemplo de declaração SIB</p>
                  <p className="text-body-sm text-neutral-200 font-mono leading-relaxed">
                    "A reforma tributária pode reduzir a complexidade fiscal."
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-2 py-1 rounded bg-confidence-medium/10 text-confidence-medium text-micro font-mono">CONFIANÇA: 0.78</span>
                    <span className="px-2 py-1 rounded bg-neutral-700/50 text-neutral-400 text-micro font-mono">COBERTURA: 65%</span>
                    <span className="px-2 py-1 rounded bg-neutral-700/50 text-neutral-400 text-micro font-mono">BASE: Série com quebra</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* VCO Section */}
        <section className="py-20 border-t border-neutral-700/30" id="vco">
          <div className="max-w-[1280px] mx-auto px-6">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <p className="uppercase tracking-[0.25em] text-xs text-brand-accent font-medium mb-4">Validação cruzada</p>
              <h2 className="font-display text-display-lg text-neutral-50 mb-3">VCO — Validação Cruzada de Output</h2>
              <p className="text-body-md text-neutral-400 mb-12 max-w-xl">Um segundo modelo de IA (GPT-4o) verifica independentemente cada análise produzida pelo modelo primário (Claude).</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: FlaskConical, title: "Contradições internas", desc: "Verifica se a tese e antítese contradizem o julgamento sem justificativa." },
                { icon: BarChart3, title: "Consistência score-narrativa", desc: "Score alto com narrativa negativa? O VCO flagra a inconsistência." },
                { icon: AlertTriangle, title: "Risco de fonte única", desc: "Afirmações sustentadas por apenas uma fonte recebem alerta." },
                { icon: Check, title: "Aprovação ou bloqueio", desc: "Severidade crítica = análise bloqueada. Major = aviso. Minor = publicada." },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-xl border border-neutral-700/30 bg-white/[0.02]"
                >
                  <item.icon className="w-6 h-6 text-confidence-high mb-4" />
                  <h3 className="text-body-sm font-semibold text-neutral-50 mb-2">{item.title}</h3>
                  <p className="text-micro text-neutral-400 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Premium Skills Library */}
        <section className="py-20 border-t border-neutral-700/30" id="skills">
          <div className="max-w-[1280px] mx-auto px-6">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <p className="uppercase tracking-[0.25em] text-xs text-brand-accent font-medium mb-4">Biblioteca de skills</p>
              <h2 className="font-display text-display-lg text-neutral-50 mb-3">As 8 skills que orientam cada prompt</h2>
              <p className="text-body-md text-neutral-400 mb-12 max-w-2xl">
                Cada pesquisa do Ágora executa uma pilha de skills auditáveis por comitê pós-doutoral —
                do rigor econométrico à auditoria adversária. Clique em qualquer card para inspecionar princípios, método, salvaguardas e checklist de qualidade.
              </p>
            </motion.div>
            <AISkillsPanel />
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 border-t border-neutral-700/30">
          <div className="max-w-[1280px] mx-auto px-6 text-center">
            <h2 className="font-display text-display-lg text-neutral-50 mb-4">Pronto para analisar com método?</h2>
            <p className="text-body-md text-neutral-400 mb-8">Escolha um país e veja o framework em ação.</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-brand-accent text-brand-primary px-8 py-4 rounded-full font-semibold hover:scale-105 transition-transform text-body-sm"
            >
              <Brain className="w-5 h-5" />
              Iniciar análise
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default MethodologyPage;
