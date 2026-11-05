/**
 * SettingsPage — Sprint 7: real profile editing + i18n + sign out.
 */
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ChevronRight, User, Globe2, Lock, LogOut, Save } from "lucide-react";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n, type Locale } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { locale, setLocale, t } = useI18n();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [preferredCountry, setPreferredCountry] = useState("");
  const [defaultLayer, setDefaultLayer] = useState<number>(() => Number(localStorage.getItem("aegis_layer") ?? 1));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setBio(profile.bio ?? "");
      setPreferredCountry(profile.preferred_country ?? "");
    }
  }, [profile]);

  const onSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName, bio, preferred_country: preferredCountry || null })
        .eq("user_id", user.id);
      if (error) throw error;
      localStorage.setItem("aegis_layer", String(defaultLayer));
      await refreshProfile();
      toast({ title: t("settings.saved") });
    } catch (e) {
      toast({ title: "Erro", description: e instanceof Error ? e.message : "—", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const onSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <>
      <NavBar />
      <main className="min-h-screen pt-16">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <nav className="flex items-center gap-2 text-body-sm text-neutral-500 mb-8" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-neutral-200 transition-colors">{t("nav.home")}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-neutral-200">{t("nav.settings")}</span>
          </nav>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-display-lg text-neutral-50 mb-2">{t("settings.title")}</h1>
            <p className="text-body-md text-neutral-400 mb-10">{t("settings.subtitle")}</p>
          </motion.div>

          <div className="space-y-8">
            <section className="p-6 rounded-2xl border border-neutral-700/30 bg-white/[0.02]">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5 text-brand-accent" />
                <h2 className="text-heading-md font-semibold text-neutral-50">{t("settings.profile")}</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-body-sm text-neutral-300 mb-1.5 block">{t("settings.name")}</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-neutral-700/50 text-body-sm text-neutral-50 focus:outline-none focus:border-brand-accent/50"
                  />
                </div>
                <div>
                  <label className="text-body-sm text-neutral-300 mb-1.5 block">{t("settings.bio")}</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-neutral-700/50 text-body-sm text-neutral-50 focus:outline-none focus:border-brand-accent/50 resize-none"
                  />
                </div>
                <div>
                  <label className="text-body-sm text-neutral-300 mb-1.5 block">{t("settings.preferred_country")}</label>
                  <input
                    type="text"
                    value={preferredCountry}
                    onChange={(e) => setPreferredCountry(e.target.value.toUpperCase())}
                    placeholder="BR, US, DE, UY..."
                    maxLength={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-neutral-700/50 text-body-sm text-neutral-50 focus:outline-none focus:border-brand-accent/50"
                  />
                </div>
                <div>
                  <label className="text-body-sm text-neutral-300 mb-1.5 block">{t("settings.email")}</label>
                  <input
                    type="email"
                    value={user?.email ?? ""}
                    disabled
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-neutral-700/30 text-body-sm text-neutral-400"
                  />
                </div>
              </div>
            </section>

            <section className="p-6 rounded-2xl border border-neutral-700/30 bg-white/[0.02]">
              <div className="flex items-center gap-3 mb-6">
                <Globe2 className="w-5 h-5 text-brand-accent" />
                <h2 className="text-heading-md font-semibold text-neutral-50">{t("settings.preferences")}</h2>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="text-body-sm text-neutral-300 mb-2 block">{t("settings.layer")}</label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { v: 1, label: "L1 · Cidadão" },
                      { v: 2, label: "L2 · Gestor" },
                      { v: 3, label: "L3 · Especialista" },
                    ].map((l) => (
                      <button
                        key={l.v}
                        onClick={() => setDefaultLayer(l.v)}
                        className={`px-4 py-2 rounded-lg text-body-sm font-medium transition-all ${
                          defaultLayer === l.v
                            ? "bg-brand-accent text-brand-primary"
                            : "text-neutral-400 bg-white/[0.03] border border-neutral-700/30 hover:text-neutral-50"
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-body-sm text-neutral-300 mb-2 block">{t("settings.language")}</label>
                  <select
                    value={locale}
                    onChange={(e) => setLocale(e.target.value as Locale)}
                    className="px-4 py-3 rounded-xl bg-white/[0.04] border border-neutral-700/50 text-body-sm text-neutral-50 focus:outline-none focus:border-brand-accent/50"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es">Español</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="p-6 rounded-2xl border border-neutral-700/30 bg-white/[0.02]">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-5 h-5 text-brand-accent" />
                <h2 className="text-heading-md font-semibold text-neutral-50">{t("settings.security")}</h2>
              </div>
              <button
                onClick={onSignOut}
                className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl border border-confidence-low/30 hover:border-confidence-low/50 transition-colors text-body-sm text-confidence-low"
              >
                <LogOut className="w-4 h-4" />
                {t("nav.signout")}
              </button>
            </section>

            <div className="sticky bottom-4 flex justify-end">
              <button
                onClick={onSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-accent text-brand-primary font-semibold shadow-lg shadow-brand-accent/20 hover:bg-brand-accent-bright transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? t("common.loading") : t("common.save")}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default SettingsPage;
