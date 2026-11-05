/**
 * LibraryPage — Public analysis library
 * Sprint 11: Analysis catalog with filters, search, mock data
 */
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import {
  Search, ChevronRight, Filter, Globe2,
  Calendar, BarChart3, Shield, ArrowUpRight,
} from "lucide-react";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import { ScoreBar } from "@/components/ui/score-bar";
import { ConfidenceBadge } from "@/components/ui/confidence-badge";

interface LibraryEntry {
  id: string;
  countryId: string;
  countryName: string;
  flag: string;
  period: string;
  score: number;
  confidence: number;
  continent: string;
  axesCount: number;
  vcoApproved: boolean;
  generatedAt: string;
  highlights: string;
}

const mockLibrary: LibraryEntry[] = [
  { id: "br-2024", countryId: "br", countryName: "Brasil", flag: "🇧🇷", period: "2019-2024", score: 5.8, confidence: 0.76, continent: "Américas", axesCount: 9, vcoApproved: true, generatedAt: "2024-12-15", highlights: "Gestão Digital destaque (6.7). Sustentabilidade com desafios persistentes." },
  { id: "uy-2024", countryId: "uy", countryName: "Uruguai", flag: "🇺🇾", period: "2019-2024", score: 7.4, confidence: 0.82, continent: "Américas", axesCount: 9, vcoApproved: true, generatedAt: "2024-11-20", highlights: "Referência em democracia. Integridade Institucional exemplar na região." },
  { id: "de-2024", countryId: "de", countryName: "Alemanha", flag: "🇩🇪", period: "2019-2024", score: 7.8, confidence: 0.88, continent: "Europa", axesCount: 9, vcoApproved: true, generatedAt: "2024-10-08", highlights: "Transição energética ambiciosa. Federalismo eficiente com desafios migratórios." },
  { id: "se-2024", countryId: "se", countryName: "Suécia", flag: "🇸🇪", period: "2019-2024", score: 8.2, confidence: 0.91, continent: "Europa", axesCount: 9, vcoApproved: true, generatedAt: "2024-09-15", highlights: "Excelência em desenvolvimento social e transparência institucional." },
  { id: "ng-2024", countryId: "ng", countryName: "Nigéria", flag: "🇳🇬", period: "2019-2024", score: 3.6, confidence: 0.58, continent: "África", axesCount: 9, vcoApproved: true, generatedAt: "2024-12-01", highlights: "Potencial demográfico enorme. Desafios de segurança e governança federativa." },
  { id: "jp-2024", countryId: "jp", countryName: "Japão", flag: "🇯🇵", period: "2019-2024", score: 7.6, confidence: 0.87, continent: "Ásia", axesCount: 9, vcoApproved: true, generatedAt: "2024-11-05", highlights: "Gestão pública digital avançada. Desafio demográfico define o futuro." },
  { id: "za-2024", countryId: "za", countryName: "África do Sul", flag: "🇿🇦", period: "2019-2024", score: 4.5, confidence: 0.68, continent: "África", axesCount: 9, vcoApproved: true, generatedAt: "2024-10-20", highlights: "Democracia resiliente pós-apartheid. Desigualdade extrema persiste." },
  { id: "cl-2024", countryId: "cl", countryName: "Chile", flag: "🇨🇱", period: "2019-2024", score: 6.5, confidence: 0.79, continent: "Américas", axesCount: 9, vcoApproved: true, generatedAt: "2024-11-12", highlights: "Estabilidade macroeconômica sólida. Processo constituinte gerou incerteza institucional." },
  { id: "in-2024", countryId: "in", countryName: "Índia", flag: "🇮🇳", period: "2019-2024", score: 5.1, confidence: 0.64, continent: "Ásia", axesCount: 9, vcoApproved: true, generatedAt: "2024-12-10", highlights: "Crescimento econômico acelerado. Pressão sobre instituições democráticas." },
];

const continentFilters = ["Todos", "África", "Américas", "Ásia", "Europa"];

