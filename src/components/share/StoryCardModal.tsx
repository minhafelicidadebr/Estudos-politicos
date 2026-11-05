/**
 * StoryCardModal — Sprint 9: shareable cinematic card per analysis.
 * Generates a 1080×1920 (9:16) story-ready image via html-to-canvas (DOM rendering)
 * with download + native share. Editorial design: dual-axis composition, gradient mesh.
 */
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Share2, X, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ease } from "@/lib/motion";
import { toast } from "sonner";
import type { SavedAnalysis } from "@/services/analysesService";

interface Props {
  analysis: SavedAnalysis | null;
  open: boolean;
  onClose: () => void;
}

function bandLabel(v: number): { label: string; color: string } {
  if (v >= 9) return { label: "Referência Global", color: "#22C55E" };
  if (v >= 7.5) return { label: "Alto desempenho", color: "#86EFAC" };
  if (v >= 6) return { label: "Sólido", color: "#FCD34D" };
  if (v >= 4.5) return { label: "Medíocre", color: "#FB923C" };
  if (v >= 3) return { label: "Fraco", color: "#F87171" };
  if (v >= 1.5) return { label: "Crítico", color: "#EF4444" };
  return { label: "Colapso", color: "#991B1B" };
}

function avgScore(a: SavedAnalysis): number {
  const s = (a.scores as Record<string, number> | null) ?? {};
  const vals = Object.values(s).filter((v) => typeof v === "number");
  return vals.length ? vals.reduce((x, y) => x + y, 0) / vals.length : 0;
}

function topAxes(a: SavedAnalysis): { axisId: string; score: number }[] {
  const s = (a.scores as Record<string, number> | null) ?? {};
  return Object.entries(s)
    .filter(([k, v]) => typeof v === "number" && k !== "average")
    .map(([axisId, score]) => ({ axisId, score: score as number }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

export function StoryCardModal({ analysis, open, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  if (!analysis) return null;

  const score = avgScore(analysis);
  const band = bandLabel(score);
  const axes = topAxes(analysis);
  const govs = Array.isArray(analysis.governments) ? analysis.governments : [];

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null, scale: 2, useCORS: true, logging: false,
      });
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
      if (!blob) throw new Error("Falha ao gerar imagem");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `agora-${analysis.country_id}-${analysis.id.slice(0, 8)}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Story card baixado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao gerar imagem");
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    const text = `${analysis.title} — score ${score.toFixed(1)} (${band.label}) · Ágora`;
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: analysis.title, text, url }); } catch {/* cancelled */}
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      toast.success("Texto copiado");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.4, ease: ease.cinematic }}
            className="relative my-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-white text-black hover:bg-white/90 flex items-center justify-center shadow-lg"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>

            {/* The 9:16 card (320x568 displayed; rendered at 2x for export) */}
            <div
              ref={cardRef}
              className="relative w-full rounded-3xl overflow-hidden shadow-2xl"
              style={{
                aspectRatio: "9 / 16",
                background: `
                  radial-gradient(circle at 20% 0%, ${band.color}33, transparent 50%),
                  radial-gradient(circle at 80% 100%, #C9A84C44, transparent 50%),
                  linear-gradient(160deg, #0A1628 0%, #1A3A6B 100%)
                `,
              }}
            >
              {/* Brand */}
              <div className="absolute top-6 left-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg border border-[#C9A84C]/50 flex items-center justify-center bg-[#C9A84C]/10">
                  <span className="font-display text-lg text-[#C9A84C] leading-none">Á</span>
                </div>
                <span className="font-display text-base text-[#C9A84C] tracking-wide">Ágora</span>
              </div>

              {/* Country pill */}
              <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-[10px] uppercase tracking-widest text-white/90 font-medium">
                {analysis.country_id}
              </div>

              {/* Score hero */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[58%] text-center w-full px-6">
                <div className="text-[10px] uppercase tracking-[0.25em] text-white/60 mb-2 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> Score PIR+
                </div>
                <div
                  className="font-display text-[8rem] leading-none"
                  style={{ color: band.color, textShadow: `0 0 40px ${band.color}66` }}
                >
                  {score.toFixed(1)}
                </div>
                <div className="mt-1 text-sm font-medium uppercase tracking-widest" style={{ color: band.color }}>
                  {band.label}
                </div>
              </div>

              {/* Title block */}
              <div className="absolute left-6 right-6 top-[68%]">
                <h2 className="font-display text-2xl text-white leading-tight line-clamp-3">
                  {analysis.title}
                </h2>
                <div className="mt-1.5 text-[11px] text-white/60">
                  {govs.length} governo{govs.length !== 1 ? "s" : ""} analisado{govs.length !== 1 ? "s" : ""} · v{analysis.framework_version}
                </div>
              </div>

              {/* Top axes mini-bars */}
              <div className="absolute left-6 right-6 bottom-16 space-y-1.5">
                {axes.map((a) => (
                  <div key={a.axisId} className="flex items-center gap-2">
                    <span className="text-[10px] text-white/70 w-8 font-mono">{a.axisId}</span>
                    <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(a.score / 10) * 100}%`, background: bandLabel(a.score).color }}
                      />
                    </div>
                    <span className="text-[10px] text-white/80 w-6 text-right font-mono">{a.score.toFixed(1)}</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between text-[10px] text-white/50 tracking-widest uppercase">
                <span>agoragov.com.br</span>
                <span>{new Date(analysis.created_at).toLocaleDateString("pt-BR")}</span>
              </div>
            </div>

            {/* Action bar */}
            <div className="mt-4 flex gap-2">
              <Button onClick={handleDownload} disabled={downloading} className="flex-1 bg-white text-black hover:bg-white/90">
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Baixar PNG
              </Button>
              <Button onClick={handleShare} variant="outline" className="flex-1 border-white/30 text-white hover:bg-white/10">
                <Share2 className="w-4 h-4" /> Compartilhar
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
