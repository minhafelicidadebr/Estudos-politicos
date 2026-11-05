/**
 * AR+ Audit Page — Algorithmic bias auditing interface
 */
import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bot, GitCompare, AlertTriangle, BarChart3,
  Globe2, Languages, UserCircle, MessageSquare,
  ChevronRight, Shield, Eye, Zap,
} from "lucide-react";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";

interface MockTestResult {
  id: string;
  country: string;
  variable: string;
  variableIcon: React.ElementType;
  model: string;
  asymmetry: number;
  type: string;
  severity: 'critical' | 'significant' | 'minor' | 'none';
  description: string;
}

// Cenários ILUSTRATIVOS do método de teste pareado — não são execuções reais.
// Nenhum teste foi rodado contra modelos de terceiros; os nomes de modelo
// abaixo são genéricos de propósito. A execução real (contra os modelos que
// a Ágora de fato usa) está na Onda 4 do PLANO_ELEVACAO_180.md.
const illustrativeTests: MockTestResult[] = [
  { id: "1", country: "Venezuela", variable: "Idioma", variableIcon: Languages, model: "Modelo A", asymmetry: 0.72, type: "framing", severity: "critical", description: "Exemplo do tipo de assimetria que o protocolo busca detectar: análise em inglês enfatizando crise humanitária vs. espanhol enfatizando soberania." },
  { id: "2", country: "China", variable: "Localidade", variableIcon: Globe2, model: "Modelo B", asymmetry: 0.45, type: "omission", severity: "significant", description: "Cenário ilustrativo de omissão dependente de origem da consulta — a ser validado por execução real." },
  { id: "3", country: "Brasil", variable: "Perfil", variableIcon: UserCircle, model: "Modelo A", asymmetry: 0.18, type: "tonal", severity: "minor", description: "Cenário ilustrativo de variação tonal por perfil de usuário." },
  { id: "4", country: "Suécia", variable: "Fraseamento", variableIcon: MessageSquare, model: "Modelo B", asymmetry: 0.05, type: "factual", severity: "none", description: "Cenário ilustrativo de robustez a variação de fraseamento." },
  { id: "5", country: "Nigéria", variable: "Idioma", variableIcon: Languages, model: "Modelo A", asymmetry: 0.58, type: "framing", severity: "significant", description: "Cenário ilustrativo de enquadramento divergente por idioma da consulta." },
];

const severityConfig = {
  critical: { label: 'Crítico', color: 'text-confidence-low', bg: 'bg-confidence-low/10', border: 'border-confidence-low/30' },
  significant: { label: 'Significativo', color: 'text-confidence-medium', bg: 'bg-confidence-medium/10', border: 'border-confidence-medium/30' },
  minor: { label: 'Menor', color: 'text-axis-a', bg: 'bg-axis-a/10', border: 'border-axis-a/30' },
  none: { label: 'Nenhum', color: 'text-confidence-high', bg: 'bg-confidence-high/10', border: 'border-confidence-high/30' },
};

function AsymmetryBar({ value }: { value: number }) {
  const pct = value * 100;
  const color = value > 0.5 ? 'hsl(var(--confidence-low))' : value > 0.25 ? 'hsl(var(--confidence-medium))' : 'hsl(var(--confidence-high))';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 rounded-full bg-neutral-700/50 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        />
      </div>
      <span className="font-mono text-micro" style={{ color }}>{(value * 100).toFixed(0)}%</span>
    </div>
  );
}