const LibraryPage = () => {
  const [search, setSearch] = useState("");
  const [continent, setContinent] = useState("Todos");
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'confidence'>('date');

  const filtered = useMemo(() => {
    let items = mockLibrary;
    if (search) items = items.filter(e => e.countryName.toLowerCase().includes(search.toLowerCase()));
    if (continent !== "Todos") items = items.filter(e => e.continent === continent);
    return items.sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'confidence') return b.confidence - a.confidence;
      return new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime();
    });
  }, [search, continent, sortBy]);

  return (
    <>
      <NavBar />
      <main className="min-h-screen pt-16">
        <div className="max-w-[1280px] mx-auto px-6 py-12">
          <nav className="flex items-center gap-2 text-body-sm text-neutral-500 mb-8" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-neutral-200 transition-colors">Início</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-neutral-200">Biblioteca Pública</span>
          </nav>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-display-lg text-neutral-50 mb-2">Biblioteca Pública</h1>
            <p className="text-body-md text-neutral-400 mb-10 max-w-xl">
              Todas as análises publicadas, com trilha de auditoria completa e fontes verificadas.
            </p>
          </motion.div>

          {/* Filters bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar país..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-neutral-700/50 text-body-sm text-neutral-50 placeholder:text-neutral-600 focus:outline-none focus:border-brand-accent/50 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {continentFilters.map((c) => (
                <button
                  key={c}
                  onClick={() => setContinent(c)}
                  className={`px-4 py-2 rounded-lg text-body-sm font-medium transition-all ${
                    continent === c
                      ? 'bg-brand-accent text-brand-primary'
                      : 'text-neutral-400 hover:text-neutral-50 bg-white/[0.03] border border-neutral-700/30'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'score' | 'date' | 'confidence')}
              className="px-4 py-2 rounded-xl bg-white/[0.04] border border-neutral-700/50 text-body-sm text-neutral-200 focus:outline-none focus:border-brand-accent/50"
              aria-label="Ordenar por"
            >
              <option value="date">Mais recentes</option>
              <option value="score">Maior score</option>
              <option value="confidence">Maior confiança</option>
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="p-4 rounded-xl border border-neutral-700/30 bg-white/[0.02] text-center">
              <p className="font-display text-heading-xl text-neutral-50">{mockLibrary.length}</p>
              <p className="text-micro text-neutral-500">Análises publicadas</p>
            </div>
            <div className="p-4 rounded-xl border border-neutral-700/30 bg-white/[0.02] text-center">
              <p className="font-display text-heading-xl text-brand-accent">
                {new Set(mockLibrary.map(e => e.continent)).size}
              </p>
              <p className="text-micro text-neutral-500">Continentes</p>
            </div>
            <div className="p-4 rounded-xl border border-neutral-700/30 bg-white/[0.02] text-center">
              <p className="font-display text-heading-xl text-confidence-high">100%</p>
              <p className="text-micro text-neutral-500">VCO aprovadas</p>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <Globe2 className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                <p className="text-body-md text-neutral-400">Nenhuma análise encontrada.</p>
              </div>
            )}
            {filtered.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  to={`/analyze/${entry.countryId}`}
                  className="block p-5 rounded-xl border border-neutral-700/30 hover:border-brand-accent/30 transition-all bg-white/[0.02] group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{entry.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-body-md font-semibold text-neutral-50 group-hover:text-brand-accent transition-colors">{entry.countryName}</h3>
                        <span className="px-2 py-0.5 rounded bg-neutral-700/50 text-micro text-neutral-400">{entry.continent}</span>
                        {entry.vcoApproved && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-confidence-high/10 text-confidence-high text-micro">
                            <Shield className="w-3 h-3" /> VCO ✓
                          </span>
                        )}
                      </div>
                      <p className="text-body-sm text-neutral-400 line-clamp-1">{entry.highlights}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-micro text-neutral-500 mb-1">Score</p>
                        <ScoreBar score={entry.score} showBand size="sm" />
                      </div>
                      <div className="text-right">
                        <p className="text-micro text-neutral-500 mb-1">Confiança</p>
                        <ConfidenceBadge confidence={entry.confidence} size="sm" />
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-micro text-neutral-500 mb-1">Período</p>
                        <p className="text-micro text-neutral-200 font-mono">{entry.period}</p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-neutral-600 group-hover:text-brand-accent transition-colors shrink-0" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default LibraryPage;
