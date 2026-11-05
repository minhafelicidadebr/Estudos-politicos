/**
 * Fiscal Impact Calculator Page (JSON_26)
 * Personal Fiscal Budget — "What did this government do with my money?"
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ArrowLeft, Brain, ChevronDown, ChevronUp, AlertTriangle, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import {
  computeFiscalImpact,
  getAvailableGovernments,
  formatCurrency,
  INCOME_LABELS,
  EMPLOYMENT_LABELS,
  PROPERTY_LABELS,
  INVESTMENT_LABELS,
  type IncomeBracket,
  type FiscalEmploymentType,
  type PropertyStatus,
  type InvestmentProfile,
  type HouseholdProfile,
  type FiscalImpactResult,
} from '@/services/fiscalImpactMicrosimulation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const METHODOLOGY = {
  iniciante: {
    label: 'Iniciante',
    content: 'Quando o governo gasta mais do que arrecada, precisa pegar emprestado. Juros sobem, financiamento fica mais caro. Quando imprime dinheiro, preços sobem (inflação), seu salário compra menos. Esses são os "canais de transmissão" — os caminhos pelos quais decisões em Brasília chegam no seu bolso.',
    example: 'Dilma II: inflação de 8.9% ao ano. Para renda de R$5.000/mês, o mesmo conjunto de compras custou R$89 a mais por mês.',
    question: 'Você já percebeu que às vezes seu salário sobe mas sua vida não melhora? Isso tem nome: erosão do poder de compra.',
  },
  medio: {
    label: 'Médio',
    content: 'A macroeconomia afeta a renda por 5 canais: inflacionário, juros, trabalhista, serviços públicos e carga tributária. O canal mais impactante varia por faixa de renda. Para R$3-7k CLT: inflação (42%) + trabalho (31%). Para R$15k+ com financiamento: juros (58%).',
    example: 'Correlação resultado primário × SELIC: r=0.61 (BCB 2003-2024, n=252 observações mensais)',
    question: 'Qual canal fiscal mais afeta sua faixa de renda?',
  },
  avancado: {
    label: 'Avançado',
    content: 'Microsimulação de 5 canais (Orcutt, 1957): impact_c_h = β_c_h × fiscal_param × income × time. Coeficientes por MQO BCB/FMI/IPEA. Incerteza via método delta: σ²(total) = Σ_c (∂impact/∂β_c)² × σ²(β_c). Intervalo 80% (P10-P90). SIB ceiling: 0.75 por canal.',
    example: 'inflation_impact = monthly_income × 12 × max(0, actual_inflation - 3.0) / 100',
    question: 'Como separar efeito de choques externos (commodities) do efeito de política fiscal?',
  },
};

const CHANNEL_COLORS: Record<string, string> = {
  inflation: '#EF4444',
  interestRate: '#F59E0B',
  laborMarket: '#10B981',
  publicService: '#3B82F6',
  taxBurden: '#8B5CF6',
};

const CHANNEL_NAMES: Record<string, string> = {
  inflation: 'Inflação',
  interestRate: 'Juros',
  laborMarket: 'Trabalho',
  publicService: 'Serviços Públicos',
  taxBurden: 'Carga Tributária',
};

export default function FiscalImpactPage() {
  const [income, setIncome] = useState<IncomeBracket>('bracket_2');
  const [employment, setEmployment] = useState<FiscalEmploymentType>('clt');
  const [property, setProperty] = useState<PropertyStatus>('aluguel');
  const [investment, setInvestment] = useState<InvestmentProfile>('sem_investimentos');
  const [gov1, setGov1] = useState('br-lula2');
  const [gov2, setGov2] = useState('br-bolsonaro');
  const [showResults, setShowResults] = useState(false);
  const [methodLevel, setMethodLevel] = useState<'iniciante' | 'medio' | 'avancado' | null>(null);

  const governments = getAvailableGovernments();
  const profile: HouseholdProfile = { incomeBracket: income, employmentType: employment, propertyStatus: property, investmentProfile: investment };

  const result1 = useMemo(() => showResults ? computeFiscalImpact(profile, gov1) : null, [showResults, income, employment, property, investment, gov1]);
  const result2 = useMemo(() => showResults ? computeFiscalImpact(profile, gov2) : null, [showResults, income, employment, property, investment, gov2]);

  const channelChart = (result: FiscalImpactResult) => {
    return Object.entries(result.channels).map(([key, value]) => ({
      name: CHANNEL_NAMES[key] || key,
      value: value,
      color: CHANNEL_COLORS[key] || '#666',
    }));
  };

  const ImpactCard = ({ result, label }: { result: FiscalImpactResult; label: string }) => (
    <div className="bg-[hsl(var(--card))] border border-white/5 rounded-2xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs text-neutral-500">{label}</span>
          <h3 className="text-lg font-bold text-white">{result.governmentName}</h3>
          <span className="text-xs text-neutral-400">{result.period}</span>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${result.monthlyImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(result.monthlyImpact)}
          </div>
          <span className="text-xs text-neutral-500">por mês estimado</span>
        </div>
      </div>

      {/* Cumulative */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-white/3">
          <span className="text-[10px] text-neutral-500">Impacto Anual</span>
          <div className={`text-lg font-bold ${result.annualImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(result.annualImpact)}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-white/3">
          <span className="text-[10px] text-neutral-500">Acumulado no Mandato</span>
          <div className={`text-lg font-bold ${result.mandateCumulative >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(result.mandateCumulative)}
          </div>
        </div>
      </div>

      {/* Uncertainty Band */}
      <div className="mb-4 p-3 rounded-lg bg-white/3">
        <span className="text-[10px] text-neutral-500">Faixa de Incerteza (P10–P90)</span>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-neutral-400">{formatCurrency(result.uncertaintyBand.p10)}</span>
          <div className="flex-1 h-2 rounded-full bg-white/5 relative">
            <div className="absolute inset-y-0 rounded-full bg-gradient-to-r from-red-500/40 via-amber-500/40 to-emerald-500/40"
              style={{ left: '10%', right: '10%' }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white border border-neutral-600"
              style={{ left: '50%', transform: 'translateX(-50%) translateY(-50%)' }} />
          </div>
          <span className="text-xs text-neutral-400">{formatCurrency(result.uncertaintyBand.p90)}</span>
        </div>
      </div>

      {/* Channel Breakdown */}
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={channelChart(result)} layout="vertical" margin={{ left: 80 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis type="number" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
          <YAxis dataKey="name" type="category" tick={{ fill: '#9CA3AF', fontSize: 10 }} width={80} />
          <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
            formatter={(v: number) => [formatCurrency(v), 'Impacto/ano']} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {channelChart(result).map((e, i) => <Cell key={i} fill={e.color} fillOpacity={0.8} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-2 mt-3">
        <span className="text-[10px] text-neutral-500">
          Canal dominante: <strong className="text-white">{result.dominantChannelLabel}</strong> · SIB {result.sibOverall.toFixed(2)} [{result.sibBand}]
        </span>
      </div>

      {result.aamFlags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {result.aamFlags.map(f => (
            <span key={f} className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">{f}</span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-[hsl(var(--background))]">
        {/* Hero */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-transparent to-red-900/10" />
          <div className="container mx-auto px-4 relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <Wallet className="w-8 h-8 text-orange-400" />
              </div>
              <div>
                <span className="text-xs font-mono text-orange-400 tracking-widest">JSON_26 · FISCAL ENGINE</span>
                <h1 className="text-3xl md:text-4xl font-bold text-white">Orçamento Pessoal Governado</h1>
              </div>
            </div>
            <p className="text-neutral-300 max-w-2xl text-lg">
              O que cada governo fez com o seu dinheiro? Microsimulação de impacto fiscal personalizada por faixa de renda, emprego e patrimônio. 100% determinístico — zero IA para cálculos financeiros.
            </p>

            <button onClick={() => setMethodLevel(methodLevel ? null : 'iniciante')}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-300 hover:bg-orange-500/20 transition-all text-sm">
              <Brain className="w-4 h-4" />
              Como decisões fiscais chegam no seu bolso
              {methodLevel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <AnimatePresence>
              {methodLevel && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="mt-4 rounded-xl bg-orange-950/30 border border-orange-500/20 p-6 max-w-3xl">
                  <div className="flex gap-2 mb-4">
                    {(['iniciante', 'medio', 'avancado'] as const).map(l => (
                      <button key={l} onClick={() => setMethodLevel(l)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${methodLevel === l ? 'bg-orange-500 text-white' : 'bg-orange-500/10 text-orange-300'}`}>
                        {METHODOLOGY[l].label}
                      </button>
                    ))}
                  </div>
                  <p className="text-neutral-300 text-sm leading-relaxed mb-3">{METHODOLOGY[methodLevel].content}</p>
                  <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/10 mb-2">
                    <p className="text-orange-300 text-xs font-mono">📊 {METHODOLOGY[methodLevel].example}</p>
                  </div>
                  <p className="text-orange-300/70 text-sm italic">💡 {METHODOLOGY[methodLevel].question}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Form */}
        <section className="container mx-auto px-4 py-8">
          <div className="bg-[hsl(var(--card))] border border-white/5 rounded-2xl p-8 max-w-4xl mx-auto">
            <h2 className="text-lg font-bold text-white mb-6">Seu Perfil Domiciliar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Faixa de renda mensal</label>
                <div className="space-y-2">
                  {(Object.entries(INCOME_LABELS) as [IncomeBracket, string][]).map(([k, v]) => (
                    <button key={k} onClick={() => { setIncome(k); setShowResults(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${income === k ? 'bg-orange-500 text-white' : 'bg-white/5 text-neutral-300 hover:bg-white/10'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-neutral-400 mb-2 block">Tipo de emprego</label>
                  <div className="flex flex-wrap gap-2">
                    {(Object.entries(EMPLOYMENT_LABELS) as [FiscalEmploymentType, string][]).map(([k, v]) => (
                      <button key={k} onClick={() => { setEmployment(k); setShowResults(false); }}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-all ${employment === k ? 'bg-orange-500 text-white' : 'bg-white/5 text-neutral-300 hover:bg-white/10'}`}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-neutral-400 mb-2 block">Situação imobiliária</label>
                  <div className="flex flex-wrap gap-2">
                    {(Object.entries(PROPERTY_LABELS) as [PropertyStatus, string][]).map(([k, v]) => (
                      <button key={k} onClick={() => { setProperty(k); setShowResults(false); }}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-all ${property === k ? 'bg-orange-500 text-white' : 'bg-white/5 text-neutral-300 hover:bg-white/10'}`}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-neutral-400 mb-2 block">Perfil de investimento</label>
                  <div className="flex flex-wrap gap-2">
                    {(Object.entries(INVESTMENT_LABELS) as [InvestmentProfile, string][]).map(([k, v]) => (
                      <button key={k} onClick={() => { setInvestment(k); setShowResults(false); }}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-all ${investment === k ? 'bg-orange-500 text-white' : 'bg-white/5 text-neutral-300 hover:bg-white/10'}`}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Government Selectors */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Governo 1</label>
                <select value={gov1} onChange={e => { setGov1(e.target.value); setShowResults(false); }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                  {governments.map(g => <option key={g.id} value={g.id}>{g.name} ({g.period})</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-neutral-400 mb-2 block">Governo 2 (comparação)</label>
                <select value={gov2} onChange={e => { setGov2(e.target.value); setShowResults(false); }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                  {governments.map(g => <option key={g.id} value={g.id}>{g.name} ({g.period})</option>)}
                </select>
              </div>
            </div>

            <Button onClick={() => setShowResults(true)} className="w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white">
              <Wallet className="w-4 h-4 mr-2" /> Calcular Impacto Fiscal
            </Button>
          </div>
        </section>

        {/* Results */}
        <AnimatePresence>
          {result1 && result2 && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ImpactCard result={result1} label="Governo 1" />
                <ImpactCard result={result2} label="Governo 2" />
              </div>

              {/* Comparison Summary */}
              <div className="mt-6 bg-[hsl(var(--card))] border border-orange-500/20 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Comparação de Impacto</h3>
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <span className="text-sm text-neutral-400">{result1.governmentName}</span>
                    <div className={`text-3xl font-bold ${result1.monthlyImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatCurrency(result1.monthlyImpact)}/mês
                    </div>
                  </div>
                  <div className="text-neutral-500 text-lg">vs</div>
                  <div className="text-center">
                    <span className="text-sm text-neutral-400">{result2.governmentName}</span>
                    <div className={`text-3xl font-bold ${result2.monthlyImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatCurrency(result2.monthlyImpact)}/mês
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <span className="text-sm text-neutral-400">Diferença estimada: </span>
                  <span className={`text-lg font-bold ${(result1.monthlyImpact - result2.monthlyImpact) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(result1.monthlyImpact - result2.monthlyImpact)}/mês
                  </span>
                </div>
              </div>

              {/* Mandatory Disclaimer */}
              <div className="mt-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <p className="text-xs text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Estimativa estatística — não previsão individual.</strong> Cálculos 100% determinísticos baseados em coeficientes calibrados BCB/FMI/IPEA 2003-2024. SIB ceiling de 0.75 reflete incerteza estrutural. Variação individual dentro da faixa de renda pode ser grande. Hipótese ceteris paribus raramente se verifica na prática.
                  </span>
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
