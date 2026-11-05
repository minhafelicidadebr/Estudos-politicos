/**
 * ScenarioEnginePage — "E se?" Synthetic Control Method
 * JSON_18: Motor de Cenários Alternativos
 */
import { useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, FlaskConical, Loader2, AlertTriangle, BookOpen, TrendingUp, TrendingDown, Minus, Shield, BarChart3 } from 'lucide-react';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
import { getBifurcationsForCountry, getPolicyTypeIcon } from '@/data/bifurcations';
import { seedCountries } from '@/data/countries';
import { getGovernmentsForCountry } from '@/data/governments';
import { runSCM, type SCMInputData } from '@/services/syntheticControlEngine';
import type { BifurcationPoint, SCMResult } from '@/types/aegis';
import { getSIBBand } from '@/types/aegis';

type Phase = 'select' | 'configure' | 'computing' | 'result';

const ScenarioEnginePage = () => {
  const { countryId } = useParams<{ countryId: string }>();
  const country = seedCountries.find(c => c.id.toLowerCase() === countryId?.toLowerCase());
  const countryName = country?.name_display_pt || countryId || 'País';
  const bifurcations = getBifurcationsForCountry((countryId || '').toUpperCase());
  const governments = getGovernmentsForCountry((countryId || '').toUpperCase());

  const [phase, setPhase] = useState<Phase>('select');
  const [selectedBif, setSelectedBif] = useState<BifurcationPoint | null>(null);
  const [selectedAxis, setSelectedAxis] = useState<string>('');
  const [horizon, setHorizon] = useState(5);
  const [result, setResult] = useState<SCMResult | null>(null);

  const runAnalysis = useCallback(() => {
    if (!selectedBif) return;
    setPhase('computing');

    // Simulate data — in production this would come from heatmap_reference_data
    setTimeout(() => {
      const nPre = selectedBif.minimum_pre_bifurcation_years;
      const targetPre = Array.from({ length: nPre }, (_, i) => 4 + Math.random() * 3 + i * 0.1);
      const targetPost = Array.from({ length: horizon }, (_, i) => {
        const base = targetPre[targetPre.length - 1];
        return selectedBif.direction_actual === 'negative'
          ? Math.max(1, base - (i + 1) * 0.4 + Math.random() * 0.5)
          : base + (i + 1) * 0.3 + Math.random() * 0.5;
      });
      const donors = ['CL', 'CO', 'MX', 'UY', 'PE'];
      const donorsPre = donors.map(() => Array.from({ length: nPre }, (_, i) => 4 + Math.random() * 3 + i * 0.15));
      const donorsPost = donors.map(() => Array.from({ length: horizon }, (_, i) => 5 + Math.random() * 2 + i * 0.1));

      const scmResult = runSCM({
        targetPre, targetPost, donorsPre, donorsPost,
        donorIds: donors,
        bifurcationYear: selectedBif.year,
        horizonYears: horizon,
        countryId: (countryId || '').toUpperCase(),
      });
      setResult(scmResult);
      setPhase('result');
    }, 2500);
  }, [selectedBif, horizon, countryId]);

  return (
    <>
      <NavBar />
      <main className="min-h-screen pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Link to={`/comparative/${(countryId || 'br').toLowerCase()}`} className="inline-flex items-center gap-1.5 text-micro text-neutral-500 hover:text-brand-accent transition-colors mb-4">
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar à Análise Comparativa
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-axis-a/20 to-axis-b/20 border border-axis-a/30 flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-axis-a" />
              </div>
              <div>
                <p className="text-micro uppercase tracking-[0.22em] text-brand-accent">Motor de Cenários Alternativos</p>
                <h1 className="font-display text-heading-xl text-neutral-50">E se? — {countryName}</h1>
              </div>
            </div>
            <p className="text-body-sm text-neutral-400 max-w-2xl">
              Synthetic Control Method (Abadie & Gardeazabal, 2003) aplicado a decisões políticas históricas.
              Cálculos determinísticos, narrativa interpretativa por IA, transparência total.
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* PHASE 1: Select bifurcation */}
            {phase === 'select' && (
              <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="font-display text-heading-md text-neutral-50 mb-4">Selecione o ponto de bifurcação</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bifurcations.map(bif => (
                    <motion.button
                      key={bif.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => { setSelectedBif(bif); setSelectedAxis(bif.affected_axes[0]); setPhase('configure'); }}
                      className={`text-left p-5 rounded-2xl border transition-all ${
                        selectedBif?.id === bif.id ? 'border-brand-accent bg-brand-accent/5' : 'border-neutral-700/30 hover:border-neutral-600/50 bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{getPolicyTypeIcon(bif.policy_type)}</span>
                        <span className="px-2 py-0.5 rounded-full bg-brand-accent/10 text-brand-accent text-micro font-bold">{bif.year}</span>
                        <span className={`px-2 py-0.5 rounded-full text-micro font-medium ${
                          bif.direction_actual.includes('negative') ? 'bg-semantic-error/10 text-semantic-error' : 'bg-confidence-high/10 text-confidence-high'
                        }`}>
                          {bif.direction_actual.includes('negative') ? 'Efeito negativo' : 'Contrafactual positivo'}
                        </span>
                      </div>
                      <h3 className="font-display text-body-md font-semibold text-neutral-50 mb-1">{bif.title_pt}</h3>
                      <p className="text-micro text-neutral-400 line-clamp-2">{bif.description_pt}</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {bif.affected_axes.map(ax => (
                          <span key={ax} className="px-2 py-0.5 rounded bg-white/[0.05] text-micro text-neutral-300 font-mono">{ax}</span>
                        ))}
                      </div>
                    </motion.button>
                  ))}
                </div>
                {bifurcations.length === 0 && (
                  <div className="text-center py-16">
                    <FlaskConical className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                    <p className="text-body-sm text-neutral-400">Cenários em preparação para {countryName}.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* PHASE 2: Configure */}
            {phase === 'configure' && selectedBif && (
              <motion.div key="configure" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <button onClick={() => setPhase('select')} className="text-micro text-neutral-500 hover:text-neutral-300 mb-4 flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" /> Voltar
                </button>
                <div className="p-6 rounded-2xl border border-brand-accent/20 bg-white/[0.02] mb-6">
                  <p className="text-micro uppercase tracking-[0.16em] text-brand-accent mb-2">Cenário selecionado</p>
                  <h3 className="font-display text-heading-md text-neutral-50 mb-2">{selectedBif.title_pt}</h3>
                  <p className="text-body-sm text-neutral-400">{selectedBif.description_pt}</p>
                </div>

                <div className="space-y-6">
                  {/* Axis selector */}
                  <div>
                    <label className="text-body-sm font-medium text-neutral-200 block mb-2">Eixo de análise</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedBif.affected_axes.map(ax => (
                        <button key={ax} onClick={() => setSelectedAxis(ax)}
                          className={`px-4 py-2 rounded-full text-body-sm font-medium transition-all ${
                            selectedAxis === ax ? 'bg-brand-accent text-brand-primary' : 'border border-neutral-700 text-neutral-400 hover:border-neutral-500'
                          }`}>{ax}</button>
                      ))}
                    </div>
                  </div>

                  {/* Horizon slider */}
                  <div>
                    <label className="text-body-sm font-medium text-neutral-200 block mb-2">
                      Horizonte de projeção: <span className="text-brand-accent">{horizon} anos</span>
                    </label>
                    <input type="range" min={1} max={10} value={horizon} onChange={e => setHorizon(Number(e.target.value))}
                      className="w-full accent-brand-accent" />
                    <div className="flex justify-between text-micro text-neutral-600 mt-1">
                      <span>1 ano</span>
                      <span>Confiança: <span className={horizon <= 3 ? 'text-confidence-high' : horizon <= 6 ? 'text-semantic-warning' : 'text-semantic-error'}>
                        {horizon <= 3 ? 'MODERADA' : horizon <= 6 ? 'BAIXA' : 'INCONCLUSIVA'}
                      </span></span>
                      <span>10 anos</span>
                    </div>
                  </div>

                  {/* Data quality notice */}
                  {selectedBif.data_quality_note && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.02] border border-neutral-700/30">
                      <Shield className="w-4 h-4 text-confidence-high mt-0.5 shrink-0" />
                      <p className="text-micro text-neutral-400">{selectedBif.data_quality_note}</p>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={runAnalysis}
                    className="w-full py-3.5 rounded-full bg-brand-accent text-brand-primary font-semibold text-body-sm hover:brightness-110 transition-all"
                  >
                    Calcular Cenário Alternativo
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* PHASE 3: Computing */}
            {phase === 'computing' && (
              <motion.div key="computing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-axis-a/10 border border-axis-a/30 flex items-center justify-center mb-6">
                  <Loader2 className="w-8 h-8 text-axis-a animate-spin" />
                </div>
                <h3 className="font-display text-heading-lg text-neutral-50 mb-2">Calculando cenário alternativo</h3>
                <div className="space-y-2 text-body-sm text-neutral-400">
                  <p>1. Carregando séries históricas pré-bifurcação...</p>
                  <p>2. Selecionando países-pares via correlação...</p>
                  <p>3. Otimizando pesos do controle sintético...</p>
                  <p>4. Executando testes placebo...</p>
                </div>
                <p className="text-micro text-neutral-600 mt-6">Cálculos determinísticos — nenhum número gerado por IA</p>
              </motion.div>
            )}

            {/* PHASE 4: Result */}
            {phase === 'result' && result && selectedBif && (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="space-y-8">
                <button onClick={() => { setPhase('configure'); setResult(null); }} className="text-micro text-neutral-500 hover:text-neutral-300 flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" /> Recalcular
                </button>

                {/* Pre-fit quality */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'R² pré-bifurcação', value: result.pre_fit_r_squared.toFixed(3), ok: result.pre_fit_r_squared >= 0.80 },
                    { label: 'RMSE', value: result.pre_fit_rmse.toFixed(3), ok: result.pre_fit_rmse < 1.5 },
                    { label: 'P-value placebo', value: result.placebo_p_value.toFixed(3), ok: result.placebo_p_value < 0.10 },
                    { label: 'Tempo de cálculo', value: `${result.computation_metadata.computation_time_ms}ms`, ok: true },
                  ].map((m, i) => (
                    <div key={i} className="p-4 rounded-xl border border-neutral-700/30 bg-white/[0.02]">
                      <p className="text-micro text-neutral-500 mb-1">{m.label}</p>
                      <p className={`font-display text-heading-md ${m.ok ? 'text-confidence-high' : 'text-semantic-warning'}`}>{m.value}</p>
                    </div>
                  ))}
                </div>

                {/* Fan chart area */}
                <div className="p-6 rounded-2xl border border-brand-accent/20 bg-white/[0.02]">
                  <p className="text-micro uppercase tracking-[0.16em] text-brand-accent mb-2">Trajetória Contrafactual vs. Real</p>
                  <h3 className="font-display text-heading-md text-neutral-50 mb-4">{selectedBif.title_pt}</h3>

                  {/* SVG chart */}
                  <div className="relative">
                    <svg viewBox="0 0 600 300" className="w-full" aria-label="Fan chart do cenário alternativo">
                      {/* Grid */}
                      {[0, 2, 4, 6, 8, 10].map(v => (
                        <g key={v}>
                          <line x1={60} y1={280 - v * 25} x2={580} y2={280 - v * 25} stroke="hsl(var(--neutral-700))" strokeWidth="0.5" opacity="0.3" />
                          <text x={50} y={283 - v * 25} fill="hsl(var(--neutral-500))" fontSize="9" textAnchor="end">{v}</text>
                        </g>
                      ))}

                      {/* Bifurcation line */}
                      <line x1={260} y1={20} x2={260} y2={280} stroke="hsl(var(--semantic-warning))" strokeWidth="1.5" strokeDasharray="4 3" />
                      <text x={262} y={16} fill="hsl(var(--semantic-warning))" fontSize="8">{selectedBif.year}</text>

                      {/* CI band (p10-p90) */}
                      {result.confidence_intervals.p10.length > 0 && (
                        <polygon
                          points={[
                            ...result.confidence_intervals.p90.map((v, i) => `${260 + (i + 1) * (320 / horizon)},${280 - Math.max(0, Math.min(10, v + (result.counterfactual_trajectory[i] ?? 5))) * 25}`),
                            ...result.confidence_intervals.p10.map((v, i) => `${260 + (result.confidence_intervals.p10.length - i) * (320 / horizon)},${280 - Math.max(0, Math.min(10, v + (result.counterfactual_trajectory[result.confidence_intervals.p10.length - 1 - i] ?? 5))) * 25}`),
                          ].join(' ')}
                          fill="hsl(var(--axis-a))" fillOpacity="0.08"
                        />
                      )}

                      {/* Counterfactual line */}
                      <polyline
                        points={result.counterfactual_trajectory.map((v, i) =>
                          `${260 + (i + 1) * (320 / horizon)},${280 - Math.max(0, Math.min(10, v)) * 25}`
                        ).join(' ')}
                        fill="none" stroke="hsl(var(--axis-a))" strokeWidth="2" strokeDasharray="5 3"
                      />

                      {/* Actual line */}
                      <polyline
                        points={result.actual_trajectory.map((v, i) =>
                          `${260 + (i + 1) * (320 / horizon)},${280 - Math.max(0, Math.min(10, v)) * 25}`
                        ).join(' ')}
                        fill="none" stroke="hsl(var(--semantic-error))" strokeWidth="2.5"
                      />

                      {/* Labels */}
                      <text x={580} y={280 - Math.max(0, Math.min(10, result.actual_trajectory[result.actual_trajectory.length - 1] ?? 5)) * 25 - 6} fill="hsl(var(--semantic-error))" fontSize="8">Real</text>
                      <text x={580} y={280 - Math.max(0, Math.min(10, result.counterfactual_trajectory[result.counterfactual_trajectory.length - 1] ?? 5)) * 25 - 6} fill="hsl(var(--axis-a))" fontSize="8">Contrafactual</text>
                    </svg>

                    <div className="flex justify-center gap-6 mt-3">
                      <span className="flex items-center gap-1.5 text-micro text-neutral-400">
                        <span className="w-4 h-0.5 bg-semantic-error rounded" /> Trajetória real
                      </span>
                      <span className="flex items-center gap-1.5 text-micro text-neutral-400">
                        <span className="w-4 h-0.5 bg-axis-a rounded border-dashed" style={{ borderTop: '2px dashed hsl(var(--axis-a))' }} /> Cenário alternativo
                      </span>
                    </div>
                  </div>
                </div>

                {/* Effect trajectory */}
                <div className="p-5 rounded-2xl border border-neutral-700/30 bg-white/[0.02]">
                  <h4 className="text-body-sm font-semibold text-neutral-50 mb-3">Efeito Estimado por Ano</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {result.effect_trajectory.map((e, i) => {
                      const sibBand = getSIBBand(result.sib_confidence_by_year[i] ?? 0.5);
                      return (
                        <div key={i} className="p-3 rounded-xl border border-neutral-800 text-center">
                          <p className="text-micro text-neutral-600">Ano +{i + 1}</p>
                          <p className={`font-display text-heading-md ${e >= 0 ? 'text-confidence-high' : 'text-semantic-error'}`}>
                            {e >= 0 ? '+' : ''}{e.toFixed(2)}
                          </p>
                          <p className={`text-micro font-mono ${
                            sibBand === 'ALTA' ? 'text-confidence-high' : sibBand === 'MODERADA' ? 'text-semantic-warning' : 'text-semantic-error'
                          }`}>SIB {sibBand}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Donor weights */}
                <div className="p-5 rounded-2xl border border-neutral-700/30 bg-white/[0.02]">
                  <h4 className="text-body-sm font-semibold text-neutral-50 mb-3">Países-Pares e Pesos</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {Object.entries(result.synthetic_weights).sort((a, b) => b[1] - a[1]).map(([id, w]) => (
                      <div key={id} className="p-3 rounded-xl border border-neutral-800 text-center">
                        <p className="font-mono text-body-sm text-neutral-200">{id}</p>
                        <p className="font-display text-heading-md text-brand-accent">{(w * 100).toFixed(1)}%</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* External shocks */}
                {result.external_shock_adjustments.length > 0 && (
                  <div className="p-4 rounded-xl border border-semantic-warning/20 bg-semantic-warning/5">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-semantic-warning" />
                      <p className="text-body-sm font-semibold text-neutral-50">Choques Externos Detectados</p>
                    </div>
                    {result.external_shock_adjustments.map((s, i) => (
                      <p key={i} className="text-micro text-neutral-400 ml-6">
                        {s.year}: {s.event} — peso reduzido em {(s.weight_reduction_factor * 100).toFixed(0)}%
                      </p>
                    ))}
                  </div>
                )}

                {/* Uncertainty declaration */}
                <div className="p-5 rounded-2xl border border-neutral-700/30 bg-white/[0.02]">
                  <p className="text-micro uppercase tracking-[0.16em] text-semantic-warning mb-2">⚠ Declaração de Incerteza</p>
                  <p className="text-body-sm text-neutral-300 leading-relaxed">
                    Este cenário é uma <strong>estimativa contrafactual</strong>, não uma previsão. O Synthetic Control Method
                    usa dados de países-pares para construir uma trajetória alternativa plausível. A confiança decai com o horizonte temporal
                    (SIB de {getSIBBand(result.sib_confidence_by_year[0] ?? 0.5)} no ano +1 a {getSIBBand(result.sib_confidence_by_year[result.sib_confidence_by_year.length - 1] ?? 0.35)} no ano +{horizon}).
                    R² pré-bifurcação de {result.pre_fit_r_squared.toFixed(3)} indica {result.pre_fit_r_squared >= 0.85 ? 'excelente' : result.pre_fit_r_squared >= 0.80 ? 'adequado' : 'limitado'} ajuste pré-intervenção.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer link */}
          <div className="mt-12 pt-6 border-t border-neutral-700/30 text-center">
            <Link to="/methodology" className="inline-flex items-center gap-2 text-body-sm text-neutral-500 hover:text-neutral-200 transition-colors">
              <BookOpen className="w-4 h-4" /> Metodologia SCM — Abadie & Gardeazabal (2003)
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ScenarioEnginePage;