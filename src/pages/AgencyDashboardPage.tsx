/**
 * AgencyDashboardPage — Termômetro de Agência Cívica (JSON_20)
 * IAC Score + Civic Opportunities + Action History
 */
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Flame, Award, BookOpen, ExternalLink, Clock, CheckCircle2,
  Users, FileText, Eye, Megaphone, Vote, Share2, ArrowRight,
} from 'lucide-react';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
import type { IACProfile, CivicOpportunity, CivicActionType, IACLevel } from '@/types/aegis';
import { getIACLevel } from '@/types/aegis';

const ACTION_TYPE_META: Record<CivicActionType, { icon: typeof Flame; label: string; color: string }> = {
  public_consultation: { icon: FileText, label: 'Consulta pública', color: 'hsl(var(--axis-a))' },
  legislative_hearing_attendance: { icon: Users, label: 'Audiência pública', color: 'hsl(var(--axis-b))' },
  legislative_monitoring: { icon: Eye, label: 'Monitoramento legislativo', color: 'hsl(var(--axis-c))' },
  cso_engagement: { icon: Users, label: 'Engajamento com OSC', color: 'hsl(var(--confidence-high))' },
  evidence_submission: { icon: FileText, label: 'Submissão de evidência', color: 'hsl(var(--brand-accent))' },
  awareness_qualified_sharing: { icon: Share2, label: 'Compartilhamento qualificado', color: 'hsl(var(--neutral-400))' },
  informed_voting: { icon: Vote, label: 'Participação eleitoral informada', color: 'hsl(var(--semantic-warning))' },
};

const LEVEL_COLORS: Record<IACLevel, string> = {
  'Observador': 'hsl(var(--neutral-500))',
  'Cidadão Informado': 'hsl(var(--axis-c))',
  'Participante Ativo': 'hsl(var(--axis-b))',
  'Agente Cívico': 'hsl(var(--axis-a))',
  'Referência Democrática': 'hsl(var(--brand-accent))',
};

const MILESTONES = [
  { threshold: 2.0, badge: '🌱', label: 'Primeiro Passo' },
  { threshold: 4.0, badge: '📊', label: 'Cidadão Analítico' },
  { threshold: 6.0, badge: '⚡', label: 'Agente Cívico' },
  { threshold: 7.5, badge: '🎯', label: 'Participante Rigoroso' },
  { threshold: 9.0, badge: '🏆', label: 'Referência Democrática' },
];

// Mock data — in production from DB
const MOCK_PROFILE: IACProfile = {
  iac_score: 3.2, iac_level: 'Cidadão Informado',
  action_quality_score: 0.4, analysis_depth_score: 0.6,
  breadth_diversity_score: 0.3, total_actions: 4, verified_actions: 2,
  axes_covered: ['A3', 'C9'], current_streak_months: 2, badges_earned: ['Primeiro Passo'],
};

const MOCK_OPPORTUNITIES: CivicOpportunity[] = [
  {
    id: 'opp-1', title: 'Consulta Pública — Reforma Tributária (PLP 68/2024)',
    organization: 'Senado Federal', organization_type: 'parliament',
    action_type: 'public_consultation', relevant_axes: ['A3', 'C8'],
    country_id: 'BR', deadline: '2026-04-15T23:59:00Z',
    estimated_time_minutes: 30, iac_points_if_completed: 0.5,
    url: 'https://legis.senado.leg.br', description_short: 'Contribua com análise fundamentada sobre impactos redistributivos.',
    why_relevant_to_user: 'Sua análise de Macroeconomia identificou gaps fiscais — esta consulta toca diretamente nesse ponto.',
    is_verified: true,
  },
  {
    id: 'opp-2', title: 'Audiência Pública — Desmatamento na Amazônia Legal',
    organization: 'Câmara dos Deputados — Comissão de Meio Ambiente',
    organization_type: 'parliament', action_type: 'legislative_hearing_attendance',
    relevant_axes: ['A7'], country_id: 'BR', deadline: '2026-04-10T14:00:00Z',
    estimated_time_minutes: 90, iac_points_if_completed: 0.3,
    url: 'https://www.camara.leg.br/eventos', description_short: 'Acompanhe a discussão sobre metas de redução.',
    is_verified: true,
  },
  {
    id: 'opp-3', title: 'Monitoramento — PL de Segurança Pública',
    organization: 'Congresso Nacional', organization_type: 'parliament',
    action_type: 'legislative_monitoring', relevant_axes: ['A8', 'B1'],
    country_id: 'BR', deadline: null, estimated_time_minutes: 5,
    iac_points_if_completed: 0.1, url: 'https://legis.senado.leg.br',
    description_short: 'Registre-se para acompanhar projetos de lei de segurança.',
    is_verified: true,
  },
];

