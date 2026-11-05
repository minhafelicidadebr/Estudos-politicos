/**
 * LabHubPage — Hub unificado do Laboratório de Simulação Avançada
 * ToT/PIR+: orquestra os 11 motores determinísticos com fluxo guiado:
 *   1) Intenção (objetivo do cidadão) → 2) Filtro/Busca → 3) Módulo → 4) Jornada pedagógica
 * Zero chamadas a IA. Tudo client-side, semântica determinística.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FlaskConical, Dna, Users, Radio, Gavel, HeartHandshake, Compass, Wallet,
  Building2, Network, Brain, Search, Sparkles, Shield, ArrowRight,
  TrendingUp, Filter, BookOpen, GraduationCap, Briefcase, Microscope,
} from 'lucide-react';

type Intent = 'all' | 'citizen' | 'manager' | 'specialist';
type Category = 'all' | 'simulation' | 'wellbeing' | 'economic' | 'cognition';

interface Module {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof FlaskConical;
  color: string;
  link: string;
  badges: string[];
  jsonTag: string;
  intent: Exclude<Intent, 'all'>[];
  category: Exclude<Category, 'all'>;
  estimatedMinutes: number;
  difficulty: 1 | 2 | 3;
  keywords: string;
  pedagogicalHook: string;
}

const MODULES: Module[] = [
  {
    id: 'scenarios', title: 'Motor de Cenários Alternativos',
    subtitle: 'E se a história tivesse tomado outro caminho?',
    description: 'Análise contrafactual com Synthetic Control Method. Bifurcações históricas com impacto quantificado.',
    icon: FlaskConical, color: '#F59E0B', link: '/analyze/br/scenarios',
    badges: ['SCM', 'Fan Charts', 'Bifurcações'], jsonTag: 'JSON_18',
    intent: ['specialist', 'manager'], category: 'simulation',
    estimatedMinutes: 8, difficulty: 3,
    keywords: 'contrafactual scm synthetic control bifurcação cenário alternativo',
    pedagogicalHook: 'Aprenda a distinguir herança macro de decisão deliberada.',
  },
  {
    id: 'dna', title: 'DNA Institucional', subtitle: 'A genética oculta das instituições',
    description: 'PCA de 2 componentes para distinguir padrões estruturais de conjunturais.',
    icon: Dna, color: '#8B5CF6', link: '/analyze/br/dna',
    badges: ['PCA 2D', 'Arquetipos', 'Estrutural'], jsonTag: 'JSON_19',
    intent: ['specialist'], category: 'cognition',
    estimatedMinutes: 6, difficulty: 3,
    keywords: 'pca genética institucional arquetipo estrutural',
    pedagogicalHook: 'Veja o "tipo sanguíneo" de cada governo em duas dimensões.',
  },
  {
    id: 'politisim', title: 'PolitiSim Engine', subtitle: 'Agentes políticos em ação',
    description: 'Simulação multi-agente com 6 atores institucionais e vetores ideológicos 8D.',
    icon: Users, color: '#3B82F6', link: '/analyze/br/politisim',
    badges: ['Multi-Agente', 'Radar 8D', 'Coalizões'], jsonTag: 'JSON_21',
    intent: ['manager', 'specialist'], category: 'simulation',
    estimatedMinutes: 7, difficulty: 2,
    keywords: 'multiagente atores coalizão ideologia lealdade',
    pedagogicalHook: 'Entenda como choques reverberam pelo sistema político.',
  },
  {
    id: 'opinion', title: 'Oráculo de Opinião Pública', subtitle: 'Ondas de sentimento popular',
    description: 'SIR-Opinion Extended com 6 segmentos e 4 canais de propagação.',
    icon: Radio, color: '#06B6D4', link: '/analyze/br/opinion-oracle',
    badges: ['SIR', '3 Timelines', 'Tipping Points'], jsonTag: 'JSON_22',
    intent: ['citizen', 'manager'], category: 'simulation',
    estimatedMinutes: 5, difficulty: 2,
    keywords: 'opinião sir contágio segmento tipping point',
    pedagogicalHook: 'Visualize como narrativas viralizam (ou colapsam).',
  },
  {
    id: 'legislative', title: 'Simulador Legislativo', subtitle: 'O jogo do poder parlamentar',
    description: 'Negociação e votação com 4 bancadas, emendas e trade de votos.',
    icon: Gavel, color: '#10B981', link: '/analyze/br/legis-sim',
    badges: ['Hemiciclo', '8 Sessões', 'Emendas'], jsonTag: 'JSON_23',
    intent: ['citizen', 'manager'], category: 'simulation',
    estimatedMinutes: 6, difficulty: 2,
    keywords: 'congresso votação emenda bancada legislativo',
    pedagogicalHook: 'Sinta na prática por que tudo demora a passar.',
  },
  {
    id: 'wellbeing', title: 'Mapa de Bem-Estar Governado', subtitle: 'PIB não é felicidade',
    description: 'C-WBIG: Kahneman, Deaton, VanderWeele. Detecta o Paradoxo de Easterlin.',
    icon: HeartHandshake, color: '#D4537E', link: '/wellbeing',
    badges: ['Easterlin', 'VanderWeele 5D', 'Kahneman'], jsonTag: 'JSON_24',
    intent: ['citizen', 'specialist'], category: 'wellbeing',
    estimatedMinutes: 5, difficulty: 2,
    keywords: 'bem-estar felicidade easterlin permasc psicologia',
    pedagogicalHook: 'Descubra por que mais PIB nem sempre é mais felicidade.',
  },
  {
    id: 'career', title: 'Navegador de Carreira', subtitle: 'Governança → mercado de trabalho',
    description: 'Correlações VAR entre eixos de governança e setores profissionais.',
    icon: Compass, color: '#14B8A6', link: '/career',
    badges: ['VAR', 'CAGED/RAIS', 'Becker'], jsonTag: 'JSON_25',
    intent: ['citizen', 'manager'], category: 'economic',
    estimatedMinutes: 6, difficulty: 2,
    keywords: 'carreira trabalho var emprego setor profissional',
    pedagogicalHook: 'Antecipe quais setores vão crescer ou encolher.',
  },
  {
    id: 'fiscal', title: 'Orçamento Pessoal Governado', subtitle: 'O que cada governo fez com seu dinheiro',
    description: 'Microsimulação fiscal por 5 canais. Calibrado com BCB/FMI/IPEA.',
    icon: Wallet, color: '#F97316', link: '/fiscal-impact',
    badges: ['5 Canais', 'Piketty', 'SIB ≤0.75'], jsonTag: 'JSON_26',
    intent: ['citizen'], category: 'economic',
    estimatedMinutes: 4, difficulty: 1,
    keywords: 'fiscal orçamento imposto inflação juros renda',
    pedagogicalHook: 'Calcule, por faixa de renda, o impacto real no seu bolso.',
  },
  {
    id: 'org-wellbeing', title: 'Bem-Estar Organizacional', subtitle: 'PERMA × Trabalho × Governança',
    description: 'OWBIG conecta PERMA (Seligman) + JCM (Hackman & Oldham) à governança.',
    icon: Building2, color: '#7C3AED', link: '/org-wellbeing',
    badges: ['PERMA', 'JCM', 'Edmondson ψ'], jsonTag: 'JSON_27',
    intent: ['manager', 'specialist'], category: 'wellbeing',
    estimatedMinutes: 7, difficulty: 3,
    keywords: 'organizacional perma trabalho engajamento segurança psicológica',
    pedagogicalHook: 'Veja como políticas públicas moldam o trabalho significativo.',
  },
  {
    id: 'emergent', title: 'Inteligência Cívica Emergente', subtitle: 'O todo é maior que as partes',
    description: 'Complex Adaptive Systems aplicados a 100.000+ análises. Padrões fractais e invariâncias.',
    icon: Network, color: '#22C55E', link: '/intelligence-commons',
    badges: ['CAS', 'Fractal', 'CUSUM'], jsonTag: 'JSON_28',
    intent: ['specialist'], category: 'cognition',
    estimatedMinutes: 8, difficulty: 3,
    keywords: 'cas complexidade emergente fractal invariância cusum',
    pedagogicalHook: 'Descubra padrões que nenhuma análise individual revela.',
  },
  {
    id: 'epistemic', title: 'Radar Epistêmico', subtitle: 'A ciência de atualizar crenças',
    description: 'Bayesian Belief Updating + Motivational Interviewing + Constitutional AI.',
    icon: Brain, color: '#A855F7', link: '/epistemic-radar',
    badges: ['MI Protocol', 'Bayesian', 'Const. AI'], jsonTag: 'JSON_29',
    intent: ['citizen', 'specialist'], category: 'cognition',
    estimatedMinutes: 10, difficulty: 2,
    keywords: 'viés bayesiano crença socrático epistêmico atualização',
    pedagogicalHook: 'Treine a humildade epistêmica em 7 turnos socráticos.',
  },
];

const INTENT_META: Record<Exclude<Intent, 'all'>, { label: string; icon: typeof BookOpen; hint: string }> = {
  citizen: { label: 'Cidadão', icon: BookOpen, hint: 'Quero entender o impacto na minha vida' },
  manager: { label: 'Gestor', icon: Briefcase, hint: 'Quero decidir com dados e cenários' },
  specialist: { label: 'Especialista', icon: Microscope, hint: 'Quero metodologia e auditoria' },
};

const CATEGORY_META: Record<Exclude<Category, 'all'>, { label: string; color: string }> = {
  simulation: { label: 'Simulação', color: '#3B82F6' },
  wellbeing: { label: 'Bem-Estar', color: '#D4537E' },
  economic: { label: 'Econômico', color: '#F97316' },
  cognition: { label: 'Cognição', color: '#8B5CF6' },
};

export default function LabHubPage() {
  const [intent, setIntent] = useState<Intent>('all');
  const [category, setCategory] = useState<Category>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MODULES.filter((m) => {
      if (intent !== 'all' && !m.intent.includes(intent)) return false;
      if (category !== 'all' && m.category !== category) return false;
      if (q) {
        const hay = `${m.title} ${m.subtitle} ${m.description} ${m.keywords} ${m.badges.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [intent, category, query]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1628] via-[#0A1628] to-[#0F1E36] pb-24">
      {/* Hero */}
      <section className="relative px-4 lg:px-8 pt-24 pb-12 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-brand-accent/[0.05] blur-[140px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-accent/20 bg-brand-accent/5 mb-6">
              <Sparkles className="w-4 h-4 text-brand-accent" />
              <span className="text-xs font-medium text-brand-accent tracking-wide">LABORATÓRIO DE SIMULAÇÃO AVANÇADA</span>
            </div>
            <h1 className="font-display text-3xl lg:text-5xl text-neutral-50 mb-4">
              Escolha sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent via-amber-400 to-brand-accent">jornada analítica</span>
            </h1>
            <p className="text-neutral-400 max-w-2xl mx-auto text-sm lg:text-base">
              11 motores determinísticos, zero alucinação. Comece pela <strong className="text-neutral-200">intenção</strong>,
              não pela ferramenta — o hub guia o caminho.
            </p>
            <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
              {[
                { icon: Brain, label: '100% Determinístico' },
                { icon: Shield, label: 'Protocolo SIB + AAM' },
                { icon: TrendingUp, label: 'Auditável' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-neutral-500 text-xs">
                  <item.icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Step 1 — Intent */}
      <section className="px-4 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-mono text-brand-accent">PASSO 01</span>
            <span className="text-xs text-neutral-500">Qual o seu papel agora?</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => setIntent('all')}
              className={`p-4 rounded-xl border text-left transition-all ${
                intent === 'all'
                  ? 'border-brand-accent/50 bg-brand-accent/10'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/20'
              }`}
            >
              <Sparkles className="w-5 h-5 mb-2 text-brand-accent" />
              <div className="text-sm font-medium text-neutral-100">Tudo</div>
              <div className="text-[11px] text-neutral-500">Explorar todos os módulos</div>
            </button>
            {(Object.keys(INTENT_META) as Exclude<Intent, 'all'>[]).map((key) => {
              const meta = INTENT_META[key];
              const Icon = meta.icon;
              const active = intent === key;
              return (
                <button
                  key={key}
                  onClick={() => setIntent(active ? 'all' : key)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    active
                      ? 'border-brand-accent/50 bg-brand-accent/10'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-2 ${active ? 'text-brand-accent' : 'text-neutral-300'}`} />
                  <div className="text-sm font-medium text-neutral-100">{meta.label}</div>
                  <div className="text-[11px] text-neutral-500">{meta.hint}</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Step 2 — Filters */}
      <section className="px-4 lg:px-8 mb-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-mono text-brand-accent">PASSO 02</span>
            <span className="text-xs text-neutral-500">Refine por tema ou busque</span>
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar: 'fiscal', 'opinião', 'bayesiano'…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-brand-accent/40"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setCategory('all')}
                className={`px-3 py-2 rounded-xl text-xs border transition-all flex items-center gap-1.5 ${
                  category === 'all'
                    ? 'border-brand-accent/40 bg-brand-accent/10 text-brand-accent'
                    : 'border-white/10 bg-white/[0.02] text-neutral-400 hover:border-white/20'
                }`}
              >
                <Filter className="w-3 h-3" /> Todos
              </button>
              {(Object.keys(CATEGORY_META) as Exclude<Category, 'all'>[]).map((key) => {
                const meta = CATEGORY_META[key];
                const active = category === key;
                return (
                  <button
                    key={key}
                    onClick={() => setCategory(active ? 'all' : key)}
                    className="px-3 py-2 rounded-xl text-xs border transition-all"
                    style={{
                      borderColor: active ? meta.color + '60' : 'rgba(255,255,255,0.1)',
                      backgroundColor: active ? meta.color + '15' : 'rgba(255,255,255,0.02)',
                      color: active ? meta.color : '#9CA3AF',
                    }}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-3 text-[11px] text-neutral-500">
            {filtered.length} de {MODULES.length} módulos · ordenados por menor tempo de execução
          </div>
        </div>
      </section>

      {/* Step 3 — Modules */}
      <section className="px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-mono text-brand-accent">PASSO 03</span>
            <span className="text-xs text-neutral-500">Escolha um motor para explorar</span>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center">
              <p className="text-neutral-400 text-sm">Nenhum módulo corresponde aos filtros atuais.</p>
              <button
                onClick={() => { setIntent('all'); setCategory('all'); setQuery(''); }}
                className="mt-3 text-brand-accent text-xs hover:underline"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {[...filtered].sort((a, b) => a.estimatedMinutes - b.estimatedMinutes).map((mod) => (
                <motion.div
                  key={mod.id}
                  variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                >
                  <Link
                    to={mod.link}
                    className="group block h-full p-5 rounded-2xl border bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300"
                    style={{ borderColor: mod.color + '25' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: mod.color + '18' }}
                      >
                        <mod.icon className="w-5 h-5" style={{ color: mod.color }} />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-mono text-neutral-600">{mod.jsonTag}</span>
                        <div className="flex items-center gap-1 text-[10px] text-neutral-500">
                          <span>~{mod.estimatedMinutes}min</span>
                          <span>·</span>
                          <span className="flex gap-0.5">
                            {[1, 2, 3].map((i) => (
                              <span
                                key={i}
                                className="w-1 h-1 rounded-full"
                                style={{ backgroundColor: i <= mod.difficulty ? mod.color : 'rgba(255,255,255,0.15)' }}
                              />
                            ))}
                          </span>
                        </div>
                      </div>
                    </div>

                    <h3 className="font-display text-base text-neutral-100 mb-1 group-hover:text-neutral-50">
                      {mod.title}
                    </h3>
                    <p className="text-[11px] italic mb-2" style={{ color: mod.color + 'CC' }}>{mod.subtitle}</p>
                    <p className="text-xs text-neutral-400 leading-relaxed mb-3">{mod.description}</p>

                    <div className="flex items-center gap-1.5 mb-3 px-2.5 py-2 rounded-lg bg-white/[0.02] border border-white/5">
                      <GraduationCap className="w-3 h-3 shrink-0 text-brand-accent/70" />
                      <p className="text-[10.5px] text-neutral-400 leading-tight">{mod.pedagogicalHook}</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {mod.badges.map((b) => (
                        <span
                          key={b}
                          className="px-2 py-0.5 rounded-full text-[9.5px] font-medium border"
                          style={{ borderColor: mod.color + '30', color: mod.color, backgroundColor: mod.color + '08' }}
                        >
                          {b}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="flex gap-1">
                        {mod.intent.map((i) => {
                          const im = INTENT_META[i];
                          const Ic = im.icon;
                          return (
                            <span
                              key={i}
                              title={im.label}
                              className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center"
                            >
                              <Ic className="w-2.5 h-2.5 text-neutral-400" />
                            </span>
                          );
                        })}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-neutral-500 group-hover:text-brand-accent transition-colors">
                        <span>Explorar</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-4 lg:px-8 mt-16">
        <div className="max-w-4xl mx-auto rounded-2xl border border-brand-accent/20 bg-gradient-to-br from-brand-accent/[0.06] to-transparent p-6 lg:p-8 text-center">
          <h3 className="font-display text-xl lg:text-2xl text-neutral-50 mb-2">
            Não sabe por onde começar?
          </h3>
          <p className="text-sm text-neutral-400 mb-4 max-w-xl mx-auto">
            Recomendamos a sequência: <span className="text-brand-accent">Orçamento Pessoal</span> →
            <span className="text-brand-accent"> Oráculo de Opinião</span> →
            <span className="text-brand-accent"> Cenários Alternativos</span>.
            Do impacto concreto ao raciocínio contrafactual.
          </p>
          <Link
            to="/fiscal-impact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-accent text-[#0A1628] text-sm font-medium hover:bg-brand-accent/90 transition-colors"
          >
            <Wallet className="w-4 h-4" />
            Começar pelo Orçamento Pessoal
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
