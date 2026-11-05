import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, LogOut, History, Settings as SettingsIcon, Sparkles, Activity, Trophy,
  Globe2, Crown, Map as MapIcon, Lightbulb, ChevronDown, FlaskConical, Dna, Users,
  Radio, Gavel, HeartHandshake, Compass, Wallet, Building2, Network, Brain,
  BookOpen, ShieldCheck, Library, GitCompareArrows, Scan, MessagesSquare, Search,
  type LucideIcon,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type MenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  badge?: string;
};

type MenuGroup = {
  title: string;
  items: MenuItem[];
};

type MenuColumn = {
  id: string;
  label: string;
  href?: string; // direct link when no dropdown
  featured?: { title: string; description: string; href: string; cta: string };
  groups?: MenuGroup[];
};

const MENU: MenuColumn[] = [
  {
    id: "explore",
    label: "Explorar",
    featured: {
      title: "Engine de Análise PIR+",
      description: "Compare governos com 28 eixos auditáveis, framework PIR+ e protocolo SIB.",
      href: "/compare",
      cta: "Iniciar análise comparativa",
    },
    groups: [
      {
        title: "Análises",
        items: [
          { label: "Comparação de Governos", href: "/compare", icon: GitCompareArrows, description: "Multi-governo, 28 eixos" },
          { label: "Comparador de Líderes", href: "/leaders", icon: Crown, description: "Perfis e legados" },
          { label: "Atlas Global", href: "/atlas", icon: Globe2, description: "Visão por país" },
          { label: "Mapa Mundial PIR+", href: "/world-map", icon: MapIcon, description: "Heatmap planetário" },
        ],
      },
      {
        title: "Inteligência",
        items: [
          { label: "Insights Globais", href: "/insights", icon: Lightbulb, description: "Padrões emergentes" },
          { label: "Heatmap Cívico", href: "/heatmap", icon: Activity, description: "Pulso da rede" },
        ],
      },
    ],
  },
  {
    id: "lab",
    label: "Laboratório",
    featured: {
      title: "Hub do Laboratório",
      description: "11 motores determinísticos. Filtro por intenção, jornada pedagógica guiada.",
      href: "/lab",
      cta: "Entrar no Hub",
    },
    groups: [
      {
        title: "Simulação política",
        items: [
          { label: "Motor de Cenários", href: "/analyze/br/scenarios", icon: FlaskConical, description: "SCM contrafactual", badge: "JSON_18" },
          { label: "DNA Institucional", href: "/analyze/br/dna", icon: Dna, description: "PCA 2D · Arquétipos", badge: "JSON_19" },
          { label: "PolitiSim", href: "/analyze/br/politisim", icon: Users, description: "Multi-agente 8D", badge: "JSON_21" },
          { label: "Oráculo de Opinião", href: "/analyze/br/opinion-oracle", icon: Radio, description: "SIR-Opinion", badge: "JSON_22" },
          { label: "Simulador Legislativo", href: "/analyze/br/legis-sim", icon: Gavel, description: "Hemiciclo · Emendas", badge: "JSON_23" },
        ],
      },
      {
        title: "Bem-estar & Economia",
        items: [
          { label: "Bem-Estar Governado", href: "/wellbeing", icon: HeartHandshake, description: "C-WBIG · Easterlin", badge: "JSON_24" },
          { label: "Navegador de Carreira", href: "/career", icon: Compass, description: "VAR · Becker/Sims", badge: "JSON_25" },
          { label: "Orçamento Pessoal", href: "/fiscal-impact", icon: Wallet, description: "5 canais fiscais", badge: "JSON_26" },
          { label: "Bem-Estar Organizacional", href: "/org-wellbeing", icon: Building2, description: "PERMA × JCM", badge: "JSON_27" },
        ],
      },
      {
        title: "Cognição & Sistemas",
        items: [
          { label: "Inteligência Emergente", href: "/intelligence-commons", icon: Network, description: "CAS · Fractal", badge: "JSON_28" },
          { label: "Radar Epistêmico", href: "/epistemic-radar", icon: Brain, description: "Bayesian · MI", badge: "JSON_29" },
        ],
      },
    ],
  },
  {
    id: "community",
    label: "Comunidade",
    featured: {
      title: "Ágora Wrapped",
      description: "Sua retrospectiva cívica anual — padrões, evolução e descobertas pessoais.",
      href: "/wrapped",
      cta: "Ver minha Wrapped",
    },
    groups: [
      {
        title: "Pessoal",
        items: [
          { label: "Ágora Wrapped", href: "/wrapped", icon: Sparkles, description: "Retrospectiva anual" },
          { label: "Heatmap Cívico", href: "/heatmap", icon: Activity, description: "Sua atividade" },
          { label: "Histórico", href: "/history", icon: History, description: "Suas análises" },
        ],
      },
      {
        title: "Coletivo",
        items: [
          { label: "Liga Ágora", href: "/liga", icon: Trophy, description: "Ranking cívico" },
          { label: "Debate Viewer", href: "/debate", icon: MessagesSquare, description: "Diálogos abertos" },
        ],
      },
    ],
  },
  {
    id: "resources",
    label: "Recursos",
    featured: {
      title: "Framework PIR+ & SIB",
      description: "Metodologia auditável: Perspectiva, Imparcialidade, Rigor + Source-Intelligence-Base.",
      href: "/methodology",
      cta: "Ler a metodologia",
    },
    groups: [
      {
        title: "Aprenda",
        items: [
          { label: "Metodologia", href: "/methodology", icon: BookOpen, description: "PIR+ · SIB · AAM" },
          { label: "Biblioteca", href: "/library", icon: Library, description: "Curadoria de fontes" },
        ],
      },
      {
        title: "Confiabilidade",
        items: [
          { label: "AR+ Auditoria", href: "/audit", icon: ShieldCheck, description: "Trilha auditável" },
          { label: "Timeline de Eventos", href: "/timeline", icon: Scan, description: "Linha do tempo" },
        ],
      },
    ],
  },
];