const AuditPage = () => {
  const [selectedTest, setSelectedTest] = useState<MockTestResult | null>(null);

  const stats = {
    total: illustrativeTests.length,
    critical: illustrativeTests.filter(t => t.severity === 'critical').length,
    avgAsymmetry: illustrativeTests.reduce((acc, t) => acc + t.asymmetry, 0) / illustrativeTests.length,
  };

  return (
    <>
      <NavBar />
      <main className="min-h-screen pt-16">
        <div className="max-w-[1280px] mx-auto px-6 py-12">
          {/* Header */}
          <nav className="flex items-center gap-2 text-body-sm text-neutral-500 mb-8" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-neutral-200 transition-colors">Início</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-neutral-200">AR+ Auditoria Algorítmica</span>
          </nav>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-confidence-low/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-confidence-low" />
              </div>
              <div>
                <h1 className="font-display text-display-lg text-neutral-50">AR+ Auditoria Algorítmica</h1>
                <p className="text-body-sm text-neutral-400">Detectando vieses em sistemas de IA usados para análise política</p>
              </div>
            </div>
          </motion.div>

          <div className="my-6 p-4 rounded-xl border border-confidence-medium/30 bg-confidence-medium/5 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-confidence-medium shrink-0 mt-0.5" />
            <p className="text-body-sm text-neutral-300">
              <strong className="text-confidence-medium">Protocolo em validação.</strong> Os cenários abaixo ilustram
              o método de teste pareado (mesma pergunta, variável controlada) que o AR+ usará — não são o resultado
              de uma auditoria já executada. Nenhum modelo de terceiros foi testado até o momento.
            </p>
          </div>

          {/* Concept cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-10">
            {[
              { icon: Eye, title: "Transparência Radical", desc: "O protocolo testará os mesmos LLMs que usamos. Se detectarmos viés, declaramos. Nenhum modelo é confiável por padrão." },
              { icon: GitCompare, title: "Testes Pareados", desc: "Mesma pergunta, variáveis diferentes: idioma, localidade, perfil, fraseamento. A diferença revela o viés." },
              { icon: Shield, title: "Governança Aberta", desc: "Quando os testes rodarem em produção, os resultados serão publicados com metodologia replicável." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="p-6 rounded-xl border border-neutral-700/30"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <item.icon className="w-6 h-6 text-brand-accent mb-3" />
                <h3 className="text-body-md font-semibold text-neutral-50 mb-2">{item.title}</h3>
                <p className="text-body-sm text-neutral-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="p-5 rounded-xl border border-neutral-700/30 bg-white/[0.02] text-center">
              <p className="font-display text-display-lg text-neutral-50">{stats.total}</p>
              <p className="text-micro text-neutral-500">Testes realizados</p>
            </div>
            <div className="p-5 rounded-xl border border-confidence-low/30 bg-confidence-low/5 text-center">
              <p className="font-display text-display-lg text-confidence-low">{stats.critical}</p>
              <p className="text-micro text-neutral-500">Vieses críticos</p>
            </div>
            <div className="p-5 rounded-xl border border-neutral-700/30 bg-white/[0.02] text-center">
              <p className="font-display text-display-lg text-confidence-medium">{(stats.avgAsymmetry * 100).toFixed(0)}%</p>
              <p className="text-micro text-neutral-500">Assimetria média</p>
            </div>
          </div>

          {/* Test results table */}
          <h2 className="font-display text-heading-xl text-neutral-50 mb-6">Resultados dos Testes</h2>
          <div className="space-y-3">
            {illustrativeTests.map((test, i) => {
              const sev = severityConfig[test.severity];
              return (
                <motion.button
                  key={test.id}
                  onClick={() => setSelectedTest(selectedTest?.id === test.id ? null : test)}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className={`w-full text-left p-5 rounded-xl border transition-all ${
                    selectedTest?.id === test.id ? `${sev.border} ${sev.bg}` : 'border-neutral-700/30 hover:border-neutral-600/50 bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{test.country === 'Brasil' ? '🇧🇷' : test.country === 'Venezuela' ? '🇻🇪' : test.country === 'China' ? '🇨🇳' : test.country === 'Suécia' ? '🇸🇪' : '🇳🇬'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-body-sm font-semibold text-neutral-50">{test.country}</span>
                        <span className={`px-2 py-0.5 rounded-full text-micro font-medium ${sev.bg} ${sev.color}`}>{sev.label}</span>
                      </div>
                      <div className="flex items-center gap-3 text-micro text-neutral-400">
                        <test.variableIcon className="w-3.5 h-3.5" />
                        <span>{test.variable}</span>
                        <span>·</span>
                        <span>{test.model}</span>
                        <span>·</span>
                        <span className="capitalize">{test.type}</span>
                      </div>
                    </div>
                    <AsymmetryBar value={test.asymmetry} />
                    <ChevronRight className={`w-4 h-4 text-neutral-600 transition-transform ${selectedTest?.id === test.id ? 'rotate-90' : ''}`} />
                  </div>
                  {selectedTest?.id === test.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pt-4 border-t border-neutral-700/30"
                    >
                      <p className="text-body-sm text-neutral-300 leading-relaxed">{test.description}</p>
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-body-sm text-neutral-400 mb-4">O módulo AR+ completo está disponível no plano Institucional.</p>
            <button className="border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-brand-primary transition-all px-6 py-3 rounded-full text-body-sm font-medium">
              Solicitar acesso institucional
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AuditPage;
