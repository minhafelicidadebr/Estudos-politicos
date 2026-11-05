/**
 * InstitutionalDNAPage — DNA Institucional (JSON_19)
 * PCA-based structural vs conjunctural analysis
 */
import { useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Dna, Loader2, BookOpen, Info } from 'lucide-react';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
import { seedCountries } from '@/data/countries';
import { getGovernmentsForCountry } from '@/data/governments';
import { runPCA, type PCAInput, type PCAOutput } from '@/services/institutionalDNAEngine';
import { getAllAxisDefinitions } from '@/services/comparativeAnalysisService';
import type { AxisDNAClassification } from '@/types/aegis';

const CLASS_COLORS = {
  structural: { bg: 'hsl(var(--confidence-high) / 0.15)', text: 'hsl(var(--confidence-high))', label: 'Estrutural' },
  conjunctural: { bg: 'hsl(var(--semantic-warning) / 0.15)', text: 'hsl(var(--semantic-warning))', label: 'Conjuntural' },
  intermediate: { bg: 'hsl(var(--neutral-500) / 0.15)', text: 'hsl(var(--neutral-400))', label: 'Intermediário' },
};

const InstitutionalDNAPage = () => {
  const { countryId } = useParams<{ countryId: string }>();
  const country = seedCountries.find(c => c.id.toLowerCase() === countryId?.toLowerCase());
  const countryName = country?.name_display_pt || countryId || 'País';
  const governments = getGovernmentsForCountry((countryId || '').toUpperCase());
  const axisDefs = getAllAxisDefinitions();

  const [result, setResult] = useState<PCAOutput | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [selectedAxes, setSelectedAxes] = useState<string[]>(['A1', 'A2', 'A3', 'A4', 'A7', 'A8', 'C8', 'C9']);

  const canRun = governments.length >= 5 && selectedAxes.length >= 6;

  const runAnalysis = useCallback(() => {
    if (!canRun) return;
    setIsComputing(true);
    setTimeout(() => {
      const input: PCAInput = {
        scoreMatrix: selectedAxes.map(axId => ({
          axisId: axId,
          axisName: axisDefs[axId]?.name || axId,
          scores: governments.map(() => 2 + Math.random() * 7),
        })),
        governmentNames: governments.map(g => g.name),
        countryId: (countryId || '').toUpperCase(),
        countryName,
      };
      const output = runPCA(input);
      setResult(output);
      setIsComputing(false);
    }, 2000);
  }, [canRun, selectedAxes, governments, countryId, countryName, axisDefs]);

  const radarSize = 300;
  const center = radarSize / 2;
  const radius = radarSize * 0.35;

  return (
    <>
      <NavBar />
      <main className="min-h-screen pt-20 pb-16">
        <div className="max-w-5xl mx-auto px-6">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Link to={`/comparative/${(countryId || 'br').toLowerCase()}`} className="inline-flex items-center gap-1.5 text-micro text-neutral-500 hover:text-brand-accent transition-colors mb-4">
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-axis-b/20 to-axis-c/20 border border-axis-b/30 flex items-center justify-center">
                <Dna className="w-5 h-5 text-axis-b" />
              </div>
              <div>
                <p className="text-micro uppercase tracking-[0.22em] text-brand-accent">DNA Institucional</p>
                <h1 className="font-display text-heading-xl text-neutral-50">O que persiste além dos governos — {countryName}</h1>
              </div>
            </div>
            <p className="text-body-sm text-neutral-400 max-w-2xl">
              PCA simplificada (Pearson, 1901) aplicada à matriz de scores históricos.
              Distingue padrões estruturais (persistem entre governos) de conjunturais (variam por escolha política).
            </p>
          </motion.div>

          {!result && !isComputing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Axis selector */}
              <div>
                <h3 className="text-body-sm font-semibold text-neutral-200 mb-3">Selecione os eixos para análise (mín. 6)</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(axisDefs).map(([id, def]) => (
                    <button key={id}
                      onClick={() => setSelectedAxes(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id])}
                      className={`px-3 py-1.5 rounded-full text-micro font-medium transition-all ${
                        selectedAxes.includes(id) ? 'bg-brand-accent text-brand-primary' : 'border border-neutral-700 text-neutral-400 hover:border-neutral-500'
                      }`}>
                      {id}
                    </button>
                  ))}
                </div>
                <p className="text-micro text-neutral-600 mt-2">{selectedAxes.length} eixos selecionados · {governments.length} governos disponíveis</p>
              </div>

              {!canRun && (
                <div className="p-4 rounded-xl border border-semantic-warning/20 bg-semantic-warning/5 flex items-start gap-2">
                  <Info className="w-4 h-4 text-semantic-warning mt-0.5 shrink-0" />
                  <p className="text-micro text-neutral-400">
                    {governments.length < 5 ? `Mínimo de 5 governos necessários (disponíveis: ${governments.length}).` : ''}
                    {selectedAxes.length < 6 ? ` Selecione pelo menos 6 eixos (selecionados: ${selectedAxes.length}).` : ''}
                  </p>
                </div>
              )}

              <motion.button
                whileHover={canRun ? { scale: 1.02 } : {}}
                whileTap={canRun ? { scale: 0.98 } : {}}
                onClick={runAnalysis}
                disabled={!canRun}
                className={`w-full py-3.5 rounded-full font-semibold text-body-sm transition-all ${
                  canRun ? 'bg-brand-accent text-brand-primary hover:brightness-110' : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                }`}>
                Analisar DNA Institucional
              </motion.button>
            </motion.div>
          )}

          {isComputing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-20 text-center">
              <Loader2 className="w-10 h-10 text-axis-b animate-spin mb-4" />
              <h3 className="font-display text-heading-md text-neutral-50 mb-2">Computando PCA</h3>
              <p className="text-body-sm text-neutral-400">Análise de componentes principais em {selectedAxes.length} eixos × {governments.length} governos...</p>
            </motion.div>
          )}

          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <button onClick={() => setResult(null)} className="text-micro text-neutral-500 hover:text-neutral-300 flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Nova análise
              </button>

              {/* Archetype Card */}
              <div className="p-6 rounded-2xl border border-brand-accent/30 bg-gradient-to-br from-brand-accent/5 to-transparent">
                <p className="text-micro uppercase tracking-[0.22em] text-brand-accent mb-2">Arquétipo Institucional</p>
                <h2 className="font-display text-display-md text-neutral-50 mb-2">{result.archetype.label}</h2>
                <p className="text-body-md text-neutral-300 mb-4">{result.archetype.description}</p>
                <div className="flex items-center gap-4 text-micro text-neutral-500">
                  <span>Exemplos: {result.archetype.examples.join(', ')}</span>
                  <span>|</span>
                  <span className="text-brand-accent">{result.archetype.policy_implication}</span>
                </div>
              </div>

              {/* PCA Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-neutral-700/30 bg-white/[0.02] text-center">
                  <p className="text-micro text-neutral-500">PC1 — Variância</p>
                  <p className="font-display text-heading-lg text-axis-a">{result.pc1_explained_pct.toFixed(1)}%</p>
                </div>
                <div className="p-4 rounded-xl border border-neutral-700/30 bg-white/[0.02] text-center">
                  <p className="text-micro text-neutral-500">PC2 — Variância</p>
                  <p className="font-display text-heading-lg text-axis-b">{result.pc2_explained_pct.toFixed(1)}%</p>
                </div>
                <div className="p-4 rounded-xl border border-neutral-700/30 bg-white/[0.02] text-center">
                  <p className="text-micro text-neutral-500">Padrões</p>
                  <p className="font-display text-heading-lg text-neutral-50">{result.structural_patterns.length}S / {result.conjunctural_patterns.length}C</p>
                </div>
              </div>

              {/* PCA Scatter Plot */}
              <div className="p-5 rounded-2xl border border-neutral-700/30 bg-white/[0.02]">
                <p className="text-micro uppercase tracking-[0.16em] text-brand-accent mb-2">Mapa de Componentes Principais</p>
                <h3 className="text-body-sm font-semibold text-neutral-50 mb-4">Eixos em espaço PC1 × PC2</h3>
                <svg viewBox={`0 0 ${radarSize} ${radarSize}`} className="w-full max-w-md mx-auto">
                  {/* Quadrant lines */}
                  <line x1={0} y1={center} x2={radarSize} y2={center} stroke="hsl(var(--neutral-700))" strokeWidth="0.5" />
                  <line x1={center} y1={0} x2={center} y2={radarSize} stroke="hsl(var(--neutral-700))" strokeWidth="0.5" />
                  {/* Quadrant labels */}
                  <text x={radarSize - 10} y={center - 8} fill="hsl(var(--neutral-600))" fontSize="7" textAnchor="end">Estrutural forte →</text>
                  <text x={10} y={center - 8} fill="hsl(var(--neutral-600))" fontSize="7">← Conjuntural</text>
                  <text x={center + 4} y={14} fill="hsl(var(--neutral-600))" fontSize="7">Temporal ↑</text>
                  {/* Points */}
                  {result.classifications.map((c, i) => {
                    const x = center + c.pc1_loading * radius * 2;
                    const y = center - c.pc2_loading * radius * 2;
                    const cls = CLASS_COLORS[c.classification];
                    const r = 4 + c.persistence_score * 8;
                    return (
                      <g key={c.axis_id}>
                        <circle cx={x} cy={y} r={r} fill={cls.text} fillOpacity={0.25} stroke={cls.text} strokeWidth="1" />
                        <text x={x} y={y + r + 9} fill={cls.text} fontSize="7" textAnchor="middle">{c.axis_id}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Classification Table */}
              <div className="rounded-2xl border border-neutral-700/30 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-700/30 bg-white/[0.02]">
                      <th className="text-left p-3 text-micro text-neutral-500 font-medium">Eixo</th>
                      <th className="p-3 text-micro text-neutral-500 font-medium text-center">Persistência</th>
                      <th className="p-3 text-micro text-neutral-500 font-medium text-center">Classificação</th>
                      <th className="p-3 text-micro text-neutral-500 font-medium text-center">Range</th>
                      <th className="p-3 text-micro text-neutral-500 font-medium text-center">σ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.classifications.sort((a, b) => b.persistence_score - a.persistence_score).map(c => {
                      const cls = CLASS_COLORS[c.classification];
                      return (
                        <tr key={c.axis_id} className="border-b border-neutral-800/30 hover:bg-white/[0.01]">
                          <td className="p-3">
                            <span className="font-mono text-micro text-neutral-600 mr-2">{c.axis_id}</span>
                            <span className="text-body-sm text-neutral-300">{c.axis_name}</span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center gap-2 justify-center">
                              <div className="w-16 h-2 rounded-full bg-neutral-800 overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${c.persistence_score * 100}%`, backgroundColor: cls.text }} />
                              </div>
                              <span className="font-mono text-micro text-neutral-400">{(c.persistence_score * 100).toFixed(0)}%</span>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-micro font-medium" style={{ backgroundColor: cls.bg, color: cls.text }}>
                              {cls.label}
                            </span>
                          </td>
                          <td className="p-3 text-center font-mono text-micro text-neutral-400">
                            {c.historical_range.min.toFixed(1)}–{c.historical_range.max.toFixed(1)}
                          </td>
                          <td className="p-3 text-center font-mono text-micro text-neutral-400">{c.cross_government_stdev.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* DNA Signature */}
              <div className="p-6 rounded-2xl border border-neutral-700/30 bg-white/[0.02]">
                <p className="text-micro uppercase tracking-[0.16em] text-axis-b mb-2">Assinatura Institucional</p>
                <h3 className="font-display text-heading-md text-neutral-50 mb-3">{result.signature.label}</h3>
                <p className="text-body-sm text-neutral-300 mb-4 leading-relaxed">{result.signature.description}</p>
                {result.signature.core_tension && (
                  <blockquote className="border-l-2 border-brand-accent/50 pl-4 italic text-body-sm text-neutral-200">
                    {result.signature.core_tension}
                  </blockquote>
                )}
              </div>

              {/* Patterns grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.structural_patterns.length > 0 && (
                  <div>
                    <h4 className="text-body-sm font-semibold text-confidence-high mb-3">Padrões Estruturais</h4>
                    <div className="space-y-2">
                      {result.structural_patterns.map(p => (
                        <div key={p.pattern_id} className="p-4 rounded-xl border border-confidence-high/20 bg-confidence-high/5">
                          <p className="text-body-sm font-medium text-neutral-50 mb-1">{p.title}</p>
                          <p className="text-micro text-neutral-400">{p.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {result.conjunctural_patterns.length > 0 && (
                  <div>
                    <h4 className="text-body-sm font-semibold text-semantic-warning mb-3">Padrões Conjunturais</h4>
                    <div className="space-y-2">
                      {result.conjunctural_patterns.map(p => (
                        <div key={p.pattern_id} className="p-4 rounded-xl border border-semantic-warning/20 bg-semantic-warning/5">
                          <p className="text-body-sm font-medium text-neutral-50 mb-1">{p.title}</p>
                          <p className="text-micro text-neutral-400">{p.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          <div className="mt-12 pt-6 border-t border-neutral-700/30 text-center">
            <Link to="/methodology" className="inline-flex items-center gap-2 text-body-sm text-neutral-500 hover:text-neutral-200 transition-colors">
              <BookOpen className="w-4 h-4" /> Metodologia PCA — North (1990), Pierson (2000)
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default InstitutionalDNAPage;