/* ───────────────────────────── component ───────────────────────────── */

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const closeTimer = useRef<number | null>(null);
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close mega-menu on route change
  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  // ESC closes mega-menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMenu(null);
        setAccountOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleSignOut = async () => {
    setAccountOpen(false);
    await signOut();
    toast.success("Sessão encerrada");
    navigate("/");
  };

  const initials = (profile?.display_name || user?.email || "?")
    .split(/[\s@.]+/)[0]
    .slice(0, 2)
    .toUpperCase();

  const openWithDelay = (id: string) => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpenMenu(id);
  };

  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenMenu(null), 140);
  };

  const isColumnActive = (col: MenuColumn) => {
    if (col.href && pathname === col.href) return true;
    if (col.featured && pathname === col.featured.href) return true;
    return col.groups?.some((g) => g.items.some((i) => pathname.startsWith(i.href))) ?? false;
  };

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand-accent focus:text-brand-primary focus:rounded-md"
      >
        Pular para o conteúdo
      </a>

      <nav
        role="navigation"
        aria-label="Navegação principal"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || openMenu
            ? "backdrop-blur-xl bg-brand-primary/85 border-b border-white/[0.06]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="Ágora — Página inicial">
            <div className="w-9 h-9 rounded-lg border border-brand-accent/40 flex items-center justify-center group-hover:border-brand-accent transition-colors bg-brand-accent/5">
              <span className="font-display text-xl text-brand-accent leading-none">Á</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg tracking-wide text-brand-accent leading-tight">Ágora</span>
              <span className="text-[9px] text-neutral-600 tracking-[0.15em] uppercase leading-none hidden sm:block">
                agoragov.com.br
              </span>
            </div>
          </Link>

          {/* Desktop mega-menu */}
          <div className="hidden lg:flex items-center gap-1" onMouseLeave={scheduleClose}>
            {MENU.map((col) => {
              const active = isColumnActive(col);
              const isOpen = openMenu === col.id;
              return (
                <div
                  key={col.id}
                  className="relative"
                  onMouseEnter={() => openWithDelay(col.id)}
                  onFocus={() => openWithDelay(col.id)}
                >
                  {col.href ? (
                    <Link
                      to={col.href}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                        active ? "text-neutral-50" : "text-neutral-400 hover:text-neutral-50"
                      }`}
                    >
                      {col.label}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      aria-haspopup="true"
                      aria-expanded={isOpen}
                      onClick={() => setOpenMenu(isOpen ? null : col.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all ${
                        active || isOpen
                          ? "text-neutral-50 bg-white/[0.04]"
                          : "text-neutral-400 hover:text-neutral-50 hover:bg-white/[0.03]"
                      }`}
                    >
                      <span>{col.label}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      />
                      {active && (
                        <span className="absolute -bottom-0.5 left-3 right-3 h-px bg-brand-accent/60" />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop CTA / account */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
              aria-label="Abrir busca rápida (Cmd+K)"
              title="Busca rápida"
              className="group flex items-center gap-2 pl-2.5 pr-1.5 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-brand-accent/30 transition-all"
            >
              <Search className="w-3.5 h-3.5 text-neutral-500 group-hover:text-brand-accent transition-colors" />
              <span className="text-xs text-neutral-500 group-hover:text-neutral-300 transition-colors">Buscar</span>
              <kbd className="ml-1 px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.06] text-[10px] font-mono text-neutral-500">⌘K</kbd>
            </button>
            {loading ? (
              <div className="w-9 h-9 rounded-full shimmer" aria-hidden />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setAccountOpen((v) => !v)}
                  className="flex items-center gap-2 focus-premium rounded-full"
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  aria-label="Menu da conta"
                >
                  <span className="w-9 h-9 rounded-full bg-gradient-primary text-brand-primary text-xs font-semibold flex items-center justify-center shadow-card overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      initials
                    )}
                  </span>
                </button>
                <AnimatePresence>
                  {accountOpen && (
                    <>
                      <button
                        aria-hidden
                        tabIndex={-1}
                        className="fixed inset-0 z-40"
                        onClick={() => setAccountOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        role="menu"
                        className="absolute right-0 top-12 z-50 w-60 rounded-xl surface-glass-elevated p-2"
                      >
                        <div className="px-3 py-2 border-b border-neutral-700/40 mb-1">
                          <p className="text-body-sm text-neutral-200 truncate">
                            {profile?.display_name || "Cidadão"}
                          </p>
                          <p className="text-micro text-neutral-500 truncate">{user.email}</p>
                        </div>
                        <Link to="/wrapped" onClick={() => setAccountOpen(false)} role="menuitem"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-body-sm text-brand-accent hover:bg-brand-accent/10 transition-colors">
                          <Sparkles className="w-4 h-4" /> Ágora Wrapped
                        </Link>
                        <Link to="/history" onClick={() => setAccountOpen(false)} role="menuitem"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-body-sm text-neutral-300 hover:bg-white/[0.04] hover:text-neutral-50 transition-colors">
                          <History className="w-4 h-4" /> Histórico
                        </Link>
                        <Link to="/settings" onClick={() => setAccountOpen(false)} role="menuitem"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-body-sm text-neutral-300 hover:bg-white/[0.04] hover:text-neutral-50 transition-colors">
                          <SettingsIcon className="w-4 h-4" /> Configurações
                        </Link>
                        <button onClick={handleSignOut} role="menuitem"
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-body-sm text-confidence-low/90 hover:bg-confidence-low/10 transition-colors">
                          <LogOut className="w-4 h-4" /> Sair
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/auth/login" className="text-sm text-neutral-400 hover:text-neutral-50 transition-colors">
                  Entrar
                </Link>
                <Link
                  to="/auth/signup"
                  className="border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-brand-primary transition-all px-5 py-2 rounded-full text-sm font-medium"
                >
                  Criar conta
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden text-neutral-400 hover:text-neutral-50"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Desktop mega-menu panel */}
        <AnimatePresence>
          {openMenu && (
            <motion.div
              key={openMenu}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => openWithDelay(openMenu)}
              onMouseLeave={scheduleClose}
              className="hidden lg:block absolute left-0 right-0 top-16 border-b border-white/[0.06] backdrop-blur-xl bg-brand-primary/95"
              role="region"
              aria-label="Submenu"
            >
              <div className="max-w-[1280px] mx-auto px-6 py-7">
                {(() => {
                  const col = MENU.find((c) => c.id === openMenu);
                  if (!col || !col.groups) return null;
                  return (
                    <div className="grid grid-cols-12 gap-6">
                      {/* Featured */}
                      {col.featured && (
                        <Link
                          to={col.featured.href}
                          className="col-span-4 group relative overflow-hidden rounded-xl p-5 border border-brand-accent/15 bg-gradient-to-br from-brand-accent/10 via-brand-accent/[0.04] to-transparent hover:border-brand-accent/35 transition-colors"
                        >
                          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-brand-accent/10 blur-2xl pointer-events-none" />
                          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-brand-accent mb-3">
                            <Sparkles className="w-3 h-3" />
                            Em destaque
                          </span>
                          <h3 className="font-display text-lg text-neutral-50 mb-2 leading-snug">
                            {col.featured.title}
                          </h3>
                          <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                            {col.featured.description}
                          </p>
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-accent group-hover:gap-2 transition-all">
                            {col.featured.cta} →
                          </span>
                        </Link>
                      )}

                      {/* Groups */}
                      <div
                        className={`${col.featured ? "col-span-8" : "col-span-12"} grid gap-x-6 gap-y-5`}
                        style={{ gridTemplateColumns: `repeat(${Math.min(col.groups.length, 3)}, minmax(0, 1fr))` }}
                      >
                        {col.groups.map((group) => (
                          <div key={group.title}>
                            <h4 className="text-[10px] uppercase tracking-[0.18em] text-neutral-500 mb-3 font-semibold">
                              {group.title}
                            </h4>
                            <ul className="space-y-1">
                              {group.items.map((item) => {
                                const Icon = item.icon;
                                const itemActive = pathname.startsWith(item.href);
                                return (
                                  <li key={item.href}>
                                    <Link
                                      to={item.href}
                                      className={`group/item flex items-start gap-3 px-2.5 py-2 rounded-lg transition-all ${
                                        itemActive
                                          ? "bg-brand-accent/10 text-neutral-50"
                                          : "text-neutral-300 hover:bg-white/[0.04] hover:text-neutral-50"
                                      }`}
                                    >
                                      <span className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 group-hover/item:bg-brand-accent/10 group-hover/item:border-brand-accent/25 transition-colors">
                                        <Icon className="w-4 h-4 text-brand-accent/80" />
                                      </span>
                                      <span className="flex-1 min-w-0">
                                        <span className="flex items-center gap-2">
                                          <span className="text-sm font-medium truncate">{item.label}</span>
                                          {item.badge && (
                                            <span className="text-[9px] font-mono text-neutral-500 px-1 py-0.5 rounded bg-white/[0.04] shrink-0">
                                              {item.badge}
                                            </span>
                                          )}
                                        </span>
                                        {item.description && (
                                          <span className="block text-[11px] text-neutral-500 truncate">
                                            {item.description}
                                          </span>
                                        )}
                                      </span>
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Backdrop click-out for desktop mega-menu */}
      {openMenu && (
        <button
          aria-hidden
          tabIndex={-1}
          className="fixed inset-0 top-16 z-40 bg-brand-primary/40 hidden lg:block"
          onClick={() => setOpenMenu(null)}
        />
      )}

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-brand-primary overflow-y-auto pt-20 pb-12 px-6 lg:hidden"
          >
            <div className="max-w-md mx-auto space-y-3">
              {MENU.map((col) => {
                const expanded = mobileExpanded === col.id;
                return (
                  <div key={col.id} className="rounded-xl border border-white/[0.06] overflow-hidden">
                    <button
                      type="button"
                      onClick={() =>
                        col.groups
                          ? setMobileExpanded(expanded ? null : col.id)
                          : (navigate(col.href!), setMobileOpen(false))
                      }
                      className="w-full flex items-center justify-between px-4 py-3.5 text-left text-neutral-100 hover:bg-white/[0.03] transition-colors"
                      aria-expanded={expanded}
                    >
                      <span className="font-display text-base">{col.label}</span>
                      {col.groups && (
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
                        />
                      )}
                    </button>
                    <AnimatePresence initial={false}>
                      {expanded && col.groups && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden border-t border-white/[0.05] bg-white/[0.015]"
                        >
                          <div className="p-3 space-y-4">
                            {col.featured && (
                              <Link
                                to={col.featured.href}
                                onClick={() => setMobileOpen(false)}
                                className="block p-3 rounded-lg border border-brand-accent/20 bg-brand-accent/[0.06]"
                              >
                                <p className="text-[10px] uppercase tracking-wider text-brand-accent mb-1">
                                  Em destaque
                                </p>
                                <p className="text-sm font-medium text-neutral-50">{col.featured.title}</p>
                                <p className="text-xs text-neutral-400 mt-1">{col.featured.description}</p>
                              </Link>
                            )}
                            {col.groups.map((group) => (
                              <div key={group.title}>
                                <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-500 px-2 mb-1.5">
                                  {group.title}
                                </p>
                                <ul className="space-y-0.5">
                                  {group.items.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                      <li key={item.href}>
                                        <Link
                                          to={item.href}
                                          onClick={() => setMobileOpen(false)}
                                          className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-neutral-300 hover:bg-white/[0.04] hover:text-neutral-50"
                                        >
                                          <Icon className="w-4 h-4 text-brand-accent/70" />
                                          <span className="text-sm flex-1">{item.label}</span>
                                          {item.badge && (
                                            <span className="text-[9px] font-mono text-neutral-500">
                                              {item.badge}
                                            </span>
                                          )}
                                        </Link>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              <div className="flex flex-col gap-3 pt-6">
                {user ? (
                  <>
                    <Link
                      to="/history"
                      onClick={() => setMobileOpen(false)}
                      className="text-center py-3 rounded-lg border border-white/10 text-neutral-200"
                    >
                      Histórico
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="text-center py-3 rounded-lg text-confidence-low/90 border border-confidence-low/20"
                    >
                      Sair
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/auth/login"
                      onClick={() => setMobileOpen(false)}
                      className="text-center text-neutral-400 hover:text-neutral-50 py-2"
                    >
                      Entrar
                    </Link>
                    <Link
                      to="/auth/signup"
                      onClick={() => setMobileOpen(false)}
                      className="border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-brand-primary transition-all px-6 py-3 rounded-full text-base font-medium text-center"
                    >
                      Criar conta
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavBar;
