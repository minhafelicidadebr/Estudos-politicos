/**
 * Wellbeing Governance Map Page (JSON_24)
 * C-WBIG Dashboard with Easterlin Paradox Detector & VanderWeele 5-Domain Radar
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartHandshake, Brain, Users, TrendingUp, AlertTriangle, ArrowLeft, Info, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import {
  analyzeWellbeingGovernance,
  getAllGovernmentIds,
  getEasterlinTypeLabel,
  getEasterlinColor,
  getDivergenceLabel,
  type CWBIGResult,
  type EasterlinType,
} from '@/services/wellbeingGovernanceEngine';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
  LineChart, Line,
} from 'recharts';

const METHODOLOGY_LEVELS = {
  iniciante: {
    label: 'Iniciante',
    content: 'Imagine que seu salário dobrou, mas você trabalha 14 horas por dia, não vê mais seus filhos, e sente ansiedade constante. Você ficou \'rico\' mas não ficou feliz. Países inteiros vivem isso. Desde os anos 1970, pesquisadores descobriram que países ficam mais ricos sem ficarem mais felizes — o Paradoxo de Easterlin. O Mapa de Bem-Estar Governado mede isso: não apenas o que o governo entregou em PIB, mas o que entregou em felicidade real.',
    question: 'Se você pudesse escolher entre um governo que aumentou o PIB em 10% mas reduziu sua qualidade de vida, e um que cresceu 3% mas aumentou seu bem-estar, qual escolheria?',
  },
  medio: {
    label: 'Médio',
    content: 'Em 1974, Richard Easterlin documentou que os EUA tinham dobrado de riqueza sem ficarem mais felizes. Kahneman (Nobel 2002) e Deaton (Nobel 2015) identificaram que acima de US$ 75.000/ano, renda adicional melhora a "avaliação de vida" mas não o "bem-estar emocional". Esta é a distinção entre o Self que Lembra e o Self que Experimenta — duas coisas completamente diferentes.',
    question: 'O Easterlin Gap de Bolsonaro (+2.1σ) foi o maior da história brasileira. O que isso revela sobre governança?',
  },
  avancado: {
    label: 'Avançado',
    content: 'O C-WBIG operacionaliza três frameworks: (1) Separação Kahneman Experiencing/Remembering Self, (2) VanderWeele 5-domain Human Flourishing Framework (Harvard, 2017), (3) Easterlin Gap = z(Δgdp) - z(Δcwbig). Fórmula: 0.30×cantril + 0.25×experiencing + 0.20×social_support×10 + 0.15×freedom×10 + 0.10×flourishing.',
    question: 'Como distinguir causalidade de correlação entre política fiscal e bem-estar subjetivo?',
  },
};

export default function WellbeingMapPage() {
  const allIds = getAllGovernmentIds();
  const [selectedIds, setSelectedIds] = useState<string[]>(allIds);
  const [methodLevel, setMethodLevel] = useState<'iniciante' | 'medio' | 'avancado' | null>(null);
  const [selectedResult, setSelectedResult] = useState<CWBIGResult | null>(null);

  const results = useMemo(() => analyzeWellbeingGovernance(selectedIds), [selectedIds]);

  const easterlinData = results.map(r => ({
    name: r.governmentName,
    economic: r.economicScore,
    cwbig: r.cwbigScore,
    gap: r.easterlinGap.gap,
    type: r.easterlinGap.type,
  }));

  const getBarColor = (type: EasterlinType) => getEasterlinColor(type);

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-[hsl(var(--background))]">
        {/* Hero */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-900/20 via-transparent to-purple-900/10" />
          <div className="container mx-auto px-4 relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Link>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20">
                <HeartHandshake className="w-8 h-8 text-pink-400" />
              </div>
              <div>
                <span className="text-xs font-mono text-pink-400 tracking-widest">JSON_24 · B8_CWBIG</span>
                <h1 className="text-3xl md:text-4xl font-bold text-white">Mapa de Bem-Estar Governado</h1>
              </div>
            </div>
            <p className="text-neutral-300 max-w-2xl text-lg">
              Operacionaliza a Economia do Bem-Estar (Kahneman 2002, Deaton 2015) como eixo de análise de governança. 
              Separa o que governos entregam em PIB do que entregam em florescimento humano.
            </p>

            {/* Methodology CTA */}
            <button
              onClick={() => setMethodLevel(methodLevel ? null : 'iniciante')}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-300 hover:bg-pink-500/20 transition-all text-sm"
            >
              <Brain className="w-4 h-4" />
              Por que governos podem crescer a economia e destruir o bem-estar
              {methodLevel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <AnimatePresence>
              {methodLevel && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 rounded-xl bg-pink-950/30 border border-pink-500/20 p-6 max-w-3xl"
                >
                  <div className="flex gap-2 mb-4">
                    {(['iniciante', 'medio', 'avancado'] as const).map(level => (
                      <button
                        key={level}
                        onClick={() => setMethodLevel(level)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          methodLevel === level ? 'bg-pink-500 text-white' : 'bg-pink-500/10 text-pink-300 hover:bg-pink-500/20'
                        }`}
                      >
                        {METHODOLOGY_LEVELS[level].label}
                      </button>
                    ))}
                  </div>
                  <p className="text-neutral-300 text-sm leading-relaxed mb-4">
                    {METHODOLOGY_LEVELS[methodLevel].content}
                  </p>
                  <div className="p-3 rounded-lg bg-pink-500/5 border border-pink-500/10">
                    <p className="text-pink-300 text-sm italic">
                      💡 {METHODOLOGY_LEVELS[methodLevel].question}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Easterlin Gap Chart */}
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-xl font-bold text-white mb-2">Paradoxo de Easterlin — Score Econômico vs C-WBIG</h2>
          <p className="text-neutral-400 text-sm mb-6">Quando as barras divergem, governos estão produzindo riqueza sem produzir bem-estar (ou vice-versa)</p>

          <div className="bg-[hsl(var(--card))] border border-white/5 rounded-2xl p-6">
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={easterlinData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
                <YAxis domain={[0, 10]} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                  formatter={(value: number, name: string) => [value.toFixed(1), name === 'economic' ? 'Score Econômico' : 'C-WBIG']}
                />
                <Legend formatter={(v: string) => v === 'economic' ? 'Score Econômico (A3)' : 'C-WBIG (Bem-Estar)'} />
                <Bar dataKey="economic" fill="#3B82F6" radius={[4, 4, 0, 0]} name="economic" />
                <Bar dataKey="cwbig" name="cwbig" radius={[4, 4, 0, 0]}>
                  {easterlinData.map((entry, index) => (
                    <Cell key={index} fill={getBarColor(entry.type)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="flex flex-wrap gap-4 mt-4 justify-center">
              <span className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="w-3 h-3 rounded-full bg-amber-500" /> Paradoxo Positivo (economia {'>'} bem-estar)
              </span>
              <span className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="w-3 h-3 rounded-full bg-cyan-500" /> Paradoxo Negativo (bem-estar {'>'} economia)
              </span>
              <span className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="w-3 h-3 rounded-full bg-emerald-500" /> Alinhado
              </span>
            </div>
          </div>
        </section>

        {/* Government Cards */}
        <section className="container mx-auto px-4 py-8">
          <h2 className="text-xl font-bold text-white mb-6">Análise por Governo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map(result => (
              <motion.div
                key={result.governmentId}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedResult(selectedResult?.governmentId === result.governmentId ? null : result)}
                className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                  selectedResult?.governmentId === result.governmentId
                    ? 'bg-pink-500/10 border-pink-500/30'
                    : 'bg-[hsl(var(--card))] border-white/5 hover:border-pink-500/20'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-white font-semibold">{result.governmentName}</h3>
                    <span className="text-neutral-400 text-xs">{result.period}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-pink-400">{result.cwbigScore.toFixed(1)}</div>
                    <span className="text-[10px] text-neutral-500">SIB {result.sibConfidence.toFixed(2)} [{result.sibBand}]</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono" style={{
                    background: getEasterlinColor(result.easterlinGap.type) + '20',
                    color: getEasterlinColor(result.easterlinGap.type),
                    border: `1px solid ${getEasterlinColor(result.easterlinGap.type)}30`
                  }}>
                    {getEasterlinTypeLabel(result.easterlinGap.type)} ({result.easterlinGap.gap > 0 ? '+' : ''}{result.easterlinGap.gap.toFixed(1)}σ)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-white/3">
                    <span className="text-neutral-500">Remembering</span>
                    <div className="text-white font-medium">{result.experiencingRemembering.rememberingSelf.toFixed(1)}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/3">
                    <span className="text-neutral-500">Experiencing</span>
                    <div className="text-white font-medium">{result.experiencingRemembering.experiencingSelf.toFixed(1)}</div>
                  </div>
                </div>

                <p className="text-[10px] text-neutral-500 mt-2 italic">
                  {getDivergenceLabel(result.experiencingRemembering.divergenceType)}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedResult && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="container mx-auto px-4 py-8"
            >
              <div className="bg-[hsl(var(--card))] border border-pink-500/20 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-white mb-6">
                  VanderWeele — 5 Domínios do Florescimento Humano · {selectedResult.governmentName}
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Radar */}
                  <div>
                    <ResponsiveContainer width="100%" height={350}>
                      <RadarChart data={[
                        { domain: 'Felicidade', value: selectedResult.vanderWeeleDomains.happiness_life_satisfaction, fullMark: 10 },
                        { domain: 'Saúde', value: selectedResult.vanderWeeleDomains.physical_mental_health, fullMark: 10 },
                        { domain: 'Propósito', value: selectedResult.vanderWeeleDomains.meaning_purpose, fullMark: 10 },
                        { domain: 'Virtude Cívica', value: selectedResult.vanderWeeleDomains.character_civic_virtue, fullMark: 10 },
                        { domain: 'Relações Sociais', value: selectedResult.vanderWeeleDomains.close_social_relations, fullMark: 10 },
                      ]}>
                        <PolarGrid stroke="rgba(255,255,255,0.08)" />
                        <PolarAngleAxis dataKey="domain" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: '#6B7280', fontSize: 9 }} />
                        <Radar name="Florescimento" dataKey="value" stroke="#D4537E" fill="#D4537E" fillOpacity={0.25} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Easterlin interpretation */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-white/3 border border-white/5">
                      <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" /> Paradoxo de Easterlin
                      </h4>
                      <p className="text-neutral-300 text-sm leading-relaxed">
                        {selectedResult.easterlinGap.governanceImplication}
                      </p>
                      <div className="mt-3 flex gap-4 text-xs text-neutral-500">
                        <span>Gap: <strong className="text-white">{selectedResult.easterlinGap.gap.toFixed(2)}σ</strong></span>
                        <span>GDP z: {selectedResult.easterlinGap.gdpGrowthZ.toFixed(2)}</span>
                        <span>WB z: {selectedResult.easterlinGap.wellbeingGrowthZ.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/3 border border-white/5">
                      <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                        <Brain className="w-4 h-4 text-purple-400" /> Experiencing vs Remembering Self
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
                          <span className="text-[10px] text-purple-300">Self que Experimenta</span>
                          <div className="text-xl font-bold text-purple-400">{selectedResult.experiencingRemembering.experiencingSelf.toFixed(1)}</div>
                          <span className="text-[10px] text-neutral-500">Emoções diárias</span>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                          <span className="text-[10px] text-blue-300">Self que Lembra</span>
                          <div className="text-xl font-bold text-blue-400">{selectedResult.experiencingRemembering.rememberingSelf.toFixed(1)}</div>
                          <span className="text-[10px] text-neutral-500">Avaliação de vida</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-2">
                        Divergência: {selectedResult.experiencingRemembering.divergence.toFixed(1)} pontos — {getDivergenceLabel(selectedResult.experiencingRemembering.divergenceType)}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-pink-500/5 border border-pink-500/10">
                      <p className="text-[10px] text-neutral-400">
                        <Info className="w-3 h-3 inline mr-1" />
                        SIB {selectedResult.sibConfidence.toFixed(2)} [{selectedResult.sibBand}] · Fontes: {selectedResult.dataSources.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </>
  );
}
