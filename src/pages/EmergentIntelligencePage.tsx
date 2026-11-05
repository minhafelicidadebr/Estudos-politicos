/**
 * EmergentIntelligencePage — JSON_28 Complex Adaptive Systems
 * Civic Intelligence Commons — emergent patterns from 100k+ analyses
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, ArrowLeft, Info, X, BookOpen, Zap, GitBranch, Calendar, Globe, TrendingUp, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { computeEmergentIntelligence, getConvergenceStrengthBand } from '@/services/emergentIntelligenceEngine';

function MethodologyCTA({ level, onClose }: { level: 'iniciante' | 'medio' | 'avancado'; onClose: () => void }) {
  const content: Record<string, { title: string; body: string; question?: string; refs?: string[] }> = {
    iniciante: {
      title: 'Como 100.000 análises geram inteligência que nenhuma pessoa poderia ter',
      body: 'Uma formiga isolada não constrói um formigueiro. Ela segue regras simples — deixar feromônio quando encontra comida, seguir trilhas de feromônio mais fortes. Mas quando milhares de formigas fazem isso juntas, emerge uma estrutura complexa que nenhuma formiga planejou.\n\nInteligência emergente é assim: o resultado coletivo supera qualquer resultado individual, não porque as formigas são inteligentes individualmente, mas porque a interação de muitas ações simples gera algo mais.\n\nQuando 100.000 analistas independentemente avaliam os mesmos governos, os padrões que emergem do cruzamento dessas análises revelam relações entre dimensões de governança que nenhum teórico havia previsto e nenhum analista individual poderia detectar.',
      question: 'Você já percebeu que às vezes um grupo de pessoas chega a uma conclusão mais sábia do que qualquer pessoa do grupo individualmente? Como você acha que isso acontece?',
    },
    medio: {
      title: 'Sistemas Adaptativos Complexos aplicados à análise política',
      body: 'Em 1992, John Holland formalizou a teoria dos Sistemas Adaptativos Complexos: sistemas compostos de agentes simples que interagem localmente produzem comportamentos globais emergentes impossíveis de deduzir das regras locais.\n\nNo contexto deste app, cada análise individual é um "agente simples" seguindo as regras da metodologia PIR+. O cruzamento de 100.000 análises independentes gera quatro tipos de emergência genuína:\n\n• Convergências inesperadas (eixos que correlacionam empiricamente mais do que a teoria prevê)\n• Padrões fractais (mesmo padrão reproduzido em escalas federal/estadual/municipal)\n• Pontos de inflexão (anos onde divergência analítica coletiva precede rupturas democráticas)\n• Invariâncias culturais (padrões que aparecem identicamente em países sem contato)\n\nInflection point em 2014 (18 meses antes do impeachment): divergência analítica σ=2.8 vs baseline σ=1.3',
    },
    avancado: {
      title: 'Algoritmos e Fundamentação Estatística',
      body: 'Três algoritmos por tipo de padrão:\n\n1. Unexpected convergences: z_fisher(r_obs) - z_fisher(r_theoretical) > threshold_z (p<0.01)\n\n2. Fractal patterns: cosine(μ_federal, μ_state) = (μ_f · μ_s) / (||μ_f|| × ||μ_s||) com bootstrap permutation test de 1000 iterações\n\n3. Inflection points via CUSUM: S_t = max(0, S_{t-1} + (var_t - μ_var - k))\n\nAnderson (1972) "More is Different": "The ability to reduce everything to simple fundamental laws does not imply the ability to start from those laws and reconstruct the universe."\n\nO conhecimento emergente neste corpus é genuinamente irredutível às análises individuais — não é média, não é soma, é propriedade de ordem superior.',
      refs: ['Holland (1992) CAS', 'Anderson (1972) More is Different', 'Axelrod & Cohen (1999) Harnessing Complexity', 'Page (2007) The Difference'],
    },
  };
  const c = content[level];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#0F1629] border border-neutral-700/50 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center"><BookOpen className="w-5 h-5 text-emerald-400" /></div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-neutral-500">{level === 'iniciante' ? 'Nível Cidadão' : level === 'medio' ? 'Nível Gestor' : 'Nível Especialista'}</span>
              <h3 className="text-lg font-semibold text-neutral-100">{c.title}</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-300"><X className="w-5 h-5" /></button>
        </div>
        <div className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line mb-6">{c.body}</div>
        {c.question && <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"><p className="text-sm text-emerald-400 italic">💭 {c.question}</p></div>}
        {c.refs && <div className="mt-4 pt-4 border-t border-neutral-800"><p className="text-[10px] uppercase tracking-wider text-neutral-600 mb-2">Referências</p>{c.refs.map((r, i) => <p key={i} className="text-xs text-neutral-500">{r}</p>)}</div>}
      </motion.div>
    </motion.div>
  );
}

const EmergentIntelligencePage = () => {
  const [methodologyLevel, setMethodologyLevel] = useState<'iniciante' | 'medio' | 'avancado' | null>(null);
  const [activeTab, setActiveTab] = useState<'convergences' | 'fractal' | 'inflection' | 'invariants'>('convergences');
  const result = computeEmergentIntelligence();

  const tabs = [
    { id: 'convergences' as const, label: 'Convergências', icon: Zap, count: result.convergences.length },
    { id: 'fractal' as const, label: 'Fractais', icon: GitBranch, count: result.fractalPatterns.length },
    { id: 'inflection' as const, label: 'Inflexões', icon: Calendar, count: result.inflectionPoints.length },
    { id: 'invariants' as const, label: 'Invariâncias', icon: Globe, count: result.universalInvariants.length },
  ];

  const convergenceChartData = result.convergences.map(c => ({
    name: `${c.axisNames[0]} × ${c.axisNames[1]}`,
    observado: c.observedR,
    teórico: c.theoreticalR,
    gap: c.gap,
  }));

  const inflectionChartData = result.inflectionPoints.map(ip => ({
    year: ip.year,
    divergência: ip.divergenceSigma,
    baseline: ip.baselineSigma,
  }));

  return (
    <div className="min-h-screen bg-[#0A1628] text-neutral-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="text-neutral-500 hover:text-neutral-300"><ArrowLeft className="w-5 h-5" /></Link>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Network className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Inteligência Cívica Emergente</h1>
            <p className="text-sm text-neutral-400">Complex Adaptive Systems — Padrões invisíveis à análise individual</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-neutral-500">Escala de demonstração</p>
            <p className="text-lg font-bold text-emerald-400">{result.totalAnalysesInCorpus.toLocaleString()}</p>
            <p className="text-[10px] text-neutral-600">análises ilustrativas — não é contagem real do corpus</p>
          </div>
        </div>

        {/* Methodology CTAs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(['iniciante', 'medio', 'avancado'] as const).map(level => (
            <button key={level} onClick={() => setMethodologyLevel(level)}
              className="px-4 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors flex items-center gap-2">
              <Info className="w-3.5 h-3.5" />
              {level === 'iniciante' ? '🐜 Formigueiro' : level === 'medio' ? '📊 Holland (1992)' : '🔬 Algoritmos'}
            </button>
          ))}
        </div>

        <AnimatePresence>{methodologyLevel && <MethodologyCTA level={methodologyLevel} onClose={() => setMethodologyLevel(null)} />}</AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-neutral-500 border border-neutral-800 hover:border-neutral-700'}`}>
              <tab.icon className="w-3.5 h-3.5" /> {tab.label}
              <span className="px-1.5 py-0.5 rounded-full bg-neutral-800 text-[10px]">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'convergences' && (
          <div>
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/50 mb-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-400" /> Correlações Observadas vs Teóricas</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={convergenceChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis type="number" domain={[0, 1]} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 9 }} width={180} />
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="teórico" name="Teórico" fill="#374151" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="observado" name="Observado" fill="#10B981" radius={[0, 4, 4, 0]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.convergences.map(c => {
                const strength = getConvergenceStrengthBand(c.gap);
                return (
                  <div key={c.id} className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-semibold">{c.axisNames[0]} × {c.axisNames[1]}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border" style={{ borderColor: strength.color + '40', color: strength.color }}>{strength.band}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center p-2 rounded-lg bg-neutral-800/50"><p className="text-[10px] text-neutral-500">Observado</p><p className="text-sm font-bold text-emerald-400">{c.observedR.toFixed(2)}</p></div>
                      <div className="text-center p-2 rounded-lg bg-neutral-800/50"><p className="text-[10px] text-neutral-500">Teórico</p><p className="text-sm font-bold text-neutral-400">{c.theoreticalR.toFixed(2)}</p></div>
                      <div className="text-center p-2 rounded-lg bg-neutral-800/50"><p className="text-[10px] text-neutral-500">Gap</p><p className="text-sm font-bold text-amber-400">+{c.gap.toFixed(2)}</p></div>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed mb-2">{c.interpretation}</p>
                    <div className="flex items-center gap-3 text-[10px] text-neutral-600">
                      <span>n={c.nAnalyses.toLocaleString()}</span>
                      <span>SIB {c.sib.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'fractal' && (
          <div className="grid grid-cols-1 gap-4">
            {result.fractalPatterns.map(fp => (
              <div key={fp.id} className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/50">
                <div className="flex items-center gap-2 mb-3">
                  <GitBranch className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-sm font-semibold">{fp.patternName}</h4>
                  <span className="text-[10px] text-neutral-500 ml-auto">p={fp.pValue.toFixed(3)} | SIB {fp.sib.toFixed(2)}</span>
                </div>
                <p className="text-xs text-neutral-300 mb-4">{fp.description}</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Federal', value: fp.federalCosine, color: '#3B82F6' },
                    { label: 'Estadual', value: fp.stateCosine, color: '#8B5CF6' },
                    { label: 'Municipal', value: fp.municipalCosine, color: '#06B6D4' },
                  ].map(scale => (
                    <div key={scale.label} className="p-3 rounded-lg bg-neutral-800/50 text-center">
                      <p className="text-[10px] text-neutral-500 mb-1">{scale.label}</p>
                      <p className="text-lg font-bold" style={{ color: scale.color }}>{scale.value.toFixed(2)}</p>
                      <div className="w-full h-1.5 rounded-full bg-neutral-700 mt-2 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${scale.value * 100}%`, backgroundColor: scale.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'inflection' && (
          <div>
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/50 mb-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-amber-400" /> Divergência Analítica por Ano</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={inflectionChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="year" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="baseline" name="Baseline σ" fill="#374151" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="divergência" name="Divergência σ" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.inflectionPoints.map(ip => (
                <div key={ip.year} className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-bold text-amber-400">{ip.year}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full border border-amber-500/30 text-amber-400">σ = {ip.divergenceSigma.toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-neutral-300 mb-2"><AlertTriangle className="w-3 h-3 inline mr-1 text-amber-400" />{ip.historicalEvent18moLater}</p>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                    <span>Lead: {ip.predictiveLeadMonths} meses</span>
                    <span>•</span>
                    <span>Eixos: {ip.mostContestedAxes.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'invariants' && (
          <div className="grid grid-cols-1 gap-4">
            {result.universalInvariants.map((inv, i) => (
              <div key={i} className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/50">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <h4 className="text-sm font-semibold text-neutral-100">{inv.pattern}</h4>
                </div>
                <p className="text-xs text-neutral-300 mb-4">{inv.mechanismHypothesis}</p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-neutral-500">Países: {inv.countriesConfirming.join(', ')}</span>
                  <span className="text-neutral-500">Testados: {inv.countriesTested}</span>
                  <span className="text-emerald-400 font-medium">Força: {(inv.strength * 100).toFixed(0)}%</span>
                  <span className="text-neutral-600">SIB {inv.sib.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergentIntelligencePage;
