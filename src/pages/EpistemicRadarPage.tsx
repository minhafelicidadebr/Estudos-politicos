/**
 * EpistemicRadarPage — JSON_29 Epistemic Transformation Engine
 * Bayesian Belief Updating + Motivational Interviewing + Constitutional AI
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowLeft, Info, X, BookOpen, Shield, Eye, Scale, EyeOff, FileWarning, CheckCircle, AlertTriangle, Lock, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { computeEpistemicProfile, getMITurns, getConstitutionalConstraints, getDivergenceTypes, getEpistemicHealthBand } from '@/services/epistemicTransformationEngine';

const DIVERGENCE_ICONS: Record<string, typeof Eye> = { Split: Eye, Scale: Scale, EyeOff: EyeOff, FileWarning: FileWarning };

function MethodologyCTA({ level, onClose }: { level: 'iniciante' | 'medio' | 'avancado'; onClose: () => void }) {
  const content: Record<string, { title: string; body: string; question?: string; refs?: string[] }> = {
    iniciante: {
      title: 'A ciência de como crenças mudam',
      body: 'Todo ser humano tem um viés de confirmação — a tendência de procurar e lembrar informações que confirmam o que já acredita. Não é fraqueza de caráter: é como o cérebro economiza energia.\n\nO problema é que em análise política, viés de confirmação sistemático nos impede de ver informações importantes sobre governos que apoiamos.\n\nUma descoberta surpreendente da pesquisa: quando alguém apresenta diretamente uma informação que contradiz nossa crença, muitas vezes ficamos ainda mais convictos da crença original — o que pesquisadores chamam de "backfire effect".\n\nA boa notícia: existe uma abordagem comprovada que funciona para atualizar crenças de forma voluntária e sustentável — não por imposição, mas por curiosidade. O Radar Epistêmico usa essa abordagem quando você ativa.',
      question: 'Você se lembra de alguma vez ter mudado genuinamente de ideia sobre um assunto político? O que foi diferente nessa experiência?',
    },
    medio: {
      title: 'Entrevista Motivacional aplicada à análise política',
      body: 'Em 2010, os politólogos Brendan Nyhan e Jason Reifler documentaram o "backfire effect": quando adultos recebem correção direta de uma crença política equivocada, eles frequentemente fortalecem a crença original.\n\nO mecanismo é psicológico: crenças políticas estão ligadas à identidade social, então contestá-las sente como ataque à pessoa, não à ideia.\n\nWilliam Miller e Stephen Rollnick passaram três décadas desenvolvendo Motivational Interviewing — e descobriram que mudança de crença sustentável ocorre apenas quando a pessoa experimenta discrepância entre seus próprios valores e seu comportamento atual, em clima de autonomia e sem pressão.\n\nO Radar Epistêmico adapta MI para análise política: quando detecta divergência entre a avaliação PIR+ e a narrativa expressa, oferece um diálogo socrático de até 7 turnos — sempre com autonomia total, sempre com SIB declarado, nunca com conclusão prescrita.\n\nMI meta-analysis (Burke et al., 2022): 40% mais mudança de crença sustentável vs abordagem direta em 87 estudos.',
    },
    avancado: {
      title: 'Bayesian Updating + Constitutional AI',
      body: 'O Motor integra três frameworks:\n\n1. Bayesian belief updating (Tenenbaum et al., 2011): evidência apresentada como dado que atualiza probabilidades, não como "a verdade".\n\n2. MI: os quatro princípios — Express Empathy, Develop Discrepancy, Roll with Resistance, Support Self-Efficacy — implementados como constraint system.\n\n3. Constitutional AI: oito restrições constitucionais verificadas a cada turno.\n\nFórmulas:\n• divergence_score = |sentiment_score(free_text) - pir_plus_score| / 10\n• double_standard_index = mean_sib_threshold_against_preferred / mean_sib_threshold_for_preferred\n• mi_fidelity_score = weighted_avg(empathy, open_questions, no_contradiction, autonomy_support)\n\nKahan (2013) "identity-protective cognition": quando o sistema quer mudar crença, o usuário ativa defesas identitárias. Solução: framing sempre de "aqui está o que seus próprios dados mostram".',
      refs: ['Miller & Rollnick (2012) MI 3rd ed.', 'Nyhan & Reifler (2010) Political Behavior', 'Tenenbaum et al. (2011) Science', 'Kahan (2013) JDM'],
    },
  };
  const c = content[level];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#0F1629] border border-neutral-700/50 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center"><BookOpen className="w-5 h-5 text-violet-400" /></div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-neutral-500">{level === 'iniciante' ? 'Nível Cidadão' : level === 'medio' ? 'Nível Gestor' : 'Nível Especialista'}</span>
              <h3 className="text-lg font-semibold text-neutral-100">{c.title}</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-300"><X className="w-5 h-5" /></button>
        </div>
        <div className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line mb-6">{c.body}</div>
        {c.question && <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20"><p className="text-sm text-violet-400 italic">💭 {c.question}</p></div>}
        {c.refs && <div className="mt-4 pt-4 border-t border-neutral-800"><p className="text-[10px] uppercase tracking-wider text-neutral-600 mb-2">Referências</p>{c.refs.map((r, i) => <p key={i} className="text-xs text-neutral-500">{r}</p>)}</div>}
      </motion.div>
    </motion.div>
  );
}

const EpistemicRadarPage = () => {
  const [methodologyLevel, setMethodologyLevel] = useState<'iniciante' | 'medio' | 'avancado' | null>(null);
  const [optedIn, setOptedIn] = useState(false);

  const profile = useMemo(() => computeEpistemicProfile('demo-user-2025'), []);
  const miTurns = getMITurns();
  const constraints = getConstitutionalConstraints();
  const divergenceTypes = getDivergenceTypes();
  const healthBand = getEpistemicHealthBand(profile.epistemicHealthScore);

  const radarData = divergenceTypes.map(d => ({
    type: d.label,
    magnitude: profile.detectedDivergences.find(dd => dd.type === d.type)?.magnitude || 0,
    fullMark: 5,
  }));

  return (
    <div className="min-h-screen bg-[#0A1628] text-neutral-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="text-neutral-500 hover:text-neutral-300"><ArrowLeft className="w-5 h-5" /></Link>
          <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <Brain className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Radar Epistêmico</h1>
            <p className="text-sm text-neutral-400">Transformação Epistêmica Responsável — Bayesian Updating × Motivational Interviewing</p>
          </div>
        </div>

        {/* Methodology CTAs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(['iniciante', 'medio', 'avancado'] as const).map(level => (
            <button key={level} onClick={() => setMethodologyLevel(level)}
              className="px-4 py-2 rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-400 text-xs font-medium hover:bg-violet-500/20 transition-colors flex items-center gap-2">
              <Info className="w-3.5 h-3.5" />
              {level === 'iniciante' ? '🧠 Viés de Confirmação' : level === 'medio' ? '📊 Entrevista Motivacional' : '🔬 Bayesian + Constitutional AI'}
            </button>
          ))}
        </div>

        <AnimatePresence>{methodologyLevel && <MethodologyCTA level={methodologyLevel} onClose={() => setMethodologyLevel(null)} />}</AnimatePresence>

        {/* Opt-in Gate */}
        {!optedIn ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
            <div className="p-8 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-transparent text-center">
              <div className="w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-violet-400" />
              </div>
              <h2 className="text-xl font-bold mb-4">Ativar Radar Epistêmico</h2>
              <p className="text-sm text-neutral-300 mb-6 max-w-lg mx-auto">
                O Radar Epistêmico analisa seus padrões de raciocínio para identificar quando seus dados sugerem uma perspectiva diferente da sua narrativa. 
                Isso inclui receber insights sobre possíveis vieses — sempre com autonomia total e sem prescrição de conclusões.
              </p>

              {/* Constitutional guarantees */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 text-left max-w-lg mx-auto">
                {constraints.slice(0, 4).map(c => (
                  <div key={c.id} className="flex items-start gap-2 p-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
                    <Lock className="w-3.5 h-3.5 text-violet-400 mt-0.5 flex-shrink-0" />
                    <p className="text-[10px] text-neutral-400">{c.constraint}</p>
                  </div>
                ))}
              </div>

              <button onClick={() => setOptedIn(true)}
                className="px-8 py-3 rounded-xl bg-violet-500/20 border border-violet-500/40 text-violet-400 font-medium hover:bg-violet-500/30 transition-colors">
                Ativar Radar Epistêmico
              </button>
              <p className="text-[10px] text-neutral-600 mt-4">Você pode desativar a qualquer momento. Seus dados de diálogo são deletáveis por solicitação (LGPD Art. 5).</p>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Health Score */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/50 col-span-1">
                <p className="text-xs text-neutral-500 mb-2">Saúde Epistêmica</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold" style={{ color: healthBand.color }}>{profile.epistemicHealthScore.toFixed(1)}</span>
                  <div>
                    <span className="text-xs px-2 py-0.5 rounded-full border" style={{ borderColor: healthBand.color + '40', color: healthBand.color }}>{healthBand.band}</span>
                    <p className="text-[10px] text-neutral-500 mt-1">{healthBand.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="p-2 rounded-lg bg-neutral-800/50 text-center">
                    <p className="text-[10px] text-neutral-500">Duplo Padrão</p>
                    <p className="text-sm font-bold text-amber-400">{profile.doubleStandardIndex.toFixed(2)}x</p>
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-800/50 text-center">
                    <p className="text-[10px] text-neutral-500">Atenção Seletiva</p>
                    <p className="text-sm font-bold text-amber-400">{profile.selectiveAttentionGap}%</p>
                  </div>
                </div>
              </div>

              {/* Radar */}
              <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/50 col-span-2">
                <h3 className="text-sm font-semibold mb-4">Mapa de Divergências Detectadas</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#1E293B" />
                    <PolarAngleAxis dataKey="type" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                    <PolarRadiusAxis domain={[0, 5]} tick={{ fill: '#6B7280', fontSize: 9 }} />
                    <Radar name="Magnitude" dataKey="magnitude" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detected divergences */}
            <h3 className="text-lg font-semibold mb-4">Divergências Detectadas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {profile.detectedDivergences.map((d, i) => {
                const IconComp = DIVERGENCE_ICONS[d.icon] || Eye;
                const severityColor = d.severity === 'alta' ? '#EF4444' : d.severity === 'moderada' ? '#F59E0B' : '#6B7280';
                return (
                  <div key={i} className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <IconComp className="w-4 h-4 text-violet-400" />
                        <span className="text-sm font-semibold">{d.label}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border" style={{ borderColor: severityColor + '40', color: severityColor }}>{d.severity}</span>
                    </div>
                    <p className="text-xs text-neutral-300 mb-2">{d.description}</p>
                    <p className="text-[10px] text-neutral-500 italic">Ex: {d.example}</p>
                    <div className="mt-3 w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                      <div className="h-full rounded-full bg-violet-500" style={{ width: `${Math.min(100, (d.magnitude / 5) * 100)}%` }} />
                    </div>
                    <p className="text-[10px] text-neutral-600 mt-1">Magnitude: {d.magnitude.toFixed(1)} / 5.0</p>
                  </div>
                );
              })}
            </div>

            {/* MI Protocol */}
            <h3 className="text-lg font-semibold mb-4">Protocolo de Diálogo Socrático (Motivational Interviewing)</h3>
            <div className="relative mb-8">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-neutral-800" />
              {miTurns.map((turn, i) => (
                <div key={turn.turnNumber} className="relative pl-14 pb-6">
                  <div className="absolute left-4 w-5 h-5 rounded-full bg-violet-500/20 border-2 border-violet-500/40 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-violet-400">{turn.turnNumber}</span>
                  </div>
                  <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-neutral-200">{turn.label}</span>
                      <span className="text-[10px] text-violet-400">{turn.miPrinciple}</span>
                    </div>
                    <p className="text-xs text-neutral-400">{turn.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Constitutional Constraints */}
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-violet-400" /> Restrições Constitucionais (Invioláveis)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {constraints.map(c => (
                <div key={c.id} className="flex items-start gap-3 p-4 rounded-xl border border-violet-500/10 bg-violet-500/5">
                  <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-violet-400">{c.id}</span>
                  </div>
                  <p className="text-xs text-neutral-300">{c.constraint}</p>
                </div>
              ))}
            </div>

            {/* Demo dialogue CTA */}
            <div className="p-6 rounded-xl border border-violet-500/20 bg-gradient-to-r from-violet-500/10 to-transparent text-center">
              <MessageCircle className="w-8 h-8 text-violet-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Iniciar Diálogo Socrático</h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto mb-4">Quando ativado com análises reais, o sistema inicia um diálogo de até 7 turnos usando Entrevista Motivacional — sempre respeitando sua autonomia cognitiva.</p>
              <button className="px-6 py-2.5 rounded-xl bg-violet-500/20 border border-violet-500/40 text-violet-400 text-sm font-medium hover:bg-violet-500/30 transition-colors">
                Explorar com dados demo
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EpistemicRadarPage;
