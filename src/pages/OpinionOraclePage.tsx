/**
 * OpinionOraclePage — Public Opinion Climate Simulation
 * JSON_22: Motor de propagação de opinião pública (SIR-Opinion Extended)
 */
import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Radio, Users, TrendingUp, AlertTriangle, Shield, Waves, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend, BarChart, Bar } from 'recharts';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSegments, getOpinionShocks, runOpinionSimulation, type PopulationSegment, type OpinionShock, type OpinionSimResult } from '@/services/opinionClimateEngine';
import { seedCountries } from '@/data/countries';

const OpinionOraclePage = () => {
  const { countryId } = useParams<{ countryId: string }>();
  const country = seedCountries.find(c => c.id.toLowerCase() === countryId?.toLowerCase());
  const countryName = country?.name_display_pt || 'Brasil';
  const segments = useMemo(() => getSegments(), []);
  const shocks = useMemo(() => getOpinionShocks(), []);

  const [selectedShock, setSelectedShock] = useState<OpinionShock | null>(null);
  const [result, setResult] = useState<OpinionSimResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTimeline, setActiveTimeline] = useState<string>('A');

  const runSim = () => {
    if (!selectedShock) return;
    setIsRunning(true);
    setTimeout(() => {
      const res = runOpinionSimulation(segments, selectedShock, 24, Date.now() % 10000);
      setResult(res);
      setIsRunning(false);
    }, 1200);
  };

  const trajectoryData = useMemo(() => {
    if (!result) return [];
    const tl = result.trajectories[activeTimeline];
    if (!tl) return [];
    const rounds = Object.values(tl)[0]?.length || 0;
    return Array.from({ length: rounds }, (_, i) => {
      const point: Record<string, string | number> = { round: i === 0 ? 'Base' : `S${i}` };
      for (const seg of segments) {
        point[seg.id] = +((tl[seg.id]?.[i] ?? 0) * 100).toFixed(1);
      }
      return point;
    });
  }, [result, activeTimeline, segments]);

  const polarizationData = useMemo(() => {
    if (!result) return [];
    return (result.polarizationIndex[activeTimeline] || []).map((v, i) => ({
      round: `S${i + 1}`,
      polarization: +(v * 100).toFixed(1),
    }));
  }, [result, activeTimeline]);

  const comparisonData = useMemo(() => {
    if (!result) return [];
    return segments.map(seg => ({
      name: seg.name.split('(')[0].trim(),
      delta: +((result.timelineComparison[seg.id] || 0) * 100).toFixed(1),
      fill: (result.timelineComparison[seg.id] || 0) > 0 ? '#EF4444' : '#10B981',
    }));
  }, [result, segments]);

  const FRAME_ICONS: Record<string, string> = { economic: '💰', justice: '⚖️', security: '🛡️', health: '🏥', environment: '🌿', cultural: '🎭' };

  return (
    <>
      <NavBar />
      <main className="min-h-screen pt-20 pb-16 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Link to={`/analyze/${countryId}`} className="p-2 rounded-lg border border-neutral-700/50 hover:border-brand-accent/50 transition-colors">
              <ArrowLeft className="w-4 h-4 text-neutral-400" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400">ORÁCULO</Badge>
                <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400">JSON_22</Badge>
              </div>
              <h1 className="font-display text-2xl lg:text-3xl text-neutral-50">
                Oráculo de Opinião Pública — {countryName}
              </h1>
              <p className="text-sm text-neutral-400 mt-1">Modelo SIR-Opinion Extended: como choques políticos se propagam na sociedade</p>
            </div>
          </div>

          {/* Setup */}
          {!result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <h2 className="font-display text-lg text-neutral-200">Selecione um Choque para Simular</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shocks.map((shock, idx) => (
                  <Card
                    key={idx}
                    className={`cursor-pointer transition-all border-neutral-700/50 hover:border-cyan-500/50 bg-white/[0.03] ${selectedShock === shock ? 'border-cyan-500 ring-1 ring-cyan-500/30' : ''}`}
                    onClick={() => setSelectedShock(shock)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{FRAME_ICONS[shock.mediaFrame] || '📊'}</span>
                        <div>
                          <p className="text-sm font-medium text-neutral-200">{shock.description}</p>
                          <Badge variant="outline" className="text-[10px] mt-2">{shock.mediaFrame}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <h2 className="font-display text-lg text-neutral-200 mt-6">Segmentos Populacionais ({segments.length})</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {segments.map(seg => (
                  <div key={seg.id} className="p-3 rounded-xl border border-neutral-700/30 bg-white/[0.02]">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
                      <p className="text-xs font-medium text-neutral-200">{seg.name}</p>
                    </div>
                    <p className="text-[10px] text-neutral-500">{seg.geographicConcentration} · {(seg.sizePct * 100).toFixed(0)}% pop · Tier {seg.socioeconomicTier}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-6">
                <Button
                  size="lg"
                  onClick={runSim}
                  disabled={!selectedShock || isRunning}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8"
                >
                  {isRunning ? (
                    <><Waves className="w-4 h-4 mr-2 animate-pulse" /> Simulando propagação...</>
                  ) : (
                    <><Radio className="w-4 h-4 mr-2" /> Simular Clima de Opinião</>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Results */}
          {result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Prob. Protesto 30d', value: `${(result.mobilizationForecast.protestProbability30 * 100).toFixed(0)}%`, color: result.mobilizationForecast.protestProbability30 > 0.5 ? 'text-red-400' : 'text-green-400' },
                  { label: 'Prob. Protesto 90d', value: `${(result.mobilizationForecast.protestProbability90 * 100).toFixed(0)}%`, color: result.mobilizationForecast.protestProbability90 > 0.6 ? 'text-red-400' : 'text-amber-400' },
                  { label: 'Shift Eleitoral', value: `${result.mobilizationForecast.estimatedVoteShift > 0 ? '+' : ''}${result.mobilizationForecast.estimatedVoteShift.toFixed(1)}pp`, color: 'text-blue-400' },
                  { label: 'Tipping Points', value: result.tippingPoints.length.toString(), color: result.tippingPoints.length > 2 ? 'text-red-400' : 'text-amber-400' },
                ].map((kpi, i) => (
                  <Card key={i} className="border-neutral-700/30 bg-white/[0.03]">
                    <CardContent className="p-4">
                      <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
                      <p className="text-xs text-neutral-500 mt-1">{kpi.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Timeline selector */}
              <div className="flex items-center gap-2">
                {[
                  { key: 'A', label: 'Sem contra-narrativa', color: 'border-red-500/50 text-red-400' },
                  { key: 'B', label: 'Resposta institucional', color: 'border-green-500/50 text-green-400' },
                  { key: 'C', label: 'Crise de credibilidade', color: 'border-amber-500/50 text-amber-400' },
                ].map(tl => (
                  <button
                    key={tl.key}
                    onClick={() => setActiveTimeline(tl.key)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-all ${activeTimeline === tl.key ? tl.color + ' bg-white/5' : 'border-neutral-700/50 text-neutral-500 hover:text-neutral-300'}`}
                  >
                    Timeline {tl.key}: {tl.label}
                  </button>
                ))}
              </div>

              {/* Opinion Trajectory */}
              <Card className="border-neutral-700/30 bg-white/[0.03]">
                <CardHeader><CardTitle className="text-sm text-neutral-300">Trajetória de Sentimento por Segmento (Timeline {activeTimeline})</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={trajectoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="round" tick={{ fontSize: 10, fill: '#888' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#888' }} domain={[-100, 100]} tickFormatter={v => `${v}%`} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: 11 }} />
                      {segments.map(seg => (
                        <Area key={seg.id} type="monotone" dataKey={seg.id} name={seg.name} stroke={seg.color} fill={seg.color} fillOpacity={0.08} strokeWidth={2} />
                      ))}
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Polarization */}
                <Card className="border-neutral-700/30 bg-white/[0.03]">
                  <CardHeader><CardTitle className="text-sm text-neutral-300">Índice de Polarização</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={polarizationData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="round" tick={{ fontSize: 10, fill: '#888' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#888' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: 11 }} />
                        <Area type="monotone" dataKey="polarization" name="Polarização" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.15} strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Timeline Comparison */}
                <Card className="border-neutral-700/30 bg-white/[0.03]">
                  <CardHeader><CardTitle className="text-sm text-neutral-300">Comparação Timeline A vs B (Δ por segmento)</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={comparisonData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis type="number" tick={{ fontSize: 10, fill: '#888' }} tickFormatter={v => `${v}%`} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#888' }} width={100} />
                        <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: 11 }} />
                        <Bar dataKey="delta" name="Δ Sentimento" radius={[0, 4, 4, 0]}>
                          {comparisonData.map((entry, index) => (
                            <rect key={index} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Tipping Points */}
              {result.tippingPoints.length > 0 && (
                <Card className="border-neutral-700/30 bg-white/[0.03]">
                  <CardHeader><CardTitle className="text-sm text-neutral-300">Pontos de Inflexão Detectados</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {result.tippingPoints.map((tp, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-neutral-200">Semana {tp.round} — {tp.type.replace(/_/g, ' ')}</p>
                          <p className="text-[11px] text-neutral-400">{tp.event}</p>
                          <p className="text-[10px] text-neutral-500 mt-1">Magnitude: {(tp.magnitude * 100).toFixed(1)}% · Cascata: {(tp.cascadeProbability * 100).toFixed(0)}%</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* SIB */}
              <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-amber-300">Protocolo SIB — Confiança: 0.25–0.50</p>
                  <p className="text-[11px] text-neutral-400 mt-1">Modelo de propagação simplificado (SIR-Opinion). Não substitui pesquisas de opinião reais. Use como ferramenta exploratória.</p>
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <Button variant="outline" onClick={() => { setResult(null); setSelectedShock(null); }}>Nova Simulação</Button>
                <Button variant="outline" asChild>
                  <Link to={`/analyze/${countryId}/legis-sim`}>Simular Legislativo →</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default OpinionOraclePage;
