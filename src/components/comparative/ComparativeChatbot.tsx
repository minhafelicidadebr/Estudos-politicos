/**
 * ComparativeChatbot — 6-phase conversational flow for Comparative Government Analysis
 */
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  HeartPulse, GraduationCap, TrendingUp, Scale, Zap, Shield, Leaf,
  ShieldAlert, Radio, AlertTriangle, Network, Vote, Flame, HandHeart,
  Calculator, Swords, Heart, Baby, Cpu, Building2, Plane, Palette,
  BarChart3, AlertOctagon, CloudLightning, Briefcase, Lightbulb,
  Check, BookOpen, Clock, ChevronRight, Users, Play, Pause, Info,
} from "lucide-react";
import { useComparativeStore } from "@/stores/comparativeStore";
import { getGovernmentsForCountry } from "@/data/governments";
import type { GovernmentRecord, UserDepthTier } from "@/types/aegis";

const AXIS_CONFIG: Record<string, { name: string; icon: React.ElementType; layer: 'A' | 'B' | 'C' }> = {
  A1: { name: 'Saúde Pública', icon: HeartPulse, layer: 'A' },
  A2: { name: 'Educação', icon: GraduationCap, layer: 'A' },
  A3: { name: 'Macroeconomia', icon: TrendingUp, layer: 'A' },
  A4: { name: 'Justiça e Corrupção', icon: Scale, layer: 'A' },
  A5: { name: 'Infraestrutura', icon: Zap, layer: 'A' },
  A6: { name: 'Governança Digital', icon: Shield, layer: 'A' },
  A7: { name: 'Meio Ambiente', icon: Leaf, layer: 'A' },
  A8: { name: 'Segurança Pública', icon: ShieldAlert, layer: 'A' },
  A9: { name: 'Liberdade de Informação', icon: Radio, layer: 'A' },
  B1: { name: 'Violência Estrutural', icon: AlertTriangle, layer: 'B' },
  B2: { name: 'Federalismo', icon: Network, layer: 'B' },
  B3: { name: 'Qualidade Democrática', icon: Vote, layer: 'B' },
  B4: { name: 'Soberania Energética', icon: Flame, layer: 'B' },
  B5: { name: 'Coesão Social', icon: HandHeart, layer: 'B' },
  B6: { name: 'Fiscal Subnacional', icon: Calculator, layer: 'B' },
  B7: { name: 'Conflito e Paz', icon: Swords, layer: 'B' },
  C1: { name: 'Gênero', icon: Heart, layer: 'C' },
  C2: { name: 'Juventude', icon: Baby, layer: 'C' },
  C3: { name: 'Tecnologia', icon: Cpu, layer: 'C' },
  C4: { name: 'Urbanização', icon: Building2, layer: 'C' },
  C5: { name: 'Migração', icon: Plane, layer: 'C' },
  C6: { name: 'Cultura', icon: Palette, layer: 'C' },
  C7: { name: 'Mídia', icon: Radio, layer: 'C' },
  C8: { name: 'Desigualdade', icon: BarChart3, layer: 'C' },
  C9: { name: 'Corrupção', icon: AlertOctagon, layer: 'C' },
  C10: { name: 'Clima', icon: CloudLightning, layer: 'C' },
  C11: { name: 'Trabalho', icon: Briefcase, layer: 'C' },
  C12: { name: 'Inovação Social', icon: Lightbulb, layer: 'C' },
};

const LAYER_COLORS = { A: 'hsl(var(--axis-a))', B: 'hsl(var(--axis-b))', C: 'hsl(var(--axis-c))' };
const LAYER_BG = { A: 'hsl(var(--axis-a) / 0.1)', B: 'hsl(var(--axis-b) / 0.1)', C: 'hsl(var(--axis-c) / 0.1)' };

const BR_AUTO_B = ['B1', 'B3'];

interface Props {
  countryId: string;
  countryName: string;
  onStartAnalysis: () => void;
}

