import { create } from 'zustand';
import type { GovernmentRecord, AxisComparativeResult, ComparativeSession, UserDepthTier, AnalysisPhase } from '@/types/aegis';

interface ComparativeStore {
  session: ComparativeSession | null;
  isAnalyzing: boolean;
  analysisProgress: { stage: string; pct: number; currentAxis: string };
  error: string | null;

  initSession: (countryId: string, countryName: string) => void;
  toggleGovernment: (gov: GovernmentRecord) => void;
  toggleAxis: (axisId: string) => void;
  setPhase: (phase: AnalysisPhase) => void;
  setUserTier: (tier: UserDepthTier) => void;
  setAnalyzing: (v: boolean) => void;
  setProgress: (stage: string, pct: number, currentAxis: string) => void;
  addCompletedAxis: (result: AxisComparativeResult) => void;
  resetSession: () => void;
  setError: (err: string | null) => void;
}

export const useComparativeStore = create<ComparativeStore>((set) => ({
  session: null,
  isAnalyzing: false,
  analysisProgress: { stage: '', pct: 0, currentAxis: '' },
  error: null,

  initSession: (countryId, countryName) => set({
    session: {
      id: `session-${Date.now()}`,
      countryId, countryName,
      selectedGovernments: [],
      selectedAxes: [],
      userTier: 'gestor',
      phase: 'country_context',
      completedAxes: [],
      currentAxisIndex: 0,
      isAnalyzing: false,
    },
    error: null,
  }),

  toggleGovernment: (gov) => set(state => {
    if (!state.session) return state;
    const exists = state.session.selectedGovernments.find(g => g.id === gov.id);
    return {
      session: {
        ...state.session,
        selectedGovernments: exists
          ? state.session.selectedGovernments.filter(g => g.id !== gov.id)
          : state.session.selectedGovernments.length < 5
            ? [...state.session.selectedGovernments, gov]
            : state.session.selectedGovernments,
      },
    };
  }),

  toggleAxis: (axisId) => set(state => {
    if (!state.session) return state;
    const exists = state.session.selectedAxes.includes(axisId);
    return {
      session: {
        ...state.session,
        selectedAxes: exists
          ? state.session.selectedAxes.filter(a => a !== axisId)
          : [...state.session.selectedAxes, axisId],
      },
    };
  }),

  setPhase: (phase) => set(state => state.session ? { session: { ...state.session, phase } } : state),
  setUserTier: (userTier) => set(state => state.session ? { session: { ...state.session, userTier } } : state),
  setAnalyzing: (v) => set({ isAnalyzing: v }),
  setProgress: (stage, pct, currentAxis) => set({ analysisProgress: { stage, pct, currentAxis } }),
  setError: (error) => set({ error }),

  addCompletedAxis: (result) => set(state => {
    if (!state.session) return state;
    return {
      session: {
        ...state.session,
        completedAxes: [...state.session.completedAxes, result],
        currentAxisIndex: state.session.currentAxisIndex + 1,
      },
    };
  }),

  resetSession: () => set({ session: null, isAnalyzing: false, error: null }),
}));
