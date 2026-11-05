/**
 * CountrySelectorModal — Slide panel for country selection
 * Slide from right on desktop, bottom sheet on mobile
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, MapPin, Building2 } from "lucide-react";
import { seedCountries, continents } from "@/data/countries";
import type { CountryProfile, StatisticalMaturity } from "@/types/aegis";
import { useNavigate } from "react-router-dom";

interface CountrySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const maturityColors: Record<StatisticalMaturity, { bg: string; text: string; label: string }> = {
  high: { bg: 'bg-confidence-high/10', text: 'text-confidence-high', label: 'Alta' },
  medium: { bg: 'bg-confidence-medium/10', text: 'text-confidence-medium', label: 'Média' },
  low: { bg: 'bg-confidence-low/10', text: 'text-confidence-low', label: 'Baixa' },
  limited: { bg: 'bg-confidence-inconclusive/10', text: 'text-confidence-inconclusive', label: 'Limitada' },
};

const regimeLabels: Record<string, string> = {
  presidential: 'Presidencialismo',
  parliamentary: 'Parlamentarismo',
  'semi-presidential': 'Semipresidencialismo',
  monarchy: 'Monarquia',
  hybrid: 'Híbrido',
  other: 'Outro',
};

function CountryCard({ country, onClick }: { country: CountryProfile; onClick: () => void }) {
  const mat = maturityColors[country.statistical_maturity];
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-xl border border-neutral-700/30 hover:border-brand-accent/30 hover:bg-white/[0.02] transition-all group text-left"
    >
      <span className="text-3xl leading-none shrink-0">{country.flag_emoji}</span>
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <span className="text-body-sm font-semibold text-neutral-50 group-hover:text-brand-accent transition-colors truncate">
          {country.name_display_pt}
        </span>
        <div className="flex items-center gap-2 text-micro text-neutral-400">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{country.capital.name}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className={`px-2 py-0.5 rounded-full text-micro font-medium ${mat.bg} ${mat.text}`}>
          {mat.label}
        </span>
        <span className="text-micro text-neutral-600">{regimeLabels[country.regime]}</span>
      </div>
    </button>
  );
}

export function CountrySelectorModal({ isOpen, onClose }: CountrySelectorModalProps) {
  const [search, setSearch] = useState("");
  const [continent, setContinent] = useState<string>("Todos");
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    return seedCountries.filter((c) => {
      const matchSearch = !search || c.name_display_pt.toLowerCase().includes(search.toLowerCase()) || c.capital.name.toLowerCase().includes(search.toLowerCase());
      const matchContinent = continent === "Todos" || c.continent === continent;
      return matchSearch && matchContinent;
    });
  }, [search, continent]);

  const handleSelect = (country: CountryProfile) => {
    onClose();
    navigate(`/analyze/${country.id.toLowerCase()}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel — slide from right on desktop, from bottom on mobile */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg border-l border-neutral-700/50 flex flex-col lg:rounded-none rounded-t-2xl"
            style={{ background: 'linear-gradient(180deg, hsl(216 55% 12%) 0%, hsl(216 60% 9%) 100%)' }}
          >
            {/* Header */}
            <div className="p-6 border-b border-neutral-700/40 shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-brand-accent" />
                  <h2 className="font-display text-heading-lg text-neutral-50">Escolher País</h2>
                </div>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full border border-neutral-700 text-neutral-400 hover:text-neutral-50 hover:border-neutral-400 transition-all" aria-label="Fechar">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Buscar país ou capital..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-neutral-700/50 text-body-sm text-neutral-50 placeholder:text-neutral-600 focus:outline-none focus:border-brand-accent/50 transition-colors"
                />
              </div>

              {/* Continent filters */}
              <div className="flex flex-wrap gap-2">
                {continents.map((c) => (
                  <button
                    key={c}
                    onClick={() => setContinent(c)}
                    className={`px-3 py-1.5 rounded-full text-micro font-medium transition-all ${
                      continent === c
                        ? 'bg-brand-accent text-brand-primary'
                        : 'bg-white/[0.04] text-neutral-400 hover:text-neutral-50 border border-neutral-700/30'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Country list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-neutral-600">
                  <Search className="w-8 h-8 mb-3" />
                  <p className="text-body-sm">Nenhum país encontrado</p>
                </div>
              ) : (
                filtered.map((country) => (
                  <CountryCard key={country.id} country={country} onClick={() => handleSelect(country)} />
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-700/40 shrink-0">
              <p className="text-micro text-neutral-600 text-center">
                {filtered.length} de {seedCountries.length} países disponíveis · Mais países em breve
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
