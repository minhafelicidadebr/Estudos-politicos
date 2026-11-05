/**
 * PolitiSimPage — Multi-Agent Political Simulation Dashboard
 * JSON_21: Motor de simulação de atores políticos
 */
import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, Zap, Users, TrendingUp, Shield, AlertTriangle, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend } from 'recharts';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAgentsForCountry, getShockTemplates, runPolitiSim, type PoliticalAgent, type ShockEvent, type SimulationResult } from '@/services/politiSimEngine';
import { seedCountries } from '@/data/countries';

const PolitiSimPage = () => {
  const { countryId } = useParams<{ countryId: string }>();
  const country = seedCountries.find(c => c.id.toLowerCase() === countryId?.toLowerCase());
  const countryName = country?.name_display_pt || 'Brasil';
  const agents = useMemo(() => getAgentsForCountry(countryId || 'BR'), [countryId]);
  const shocks = useMemo(() => getShockTemplates(), []);

  const [selectedShock, setSelectedShock] = useState<ShockEvent | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [visibleRound, setVisibleRound] = useState<number>(0);

  const runSim = () => {
    if (!selectedShock) return;
    setIsRunning(true);
    setTimeout(() => {
      const res = runPolitiSim(agents, selectedShock, 12, Date.now() % 10000);
      setResult(res);
      setVisibleRound(res.rounds);
      setIsRunning(false);
    }, 1500);
  };

  const trajectoryData = useMemo(() => {
    if (!result) return [];
    return Array.from({ length: result.rounds + 1 }, (_, i) => {
      const point: Record<string, string | number> = { round: i === 0 ? 'Início' : `R${i}` };
      for (const agent of agents) {
        point[agent.id] = +(result.trajectories[agent.id]?.[i] ?? 0).toFixed(3);
      }
      return point;
    });
  }, [result, agents]);

  const radarData = useMemo(() => {
    if (!result) return [];
    const dims = ['fiscal_orthodoxy', 'state_interventionism', 'civil_liberties', 'social_conservatism', 'environmental_priority', 'international_openness', 'institutional_reformism', 'digital_governance_adoption'];
    const labels: Record<string, string> = {
      fiscal_orthodoxy: 'Ortodoxia Fiscal', state_interventionism: 'Intervencionismo', civil_liberties: 'Liberdades Civis',
      social_conservatism: 'Conservadorismo', environmental_priority: 'Meio Ambiente', international_openness: 'Abertura Internacional',
      institutional_reformism: 'Reformismo', digital_governance_adoption: 'Gov. Digital',
    };
    return dims.map(d => {
      const point: Record<string, string | number> = { dimension: labels[d] || d };
      for (const agent of agents) {
        point[agent.id] = +((result.agentFinalPositions[agent.id]?.[d as keyof typeof result.agentFinalPositions[typeof agent.id]] ?? 0) * 50 + 50).toFixed(1);
      }
      return point;
    });
  }, [result, agents]);

  const crisisData = useMemo(() => {
    if (!result) return [];
    return result.crisisIndex.map((v, i) => ({ round: `R${i + 1}`, crisis: +(v * 100).toFixed(1) }));
  }, [result]);

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
                <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">SIMULAÇÃO</Badge>
                <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400">JSON_21</Badge>
              </div>
              <h1 className="font-display text-2xl lg:text-3xl text-neutral-50">
                PolitiSim — {countryName}
              </h1>
              <p className="text-sm text-neutral-400 mt-1">Simulação multi-agente de reações institucionais a choques políticos</p>
            </div>
          </div>

          {/* Shock Selection */}
          {!result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <h2 className="font-display text-lg text-neutral-200">Selecione um Choque Político</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shocks.map(shock => (
                  <Card
                    key={shock.id}
                    className={`cursor-pointer transition-all border-neutral-700/50 hover:border-brand-accent/50 bg-white/[0.03] ${selectedShock?.id === shock.id ? 'border-brand-accent ring-1 ring-brand-accent/30' : ''}`}
                    onClick={() => setSelectedShock(shock)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                          <Zap className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-200">{shock.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-[10px]">Intensidade: {(shock.intensity * 100).toFixed(0)}%</Badge>
                            <Badge variant="outline" className="text-[10px]">{shock.type.replace(/_/g, ' ')}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <h2 className="font-display text-lg text-neutral-200 mt-8">Atores Políticos ({agents.length})</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {agents.map(agent => (
                  <div key={agent.id} className="p-3 rounded-xl border border-neutral-700/30 bg-white/[0.02]">
                    <div className="w-8 h-8 rounded-full mb-2 flex items-center justify-center" style={{ backgroundColor: agent.color + '20' }}>
                      <Users className="w-4 h-4" style={{ color: agent.color }} />
                    </div>
                    <p className="text-xs font-medium text-neutral-200">{agent.name}</p>
                    <p className="text-[10px] text-neutral-500 mt-1">{agent.responseStyle} · Influência: {(agent.influenceWeight * 100).toFixed(0)}%</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-6">
                <Button
                  size="lg"
                  onClick={runSim}
                  disabled={!selectedShock || isRunning}
                  className="bg-gradient-to-r from-purple-600 to-brand-accent hover:from-purple-500 hover:to-brand-accent/90 text-white px-8"
                >
                  {isRunning ? (
                    <><Activity className="w-4 h-4 mr-2 animate-spin" /> Simulando...</>
                  ) : (
                    <><Play className="w-4 h-4 mr-2" /> Iniciar Simulação</>
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
                  { label: 'Probabilidade de Coalizão', value: `${(result.coalitionProbability * 100).toFixed(1)}%`, icon: Users, color: result.coalitionProbability > 0.6 ? 'text-green-400' : 'text-amber-400' },
                  { label: 'Equilíbrio', value: result.equilibriumRound ? `Rodada ${result.equilibriumRound}` : 'Não atingido', icon: Activity, color: result.equilibriumRound ? 'text-blue-400' : 'text-red-400' },
                  { label: 'Ações Totais', value: result.actions.length.toString(), icon: Zap, color: 'text-purple-400' },
                  { label: 'Índice de Crise Médio', value: `${(result.crisisIndex.reduce((a, b) => a + b, 0) / result.crisisIndex.length * 100).toFixed(1)}%`, icon: AlertTriangle, color: 'text-amber-400' },
                ].map((kpi, i) => (
                  <Card key={i} className="border-neutral-700/30 bg-white/[0.03]">
                    <CardContent className="p-4">
                      <kpi.icon className={`w-5 h-5 ${kpi.color} mb-2`} />
                      <p className="text-xl font-bold text-neutral-50">{kpi.value}</p>
                      <p className="text-xs text-neutral-500">{kpi.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-neutral-700/30 bg-white/[0.03]">
                  <CardHeader><CardTitle className="text-sm text-neutral-300">Trajetória de Influência por Ator</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={trajectoryData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="round" tick={{ fontSize: 10, fill: '#888' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#888' }} domain={[0, 1]} />
                        <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: 12 }} />
                        {agents.map(a => (
                          <Line key={a.id} type="monotone" dataKey={a.id} name={a.name} stroke={a.color} strokeWidth={2} dot={false} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-neutral-700/30 bg-white/[0.03]">
                  <CardHeader><CardTitle className="text-sm text-neutral-300">Índice de Crise por Rodada</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={crisisData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="round" tick={{ fontSize: 10, fill: '#888' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#888' }} domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: 12 }} />
                        <Line type="monotone" dataKey="crisis" name="Crise (%)" stroke="#EF4444" strokeWidth={2} fill="url(#crisisGrad)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Radar Chart */}
              <Card className="border-neutral-700/30 bg-white/[0.03]">
                <CardHeader><CardTitle className="text-sm text-neutral-300">Posições Ideológicas Finais (Radar 8D)</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10, fill: '#888' }} />
                      {agents.map(a => (
                        <Radar key={a.id} name={a.name} dataKey={a.id} stroke={a.color} fill={a.color} fillOpacity={0.1} />
                      ))}
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Action Timeline */}
              <Card className="border-neutral-700/30 bg-white/[0.03]">
                <CardHeader><CardTitle className="text-sm text-neutral-300">Timeline de Ações ({result.actions.length} ações)</CardTitle></CardHeader>
                <CardContent className="max-h-96 overflow-y-auto space-y-2">
                  {result.actions.slice(0, 36).map((action, i) => {
                    const agent = agents.find(a => a.id === action.agentId);
                    return (
                      <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-white/[0.02] border border-neutral-800/50">
                        <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: (agent?.color || '#888') + '20', color: agent?.color }}>
                          R{action.round}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-neutral-200">{action.agentName}</span>
                            <Badge variant="outline" className={`text-[9px] ${action.success ? 'border-green-500/30 text-green-400' : 'border-red-500/30 text-red-400'}`}>
                              {action.actionType.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-neutral-400 mt-0.5">{action.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* SIB Disclaimer */}
              <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-amber-300">Protocolo SIB — Confiança: 0.30–0.55</p>
                  <p className="text-[11px] text-neutral-400 mt-1">Resultados são projeções simuladas com modelo determinístico. Confiança epistêmica reduzida — use como ferramenta exploratória, não preditiva.</p>
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <Button variant="outline" onClick={() => { setResult(null); setSelectedShock(null); }}>
                  Nova Simulação
                </Button>
                <Button variant="outline" asChild>
                  <Link to={`/analyze/${countryId}/opinion-oracle`}>
                    Ver Impacto na Opinião Pública →
                  </Link>
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

export default PolitiSimPage;
