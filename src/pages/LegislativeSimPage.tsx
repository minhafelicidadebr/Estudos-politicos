/**
 * LegislativeSimPage — Legislative Negotiation Simulator
 * JSON_23: Simulador de negociação legislativa com hemiciclo e timeline
 */
import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Gavel, Play, Users, TrendingUp, AlertTriangle, Shield, FileText, Vote, Scale } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getFactions, getBillTemplates, runLegislativeSim, type LegislativeFaction, type BillProposal, type LegislativeSimResult } from '@/services/legislativeSimEngine';
import { seedCountries } from '@/data/countries';

const LegislativeSimPage = () => {
  const { countryId } = useParams<{ countryId: string }>();
  const country = seedCountries.find(c => c.id.toLowerCase() === countryId?.toLowerCase());
  const countryName = country?.name_display_pt || 'Brasil';
  const factions = useMemo(() => getFactions(), []);
  const bills = useMemo(() => getBillTemplates(), []);

  const [selectedBill, setSelectedBill] = useState<BillProposal | null>(null);
  const [result, setResult] = useState<LegislativeSimResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeRound, setActiveRound] = useState<number>(0);

  const runSim = () => {
    if (!selectedBill) return;
    setIsRunning(true);
    setTimeout(() => {
      const res = runLegislativeSim(factions, selectedBill, Date.now() % 10000);
      setResult(res);
      setActiveRound(res.rounds.length - 1);
      setIsRunning(false);
    }, 1500);
  };

  const passageData = useMemo(() => {
    if (!result) return [];
    return result.passageTrajectory.map((v, i) => ({
      round: result.rounds[i]?.sessionType?.split('—')[0]?.trim() || `R${i + 1}`,
      probability: +(v * 100).toFixed(1),
    }));
  }, [result]);

  const seatData = useMemo(() => {
    return factions.map(f => ({
      name: f.acronym,
      value: f.seatsLower,
      color: f.color,
    }));
  }, [factions]);

  const currentRound = result?.rounds[activeRound];
  const roundActions = result?.actions.filter(a => a.round === activeRound) || [];

  const statusColor = result?.status === 'approved' ? 'text-green-400' : result?.status === 'rejected' ? 'text-red-400' : 'text-amber-400';
  const statusLabel = result?.status === 'approved' ? 'APROVADO' : result?.status === 'rejected' ? 'REJEITADO' : 'ESTAGNADO';

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
                <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400">LEGISLATIVO</Badge>
                <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400">JSON_23</Badge>
              </div>
              <h1 className="font-display text-2xl lg:text-3xl text-neutral-50">
                Simulador Legislativo — {countryName}
              </h1>
              <p className="text-sm text-neutral-400 mt-1">Simule o processo de negociação e votação de projetos de lei</p>
            </div>
          </div>

          {/* Setup */}
          {!result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <h2 className="font-display text-lg text-neutral-200">Selecione um Projeto de Lei</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bills.map(bill => (
                  <Card
                    key={bill.id}
                    className={`cursor-pointer transition-all border-neutral-700/50 hover:border-emerald-500/50 bg-white/[0.03] ${selectedBill?.id === bill.id ? 'border-emerald-500 ring-1 ring-emerald-500/30' : ''}`}
                    onClick={() => setSelectedBill(bill)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-200">{bill.title}</p>
                          <p className="text-[11px] text-neutral-400 mt-1">{bill.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-[10px]">Maioria: {bill.majorityRequired.replace(/_/g, ' ')}</Badge>
                            <Badge variant="outline" className="text-[10px]">Eixos: {bill.axesAffected.join(', ')}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Hemiciclo visual */}
              <h2 className="font-display text-lg text-neutral-200 mt-6">Composição do Legislativo</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-neutral-700/30 bg-white/[0.03]">
                  <CardContent className="p-4">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={seatData} cx="50%" cy="90%" startAngle={180} endAngle={0} innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                          {seatData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-3">
                  {factions.map(f => (
                    <div key={f.id} className="p-3 rounded-xl border border-neutral-700/30 bg-white/[0.02]">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: f.color }} />
                        <p className="text-xs font-bold text-neutral-200">{f.partyName}</p>
                      </div>
                      <p className="text-[10px] text-neutral-500">{f.seatsLower} cadeiras ({(f.seatsPct * 100).toFixed(0)}%)</p>
                      <p className="text-[10px] text-neutral-500">Papel: {f.coalitionRole} · Disciplina: {(f.voteDiscipline * 100).toFixed(0)}%</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center pt-6">
                <Button
                  size="lg"
                  onClick={runSim}
                  disabled={!selectedBill || isRunning}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-8"
                >
                  {isRunning ? (
                    <><Scale className="w-4 h-4 mr-2 animate-pulse" /> Simulando sessões...</>
                  ) : (
                    <><Gavel className="w-4 h-4 mr-2" /> Simular Negociação Legislativa</>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Results */}
          {result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Status Bar */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-700/30 bg-white/[0.03]">
                <div>
                  <p className="text-sm font-medium text-neutral-200">{result.billTitle}</p>
                  <p className="text-xs text-neutral-500">{result.rounds.length} sessões concluídas</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${statusColor}`}>{statusLabel}</p>
                  <p className="text-sm text-neutral-400">Prob: {(result.passageProbability * 100).toFixed(1)}%</p>
                </div>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Coalizão Vencedora', value: `${result.winningCoalition.seatsTotal} cadeiras`, sub: `${(result.winningCoalition.seatsPct * 100).toFixed(1)}%` },
                  { label: 'Estabilidade', value: `${(result.winningCoalition.stability * 100).toFixed(0)}%`, sub: 'Coesão interna' },
                  { label: 'Emendas Aceitas', value: `${result.amendments.filter(a => a.status === 'accepted').length}/${result.amendments.length}`, sub: 'incorporadas' },
                  { label: 'Drift Ideológico', value: `${result.ideologicalDrift > 0 ? '+' : ''}${(result.ideologicalDrift * 100).toFixed(1)}%`, sub: 'desvio do texto original' },
                ].map((kpi, i) => (
                  <Card key={i} className="border-neutral-700/30 bg-white/[0.03]">
                    <CardContent className="p-4">
                      <p className="text-lg font-bold text-neutral-50">{kpi.value}</p>
                      <p className="text-xs text-neutral-500">{kpi.label}</p>
                      <p className="text-[10px] text-neutral-600 mt-0.5">{kpi.sub}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Passage Probability Chart */}
              <Card className="border-neutral-700/30 bg-white/[0.03]">
                <CardHeader><CardTitle className="text-sm text-neutral-300">Probabilidade de Aprovação por Sessão</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={passageData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="round" tick={{ fontSize: 10, fill: '#888' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#888' }} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: 11 }} />
                      <Line type="monotone" dataKey="probability" name="Prob. Aprovação" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Round Selector + Actions */}
              <Card className="border-neutral-700/30 bg-white/[0.03]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-neutral-300">Sessões Legislativas</CardTitle>
                    <div className="flex gap-1">
                      {result.rounds.map((r, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveRound(i)}
                          className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all ${activeRound === i ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-white/[0.03] text-neutral-500 border border-neutral-700/30 hover:text-neutral-300'}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {currentRound && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-neutral-700/30">
                        <div>
                          <p className="text-xs font-medium text-neutral-200">{currentRound.sessionType}</p>
                          <p className="text-[10px] text-neutral-500">Quorum: {currentRound.quorumRequired} · Maioria: {currentRound.majorityType}</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-green-400">✓ {currentRound.approvalVotes}</span>
                          <span className="text-red-400">✗ {currentRound.rejectionVotes}</span>
                          <span className="text-neutral-500">○ {currentRound.abstentions}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] text-neutral-500">Temperatura:</span>
                        <Progress value={currentRound.negotiationTemperature * 100} className="h-2 flex-1" />
                        <span className="text-[10px] text-neutral-400">{(currentRound.negotiationTemperature * 100).toFixed(0)}%</span>
                      </div>

                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {roundActions.map((action, i) => {
                          const faction = factions.find(f => f.id === action.agentId);
                          return (
                            <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-white/[0.02] border border-neutral-800/50">
                              <div className="w-2 h-full rounded-full shrink-0 mt-1" style={{ backgroundColor: faction?.color, minHeight: 20 }} />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-neutral-200">{action.agentName}</span>
                                  <Badge variant="outline" className="text-[9px]">{action.actionType.replace(/_/g, ' ')}</Badge>
                                  {!action.isPublic && <Badge variant="outline" className="text-[9px] border-purple-500/30 text-purple-400">Reservado</Badge>}
                                </div>
                                <p className="text-[11px] text-neutral-400 mt-0.5">{action.content}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* SIB */}
              <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-amber-300">Protocolo SIB — Confiança: 0.35–0.65</p>
                  <p className="text-[11px] text-neutral-400 mt-1">Simulação baseada em posições declaradas e histórico. Negociações reais envolvem variáveis não observáveis.</p>
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <Button variant="outline" onClick={() => { setResult(null); setSelectedBill(null); }}>Nova Simulação</Button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default LegislativeSimPage;
