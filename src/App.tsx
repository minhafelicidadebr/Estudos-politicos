import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { I18nProvider } from "@/i18n";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { lazy, Suspense } from "react";
import { SofiaChatbot } from "@/components/sofia/SofiaChatbot";
import { GlobalCommandPalette } from "@/components/command/GlobalCommandPalette";
import { KeyboardShortcuts } from "@/components/command/KeyboardShortcuts";

// Eager load critical pages
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

// Lazy load secondary pages
const AnalyzePage = lazy(() => import("./pages/AnalyzePage.tsx"));
const AuditPage = lazy(() => import("./pages/AuditPage.tsx"));
const MethodologyPage = lazy(() => import("./pages/MethodologyPage.tsx"));
const LibraryPage = lazy(() => import("./pages/LibraryPage.tsx"));
const ComparePage = lazy(() => import("./pages/ComparePage.tsx"));
const SettingsPage = lazy(() => import("./pages/SettingsPage.tsx"));
const HistoryPage = lazy(() => import("./pages/HistoryPage.tsx"));
const ComparativeAnalysisPage = lazy(() => import("./pages/ComparativeAnalysisPage.tsx"));
const AuthPages = lazy(() => import("./pages/AuthPages.tsx").then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import("./pages/AuthPages.tsx").then(m => ({ default: m.SignupPage })));
const ScenarioEnginePage = lazy(() => import("./pages/ScenarioEnginePage.tsx"));
const InstitutionalDNAPage = lazy(() => import("./pages/InstitutionalDNAPage.tsx"));
const AgencyDashboardPage = lazy(() => import("./pages/AgencyDashboardPage.tsx"));
const PolitiSimPage = lazy(() => import("./pages/PolitiSimPage.tsx"));
const OpinionOraclePage = lazy(() => import("./pages/OpinionOraclePage.tsx"));
const LegislativeSimPage = lazy(() => import("./pages/LegislativeSimPage.tsx"));
const WellbeingMapPage = lazy(() => import("./pages/WellbeingMapPage.tsx"));
const CareerNavigatorPage = lazy(() => import("./pages/CareerNavigatorPage.tsx"));
const FiscalImpactPage = lazy(() => import("./pages/FiscalImpactPage.tsx"));
const OrgWellbeingPage = lazy(() => import("./pages/OrgWellbeingPage.tsx"));
const EmergentIntelligencePage = lazy(() => import("./pages/EmergentIntelligencePage.tsx"));
const EpistemicRadarPage = lazy(() => import("./pages/EpistemicRadarPage.tsx"));
const PoliticalWrappedPage = lazy(() => import("./pages/PoliticalWrappedPage.tsx"));
const CivicHeatmapPage = lazy(() => import("./pages/CivicHeatmapPage.tsx"));
const DebateViewerPage = lazy(() => import("./pages/DebateViewerPage.tsx"));
const LigaPage = lazy(() => import("./pages/LigaPage.tsx"));
const AtlasPage = lazy(() => import("./pages/AtlasPage.tsx"));
const TimelinePage = lazy(() => import("./pages/TimelinePage.tsx"));
const LeadersPage = lazy(() => import("./pages/LeadersPage.tsx"));
const WorldMapPage = lazy(() => import("./pages/WorldMapPage.tsx"));
const InsightsPage = lazy(() => import("./pages/InsightsPage.tsx"));
const LabHubPage = lazy(() => import("./pages/LabHubPage.tsx"));
const TermsPage = lazy(() => import("./pages/LegalPage.tsx").then(m => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import("./pages/LegalPage.tsx").then(m => ({ default: m.PrivacyPage })));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-lg border border-brand-accent/40 flex items-center justify-center bg-brand-accent/5 animate-pulse">
          <span className="font-display text-2xl text-brand-accent leading-none">Á</span>
        </div>
        <p className="text-body-sm text-neutral-400">Carregando...</p>
      </div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <I18nProvider>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/analyze/:countryId" element={<AnalyzePage />} />
                  <Route path="/audit" element={<AuditPage />} />
                  <Route path="/methodology" element={<MethodologyPage />} />
                  <Route path="/library" element={<LibraryPage />} />
                  <Route path="/compare" element={<ComparePage />} />
                  <Route path="/comparative/:countryId" element={<ComparativeAnalysisPage />} />
                  <Route path="/analyze/:countryId/scenarios" element={<ScenarioEnginePage />} />
                  <Route path="/analyze/:countryId/dna" element={<InstitutionalDNAPage />} />
                  <Route path="/agency" element={<AgencyDashboardPage />} />
                  <Route path="/analyze/:countryId/politisim" element={<PolitiSimPage />} />
                  <Route path="/analyze/:countryId/opinion-oracle" element={<OpinionOraclePage />} />
                  <Route path="/analyze/:countryId/legis-sim" element={<LegislativeSimPage />} />
                  <Route path="/wellbeing" element={<WellbeingMapPage />} />
                  <Route path="/career" element={<CareerNavigatorPage />} />
                  <Route path="/fiscal-impact" element={<FiscalImpactPage />} />
                  <Route path="/org-wellbeing" element={<OrgWellbeingPage />} />
                  <Route path="/intelligence-commons" element={<EmergentIntelligencePage />} />
                  <Route path="/epistemic-radar" element={<EpistemicRadarPage />} />
                  <Route path="/wrapped" element={<ProtectedRoute><PoliticalWrappedPage /></ProtectedRoute>} />
                  <Route path="/heatmap" element={<ProtectedRoute><CivicHeatmapPage /></ProtectedRoute>} />
                  <Route path="/debate/:analysisId" element={<ProtectedRoute><DebateViewerPage /></ProtectedRoute>} />
                  <Route path="/liga" element={<ProtectedRoute><LigaPage /></ProtectedRoute>} />
                  <Route path="/atlas" element={<AtlasPage />} />
                  <Route path="/timeline/:countryId" element={<TimelinePage />} />
                  <Route path="/leaders" element={<LeadersPage />} />
                  <Route path="/world-map" element={<WorldMapPage />} />
                  <Route path="/insights" element={<InsightsPage />} />
                  <Route path="/lab" element={<LabHubPage />} />
                  <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                  <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
                  <Route path="/auth/login" element={<AuthPages />} />
                  <Route path="/auth/signup" element={<SignupPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <SofiaChatbot />
              <GlobalCommandPalette />
              <KeyboardShortcuts />
            </I18nProvider>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
