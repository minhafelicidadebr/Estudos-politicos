/**
 * ComparePage — Side-by-side country comparison
 * Sprint 12: Compare two countries across all axes
 */
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import {
  ChevronRight, GitCompare, ArrowLeftRight,
  Brain, Leaf, Shield, TrendingUp, Globe2,
  Zap, Users, Cpu, Heart,
} from "lucide-react";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import { ScoreBar } from "@/components/ui/score-bar";
import { ConfidenceBadge } from "@/components/ui/confidence-badge";

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

interface CompareCountry {
  id: string;
  name: string;
  flag: string;
  score: number;
  confidence: number;
  axes: { name: string; score: number; confidence: number }[];
}

const mockCountries: CompareCountry[] = [
  {
    id: "br", name: "Brasil", flag: "🇧🇷", score: 5.8, confidence: 0.76,
    axes: [
      { name: "Capital Humano e Inovação", score: 5.2, confidence: 0.82 },
      { name: "Sustentabilidade Ambiental", score: 4.8, confidence: 0.73 },
      { name: "Integridade Institucional", score: 5.1, confidence: 0.78 },
      { name: "Macroeconomia", score: 6.3, confidence: 0.85 },
      { name: "Inserção Internacional", score: 6.0, confidence: 0.71 },
      { name: "Infraestrutura e Energia", score: 5.5, confidence: 0.79 },
      { name: "Desenvolvimento Social", score: 5.4, confidence: 0.80 },
      { name: "Gestão Pública Digital", score: 6.7, confidence: 0.83 },
      { name: "Saúde Pública", score: 5.6, confidence: 0.77 },
    ],
  },
  {
    id: "uy", name: "Uruguai", flag: "🇺🇾", score: 7.4, confidence: 0.82,
    axes: [
      { name: "Capital Humano e Inovação", score: 6.8, confidence: 0.85 },
      { name: "Sustentabilidade Ambiental", score: 7.1, confidence: 0.80 },
      { name: "Integridade Institucional", score: 8.2, confidence: 0.90 },
      { name: "Macroeconomia", score: 6.9, confidence: 0.84 },
      { name: "Inserção Internacional", score: 6.5, confidence: 0.76 },
      { name: "Infraestrutura e Energia", score: 7.0, confidence: 0.82 },
      { name: "Desenvolvimento Social", score: 7.8, confidence: 0.87 },
      { name: "Gestão Pública Digital", score: 7.5, confidence: 0.83 },
      { name: "Saúde Pública", score: 7.6, confidence: 0.85 },
    ],
  },
  {
    id: "de", name: "Alemanha", flag: "🇩🇪", score: 7.8, confidence: 0.88,
    axes: [
      { name: "Capital Humano e Inovação", score: 8.1, confidence: 0.92 },
      { name: "Sustentabilidade Ambiental", score: 7.2, confidence: 0.85 },
      { name: "Integridade Institucional", score: 8.4, confidence: 0.91 },
      { name: "Macroeconomia", score: 7.5, confidence: 0.89 },
      { name: "Inserção Internacional", score: 8.0, confidence: 0.87 },
      { name: "Infraestrutura e Energia", score: 7.3, confidence: 0.86 },
      { name: "Desenvolvimento Social", score: 7.9, confidence: 0.88 },
      { name: "Gestão Pública Digital", score: 7.4, confidence: 0.84 },
      { name: "Saúde Pública", score: 8.0, confidence: 0.90 },
    ],
  },
  {
    id: "ng", name: "Nigéria", flag: "🇳🇬", score: 3.6, confidence: 0.58,
    axes: [
      { name: "Capital Humano e Inovação", score: 3.2, confidence: 0.55 },
      { name: "Sustentabilidade Ambiental", score: 3.5, confidence: 0.52 },
      { name: "Integridade Institucional", score: 2.8, confidence: 0.60 },
      { name: "Macroeconomia", score: 4.1, confidence: 0.62 },
      { name: "Inserção Internacional", score: 3.9, confidence: 0.56 },
      { name: "Infraestrutura e Energia", score: 3.0, confidence: 0.54 },
      { name: "Desenvolvimento Social", score: 3.3, confidence: 0.58 },
      { name: "Gestão Pública Digital", score: 4.2, confidence: 0.60 },
      { name: "Saúde Pública", score: 3.4, confidence: 0.55 },
    ],
  },
];

