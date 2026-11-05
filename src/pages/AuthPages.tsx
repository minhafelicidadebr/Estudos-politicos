/**
 * AuthPages — State-of-the-art authentication UI for AEGIS.
 * Features: Lovable Cloud auth (email + Google OAuth), Zod validation,
 * password-strength meter, accessible (WCAG 2.2 AA), motion-respecting,
 * intelligent redirect, micro-interactions, loading & error states.
 */
import { useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

type AuthMode = "login" | "signup";

const emailSchema = z.string().trim().email("Informe um email válido").max(255);
const passwordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .max(72, "Máximo 72 caracteres");

function passwordStrength(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string; color: string } {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw) && pw.length >= 12) s++;
  const labels = ["Muito fraca", "Fraca", "Razoável", "Forte", "Excelente"];
  const colors = [
    "bg-confidence-low",
    "bg-confidence-low",
    "bg-confidence-medium",
    "bg-confidence-high",
    "bg-confidence-high",
  ];
  return { score: s as 0 | 1 | 2 | 3 | 4, label: labels[s], color: colors[s] };
}

function AuthForm({ mode }: { mode: AuthMode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (location.state as { from?: string } | null)?.from ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const strength = useMemo(() => passwordStrength(password), [password]);

  const validate = (): boolean => {
    const e: typeof fieldErrors = {};
    const emailRes = emailSchema.safeParse(email);
    if (!emailRes.success) e.email = emailRes.error.issues[0].message;
    const pwRes = passwordSchema.safeParse(password);
    if (!pwRes.success) e.password = pwRes.error.issues[0].message;
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { error: e } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (e) throw e;
        toast.success("Conta criada!", {
          description: "Verifique seu email para confirmar e depois entre.",
        });
        navigate("/auth/login", { replace: true });
      } else {
        const { error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) throw e;
        toast.success("Bem-vindo de volta!");
        navigate(fromPath, { replace: true });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      const friendly =
        msg.includes("Invalid login") || msg.includes("invalid_credentials")
          ? "Email ou senha incorretos"
          : msg.includes("already registered") || msg.includes("User already")
            ? "Este email já tem cadastro. Tente entrar."
            : msg.includes("Email not confirmed")
              ? "Confirme seu email antes de entrar."
              : msg;
      setError(friendly);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setOauthLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      if (result.redirected) return; // browser navigating to Google
      navigate(fromPath, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no login com Google");
      setOauthLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 30%, hsl(var(--brand-accent) / 0.08), transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <Link to="/" className="flex items-center gap-2.5 justify-center mb-10 group">
          <div className="w-10 h-10 rounded-lg border border-brand-accent/40 flex items-center justify-center bg-brand-accent/5 group-hover:bg-brand-accent/10 transition-colors">
            <span className="font-display text-2xl text-brand-accent leading-none">Á</span>
          </div>
          <span className="font-display text-xl tracking-wide text-brand-accent">Ágora</span>
        </Link>

        <div
          className="rounded-2xl border border-neutral-700/50 p-8 backdrop-blur-xl shadow-floating"
          style={{ background: "rgba(255,255,255,0.03)" }}
        >
          <motion.h1
            key={mode + "-h"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-heading-xl text-neutral-50 text-center mb-2"
          >
            {mode === "login" ? "Entrar" : "Criar conta"}
          </motion.h1>
          <p className="text-body-sm text-neutral-400 text-center mb-8">
            {mode === "login"
              ? "Acesse para salvar análises e continuar de onde parou"
              : "Comece a analisar política com método rigoroso"}
          </p>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={oauthLoading || submitting}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-neutral-700/50 text-neutral-200 hover:border-neutral-600 hover:bg-white/[0.02] transition-all text-body-sm disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            {oauthLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32l3.57 2.77c2.08-1.92 3.28-4.74 3.28-8.1z" />
              </svg>
            )}
            Continuar com Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-neutral-700/50" />
            <span className="text-micro text-neutral-500 uppercase tracking-wider">ou por email</span>
            <div className="flex-1 h-px bg-neutral-700/50" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="text-body-sm text-neutral-300 mb-1.5 block">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" aria-hidden />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete={mode === "login" ? "username" : "email"}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((s) => ({ ...s, email: undefined }));
                  }}
                  placeholder="seu@email.com"
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? "email-error" : undefined}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border text-body-sm text-neutral-50 placeholder:text-neutral-600 focus:outline-none transition-colors ${
                    fieldErrors.email
                      ? "border-confidence-low/60 focus:border-confidence-low"
                      : "border-neutral-700/50 focus:border-brand-accent/50"
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p id="email-error" className="text-micro text-confidence-low mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="text-body-sm text-neutral-300 mb-1.5 block">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" aria-hidden />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((s) => ({ ...s, password: undefined }));
                  }}
                  placeholder="••••••••"
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? "password-error" : undefined}
                  className={`w-full pl-10 pr-12 py-3 rounded-xl bg-white/[0.04] border text-body-sm text-neutral-50 placeholder:text-neutral-600 focus:outline-none transition-colors ${
                    fieldErrors.password
                      ? "border-confidence-low/60 focus:border-confidence-low"
                      : "border-neutral-700/50 focus:border-brand-accent/50"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                  aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p id="password-error" className="text-micro text-confidence-low mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.password}
                </p>
              )}

              {mode === "signup" && password.length > 0 && (
                <div className="mt-2.5">
                  <div className="flex gap-1 mb-1.5" aria-hidden>
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                          i < strength.score ? strength.color : "bg-neutral-700/40"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-micro text-neutral-500" aria-live="polite">
                    Força: <span className="text-neutral-300">{strength.label}</span>
                  </p>
                </div>
              )}
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-start gap-2 p-3 rounded-lg border border-confidence-low/30 bg-confidence-low/5">
                    <AlertCircle className="w-4 h-4 text-confidence-low flex-shrink-0 mt-0.5" aria-hidden />
                    <p className="text-body-sm text-confidence-low" role="alert">
                      {error}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={submitting || oauthLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-accent text-brand-primary font-semibold hover:bg-brand-accent-bright active:scale-[0.99] transition-all text-body-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {mode === "login" ? "Entrando…" : "Criando conta…"}
                </>
              ) : (
                <>
                  {mode === "login" ? "Entrar" : "Criar conta"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {mode === "signup" && (
              <p className="text-micro text-neutral-500 text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3 h-3" /> Ao criar conta, você concorda com nossos termos de uso
              </p>
            )}
          </form>

          <p className="text-body-sm text-neutral-500 text-center mt-6">
            {mode === "login" ? (
              <>
                Não tem conta?{" "}
                <Link to="/auth/signup" className="text-brand-accent hover:text-brand-accent-bright transition-colors">
                  Criar conta
                </Link>
              </>
            ) : (
              <>
                Já tem conta?{" "}
                <Link to="/auth/login" className="text-brand-accent hover:text-brand-accent-bright transition-colors">
                  Entrar
                </Link>
              </>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function AuthGate({ mode }: { mode: AuthMode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <AuthForm mode={mode} />;
}

export function LoginPage() {
  return <AuthGate mode="login" />;
}

export function SignupPage() {
  return <AuthGate mode="signup" />;
}

export default LoginPage;
