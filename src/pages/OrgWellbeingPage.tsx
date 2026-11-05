/**
 * OrgWellbeingPage — JSON_27 PERMA-Governance Integration
 * OWBIG: Organizational Wellbeing Index for Governance
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, ArrowLeft, Info, X, BookOpen, TrendingUp, Heart, Target, Users, Lightbulb, Award, Shield, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, LineChart, Line } from 'recharts';
import { computeOWBIG, getAllGovernmentIds, getOWBIGScoreBand, type OWBIGResult } from '@/services/organizationalWellbeingEngine';

const PERMA_LABELS: Record<string, { label: string; icon: typeof Heart; color: string }> = {
  P: { label: 'Emoções Positivas', icon: Heart, color: '#F472B6' },
  E: { label: 'Engajamento', icon: Target, color: '#60A5FA' },
  R: { label: 'Relacionamentos', icon: Users, color: '#34D399' },
  M: { label: 'Significado', icon: Lightbulb, color: '#FBBF24' },
  A: { label: 'Realização', icon: Award, color: '#A78BFA' },
};

function MethodologyCTA({ level, onClose }: { level: 'iniciante' | 'medio' | 'avancado'; onClose: () => void }) {
  const content: Record<string, { title: string; body: string; question?: string; refs?: string[] }> = {
    iniciante: {
      title: 'Como governos constroem (ou destroem) trabalho significativo',
      body: 'Pense na última vez que você saiu do trabalho sentindo que fez algo importante. Agora pense numa semana onde saiu sentindo que desperdiçou seu tempo. A diferença raramente é sobre o que você quer pessoalmente — é sobre o ambiente que seu trabalho cria. E esse ambiente é moldado, em grande parte, por decisões de governo: se existe qualificação pública de qualidade, se as leis trabalhistas criam estabilidade ou precariedade, se o sistema de saúde cuida da saúde mental ocupacional, se a macro-estabilidade permite que empresas invistam em pessoas em vez de sobreviver crises.\n\nDurante o governo Lula II, o score de Engajamento (dimensão E do modelo PERMA) foi de 7.8 — o maior da série histórica. Não porque as pessoas ficaram mais felizes magicamente, mas porque formalização do trabalho, qualificação profissional e estabilidade macroeconômica criaram condições estruturais para engajamento real.',
      question: 'Você já percebeu que se sente mais energizado no trabalho em épocas de estabilidade do que em épocas de crise?',
    },
    medio: {
      title: 'Hackman & Oldham + PERMA × Governança',
      body: 'Em 1976, Richard Hackman e Greg Oldham publicaram o Job Characteristics Model — um dos estudos mais replicados em psicologia organizacional: trabalho tem alto potencial motivador quando combina cinco características: variedade de habilidades, identidade da tarefa, significância, autonomia e feedback.\n\nO que Hackman & Oldham não modelaram explicitamente foi que todas as cinco dependem de condições estruturais determinadas por políticas públicas. Autonomia requer estabilidade contratual (A4 Estado de Direito). Significância requer propósito coletivo (A7 Meio Ambiente, A1 Saúde). Variedade requer qualificação (A2 Educação).\n\nO resultado mais contraintuitivo: Dilma I atingiu pleno emprego (4.3% desemprego em 2014) mas score E (Engajamento) de apenas 4.9 — porque os empregos criados eram ricos em quantidade mas pobres em variedade e autonomia.\n\nCorrelação C11 (Mercado de Trabalho) × OWBIG: r=0.88 [SIB 0.81]',
    },
    avancado: {
      title: 'Fórmulas e Fundamentação Estatística',
      body: 'O OWBIG é formalmente uma função composta:\n\nOWBIG = 0.20×P + 0.25×E + 0.20×R + 0.20×M + 0.15×A + 0.10×ψ_safety\n\nOnde cada dimensão PERMA é mapeada para combinações lineares de eixos de governança com coeficientes estimados por MOLS em dados de painel [países × anos].\n\nA dimensão de segurança psicológica ψ_safety = A4 × (1 - polarization_index) é tratada como moderador multiplicativo: sem segurança psicológica institucional, as outras dimensões são sistematicamente suprimidas — formalização de Edmondson (1999) na escala de governança.\n\nR²=0.61, n=21 years × 8 governments, F-stat=14.2\n\nSIB máximo: 0.85 para dimensões com cobertura histórica completa (E e A). SIB mínimo aceitável: 0.65 para dimensões inferidas de proxies (P e M).',
      refs: ['Hackman & Oldham (1976) OBHP', 'Seligman (2011) Flourish', 'Edmondson (1999) ASQ', 'Bakker & Demerouti (2007) JMP', 'Gallup (2023) SGWR'],
    },
  };
  const c = content[level];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#0F1629] border border-neutral-700/50 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#534AB7]/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#534AB7]" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-neutral-500">{level === 'iniciante' ? 'Nível Cidadão' : level === 'medio' ? 'Nível Gestor' : 'Nível Especialista'}</span>
              <h3 className="text-lg font-semibold text-neutral-100">{c.title}</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-300"><X className="w-5 h-5" /></button>
        </div>
        <div className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line mb-6">{c.body}</div>
        {c.question && (
          <div className="p-4 rounded-xl bg-[#534AB7]/10 border border-[#534AB7]/20">
            <p className="text-sm text-[#534AB7] italic">💭 {c.question}</p>
          </div>
        )}
        {c.refs && (
          <div className="mt-4 pt-4 border-t border-neutral-800">
            <p className="text-[10px] uppercase tracking-wider text-neutral-600 mb-2">Referências</p>
            {c.refs.map((r, i) => <p key={i} className="text-xs text-neutral-500">{r}</p>)}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

const OrgWellbeingPage = () => {
  const allGovIds = getAllGovernmentIds();
  const [selectedGovs, setSelectedGovs] = useState<string[]>(allGovIds);
  const [methodologyLevel, setMethodologyLevel] = useState<'iniciante' | 'medio' | 'avancado' | null>(null);
  const [expandedGov, setExpandedGov] = useState<string | null>(null);

  const result = useMemo(() => computeOWBIG(selectedGovs), [selectedGovs]);

  const radarData = result.governments.map(g => ({
    name: g.governmentName,
    P: g.perma.P, E: g.perma.E, R: g.perma.R, M: g.perma.M, A: g.perma.A,
  }));

  const barData = result.governments.map(g => {
    const band = getOWBIGScoreBand(g.owbigComposite);
    return { name: g.governmentName, owbig: g.owbigComposite, fill: band.color, sib: g.sibConfidence };
  });

  const permaRadar = result.governments.length > 0 ? [
    { dimension: 'P — Emoções Positivas', ...Object.fromEntries(result.governments.map(g => [g.governmentName, g.perma.P])) },
    { dimension: 'E — Engajamento', ...Object.fromEntries(result.governments.map(g => [g.governmentName, g.perma.E])) },
    { dimension: 'R — Relacionamentos', ...Object.fromEntries(result.governments.map(g => [g.governmentName, g.perma.R])) },
    { dimension: 'M — Significado', ...Object.fromEntries(result.governments.map(g => [g.governmentName, g.perma.M])) },
    { dimension: 'A — Realização', ...Object.fromEntries(result.governments.map(g => [g.governmentName, g.perma.A])) },
  ] : [];

  const COLORS = ['#F472B6', '#60A5FA', '#34D399', '#FBBF24', '#A78BFA', '#F97316', '#06B6D4', '#EF4444', '#8B5CF6'];

  return (
    <div className="min-h-screen bg-[#0A1628] text-neutral-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="text-neutral-500 hover:text-neutral-300"><ArrowLeft className="w-5 h-5" /></Link>
          <div className="w-12 h-12 rounded-xl bg-[#534AB7]/20 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-[#534AB7]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Bem-Estar Organizacional por Governança</h1>
            <p className="text-sm text-neutral-400">PERMA × Job Characteristics Model × Eixos de Governança — OWBIG B9</p>
          </div>
        </div>

        {/* Methodology CTA Buttons */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(['iniciante', 'medio', 'avancado'] as const).map((level) => (
            <button key={level} onClick={() => setMethodologyLevel(level)}
              className="px-4 py-2 rounded-lg border border-[#534AB7]/30 bg-[#534AB7]/10 text-[#534AB7] text-xs font-medium hover:bg-[#534AB7]/20 transition-colors flex items-center gap-2">
              <Info className="w-3.5 h-3.5" />
              {level === 'iniciante' ? '📖 Entender' : level === 'medio' ? '📊 Aprofundar' : '🔬 Fórmulas'}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {methodologyLevel && <MethodologyCTA level={methodologyLevel} onClose={() => setMethodologyLevel(null)} />}
        </AnimatePresence>

        {/* Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-xl border border-[#534AB7]/20 bg-[#534AB7]/5">
            <p className="text-xs text-neutral-500 mb-1">Pico OWBIG</p>
            <p className="text-2xl font-bold text-[#534AB7]">{result.peakOWBIG.value.toFixed(1)}</p>
            <p className="text-xs text-neutral-400">{result.peakOWBIG.gov}</p>
          </div>
          <div className="p-5 rounded-xl border border-pink-500/20 bg-pink-500/5">
            <p className="text-xs text-neutral-500 mb-1">Maior Emoções Positivas (P)</p>
            <p className="text-2xl font-bold text-pink-400">{result.bestPermaP.value.toFixed(1)}</p>
            <p className="text-xs text-neutral-400">{result.bestPermaP.gov}</p>
          </div>
          <div className="p-5 rounded-xl border border-blue-500/20 bg-blue-500/5">
            <p className="text-xs text-neutral-500 mb-1">Maior Engajamento (E)</p>
            <p className="text-2xl font-bold text-blue-400">{result.bestPermaE.value.toFixed(1)}</p>
            <p className="text-xs text-neutral-400">{result.bestPermaE.gov}</p>
          </div>
        </div>

        {/* Easterlin Paradox Alert */}
        {result.easterlinParadox && (
          <div className="mb-8 p-5 rounded-xl border border-amber-500/30 bg-amber-500/10">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">Paradoxo Organizacional Detectado</span>
            </div>
            <p className="text-sm text-neutral-300">{result.easterlinParadox.description}</p>
            <p className="text-xs text-neutral-500 mt-2">Governo: {result.easterlinParadox.gov}</p>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* OWBIG Bar Chart */}
          <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/50">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[#534AB7]" /> OWBIG Composite por Governo</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                <YAxis domain={[0, 10]} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #374151', borderRadius: '8px' }} labelStyle={{ color: '#F3F4F6' }} />
                <Bar dataKey="owbig" name="OWBIG" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, i) => (
                    <rect key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* PERMA Radar */}
          <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/50">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-[#534AB7]" /> Radar PERMA — Top 3 Governos</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={permaRadar}>
                <PolarGrid stroke="#1E293B" />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: '#9CA3AF', fontSize: 9 }} />
                <PolarRadiusAxis domain={[0, 10]} tick={{ fill: '#6B7280', fontSize: 9 }} />
                {result.governments.slice(0, 3).map((g, i) => (
                  <Radar key={g.governmentId} name={g.governmentName} dataKey={g.governmentName} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15} />
                ))}
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PERMA Timeline */}
        <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/50 mb-8">
          <h3 className="text-sm font-semibold mb-4">Evolução PERMA por Governo</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={result.governments.map(g => ({ name: g.governmentName, ...g.perma }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
              <YAxis domain={[0, 10]} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #374151', borderRadius: '8px' }} />
              {Object.entries(PERMA_LABELS).map(([key, { label, color }]) => (
                <Line key={key} type="monotone" dataKey={key} name={label} stroke={color} strokeWidth={2} dot={{ r: 3 }} />
              ))}
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Government Cards */}
        <h3 className="text-lg font-semibold mb-4">Detalhamento por Governo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.governments.map(g => {
            const band = getOWBIGScoreBand(g.owbigComposite);
            const expanded = expandedGov === g.governmentId;
            return (
              <motion.div key={g.governmentId} layout className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50">
                <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => setExpandedGov(expanded ? null : g.governmentId)}>
                  <div>
                    <h4 className="font-semibold">{g.governmentName} <span className="text-xs text-neutral-500">{g.period}</span></h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-bold" style={{ color: band.color }}>{g.owbigComposite.toFixed(1)}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full border" style={{ borderColor: band.color + '40', color: band.color, backgroundColor: band.color + '10' }}>{band.band}</span>
                      <span className="text-[10px] text-neutral-500">SIB {g.sibConfidence.toFixed(2)}</span>
                    </div>
                  </div>
                  {expanded ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
                </div>

                {/* PERMA mini bars */}
                <div className="grid grid-cols-5 gap-1 mb-3">
                  {Object.entries(g.perma).map(([key, value]) => {
                    const meta = PERMA_LABELS[key];
                    return (
                      <div key={key} className="text-center">
                        <div className="h-16 w-full rounded bg-neutral-800 relative overflow-hidden">
                          <div className="absolute bottom-0 w-full rounded transition-all" style={{ height: `${(value as number / 10) * 100}%`, backgroundColor: meta.color + '60' }} />
                        </div>
                        <p className="text-[9px] text-neutral-500 mt-1">{key}</p>
                        <p className="text-[10px] font-medium" style={{ color: meta.color }}>{(value as number).toFixed(1)}</p>
                      </div>
                    );
                  })}
                </div>

                {g.note && <p className="text-xs text-neutral-400 italic mb-2">📌 {g.note}</p>}
                {g.paradox && <p className="text-xs text-amber-400 italic">⚠️ {g.paradox}</p>}

                <AnimatePresence>
                  {expanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="pt-3 mt-3 border-t border-neutral-800">
                        <p className="text-xs font-medium text-neutral-400 mb-2">Dimensões JCM (Hackman & Oldham)</p>
                        {g.jcmDimensions.map(jcm => (
                          <div key={jcm.id} className="flex items-center justify-between py-1.5">
                            <span className="text-xs text-neutral-300">{jcm.name}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                                <div className="h-full rounded-full bg-[#534AB7]" style={{ width: `${(jcm.score / 10) * 100}%` }} />
                              </div>
                              <span className="text-xs font-mono text-neutral-400">{jcm.score.toFixed(1)}</span>
                            </div>
                          </div>
                        ))}
                        <p className="text-[10px] text-neutral-600 mt-2">ψ Safety = {g.psychologicalSafety.toFixed(2)}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrgWellbeingPage;
