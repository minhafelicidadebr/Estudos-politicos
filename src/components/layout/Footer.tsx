import { Link } from "react-router-dom";

const footerColumns = [
  {
    title: "Produto",
    links: [
      { label: "Análise por País", href: "/" },
      { label: "Biblioteca Pública", href: "/library" },
      { label: "Comparação", href: "/compare" },
      { label: "AR+ Auditoria", href: "/audit" },
    ],
  },
  {
    title: "Metodologia",
    links: [
      { label: "Framework PIR+", href: "/methodology#pir" },
      { label: "Sistema de Confiança SIB", href: "/methodology#sib" },
      { label: "Validação VCO", href: "/methodology#vco" },
      { label: "Tree of Thoughts", href: "/methodology#tot" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Termos de Uso", href: "/terms" },
      { label: "Privacidade", href: "/privacy" },
    ],
  },
];

const Footer = () => (
  <footer className="border-t border-neutral-700/50 bg-brand-primary">
    <div className="max-w-[1280px] mx-auto px-6 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand column */}
        <div>
          <Link to="/" className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg border border-brand-accent/40 flex items-center justify-center bg-brand-accent/5">
              <span className="font-display text-lg text-brand-accent leading-none">Á</span>
            </div>
            <span className="font-display text-lg tracking-wide text-brand-accent">Ágora</span>
          </Link>
          <p className="text-sm text-neutral-400 leading-relaxed mb-2">
            Democracia começa com compreensão baseada em evidência.
          </p>
          <p className="text-xs text-neutral-600">
            agoragov.com.br · @agoragov
          </p>
        </div>

        {/* Link columns */}
        {footerColumns.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold text-neutral-200 mb-4">{col.title}</h4>
            <ul className="space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-neutral-400 hover:text-neutral-50 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="mt-16 pt-8 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-neutral-600">
          © {new Date().getFullYear()} Ágora. Todos os direitos reservados.
        </p>
        <p className="text-xs text-neutral-600">
          Dados de: Banco Mundial · FMI · V-Dem · TI · WJP · PNUD
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
