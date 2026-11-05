/**
 * Career Governance Navigator Page (JSON_25)
 * Policy-Driven Career Intelligence with VAR correlations
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, TrendingUp, TrendingDown, AlertTriangle, ArrowLeft, Brain, ChevronDown, ChevronUp, Zap, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import {
  generateCareerInsights,
  EDUCATION_LABELS,
  EMPLOYMENT_LABELS,
  type EducationArea,
  type EmploymentType,
  type CareerProfile,
  type CareerInsight,
} from '@/services/careerGovernanceEngine';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const METHODOLOGY = {
  iniciante: {
    label: 'Iniciante',
    content: 'Quando um governo decide investir pesado em saúde pública, isso não é só uma política — é a criação de um mercado de trabalho inteiro. O Navegador de Carreira usa dados históricos de governança para mostrar quais setores cresceram (e quais encolheram) sob cada tipo de governo.',
    example: 'Nos 4 governos com score A6 ≥ 7.0, vagas em tecnologia pública cresceram 287% em 5 anos.',
    question: 'Se você soubesse que um tipo de governo sempre aquece o setor onde você trabalha, isso mudaria como você planeja sua carreira?',
  },
  medio: {
    label: 'Médio',
    content: 'Gary Becker (Nobel 1992) formalizou a Teoria do Capital Humano. Acemoglu e Restrepo (2018) mostraram que automação é moldada por incentivos de política pública. O Navegador usa correlações históricas entre scores de eixos governamentais e dados CAGED/RAIS para identificar com 3-5 anos de antecedência quais setores estão sendo criados ou destruídos.',
    example: 'Correlação A6 × Govtech emprego: r=0.78 com lag de 5 anos [SIB 0.81]',
    question: 'Correlações são associações, não causalidade garantida. Como interpretar isso?',
  },
  avancado: {
    label: 'Avançado',
    content: 'VAR simplificado (Sims, 1980): Δemployment_s(t+k) = α + β₁×axis_score(t) + β₂×Δgdp(t) + ε(t). Coeficientes β₁ estimados por MQO com CAGED/RAIS 2003-2024. Efeitos estruturais identificados quando correlação se repete em governos de ideologias opostas.',
    example: 'career_insight_score = abs(β₁) × sib × min(1.0, n_gov/8) × recency_weight',
    question: 'Como instrumentalizar timing de reformas para reduzir viés de causalidade inversa?',
  },
};

export default function CareerNavigatorPage() {
  const [education, setEducation] = useState<EducationArea>('technology');
  const [employment, setEmployment] = useState<EmploymentType>('clt');
  const [horizon, setHorizon] = useState<3 | 5 | 10>(5);
  const [showResults, setShowResults] = useState(false);
  const [methodLevel, setMethodLevel] = useState<'iniciante' | 'medio' | 'avancado' | null>(null);

  const profile: CareerProfile = { educationArea: education, employmentType: employment, careerHorizon: horizon };
  const results = useMemo(() => showResults ? generateCareerInsights(profile) : null, [showResults, education, employment, horizon]);

  const chartData = results?.insights.slice(0, 6).map(i => ({
    name: i.sectorName.length > 25 ? i.sectorName.slice(0, 22) + '...' : i.sectorName,
    correlation: Math.round(i.correlation * 100) / 100,
    color: i.color,
    sib: i.sib,
  })) || [];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'growth_opportunity': return <TrendingUp className="w-4 h-4" />;
      case 'structural_trend': return <Zap className="w-4 h-4" />;
      case 'governance_risk': return <TrendingDown className="w-4 h-4" />;
      case 'cross_sector_emerging': return <Compass className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-[hsl(var(--background))]">
        {/* Hero */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-transparent to-blue-900/10" />
          <div className="container mx-auto px-4 relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Compass className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <span className="text-xs font-mono text-emerald-400 tracking-widest">JSON_25 · CAREER NAV</span>
                <h1 className="text-3xl md:text-4xl font-bold text-white">Navegador de Carreira por Governança</h1>
              </div>
            </div>
            <p className="text-neutral-300 max-w-2xl text-lg">
              O que a história de governança diz sobre onde investir sua carreira. Correlações VAR entre eixos de governança e mercado de trabalho (CAGED/RAIS 2003-2024).
            </p>

            <button
              onClick={() => setMethodLevel(methodLevel ? null : 'iniciante')}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 transition-all text-sm"
            >
              <Brain className="w-4 h-4" />
              Como decisões de governo criam e destroem carreiras
              {methodLevel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <AnimatePresence>
              {methodLevel && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="mt-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 p-6 max-w-3xl">
                  <div className="flex gap-2 mb-4">
                    {(['iniciante', 'medio', 'avancado'] as const).map(l => (
                      <button key={l} onClick={() => setMethodLevel(l)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${methodLevel === l ? 'bg-emerald-500 text-white' : 'bg-emerald-500/10 text-emerald-300'}`}>
                        {METHODOLOGY[l].label}
                      </button>
                    ))}
                  </div>
                  <p className="text-neutral-300 text-sm leading-relaxed mb-3">{METHODOLOGY[methodLevel].content}</p>
                  <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 mb-2">
                    <p className="text-emerald-300 text-xs font-mono">📊 {METHODOLOGY[methodLevel].example}</p>
                  </div>
                  <p className="text-emerald-300/70 text-sm italic">💡 {METHODOLOGY[methodLevel].question}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Profile Form */}
        <section className="container mx-auto px-4 py-8">
          <div className="bg-[hsl(var(--card))] border border-white/5 rounded-2xl p-8 max-w-3xl mx-auto">
            <h2 className="text-lg font-bold text-white mb-6">Seu Perfil Profissional</h2>

            <div className="space-y-6">
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Área de formação</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {(Object.entries(EDUCATION_LABELS) as [EducationArea, string][]).map(([key, label]) => (
                    <button key={key} onClick={() => { setEducation(key); setShowResults(false); }}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${education === key ? 'bg-emerald-500 text-white' : 'bg-white/5 text-neutral-300 hover:bg-white/10'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Tipo de emprego</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(EMPLOYMENT_LABELS) as [EmploymentType, string][]).map(([key, label]) => (
                    <button key={key} onClick={() => { setEmployment(key); setShowResults(false); }}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${employment === key ? 'bg-emerald-500 text-white' : 'bg-white/5 text-neutral-300 hover:bg-white/10'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Horizonte de planejamento</label>
                <div className="flex gap-2">
                  {([3, 5, 10] as const).map(h => (
                    <button key={h} onClick={() => { setHorizon(h); setShowResults(false); }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${horizon === h ? 'bg-emerald-500 text-white' : 'bg-white/5 text-neutral-300 hover:bg-white/10'}`}>
                      {h} anos
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={() => setShowResults(true)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                <Compass className="w-4 h-4 mr-2" /> Gerar Insights de Carreira
              </Button>
            </div>
          </div>
        </section>

        {/* Results */}
        <AnimatePresence>
          {results && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="container mx-auto px-4 py-8">
              {/* Correlation Chart */}
              <div className="bg-[hsl(var(--card))] border border-white/5 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-bold text-white mb-4">Correlações Eixo-Setor para seu Perfil</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} layout="vertical" margin={{ left: 120 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" domain={[-1, 1]} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: '#9CA3AF', fontSize: 10 }} width={120} />
                    <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                    <Bar dataKey="correlation" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-neutral-500 mt-2">SIB médio: {results.sibOverall.toFixed(2)} · {results.methodology}</p>
              </div>

              {/* Insight Cards */}
              <h3 className="text-lg font-bold text-white mb-4">Insights Estratégicos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.insights.map(insight => (
                  <motion.div key={insight.id} whileHover={{ scale: 1.01 }}
                    className="bg-[hsl(var(--card))] border border-white/5 rounded-xl p-5 hover:border-emerald-500/20 transition-all">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 rounded-lg" style={{ background: insight.color + '20', color: insight.color }}>
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: insight.color + '15', color: insight.color }}>
                          {insight.label}
                        </span>
                        <h4 className="text-white font-semibold text-sm mt-1">{insight.sectorName}</h4>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold" style={{ color: insight.color }}>
                          {insight.correlation > 0 ? '+' : ''}{(insight.correlation * 100).toFixed(0)}%
                        </div>
                        <span className="text-[9px] text-neutral-500">r={insight.correlation.toFixed(2)}</span>
                      </div>
                    </div>
                    <p className="text-neutral-400 text-xs leading-relaxed mb-2">{insight.mechanism}</p>
                    <div className="flex items-center justify-between text-[10px] text-neutral-500">
                      <span>📊 {insight.historicalEvidence}</span>
                      <span className="font-mono">SIB {insight.sib.toFixed(2)} · lag {insight.lag}a</span>
                    </div>
                    {insight.isStructural && (
                      <span className="mt-2 inline-flex items-center gap-1 text-[9px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                        <Shield className="w-3 h-3" /> Tendência estrutural — independente do governo
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <p className="text-xs text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  Correlações históricas não garantem resultados futuros. SIB declarado em cada insight. Causalidade inversa possível. Use como complemento, não como decisão definitiva.
                </p>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </>
  );
}
