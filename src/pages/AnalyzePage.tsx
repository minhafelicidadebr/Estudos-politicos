/**
 * AnalyzePage — Analysis Lab with radar chart, confidence distribution,
 * progress simulation, PDF preview, and enhanced dashboard
 */
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  Brain, Leaf, Shield, TrendingUp, Globe2, Zap, Users, Cpu, Heart,
  ChevronRight, Download, BookOpen, ArrowLeft, Play, Eye, GitCompare, Sparkles,
} from "lucide-react";
import { seedCountries } from "@/data/countries";
import { mockAnalysisBR, mockAvatarBR } from "@/data/mock-analysis";
import { AvatarCard } from "@/components/avatar/AvatarCard";
import { ScoreBar } from "@/components/ui/score-bar";
import { ConfidenceBadge } from "@/components/ui/confidence-badge";
import { AxisBadge } from "@/components/ui/axis-badge";
import { WarningFlag } from "@/components/ui/warning-flag";
import { SourceTag } from "@/components/ui/source-tag";
import { ExportPanel } from "@/components/export/ExportPanel";
import { RadarAxisChart } from "@/components/analysis/RadarAxisChart";
import { ConfidenceDistribution } from "@/components/analysis/ConfidenceDistribution";
import { AnalysisProgressPanel } from "@/components/analysis/AnalysisProgressPanel";
import { PDFPreview } from "@/components/analysis/PDFPreview";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import NavBar from "@/components/layout/NavBar";
import type { AxisAnalysis, PedagogicalLayer } from "@/types/aegis";

const axisIcons: Record<string, React.ElementType> = {
  "Capital Humano e Inovação": Brain,
  "Sustentabilidade Ambiental": Leaf,
  "Integridade Institucional": Shield,
  "Macroeconomia": TrendingUp,
  "Inserção Internacional": Globe2,
  "Infraestrutura e Energia": Zap,
  "Desenvolvimento Social": Users,
  "Gestão Pública Digital": Cpu,
  "Saúde Pública": Heart,
};

const layerLabels: Record<PedagogicalLayer, { label: string; desc: string }> = {
  1: { label: "Visão Geral", desc: "Para cidadãos" },
  2: { label: "Análise Completa", desc: "Para gestores" },
  3: { label: "Dados Técnicos", desc: "Para especialistas" },
};