function RadarChart({ countries, size = 280 }: { countries: CompareCountry[]; size?: number }) {
  const center = size / 2;
  const radius = size * 0.38;
  const axes = countries[0]?.axes || [];
  const n = axes.length;
  const colors = ['hsl(var(--axis-a))', 'hsl(var(--confidence-high))'];

  const getPoint = (axisIndex: number, value: number) => {
    const angle = (Math.PI * 2 * axisIndex) / n - Math.PI / 2;
    const r = (value / 10) * radius;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-sm mx-auto">
      {/* Grid */}
      {[2, 4, 6, 8, 10].map((level) => {
        const points = Array.from({ length: n }, (_, i) => {
          const p = getPoint(i, level);
          return `${p.x},${p.y}`;
        }).join(' ');
        return <polygon key={level} points={points} fill="none" stroke="hsl(0 0% 18%)" strokeWidth="0.5" opacity={0.5} />;
      })}
      {/* Axis lines */}
      {axes.map((_, i) => {
        const p = getPoint(i, 10);
        return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="hsl(0 0% 18%)" strokeWidth="0.5" opacity={0.3} />;
      })}
      {/* Labels */}
      {axes.map((axis, i) => {
        const p = getPoint(i, 11.5);
        return (
          <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
            fill="hsl(0 0% 54%)" fontSize="8" fontFamily="'DM Sans', sans-serif">
            {axis.name.split(' ').slice(0, 2).join(' ')}
          </text>
        );
      })}
      {/* Data polygons */}
      {countries.map((country, ci) => {
        const points = country.axes.map((axis, i) => {
          const p = getPoint(i, axis.score);
          return `${p.x},${p.y}`;
        }).join(' ');
        return (
          <motion.polygon
            key={country.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: ci * 0.3 }}
            points={points}
            fill={colors[ci] || 'hsl(var(--brand-accent))'}
            fillOpacity={0.1}
            stroke={colors[ci] || 'hsl(var(--brand-accent))'}
            strokeWidth="1.5"
          />
        );
      })}
      {/* Data points */}
      {countries.map((country, ci) =>
        country.axes.map((axis, i) => {
          const p = getPoint(i, axis.score);
          return <circle key={`${ci}-${i}`} cx={p.x} cy={p.y} r="3" fill={colors[ci] || 'hsl(var(--brand-accent))'} />;
        })
      )}
    </svg>
  );
}