const AgencyDashboardPage = () => {
  const profile = MOCK_PROFILE;
  const opportunities = MOCK_OPPORTUNITIES;
  const level = getIACLevel(profile.iac_score);
  const levelColor = LEVEL_COLORS[level];

  const nextMilestone = MILESTONES.find(m => m.threshold > profile.iac_score) || MILESTONES[MILESTONES.length - 1];
  const progressToNext = (profile.iac_score / nextMilestone.threshold) * 100;

  return (
    <>
      <NavBar />
      <main className="min-h-screen pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <p className="text-micro uppercase tracking-[0.22em] text-brand-accent mb-2">Termômetro de Agência Cívica</p>
            <h1 className="font-display text-heading-xl text-neutral-50 mb-2">
              Entender política sem agir é luxo intelectual.
            </h1>
            <p className="text-body-sm text-neutral-400 max-w-2xl">
              Conecte suas análises a oportunidades concretas de participação cívica institucional.
              Seu Índice de Agência Cívica (IAC) cresce com a qualidade da sua conexão análise → ação.
            </p>
          </motion.div>

          {/* IAC Score Display */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl border border-brand-accent/30 bg-gradient-to-br from-brand-accent/5 to-transparent mb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Score circle */}
              <div className="relative w-32 h-32 shrink-0 mx-auto md:mx-0">
                <svg viewBox="0 0 120 120" className="w-full h-full">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--neutral-800))" strokeWidth="6" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke={levelColor} strokeWidth="6"
                    strokeDasharray={`${(profile.iac_score / 10) * 314} 314`}
                    strokeLinecap="round" transform="rotate(-90 60 60)" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-display-lg text-neutral-50">{profile.iac_score.toFixed(1)}</span>
                  <span className="text-micro text-neutral-500">/10</span>
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <p className="font-display text-heading-md mb-1" style={{ color: levelColor }}>{level}</p>
                <p className="text-body-sm text-neutral-300 mb-4">
                  {profile.total_actions} ações realizadas · {profile.verified_actions} verificadas · {profile.current_streak_months} meses de streak
                </p>

                {/* Progress to next milestone */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-micro text-neutral-500 mb-1">
                    <span>Próximo: {nextMilestone.badge} {nextMilestone.label}</span>
                    <span>{profile.iac_score.toFixed(1)} / {nextMilestone.threshold}</span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(progressToNext, 100)}%` }}
                      transition={{ duration: 1, type: 'spring' }}
                      className="h-full rounded-full bg-gradient-to-r from-brand-accent/70 to-brand-accent" />
                  </div>
                </div>

                {/* Component scores */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Qualidade', value: profile.action_quality_score, weight: '40%' },
                    { label: 'Profundidade', value: profile.analysis_depth_score, weight: '25%' },
                    { label: 'Diversidade', value: profile.breadth_diversity_score, weight: '15%' },
                  ].map(c => (
                    <div key={c.label} className="text-center">
                      <p className="font-mono text-body-sm text-neutral-200">{(c.value * 10).toFixed(1)}</p>
                      <p className="text-micro text-neutral-600">{c.label} ({c.weight})</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Badges */}
            {profile.badges_earned.length > 0 && (
              <div className="mt-4 pt-4 border-t border-neutral-700/30 flex items-center gap-3">
                <Award className="w-4 h-4 text-brand-accent" />
                {profile.badges_earned.map(b => (
                  <span key={b} className="px-3 py-1 rounded-full bg-brand-accent/10 text-brand-accent text-micro font-medium">{b}</span>
                ))}
              </div>
            )}
          </motion.div>

          {/* Opportunities */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
            <h2 className="font-display text-heading-lg text-neutral-50 mb-4">Oportunidades de Ação</h2>
            <div className="space-y-3">
              {opportunities.map((opp, i) => {
                const meta = ACTION_TYPE_META[opp.action_type];
                const Icon = meta.icon;
                const deadline = opp.deadline ? new Date(opp.deadline) : null;
                const daysLeft = deadline ? Math.ceil((deadline.getTime() - Date.now()) / 86400000) : null;
                return (
                  <motion.div key={opp.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
                    className="p-5 rounded-2xl border border-neutral-700/30 bg-white/[0.02] hover:border-neutral-600/50 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: meta.color + '20' }}>
                        <Icon className="w-5 h-5" style={{ color: meta.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-micro font-medium" style={{ backgroundColor: meta.color + '20', color: meta.color }}>
                            {meta.label}
                          </span>
                          {opp.is_verified && (
                            <span className="flex items-center gap-0.5 text-micro text-confidence-high">
                              <CheckCircle2 className="w-3 h-3" /> Verificado
                            </span>
                          )}
                          {daysLeft !== null && (
                            <span className={`flex items-center gap-0.5 text-micro ${daysLeft <= 3 ? 'text-semantic-error' : 'text-neutral-500'}`}>
                              <Clock className="w-3 h-3" /> {daysLeft <= 0 ? 'Encerrado' : `${daysLeft}d restantes`}
                            </span>
                          )}
                        </div>
                        <h3 className="text-body-sm font-semibold text-neutral-50 mb-1">{opp.title}</h3>
                        <p className="text-micro text-neutral-500 mb-2">{opp.organization}</p>
                        <p className="text-micro text-neutral-400">{opp.description_short}</p>
                        {opp.why_relevant_to_user && (
                          <p className="mt-2 text-micro text-brand-accent italic">💡 {opp.why_relevant_to_user}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-micro text-neutral-600">⏱ ~{opp.estimated_time_minutes}min</span>
                          <span className="text-micro font-semibold text-brand-accent">+{opp.iac_points_if_completed} IAC</span>
                          <a href={opp.url} target="_blank" rel="noopener noreferrer"
                            className="ml-auto flex items-center gap-1 text-micro text-neutral-400 hover:text-brand-accent transition-colors">
                            Acessar <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* How IAC works */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl border border-neutral-700/30 bg-white/[0.02] mb-8">
            <h3 className="font-display text-heading-md text-neutral-50 mb-4">Como funciona o IAC</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Qualidade da Ação (40%)', desc: 'Peso proporcional ao tipo de participação: submissão de evidência fundamentada vale mais que compartilhamento.' },
                { title: 'Profundidade Analítica (25%)', desc: 'Quanto mais eixos você analisa com rigor, maior a base para participação qualificada.' },
                { title: 'Lag Insight→Ação (20%)', desc: 'Ações tomadas até 7 dias após análise têm multiplicador máximo — conhecimento fresco gera melhor participação.' },
                { title: 'Diversidade de Eixos (15%)', desc: 'Participação cobrindo múltiplos eixos demonstra cidadania abrangente.' },
              ].map(c => (
                <div key={c.title} className="p-4 rounded-xl border border-neutral-800 bg-white/[0.01]">
                  <p className="text-body-sm font-semibold text-neutral-200 mb-1">{c.title}</p>
                  <p className="text-micro text-neutral-400">{c.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-micro text-neutral-600 text-center">
              Fundamentação: Bandura (1997), Deci & Ryan (1985), Verba, Schlozman & Brady (1995)
            </p>
          </motion.div>

          {/* Milestones */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <h3 className="font-display text-heading-md text-neutral-50 mb-4">Conquistas</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {MILESTONES.map(m => {
                const achieved = profile.iac_score >= m.threshold;
                return (
                  <div key={m.label} className={`shrink-0 w-36 p-4 rounded-xl border text-center transition-all ${
                    achieved ? 'border-brand-accent/40 bg-brand-accent/5' : 'border-neutral-800 bg-white/[0.01] opacity-50'
                  }`}>
                    <span className="text-2xl block mb-2">{m.badge}</span>
                    <p className="text-micro font-semibold text-neutral-200">{m.label}</p>
                    <p className="text-micro text-neutral-600">IAC ≥ {m.threshold}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <div className="mt-12 pt-6 border-t border-neutral-700/30 text-center">
            <Link to="/methodology" className="inline-flex items-center gap-2 text-body-sm text-neutral-500 hover:text-neutral-200 transition-colors">
              <BookOpen className="w-4 h-4" /> Framework SDG 16 · Habermas (1996) · Ostrom (2009)
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AgencyDashboardPage;