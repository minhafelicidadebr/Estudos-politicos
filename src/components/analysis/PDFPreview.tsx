/**
 * PDFPreview — Rendered preview of the analysis report
 * Sprint 13: PDF Preview component
 */
import { motion } from "framer-motion";
import type { AnalysisOutput, AvatarProfile } from "@/types/aegis";
import type { CountryProfile } from "@/types/aegis";
import { getScoreBand } from "@/types/aegis";

interface PDFPreviewProps {
  analysis: AnalysisOutput;
  country: CountryProfile;
  avatar?: AvatarProfile;
  isOpen: boolean;
  onClose: () => void;
}

export function PDFPreview({ analysis, country, avatar, isOpen, onClose }: PDFPreviewProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white text-black shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors"
          aria-label="Fechar"
        >
          ✕
        </button>

        {/* Cover Page */}
        <div className="p-12 min-h-[500px] flex flex-col justify-between" style={{ background: 'linear-gradient(180deg, #0A1628 0%, #1A3A6B 100%)' }}>
          <div>
            <div className="flex items-center gap-2 mb-12">
              <div className="w-8 h-8 rounded border border-[#C9A84C]/40 flex items-center justify-center">
                <span className="text-[#C9A84C] font-serif text-lg">Á</span>
              </div>
              <span className="text-[#C9A84C] font-serif text-lg tracking-wide">Ágora</span>
            </div>
            <p className="text-[#C9A84C]/60 text-xs uppercase tracking-[0.25em] mb-4">Análise Política Comparada</p>
            <h1 className="text-white font-serif text-5xl mb-3">{country.name_display_pt}</h1>
            <p className="text-white/60 text-lg">{analysis.period}</p>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-white/40 text-xs mb-1">Score Global</p>
              <p className="text-[#C9A84C] font-serif text-6xl">{analysis.global_score.toFixed(1)}</p>
              <p className="text-white/40 text-sm">{getScoreBand(analysis.global_score)}</p>
            </div>
            <div className="text-right text-white/40 text-xs">
              <p>{new Date(analysis.generated_at).toLocaleDateString('pt-BR')}</p>
              <p>Framework v{analysis.framework_version}</p>
              <p>{analysis.model_used}</p>
            </div>
          </div>
        </div>

        {/* Methodology Summary */}
        <div className="p-12 border-b border-gray-200">
          <h2 className="font-serif text-2xl text-gray-800 mb-4">Metodologia</h2>
          <div className="grid grid-cols-3 gap-6 text-sm">
            <div>
              <p className="font-semibold text-gray-800 mb-1">PIR+ (Imparcialidade)</p>
              <p className="text-gray-500">Tese, antítese e julgamento obrigatórios para cada eixo.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-1">SIB (Confiança)</p>
              <p className="text-gray-500">Score bayesiano com cadeia de custódia de evidência.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-1">VCO (Validação)</p>
              <p className="text-gray-500">Cross-validation com modelo independente (GPT-4o).</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4 italic">{analysis.methodology_note}</p>
        </div>

        {/* Axes Summary */}
        <div className="p-12">
          <h2 className="font-serif text-2xl text-gray-800 mb-6">Análise por Eixo</h2>
          <div className="space-y-6">
            {analysis.axes.map((axis) => (
              <div key={axis.axis_id} className="pb-6 border-b border-gray-100 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">{axis.axis_name}</h3>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-mono text-gray-600">Score: {axis.score.toFixed(1)}</span>
                    <span className="font-mono text-gray-400">Conf: {(axis.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">{axis.summary}</p>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="p-3 rounded bg-blue-50">
                    <p className="font-semibold text-blue-700 mb-1">Tese</p>
                    <p className="text-blue-600 line-clamp-3">{axis.thesis}</p>
                  </div>
                  <div className="p-3 rounded bg-purple-50">
                    <p className="font-semibold text-purple-700 mb-1">Antítese</p>
                    <p className="text-purple-600 line-clamp-3">{axis.antithesis}</p>
                  </div>
                  <div className="p-3 rounded bg-amber-50">
                    <p className="font-semibold text-amber-700 mb-1">Julgamento</p>
                    <p className="text-amber-600 line-clamp-3">{axis.judgment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Trail */}
        <div className="p-12 bg-gray-50 rounded-b-2xl">
          <h2 className="font-serif text-2xl text-gray-800 mb-4">Trilha de Auditoria</h2>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <p><strong>Prompt:</strong> {analysis.audit_trail.prompt_id} v{analysis.audit_trail.prompt_version}</p>
            <p><strong>Modelo:</strong> {analysis.audit_trail.model}</p>
            <p><strong>VCO:</strong> {analysis.audit_trail.vco_result.passed ? 'Aprovado ✓' : 'Reprovado ✗'}</p>
            <p><strong>Data:</strong> {new Date(analysis.generated_at).toLocaleString('pt-BR')}</p>
          </div>
          <p className="text-xs text-gray-400 mt-6 italic">
            Este relatório foi gerado pela plataforma Ágora com trilha de auditoria completa.
            Cada afirmação é rastreável a uma fonte primária verificada.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
