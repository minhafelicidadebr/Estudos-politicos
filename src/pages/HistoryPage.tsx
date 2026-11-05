/**
 * HistoryPage — Sprint 7: real Cloud-backed analyses list with delete + open.
 */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight, Clock, ArrowUpRight, Shield, Trash2, Inbox, Share2, Swords, Sparkles } from "lucide-react";
import { CoPilotChatDrawer } from "@/components/copilot/CoPilotChatDrawer";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import { ScoreBar } from "@/components/ui/score-bar";
import { listAnalyses, deleteAnalysis, type SavedAnalysis } from "@/services/analysesService";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n";
import { StoryCardModal } from "@/components/share/StoryCardModal";

const HistoryPage = () => {
  const { t } = useI18n();
  const { toast } = useToast();
  const [items, setItems] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [storyAnalysis, setStoryAnalysis] = useState<SavedAnalysis | null>(null);
  const [chatAnalysis, setChatAnalysis] = useState<SavedAnalysis | null>(null);

  const refresh = async () => {
    try {
      setItems(await listAnalyses());
    } catch (e) {
      toast({ title: "Erro ao carregar histórico", description: e instanceof Error ? e.message : "—", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const onDelete = async (id: string) => {
    if (!confirm("Excluir esta análise?")) return;
    try {
      await deleteAnalysis(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast({ title: "Análise excluída" });
    } catch (e) {
      toast({ title: "Erro ao excluir", description: e instanceof Error ? e.message : "—", variant: "destructive" });
    }
  };

  const avgScore = (a: SavedAnalysis): number => {
    const s = a.scores as Record<string, number> | null;
    if (!s) return 0;
    const vals = Object.values(s).filter((v) => typeof v === "number");
    return vals.length ? vals.reduce((x, y) => x + y, 0) / vals.length : 0;
  };

  return (
    <>
      <NavBar />
      <main className="min-h-screen pt-16">
        <div className="max-w-[1280px] mx-auto px-6 py-12">
          <nav className="flex items-center gap-2 text-body-sm text-neutral-500 mb-8" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-neutral-200 transition-colors">{t("nav.home")}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-neutral-200">{t("nav.history")}</span>
          </nav>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-8 h-8 text-brand-accent" />
              <h1 className="font-display text-display-lg text-neutral-50">{t("history.title")}</h1>
            </div>
            <p className="text-body-md text-neutral-400">{t("history.subtitle")}</p>
          </motion.div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-xl border border-neutral-700/30 bg-white/[0.02] animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <Inbox className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <p className="text-body-md text-neutral-400 mb-4">{t("history.empty")}</p>
              <Link to="/" className="text-brand-accent hover:text-brand-accent-bright text-body-sm">{t("history.first")}</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, i) => {
                const score = avgScore(item);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-4 p-5 rounded-xl border border-neutral-700/30 bg-white/[0.02] group hover:border-brand-accent/30 transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-brand-accent/10 flex items-center justify-center text-brand-accent font-display text-lg">
                      {item.country_id?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-body-md font-semibold text-neutral-50 truncate">{item.title}</h3>
                        {item.is_public && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-confidence-high/10 text-confidence-high text-micro">
                            <Shield className="w-3 h-3" /> Pública
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-micro text-neutral-500">
                        <span>{new Date(item.updated_at).toLocaleDateString()}</span>
                        <span>v{item.framework_version}</span>
                      </div>
                    </div>
                    {score > 0 && <ScoreBar score={score} showBand size="sm" className="hidden sm:flex" />}
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/debate/${item.id}`}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-600 hover:text-brand-accent hover:bg-brand-accent/10 transition-all"
                        aria-label="Abrir debate"
                        title="Abrir arena de debate"
                      >
                        <Swords className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setChatAnalysis(item)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-600 hover:text-brand-accent hover:bg-brand-accent/10 transition-all"
                        aria-label="Co-Piloto Analítico"
                        title="Conversar com IA sobre esta análise"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setStoryAnalysis(item)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-600 hover:text-brand-accent hover:bg-brand-accent/10 transition-all"
                        aria-label="Gerar story card"
                        title="Gerar story card compartilhável"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-600 hover:text-confidence-low hover:bg-confidence-low/10 transition-all"
                        aria-label={t("common.delete")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/comparative/${item.country_id.toLowerCase()}`}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-600 group-hover:text-brand-accent hover:bg-white/[0.04] transition-all"
                        aria-label="Abrir"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <StoryCardModal
        analysis={storyAnalysis}
        open={!!storyAnalysis}
        onClose={() => setStoryAnalysis(null)}
      />
      <CoPilotChatDrawer
        analysis={chatAnalysis}
        open={!!chatAnalysis}
        onClose={() => setChatAnalysis(null)}
      />
    </>
  );
};

export default HistoryPage;
