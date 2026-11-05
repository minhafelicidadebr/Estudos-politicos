/**
 * ExportPanel — Export options for analysis results
 */
import { motion } from "framer-motion";
import { FileText, Image, Presentation, Video, Database, FileDown, Lock } from "lucide-react";
import type { ExportTier } from "@/types/aegis";

interface ExportOptionUI {
  format: string;
  label: string;
  description: string;
  tier: ExportTier;
  icon: React.ElementType;
}

const exportOptions: ExportOptionUI[] = [
  { format: 'pdf_basic', label: 'PDF Básico', description: 'Resumo executivo com scores e síntese', tier: 'free', icon: FileText },
  { format: 'pdf_premium', label: 'PDF Premium', description: 'Relatório completo com design editorial, 15-25 páginas', tier: 'pro', icon: FileDown },
  { format: 'infographic', label: 'Infográfico', description: 'Visualização de dados para compartilhamento social', tier: 'pro', icon: Image },
  { format: 'slides', label: 'Apresentação', description: 'Slides prontos para reuniões e aulas', tier: 'pro', icon: Presentation },
  { format: 'video_script', label: 'Roteiro de Vídeo', description: 'Script estruturado para conteúdo audiovisual', tier: 'pro', icon: Video },
  { format: 'data_csv', label: 'Dados (CSV)', description: 'Dataset estruturado para análise externa', tier: 'institutional', icon: Database },
];

const tierBadge: Record<ExportTier, { label: string; className: string }> = {
  free: { label: 'Grátis', className: 'bg-confidence-high/10 text-confidence-high' },
  pro: { label: 'Analista', className: 'bg-brand-accent/10 text-brand-accent' },
  institutional: { label: 'Institucional', className: 'bg-axis-b/10 text-axis-b' },
};

export function ExportPanel({ className }: { className?: string }) {
  return (
    <section className={className}>
      <h2 className="font-display text-heading-xl text-neutral-50 mb-2">Exportar Análise</h2>
      <p className="text-body-sm text-neutral-400 mb-6">Cada formato mantém a trilha de auditoria completa.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {exportOptions.map((opt, i) => {
          const badge = tierBadge[opt.tier];
          const locked = opt.tier !== 'free';
          return (
            <motion.button
              key={opt.format}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              disabled={locked}
              className="p-5 rounded-xl border border-neutral-700/30 hover:border-brand-accent/30 transition-all text-left group relative disabled:opacity-60"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              {locked && <Lock className="absolute top-3 right-3 w-3.5 h-3.5 text-neutral-600" />}
              <opt.icon className="w-6 h-6 text-neutral-400 group-hover:text-brand-accent transition-colors mb-3" />
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-body-sm font-semibold text-neutral-50">{opt.label}</h3>
                <span className={`px-2 py-0.5 rounded-full text-micro font-medium ${badge.className}`}>{badge.label}</span>
              </div>
              <p className="text-micro text-neutral-400 leading-relaxed">{opt.description}</p>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