function AxisCard({ axis, onClick }: { axis: AxisAnalysis; onClick: () => void }) {
  const Icon = axisIcons[axis.axis_name] || Brain;
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-left p-5 rounded-xl border border-neutral-700/30 hover:border-brand-accent/30 transition-all group"
      style={{ background: 'rgba(255,255,255,0.02)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: axis.layer === 'A' ? 'hsl(var(--axis-a) / 0.1)' : axis.layer === 'B' ? 'hsl(var(--axis-b) / 0.1)' : 'hsl(var(--axis-c) / 0.1)' }}>
            <Icon className="w-4.5 h-4.5" style={{ color: axis.layer === 'A' ? 'hsl(var(--axis-a))' : axis.layer === 'B' ? 'hsl(var(--axis-b))' : 'hsl(var(--axis-c))' }} />
          </div>
          <div>
            <h3 className="text-body-sm font-semibold text-neutral-50 group-hover:text-brand-accent transition-colors">{axis.axis_name}</h3>
            <AxisBadge layer={axis.layer} size="sm" />
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-neutral-400 transition-colors" />
      </div>
      <ScoreBar score={axis.score} showBand size="sm" />
      <div className="mt-3 flex items-center gap-3">
        <ConfidenceBadge confidence={axis.confidence} size="sm" />
        <span className="text-micro text-neutral-600">{axis.coverage}% cobertura</span>
      </div>
      <p className="mt-3 text-body-sm text-neutral-400 line-clamp-2 leading-relaxed">{axis.summary}</p>
      {axis.warnings.length > 0 && (
        <div className="mt-3 space-y-1">
          {axis.warnings.slice(0, 1).map((w, i) => (
            <WarningFlag key={i} type={w} />
          ))}
        </div>
      )}
    </motion.button>
  );
}

function AxisDetailPanel({ axis, onClose }: { axis: AxisAnalysis; onClose: () => void }) {
  const [tab, setTab] = useState<'tese' | 'antitese' | 'julgamento' | 'contexto' | 'fontes'>('tese');
  const Icon = axisIcons[axis.axis_name] || Brain;

  const tabs = [
    { id: 'tese' as const, label: 'Tese' },
    { id: 'antitese' as const, label: 'Antítese' },
    { id: 'julgamento' as const, label: 'Julgamento' },
    { id: 'contexto' as const, label: 'Contexto' },
    { id: 'fontes' as const, label: `Fontes (${axis.sources.length})` },
  ];

  const content: Record<string, string> = {
    tese: axis.thesis,
    antitese: axis.antithesis,
    julgamento: axis.judgment,
    contexto: `${axis.context}\n\nDistribuição: ${axis.distribution}\n\nNota metodológica: ${axis.methodology_note}`,
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl border-l border-neutral-700/50 overflow-y-auto"
      style={{ background: 'linear-gradient(180deg, hsl(216 55% 12%) 0%, hsl(216 60% 9%) 100%)' }}
    >
      <div className="p-6">
        <button onClick={onClose} className="flex items-center gap-2 text-body-sm text-neutral-400 hover:text-neutral-50 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-axis-a/10">
            <Icon className="w-5 h-5 text-axis-a" />
          </div>
          <div>
            <h2 className="font-display text-heading-lg text-neutral-50">{axis.axis_name}</h2>
            <AxisBadge layer={axis.layer} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl border border-neutral-700/30 bg-white/[0.02]">
            <p className="text-micro text-neutral-500 mb-1">Score</p>
            <ScoreBar score={axis.score} showBand size="md" />
          </div>
          <div className="p-4 rounded-xl border border-neutral-700/30 bg-white/[0.02]">
            <p className="text-micro text-neutral-500 mb-1">Confiança</p>
            <ConfidenceBadge confidence={axis.confidence} showLabel size="md" />
          </div>
          <div className="p-4 rounded-xl border border-neutral-700/30 bg-white/[0.02]">
            <p className="text-micro text-neutral-500 mb-1">Cobertura</p>
            <span className="font-mono text-body-md text-neutral-50">{axis.coverage}%</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-neutral-700/40 mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-body-sm font-medium transition-colors relative ${
                tab === t.id ? 'text-brand-accent' : 'text-neutral-400 hover:text-neutral-50'
              }`}
            >
              {t.label}
              {tab === t.id && (
                <motion.div layoutId="axis-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-accent rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === 'fontes' ? (
          <div className="space-y-2">
            {axis.sources.length > 0 ? axis.sources.map((s, i) => (
              <SourceTag key={i} source={s} />
            )) : (
              <p className="text-body-sm text-neutral-500 py-8 text-center">Fontes detalhadas disponíveis na versão completa.</p>
            )}
          </div>
        ) : (
          <div className="prose prose-invert max-w-none">
            <p className="text-body-md text-neutral-200 leading-relaxed whitespace-pre-line">{content[tab]}</p>
          </div>
        )}

        {/* Warnings */}
        {axis.warnings.length > 0 && (
          <div className="mt-6 space-y-2">
            <p className="text-micro text-neutral-500 font-semibold uppercase tracking-wider mb-2">Alertas Metodológicos</p>
            {axis.warnings.map((w, i) => (
              <WarningFlag key={i} type={w} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

const AnalyzePage = () => {
  const { countryId } = useParams<{ countryId: string }>();
  const navigate = useNavigate();
  const [selectedAxis, setSelectedAxis] = useState<AxisAnalysis | null>(null);
  const [layer, setLayer] = useState<PedagogicalLayer>(1);
  const [showProgress, setShowProgress] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  const country = useMemo(() => seedCountries.find(c => c.id.toLowerCase() === countryId?.toLowerCase()), [countryId]);
  const analysis = countryId?.toLowerCase() === 'br' ? mockAnalysisBR : null;
  const avatar = countryId?.toLowerCase() === 'br' ? mockAvatarBR : null;

  if (!country) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-heading-xl text-neutral-50 font-display mb-4">País não encontrado</p>
          <Link to="/" className="text-brand-accent hover:text-brand-accent-bright transition-colors text-body-sm">← Voltar ao início</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <NavBar />
      <div className="max-w-[1440px] mx-auto flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-[280px] shrink-0 border-r border-neutral-700/30 p-6 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          {avatar ? (
            <AvatarCard avatar={avatar} variant="sidebar" className="mb-6" />
          ) : (
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 rounded-full bg-brand-secondary/30 flex items-center justify-center text-4xl mb-3">
                {country.flag_emoji}
              </div>
              <h3 className="font-display text-heading-md text-neutral-50">{country.name_display_pt}</h3>
              <p className="text-micro text-neutral-400">{country.capital.name}</p>
            </div>
          )}

          <div className="space-y-1 mb-6">
            <div className="flex items-center justify-between text-body-sm">
              <span className="text-neutral-500">Regime</span>
              <span className="text-neutral-200 capitalize">{country.regime}</span>
            </div>
            <div className="flex items-center justify-between text-body-sm">
              <span className="text-neutral-500">Maturidade</span>
              <span className="text-neutral-200 capitalize">{country.statistical_maturity}</span>
            </div>
          </div>

          <div className="border-t border-neutral-700/30 pt-4 mb-4">
            <p className="text-micro text-neutral-500 font-semibold uppercase tracking-wider mb-3">Eixos de Análise</p>
            <nav className="space-y-1">
              {analysis?.axes.map((axis) => {
                const Icon = axisIcons[axis.axis_name] || Brain;
                return (
                  <button
                    key={axis.axis_id}
                    onClick={() => setSelectedAxis(axis)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-body-sm text-neutral-400 hover:text-neutral-50 hover:bg-white/[0.03] transition-all text-left"
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{axis.axis_name}</span>
                    <span className="ml-auto font-mono text-micro text-neutral-600">{axis.score.toFixed(1)}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto space-y-2">
            {analysis && (
              <button
                onClick={() => setShowPdfPreview(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-neutral-700 text-neutral-400 hover:border-brand-accent hover:text-brand-accent transition-all text-body-sm"
              >
                <Eye className="w-4 h-4" /> Preview PDF
              </button>
            )}
            <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-neutral-700 text-neutral-400 hover:border-brand-accent hover:text-brand-accent transition-all text-body-sm" disabled>
              <Download className="w-4 h-4" /> Exportar Análise
            </button>
            <Link to="/methodology" className="w-full flex items-center justify-center gap-2 py-2.5 text-body-sm text-neutral-500 hover:text-neutral-200 transition-colors">
              <BookOpen className="w-4 h-4" /> Ver Metodologia
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-10 min-w-0">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-body-sm text-neutral-500 mb-8" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-neutral-200 transition-colors">Início</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-neutral-200">{country.name_display_pt}</span>
          </nav>

          {/* CTA — Comparative Analysis Premium */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="mb-10 relative overflow-hidden rounded-2xl cursor-pointer group"
            onClick={() => navigate(`/comparative/${countryId}`)}
          >
            {/* Animated gradient border */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-brand-accent/40 via-axis-a/30 to-brand-accent/40 p-[1px] group-hover:from-brand-accent/70 group-hover:via-axis-b/50 group-hover:to-brand-accent/70 transition-all duration-700">
              <div className="absolute inset-[1px] rounded-2xl" style={{ background: 'linear-gradient(135deg, hsl(216 60% 10%) 0%, hsl(216 55% 14%) 50%, hsl(216 60% 10%) 100%)' }} />
            </div>

            <div className="relative z-10 p-6 sm:p-8">
              {/* Top badge row */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, hsl(42 52% 54% / 0.2) 0%, hsl(217 91% 60% / 0.15) 100%)', border: '1px solid hsl(42 52% 54% / 0.2)' }}
                  >
                    <GitCompare className="w-6 h-6 text-brand-accent" />
                  </motion.div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-micro font-bold tracking-wider uppercase"
                      style={{ background: 'linear-gradient(135deg, hsl(42 52% 54% / 0.2), hsl(42 85% 60% / 0.15))', color: 'hsl(43 85% 60%)' }}>
                      <Sparkles className="w-3 h-3" /> PREMIUM · PIR+
                    </span>
                  </div>
                </div>
                <motion.div
                  whileHover={{ x: 4 }}
                  className="w-10 h-10 rounded-full flex items-center justify-center border border-neutral-700/50 group-hover:border-brand-accent/50 group-hover:bg-brand-accent/10 transition-all"
                >
                  <ChevronRight className="w-5 h-5 text-neutral-500 group-hover:text-brand-accent transition-colors" />
                </motion.div>
              </div>

              {/* Main content */}
              <h3 className="font-display text-heading-xl sm:text-display-md text-neutral-50 mb-3 group-hover:text-brand-accent transition-colors duration-300">
                Análise Comparativa de Governos
              </h3>
              <p className="text-body-md text-neutral-300 max-w-2xl mb-6 leading-relaxed">
                Compare governos de <strong className="text-neutral-50">{country?.name_display_pt || countryId}</strong> com rigor metodológico e imparcialidade total — framework PIR+ com 28 eixos analíticos e trilha de auditoria completa.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { icon: '🔬', label: '28 Eixos Analíticos' },
                  { icon: '⚖️', label: 'Tese & Antítese' },
                  { icon: '📊', label: 'Dados Primários' },
                  { icon: '🛡️', label: 'Anti-Alucinação' },
                  { icon: '📋', label: 'Auditoria CCE' },
                ].map(pill => (
                  <span key={pill.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-700/40 text-micro text-neutral-300 bg-white/[0.02] group-hover:border-neutral-600/60 transition-colors">
                    <span>{pill.icon}</span> {pill.label}
                  </span>
                ))}
              </div>

              {/* Bottom bar — stats + CTA */}
              <div className="flex items-center justify-between pt-5 border-t border-neutral-700/30">
                <div className="flex items-center gap-6 text-micro text-neutral-500">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> 11 governos mapeados
                  </span>
                  <span className="hidden sm:flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Validação VCO
                  </span>
                </div>
                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-body-sm bg-brand-accent text-brand-primary group-hover:scale-105 transition-transform">
                  <Play className="w-4 h-4" /> Iniciar Análise
                </span>
              </div>
            </div>

            {/* Decorative glow */}
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{ background: 'radial-gradient(circle, hsl(42 52% 54% / 0.08) 0%, transparent 70%)' }} />
          </motion.div>

          {!analysis ? (
            <div className="space-y-6">
              <div className="text-center py-20">
                <span className="text-6xl mb-6 block">{country.flag_emoji}</span>
                <h1 className="font-display text-display-lg text-neutral-50 mb-4">{country.name_display_pt}</h1>
                <p className="text-body-lg text-neutral-400 max-w-xl mx-auto mb-8">
                  Análise detalhada para {country.name_display_pt} estará disponível em breve. No momento, dados demo estão disponíveis para o Brasil.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Link to="/analyze/br" className="inline-flex items-center gap-2 bg-brand-accent text-brand-primary px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform text-body-sm">
                    Ver análise do Brasil (demo)
                  </Link>
                  <button
                    onClick={() => setShowProgress(true)}
                    className="inline-flex items-center gap-2 border border-brand-accent text-brand-accent px-6 py-3 rounded-full font-medium hover:bg-brand-accent hover:text-brand-primary transition-all text-body-sm"
                  >
                    <Play className="w-4 h-4" /> Simular pipeline
                  </button>
                </div>
                {showProgress && (
                  <div className="max-w-lg mx-auto mt-10">
                    <AnalysisProgressPanel isRunning={showProgress} onComplete={() => {}} />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <ErrorBoundary fallbackTitle="Erro ao renderizar análise">
              <div className="space-y-10">
                {/* Analysis Header */}
                <section>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h1 className="font-display text-display-lg text-neutral-50 flex items-center gap-3">
                        <span className="text-4xl">{country.flag_emoji}</span>
                        {country.name_display_pt}
                      </h1>
                      <p className="text-body-sm text-neutral-400 mt-1">Período: {analysis.period} · Gerado em {new Date(analysis.generated_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>

                  {/* Global Score Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-6 rounded-2xl border border-brand-accent/30 col-span-1"
                      style={{ background: 'rgba(201,168,76,0.05)' }}
                    >
                      <p className="text-micro text-neutral-500 uppercase tracking-wider mb-2">Score Global</p>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-display-xl text-brand-accent">{analysis.global_score.toFixed(1)}</span>
                        <span className="text-body-sm text-neutral-400">/10</span>
                      </div>
                      <ScoreBar score={analysis.global_score} showBand size="md" className="mt-3" />
                    </motion.div>

                    <div className="p-6 rounded-2xl border border-neutral-700/30 bg-white/[0.02]">
                      <p className="text-micro text-neutral-500 uppercase tracking-wider mb-2">Confiança Geral</p>
                      <ConfidenceBadge confidence={analysis.confidence_overall} showLabel size="lg" />
                      <p className="text-micro text-neutral-500 mt-3">{analysis.methodology_note}</p>
                    </div>

                    <div className="p-6 rounded-2xl border border-neutral-700/30 bg-white/[0.02]">
                      <p className="text-micro text-neutral-500 uppercase tracking-wider mb-2">Validação Cruzada</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Shield className="w-5 h-5 text-confidence-high" />
                        <span className="text-body-md text-confidence-high font-semibold">VCO Aprovado</span>
                      </div>
                      <p className="text-micro text-neutral-500 mt-2">Cross-validation GPT-4o ✓</p>
                      <p className="text-micro text-neutral-500">PIR+ aplicado ✓</p>
                    </div>
                  </div>
                </section>

                {/* Avatar Welcome */}
                {avatar && <AvatarCard avatar={avatar} variant="hero" />}

                {/* Radar + Confidence Distribution */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl border border-neutral-700/30 bg-white/[0.02]">
                    <h3 className="text-heading-md font-semibold text-neutral-50 mb-4">Radar de Eixos</h3>
                    <RadarAxisChart axes={analysis.axes} />
                  </div>
                  <div className="p-6 rounded-2xl border border-neutral-700/30 bg-white/[0.02]">
                    <ConfidenceDistribution axes={analysis.axes} />
                  </div>
                </section>

                {/* Layer Selector */}
                <div className="flex items-center gap-2 p-1 rounded-xl bg-white/[0.03] border border-neutral-700/30 w-fit">
                  {([1, 2, 3] as PedagogicalLayer[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLayer(l)}
                      className={`px-4 py-2 rounded-lg text-body-sm font-medium transition-all ${
                        layer === l
                          ? 'bg-brand-accent text-brand-primary'
                          : 'text-neutral-400 hover:text-neutral-50'
                      }`}
                    >
                      L{l} · {layerLabels[l].label}
                    </button>
                  ))}
                </div>

                {/* Axis Analysis Grid */}
                <section>
                  <h2 className="font-display text-heading-xl text-neutral-50 mb-6">Análise por Eixo</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {analysis.axes.map((axis) => (
                      <AxisCard key={axis.axis_id} axis={axis} onClick={() => setSelectedAxis(axis)} />
                    ))}
                  </div>
                </section>

                {/* Cross Effects */}
                <section>
                  <h2 className="font-display text-heading-xl text-neutral-50 mb-6">Efeitos Cruzados entre Eixos</h2>
                  <div className="space-y-3">
                    {analysis.cross_effects.map((effect, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-4 p-4 rounded-xl border border-neutral-700/30 bg-white/[0.02]"
                      >
                        <div className="flex items-center gap-2 shrink-0 mt-0.5">
                          <span className="px-2 py-0.5 rounded bg-axis-a/10 text-axis-a text-micro font-mono">{effect.from_axis.slice(0, 12)}</span>
                          <span className="text-neutral-600">→</span>
                          <span className="px-2 py-0.5 rounded bg-axis-b/10 text-axis-b text-micro font-mono">{effect.to_axis.slice(0, 12)}</span>
                        </div>
                        <p className="text-body-sm text-neutral-300 leading-relaxed">{effect.description}</p>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-micro font-medium ${
                          effect.strength === 'strong' ? 'bg-confidence-high/10 text-confidence-high' :
                          effect.strength === 'moderate' ? 'bg-confidence-medium/10 text-confidence-medium' :
                          'bg-neutral-700 text-neutral-400'
                        }`}>
                          {effect.strength === 'strong' ? 'Forte' : effect.strength === 'moderate' ? 'Moderado' : 'Fraco'}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </section>

                {/* Export */}
                <ExportPanel />

                {/* Audit Trail */}
                <section className="border-t border-neutral-700/30 pt-8">
                  <details className="group">
                    <summary className="flex items-center gap-2 cursor-pointer text-body-sm text-neutral-500 hover:text-neutral-200 transition-colors">
                      <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                      Trilha de Auditoria — Esta análise é auditável
                    </summary>
                    <div className="mt-4 p-4 rounded-xl border border-neutral-700/30 bg-white/[0.02] font-mono text-micro text-neutral-400 space-y-2">
                      <p><span className="text-neutral-500">Prompt:</span> {analysis.audit_trail.prompt_id} v{analysis.audit_trail.prompt_version}</p>
                      <p><span className="text-neutral-500">Modelo:</span> {analysis.audit_trail.model} ({analysis.audit_trail.model_version})</p>
                      <p><span className="text-neutral-500">Framework:</span> v{analysis.framework_version}</p>
                      <p><span className="text-neutral-500">VCO:</span> {analysis.audit_trail.vco_result.passed ? '✓ Aprovado' : '✗ Reprovado'} ({analysis.audit_trail.vco_result.model})</p>
                      <p><span className="text-neutral-500">Gerado em:</span> {new Date(analysis.generated_at).toLocaleString('pt-BR')}</p>
                      <p><span className="text-neutral-500">Confiança declarada:</span> {(analysis.audit_trail.confidence_declared * 100).toFixed(0)}%</p>
                    </div>
                  </details>
                </section>
              </div>
            </ErrorBoundary>
          )}
        </main>
      </div>

      {/* Axis Detail Panel */}
      {selectedAxis && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-40 bg-black/50" onClick={() => setSelectedAxis(null)} />
          <AxisDetailPanel axis={selectedAxis} onClose={() => setSelectedAxis(null)} />
        </>
      )}

      {/* PDF Preview */}
      {analysis && country && (
        <PDFPreview
          analysis={analysis}
          country={country}
          avatar={avatar || undefined}
          isOpen={showPdfPreview}
          onClose={() => setShowPdfPreview(false)}
        />
      )}
    </div>
  );
};

export default AnalyzePage;