export function ComparativeChatbot({ countryId, countryName, onStartAnalysis }: Props) {
  const store = useComparativeStore();
  const session = store.session;
  const [showMethodology, setShowMethodology] = useState(false);
  const governments = getGovernmentsForCountry(countryId.toUpperCase());
  const phase = session?.phase || 'welcome';

  const selectedGovCount = session?.selectedGovernments.length || 0;
  const selectedAxes = session?.selectedAxes || [];
  const cLayerSelected = selectedAxes.filter(a => a.startsWith('C')).length;

  function handleStartFlow() {
    store.initSession(countryId.toUpperCase(), countryName);
  }

  function handleConfirmGovernments() {
    store.setPhase('axis_selection');
  }

  function handleConfirmAxes() {
    store.setPhase('confirmation');
  }

  function handleLaunchAnalysis() {
    store.setPhase('analyzing');
    onStartAnalysis();
  }

  const tierLabels: Record<UserDepthTier, { label: string; desc: string }> = {
    cidadao: { label: 'Cidadão', desc: 'Linguagem simples e acessível' },
    gestor: { label: 'Gestor', desc: 'Termos técnicos explicados' },
    especialista: { label: 'Especialista', desc: 'Análise completa com nuances' },
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-neutral-700/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-accent/10 flex items-center justify-center">
            <span className="font-display text-xl text-brand-accent">Á</span>
          </div>
          <div>
            <h3 className="text-body-sm font-semibold text-neutral-50">Análise Comparativa</h3>
            <p className="text-micro text-neutral-500">{countryName}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="wait">
          {/* ═══ WELCOME ═══ */}
          {phase === 'welcome' && (
            <motion.div key="welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="p-5 rounded-2xl border border-brand-accent/20 bg-brand-accent/5">
                <p className="text-body-md text-neutral-200 leading-relaxed mb-4">
                  Olá! Sou o assistente analítico do <strong className="text-brand-accent">Ágora</strong>. Vou guiar você por uma análise comparativa rigorosa dos governos de <strong className="text-neutral-50">{countryName}</strong>.
                </p>
                <p className="text-body-sm text-neutral-400 mb-4">
                  Utilizamos o framework <strong>PIR+</strong> (Perspectiva, Imparcialidade, Rigor) com 28 eixos analíticos, validação cruzada e trilha de auditoria completa.
                </p>
                {governments.length === 0 ? (
                  <div className="p-4 rounded-xl border border-semantic-warning/30 bg-semantic-warning/5">
                    <p className="text-body-sm text-neutral-300">
                      Dados históricos de <strong>{countryName}</strong> em preparação. Experimente: 🇧🇷 Brasil, 🇺🇸 EUA, 🇩🇪 Alemanha ou 🇺🇾 Uruguai.
                    </p>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowMethodology(!showMethodology)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-200 transition-all text-body-sm"
                    >
                      <BookOpen className="w-4 h-4" /> Metodologia
                    </button>
                    <button
                      onClick={handleStartFlow}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-accent text-brand-primary font-semibold hover:scale-105 transition-transform text-body-sm"
                    >
                      <Play className="w-4 h-4" /> Começar Análise
                    </button>
                  </div>
                )}
              </div>

              {showMethodology && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-4 rounded-xl border border-neutral-700/30 bg-white/[0.02] space-y-3">
                  <h4 className="text-body-sm font-semibold text-neutral-50">Framework PIR+</h4>
                  {[
                    { label: 'TESE', desc: 'Argumentos favoráveis com fontes declaradas', color: 'text-confidence-high' },
                    { label: 'ANTÍTESE', desc: 'Críticas e contrafatuais com fontes', color: 'text-semantic-warning' },
                    { label: 'DADOS PRIMÁRIOS', desc: 'Decidem a nota — nunca fabricados', color: 'text-axis-a' },
                    { label: 'VCO', desc: 'Validação cruzada independente', color: 'text-axis-b' },
                  ].map(item => (
                    <div key={item.label} className="flex items-start gap-3">
                      <span className={`font-mono text-micro font-bold ${item.color} shrink-0 w-20`}>{item.label}</span>
                      <span className="text-body-sm text-neutral-400">{item.desc}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ═══ COUNTRY CONTEXT — Select Governments ═══ */}
          {phase === 'country_context' && (
            <motion.div key="country_context" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <p className="text-body-sm text-neutral-300 mb-4">
                Selecione entre <strong className="text-neutral-50">2 e 5 governos</strong> para comparar:
              </p>
              <div className="space-y-2 mb-4">
                {governments.map((gov) => {
                  const selected = session?.selectedGovernments.some(g => g.id === gov.id);
                  return (
                    <button
                      key={gov.id}
                      onClick={() => store.toggleGovernment(gov)}
                      aria-pressed={selected}
                      aria-label={`${gov.name} (${gov.yearStart}–${gov.yearEnd ?? 'presente'})`}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                        selected
                          ? 'border-brand-accent/50 bg-brand-accent/10'
                          : 'border-neutral-700/30 hover:border-neutral-600'
                      }`}
                    >
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: gov.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-body-sm font-medium text-neutral-50 truncate">{gov.name}</span>
                          {selected && <Check className="w-3.5 h-3.5 text-brand-accent shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2 text-micro text-neutral-500">
                          <span>{gov.leaderName} · {gov.party}</span>
                          <span>·</span>
                          <span className="font-mono">{gov.yearStart}–{gov.yearEnd ?? 'atual'}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-micro font-medium ${
                        gov.analyticalMaturity === 'Alta' ? 'bg-confidence-high/10 text-confidence-high' :
                        gov.analyticalMaturity === 'Média' ? 'bg-confidence-medium/10 text-confidence-medium' :
                        'bg-neutral-700 text-neutral-400'
                      }`}>
                        {gov.analyticalMaturity}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-micro text-neutral-500">{selectedGovCount}/5 selecionados</span>
                <button
                  onClick={handleConfirmGovernments}
                  disabled={selectedGovCount < 2}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-accent text-brand-primary font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 transition-transform text-body-sm"
                >
                  Confirmar Governos <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══ AXIS SELECTION ═══ */}
          {phase === 'axis_selection' && (
            <motion.div key="axis_selection" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <p className="text-body-sm text-neutral-300 mb-4">
                Selecione os eixos de análise. Camadas A (universal) e B (estrutural) recomendadas. Camada C: até 4 eixos modulares.
              </p>

              {/* Tier selector */}
              <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-neutral-700/30 mb-4">
                {(Object.entries(tierLabels) as [UserDepthTier, { label: string; desc: string }][]).map(([tier, info]) => (
                  <button
                    key={tier}
                    onClick={() => store.setUserTier(tier)}
                    className={`flex-1 px-3 py-2 rounded-lg text-micro font-medium transition-all ${
                      session?.userTier === tier ? 'bg-brand-accent text-brand-primary' : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {info.label}
                  </button>
                ))}
              </div>

              {(['A', 'B', 'C'] as const).map(layer => {
                const axes = Object.entries(AXIS_CONFIG).filter(([, v]) => v.layer === layer);
                const layerLabel = layer === 'A' ? 'Camada A — Universal' : layer === 'B' ? 'Camada B — Estrutural' : 'Camada C — Modular';
                return (
                  <div key={layer} className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-micro font-bold" style={{ backgroundColor: LAYER_BG[layer], color: LAYER_COLORS[layer] }}>
                        {layerLabel}
                      </span>
                      {layer === 'C' && <span className="text-micro text-neutral-500">{cLayerSelected}/4</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {axes.map(([id, cfg]) => {
                        const selected = selectedAxes.includes(id);
                        const autoActivated = layer === 'B' && BR_AUTO_B.includes(id) && countryId.toUpperCase() === 'BR';
                        const disabled = layer === 'C' && !selected && cLayerSelected >= 4;
                        const Icon = cfg.icon;
                        return (
                          <button
                            key={id}
                            onClick={() => store.toggleAxis(id)}
                            disabled={disabled}
                            aria-pressed={selected}
                            aria-label={`${id}: ${cfg.name}`}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all text-micro ${
                              selected
                                ? 'border-brand-accent/40 bg-brand-accent/10 text-neutral-50'
                                : disabled
                                  ? 'border-neutral-800 text-neutral-600 cursor-not-allowed'
                                  : 'border-neutral-700/30 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: selected ? LAYER_COLORS[layer] : undefined }} />
                            <span className="truncate">{id} {cfg.name}</span>
                            {selected && <Check className="w-3 h-3 text-brand-accent shrink-0 ml-auto" />}
                            {autoActivated && !selected && (
                              <span className="text-[9px] text-axis-b ml-auto">AUTO</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <button
                onClick={handleConfirmAxes}
                disabled={selectedAxes.length === 0}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-brand-accent text-brand-primary font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 transition-transform text-body-sm mt-2"
              >
                Iniciar Análise ({selectedAxes.length} eixos) <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* ═══ CONFIRMATION ═══ */}
          {phase === 'confirmation' && session && (
            <motion.div key="confirmation" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="p-5 rounded-2xl border border-brand-accent/20 bg-brand-accent/5 space-y-4">
                <h4 className="text-body-md font-semibold text-neutral-50">Resumo da Análise</h4>

                <div className="space-y-2 text-body-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">País</span>
                    <span className="text-neutral-50 font-medium">{session.countryName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Governos</span>
                    <span className="text-neutral-50 font-medium">{session.selectedGovernments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Eixos</span>
                    <span className="text-neutral-50 font-medium">{session.selectedAxes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Profundidade</span>
                    <span className="text-neutral-50 font-medium capitalize">{session.userTier}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-neutral-700/30">
                  <Clock className="w-4 h-4 text-neutral-500 shrink-0" />
                  <span className="text-micro text-neutral-400">
                    Estimativa: ~{session.selectedAxes.length * 45}s ({session.selectedAxes.length} eixos × 45s)
                  </span>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-xl bg-semantic-info/5 border border-semantic-info/20">
                  <Info className="w-4 h-4 text-semantic-info shrink-0 mt-0.5" />
                  <p className="text-micro text-neutral-400">
                    Cada eixo é analisado individualmente com o framework PIR+. Você verá os resultados em tempo real conforme forem gerados.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => store.setPhase('axis_selection')}
                    className="flex-1 px-4 py-2.5 rounded-full border border-neutral-700 text-neutral-400 hover:text-neutral-200 transition-all text-body-sm"
                  >
                    Ajustar
                  </button>
                  <button
                    onClick={handleLaunchAnalysis}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-brand-accent text-brand-primary font-semibold hover:scale-105 transition-transform text-body-sm"
                  >
                    <Play className="w-4 h-4" /> Confirmar e Iniciar
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ ANALYZING ═══ */}
          {phase === 'analyzing' && session && (
            <motion.div key="analyzing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="space-y-3">
                {session.selectedAxes.map((axisId, i) => {
                  const cfg = AXIS_CONFIG[axisId];
                  const completed = i < session.currentAxisIndex;
                  const current = i === session.currentAxisIndex && store.isAnalyzing;
                  const Icon = cfg?.icon || BarChart3;
                  return (
                    <div key={axisId} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      completed ? 'border-confidence-high/30 bg-confidence-high/5' :
                      current ? 'border-brand-accent/30 bg-brand-accent/5 animate-pulse' :
                      'border-neutral-700/20 opacity-40'
                    }`}>
                      <Icon className="w-4 h-4 shrink-0" style={{ color: completed ? 'hsl(var(--confidence-high))' : current ? 'hsl(var(--brand-accent))' : undefined }} />
                      <span className={`text-body-sm flex-1 ${completed ? 'text-neutral-300' : current ? 'text-neutral-50 font-medium' : 'text-neutral-600'}`}>
                        {axisId} — {cfg?.name}
                      </span>
                      {completed && <Check className="w-4 h-4 text-confidence-high" />}
                      {current && <span className="text-micro text-brand-accent animate-pulse">Analisando...</span>}
                    </div>
                  );
                })}

                {store.error && (
                  <div className="p-3 rounded-xl border border-semantic-error/30 bg-semantic-error/5">
                    <p className="text-body-sm text-semantic-error">{store.error}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ═══ AXIS TRANSITION ═══ */}
          {phase === 'axis_transition' && session && session.completedAxes.length > 0 && (
            <motion.div key="axis_transition" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="p-4 rounded-2xl border border-confidence-high/20 bg-confidence-high/5 mb-4">
                <p className="text-body-sm text-neutral-300 mb-3">
                  ✓ <strong className="text-neutral-50">{session.completedAxes[session.completedAxes.length - 1].axisName}</strong> concluído
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {session.completedAxes[session.completedAxes.length - 1].governmentScores.slice(0, 4).map(gs => (
                    <div key={gs.governmentId} className="p-2 rounded-lg bg-white/[0.03] border border-neutral-700/20">
                      <p className="text-micro text-neutral-500 truncate">{gs.governmentName}</p>
                      <p className="font-display text-heading-md text-brand-accent">
                        {gs.score !== null ? gs.score.toFixed(1) : 'S/D'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { store.setPhase('analyzing'); onStartAnalysis(); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-brand-accent text-brand-primary font-semibold hover:scale-105 transition-transform text-body-sm"
                >
                  Continuar <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => store.setPhase('complete')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-neutral-700 text-neutral-400 hover:text-neutral-200 transition-all text-body-sm"
                >
                  <Pause className="w-4 h-4" /> Pausar
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══ SYNTHESIS / COMPLETE ═══ */}
          {(phase === 'synthesis' || phase === 'complete') && session && (
            <motion.div key="complete" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="p-5 rounded-2xl border border-confidence-high/20 bg-confidence-high/5">
                <h4 className="text-body-md font-semibold text-neutral-50 mb-2">
                  ✓ Análise Concluída
                </h4>
                <p className="text-body-sm text-neutral-400 mb-4">
                  {session.completedAxes.length} eixos analisados para {session.selectedGovernments.length} governos de {session.countryName}.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => store.resetSession()}
                    className="flex-1 px-4 py-2.5 rounded-full border border-neutral-700 text-neutral-400 hover:text-neutral-200 transition-all text-body-sm"
                  >
                    Nova Análise
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