const ComparePage = () => {
  const [leftId, setLeftId] = useState("br");
  const [rightId, setRightId] = useState("uy");

  const left = useMemo(() => mockCountries.find(c => c.id === leftId)!, [leftId]);
  const right = useMemo(() => mockCountries.find(c => c.id === rightId)!, [rightId]);

  return (
    <>
      <NavBar />
      <main className="min-h-screen pt-16">
        <div className="max-w-[1280px] mx-auto px-6 py-12">
          <nav className="flex items-center gap-2 text-body-sm text-neutral-500 mb-8" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-neutral-200 transition-colors">Início</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-neutral-200">Comparação</span>
          </nav>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            {/* Banner */}
            <div className="mb-6 p-4 rounded-xl border border-brand-accent/20 bg-brand-accent/5">
              <p className="text-body-sm text-neutral-400">
                Esta página compara <strong className="text-neutral-200">países</strong>. Para comparar <strong className="text-neutral-200">governos históricos</strong> com análise PIR+ completa,{' '}
                <Link to="/comparative/br" className="text-brand-accent hover:underline font-medium">acesse a Análise Comparativa de Governos →</Link>
              </p>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <GitCompare className="w-8 h-8 text-brand-accent" />
              <h1 className="font-display text-display-lg text-neutral-50">Comparação de Países</h1>
            </div>
            <p className="text-body-md text-neutral-400">Análise lado a lado com radar de 9 eixos universais.</p>
          </motion.div>

          {/* Country selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 items-center">
            <select
              value={leftId}
              onChange={(e) => setLeftId(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/[0.04] border border-neutral-700/50 text-body-sm text-neutral-50 focus:outline-none focus:border-brand-accent/50"
              aria-label="País esquerdo"
            >
              {mockCountries.map(c => <option key={c.id} value={c.id}>{c.flag} {c.name}</option>)}
            </select>
            <div className="flex justify-center">
              <ArrowLeftRight className="w-6 h-6 text-neutral-600" />
            </div>
            <select
              value={rightId}
              onChange={(e) => setRightId(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/[0.04] border border-neutral-700/50 text-body-sm text-neutral-50 focus:outline-none focus:border-brand-accent/50"
              aria-label="País direito"
            >
              {mockCountries.map(c => <option key={c.id} value={c.id}>{c.flag} {c.name}</option>)}
            </select>
          </div>

          {/* Global scores */}
          <div className="grid grid-cols-2 gap-6 mb-12">
            {[left, right].map((country) => (
              <motion.div
                key={country.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl border border-neutral-700/30 bg-white/[0.02] text-center"
              >
                <span className="text-4xl block mb-2">{country.flag}</span>
                <h2 className="font-display text-heading-lg text-neutral-50 mb-3">{country.name}</h2>
                <div className="flex items-baseline justify-center gap-2 mb-3">
                  <span className="font-display text-display-xl text-brand-accent">{country.score.toFixed(1)}</span>
                  <span className="text-body-sm text-neutral-400">/10</span>
                </div>
                <ConfidenceBadge confidence={country.confidence} showLabel size="md" />
              </motion.div>
            ))}
          </div>

          {/* Radar Chart */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-8 rounded-2xl border border-neutral-700/30 bg-white/[0.02] mb-12"
          >
            <h3 className="font-display text-heading-lg text-neutral-50 text-center mb-6">Radar Comparativo</h3>
            <div className="flex justify-center gap-6 mb-4">
              <span className="flex items-center gap-2 text-micro text-neutral-400">
                <span className="w-3 h-3 rounded-full bg-axis-a" /> {left.name}
              </span>
              <span className="flex items-center gap-2 text-micro text-neutral-400">
                <span className="w-3 h-3 rounded-full bg-confidence-high" /> {right.name}
              </span>
            </div>
            <RadarChart countries={[left, right]} size={320} />
          </motion.div>

          {/* Axis-by-axis comparison */}
          <h3 className="font-display text-heading-xl text-neutral-50 mb-6">Comparação por Eixo</h3>
          <div className="space-y-3">
            {left.axes.map((axis, i) => {
              const rightAxis = right.axes[i];
              const Icon = axisIcons[axis.name] || Brain;
              const diff = axis.score - rightAxis.score;
              return (
                <motion.div
                  key={axis.name}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="p-4 rounded-xl border border-neutral-700/30 bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className="w-4 h-4 text-axis-a shrink-0" />
                    <span className="text-body-sm font-semibold text-neutral-50 flex-1">{axis.name}</span>
                    <span className={`font-mono text-micro font-semibold ${
                      Math.abs(diff) < 0.5 ? 'text-neutral-400' :
                      diff > 0 ? 'text-axis-a' : 'text-confidence-high'
                    }`}>
                      Δ {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-micro text-neutral-500 mb-1">{left.flag} {left.name}</p>
                      <ScoreBar score={axis.score} showBand size="sm" />
                    </div>
                    <div>
                      <p className="text-micro text-neutral-500 mb-1">{right.flag} {right.name}</p>
                      <ScoreBar score={rightAxis.score} showBand size="sm" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ComparePage;
