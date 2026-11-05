/**
 * ComparativeAnalysisPage — Split-view: Chatbot (left) + Dashboard (right)
 */
import { useParams, Link } from "react-router-dom";
import { useCallback, useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, Loader2 } from "lucide-react";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import { ComparativeChatbot } from "@/components/comparative/ComparativeChatbot";
import { AxisDashboard } from "@/components/comparative/AxisDashboard";
import { FinalSynthesisDashboard } from "@/components/comparative/FinalSynthesisDashboard";
import { useComparativeStore } from "@/stores/comparativeStore";
import { generateAxisAnalysis, generateFinalSynthesis, getAxisDefinition } from "@/services/comparativeAnalysisService";
import { seedCountries } from "@/data/countries";
import { getGovernmentsForCountry, governmentsByCountry } from "@/data/governments";
import { discoverGovernments, getCachedDiscovered } from "@/services/discoverGovernmentsService";
import { useToast } from "@/hooks/use-toast";
import { saveAnalysis, logCivicAction } from "@/services/analysesService";
import { useAuth } from "@/contexts/AuthContext";
import type { GovernmentRecord } from "@/types/aegis";


const ComparativeAnalysisPage = () => {
  const { countryId } = useParams<{ countryId: string }>();
  const store = useComparativeStore();
  const session = store.session;
  const { toast } = useToast();
  const { user } = useAuth();
  const [synthesis, setSynthesis] = useState<{ executiveSummary: string; trajectoryAnalysis: string; lessons: string[] } | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const country = seedCountries.find(c => c.id.toLowerCase() === countryId?.toLowerCase());
  const countryName = country?.name_display_pt || countryId || 'País';
  const upperId = (countryId || '').toUpperCase();
  const seedGovs = getGovernmentsForCountry(upperId);
  const [discovered, setDiscovered] = useState<GovernmentRecord[]>(() => getCachedDiscovered(upperId) ?? []);
  const [discovering, setDiscovering] = useState(false);
  const [viewedAxisId, setViewedAxisId] = useState<string | null>(null);
  const governments = useMemo<GovernmentRecord[]>(
    () => (seedGovs.length > 0 ? seedGovs : discovered),
    [seedGovs, discovered]
  );

  useEffect(() => {
    if (seedGovs.length === 0 && discovered.length > 0) {
      governmentsByCountry[upperId] = discovered;
    }
  }, [seedGovs.length, discovered, upperId]);

  const handleDiscover = useCallback(async () => {
    if (!country) return;
    setDiscovering(true);
    try {
      const list = await discoverGovernments(upperId, country.name_display_pt, 4);
      setDiscovered(list);
      governmentsByCountry[upperId] = list;
      toast({ title: `${list.length} governos identificados`, description: `Dataset gerado com protocolo AAM para ${countryName}.` });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Tente novamente.";
      toast({ title: "Não foi possível descobrir governos", description: msg, variant: "destructive" });
    } finally {
      setDiscovering(false);
    }
  }, [country, upperId, countryName, toast]);

  const runAnalysis = useCallback(async () => {
    if (!session) return;
    store.setAnalyzing(true);
    store.setError(null);

    const axesToAnalyze = session.selectedAxes.slice(session.currentAxisIndex);

    for (const axisId of axesToAnalyze) {
      const axisDef = getAxisDefinition(axisId);
      if (!axisDef) continue;

      store.setProgress('analyzing', (session.currentAxisIndex / session.selectedAxes.length) * 100, axisId);

      try {
        const result = await generateAxisAnalysis({
          country: countryName,
          countryId: (countryId || '').toUpperCase(),
          axisId,
          axisName: axisDef.name,
          governments: session.selectedGovernments,
        });
        store.addCompletedAxis(result);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erro inesperado na análise.';
        store.setError(msg);
        toast({ title: 'Erro na análise', description: msg, variant: 'destructive' });
        store.setAnalyzing(false);
        store.setPhase('axis_transition');
        return;
      }
    }

    store.setAnalyzing(false);
    store.setPhase('synthesis');

    // Generate final synthesis
    try {
      setIsSynthesizing(true);
      const updatedSession = useComparativeStore.getState().session;
      if (updatedSession) {
        const synth = await generateFinalSynthesis(countryName, updatedSession.selectedGovernments, updatedSession.completedAxes);
        setSynthesis(synth);

        // Sprint 2: persist analysis + log civic action when authenticated
        if (user && updatedSession.completedAxes.length > 0) {
          try {
            const scores: Record<string, number> = {};
            updatedSession.completedAxes.forEach((a) => {
              const valid = a.governmentScores.filter((g) => g.score !== null && g.eligibleForRanking !== false);
              if (valid.length > 0) {
                const avg = valid.reduce((s, g) => s + (g.score ?? 0), 0) / valid.length;
                scores[a.axisId] = Number(avg.toFixed(2));
              }
            });
            const saved = await saveAnalysis({
              title: `${countryName} — ${updatedSession.selectedGovernments.map((g) => g.name).join(" vs ")}`,
              countryId: (countryId || "").toUpperCase(),
              governments: updatedSession.selectedGovernments,
              axisData: updatedSession.completedAxes,
              scores,
              isPublic: false,
            });
            await logCivicAction({
              actionType: "analysis_completed",
              description: `Análise PIR+ concluída para ${countryName}`,
              metadata: { analysisId: saved.id, axes: updatedSession.completedAxes.length },
            });
            toast({ title: "Análise salva no histórico" });
          } catch (e) {
            console.warn("[saveAnalysis] failed:", e);
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro inesperado na síntese.';
      toast({ title: 'Erro na síntese', description: msg, variant: 'destructive' });
    } finally {
      setIsSynthesizing(false);
      store.setPhase('complete');
    }
  }, [session, countryName, countryId, store, toast, user]);

  const lastCompletedAxis = session?.completedAxes[session.completedAxes.length - 1];
  const showSynthesis = session?.phase === 'synthesis' || session?.phase === 'complete';

  // Empty state for countries without data — agora oferece descoberta automática via IA (PIR+/AAM)
  if (governments.length === 0) {
    return (
      <>
        <NavBar />
        <main className="min-h-screen pt-24 px-6">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center border border-brand-accent/30 bg-brand-accent/5">
              <Sparkles className="w-9 h-9 text-brand-accent" />
            </div>
            <h1 className="font-display text-heading-xl text-neutral-50 mb-3">
              {country?.flag_emoji} {countryName} — gerar dataset analítico
            </h1>
            <p className="text-body-md text-neutral-400 mb-2">
              Ainda não há dataset curado para {countryName}. Posso gerar agora os últimos 4 governos com o
              <span className="text-brand-accent"> Núcleo Analítico PIR+ </span>
              (protocolos anti-alucinação AAM e anti-polarização APP, rigor estatístico nível mestrado).
            </p>
            <p className="text-micro text-neutral-600 mb-8">
              A IA retorna apenas mandatos verificáveis. O resultado fica em cache local — não consome créditos em novas visitas.
            </p>

            <button
              onClick={handleDiscover}
              disabled={discovering}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-accent text-brand-primary font-semibold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {discovering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {discovering ? "Compilando governos…" : `Descobrir governos de ${countryName} com IA`}
            </button>

            <div className="mt-10 pt-8 border-t border-neutral-700/30">
              <p className="text-micro text-neutral-600 mb-3">Ou explore países com dataset curado:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['BR', 'US', 'DE', 'UY'].map(id => {
                  const c = seedCountries.find(s => s.id === id);
                  return c ? (
                    <Link key={id} to={`/comparative/${id.toLowerCase()}`} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-700 text-neutral-400 hover:border-brand-accent hover:text-brand-accent transition-all text-micro">
                      {c.flag_emoji} {c.name_display_pt}
                    </Link>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }


  return (
    <>
      <NavBar />
      <main className="min-h-screen pt-16">
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
          {/* Left Panel — Chatbot */}
          <div className="w-full lg:w-[420px] shrink-0 border-r border-neutral-700/30 flex flex-col lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)]">
            <ComparativeChatbot
              countryId={countryId || 'BR'}
              countryName={countryName}
              onStartAnalysis={runAnalysis}
            />
          </div>

          {/* Right Panel — Dashboard */}
          <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
            <AnimatePresence mode="wait">
              {(() => {
                // Once complete, the user can jump between synthesis and any individual axis.
                const isComplete = session?.phase === 'complete';
                const axesList = session?.completedAxes ?? [];
                const currentAxis = isComplete && viewedAxisId
                  ? axesList.find(a => a.axisId === viewedAxisId)
                  : (!showSynthesis ? lastCompletedAxis : null);

                if (showSynthesis && session && !(isComplete && currentAxis)) {
                  return (
                    <motion.div key="synthesis" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <FinalSynthesisDashboard
                        session={session}
                        synthesis={synthesis}
                        isGenerating={isSynthesizing}
                        onViewAxis={isComplete ? (id) => { setViewedAxisId(id); window.scrollTo({ top: 0, behavior: 'smooth' }); } : undefined}
                      />
                    </motion.div>
                  );
                }
                if (currentAxis && session) {
                  const idx = axesList.findIndex(a => a.axisId === currentAxis.axisId);
                  const prev = idx > 0 ? axesList[idx - 1] : null;
                  const next = idx >= 0 && idx < axesList.length - 1 ? axesList[idx + 1] : null;
                  const nav = isComplete
                    ? {
                        onBackToSynthesis: () => { setViewedAxisId(null); window.scrollTo({ top: 0, behavior: 'smooth' }); },
                        onPrevAxis: prev ? () => { setViewedAxisId(prev.axisId); window.scrollTo({ top: 0, behavior: 'smooth' }); } : undefined,
                        onNextAxis: next ? () => { setViewedAxisId(next.axisId); window.scrollTo({ top: 0, behavior: 'smooth' }); } : undefined,
                        prevAxisName: prev?.axisName,
                        nextAxisName: next?.axisName,
                        axisIndex: idx,
                        axisTotal: axesList.length,
                      }
                    : {};
                  return (
                    <motion.div key={currentAxis.axisId} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <AxisDashboard
                        result={currentAxis}
                        userTier={session.userTier}
                        countryName={countryName}
                        onDownloadPDF={() => toast({ title: 'PDF sendo preparado...', description: 'Em breve esta funcionalidade estará disponível.' })}
                        governments={governments}
                        {...nav}
                      />
                    </motion.div>
                  );
                }
                return null;
              })()}
              {!session?.completedAxes.length && !showSynthesis && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-center py-20">
                  <div className="w-20 h-20 rounded-2xl border border-neutral-700/30 flex items-center justify-center mb-6 bg-white/[0.02]">
                    <span className="font-display text-4xl text-brand-accent/40">Á</span>
                  </div>
                  <h3 className="font-display text-heading-lg text-neutral-50 mb-2">Dashboard de Análise</h3>
                  <p className="text-body-sm text-neutral-500 max-w-md">
                    Selecione governos e eixos no painel ao lado para iniciar a análise comparativa com framework PIR+.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer link */}
            <div className="mt-12 pt-6 border-t border-neutral-700/30 text-center">
              <Link to="/methodology" className="inline-flex items-center gap-2 text-body-sm text-neutral-500 hover:text-neutral-200 transition-colors">
                <BookOpen className="w-4 h-4" /> Ver Metodologia Completa
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ComparativeAnalysisPage;
