# Plano — Elevar analise-politica com virtudes de UX do Kiro

Base oficial: `analise-politica-main` (este projeto). Kiro é referência visual/UX apenas — nenhum recurso da base é removido.

## Matriz de decisão (Fase 0)

| Recurso Kiro | Valor UX | Onde aplicar na base | Risco | Decisão |
|---|---|---|---|---|
| Sofia com header contextual + estados robustos | Confiança, clareza | `src/components/sofia/SofiaChatbot.tsx` | Baixo (isolado) | Aprimorar in-place |
| Renderização estruturada de respostas IA (KPIs, tabelas, barras) | Legibilidade executiva | Novo `AIInsightRenderer` + schema Zod | Médio (parser) | Criar módulo novo, opt-in |
| Tabelas com barras proporcionais + acessibilidade | Comparação rápida | Dentro do renderer | Baixo | Componente `ProportionalBar` |
| CTAs contextuais (aprofundar eixo, ver evidências, voltar síntese) | Fluxo decisório | Sofia + AxisDashboard | Baixo | Barra de CTAs contextual |
| ComparativeHeroCTA | Onboarding análise | Existe versão própria na base | Médio | Não portar (evita regressão) |

Preservado sem alteração: `AIPromptTransparency`, `AISkillsPanel`, `AxisDashboard` (navegação eixos + voltar síntese), `FinalSynthesisDashboard`, `GlobalCommandPalette`, `KeyboardShortcuts`, rotas, RLS, edge functions.

## Fase 1 — Implementação

### 1. Schema + parser (novo)
- `src/types/aiInsights.ts` — union tipada `AIInsightBlock` (`kpi | table | chart | ranking | alert | evidence | recommendation | next_step`), campos comuns `id, type, title?, description?, data, sourceReferences?, confidence?`.
- `src/lib/aiInsights/schema.ts` — validação Zod estrita, discriminated union.
- `src/lib/aiInsights/parse.ts` — extrai bloco ```insights``` do markdown, `safeParse` por bloco; blocos inválidos viram warning silencioso (log dev). Nunca lança.

### 2. Componentes de renderização (novos, tipados)
- `src/components/ai-insights/AIInsightRenderer.tsx` — despachador por `type`.
- `KPIBlock`, `TableBlock` (com `ProportionalBar` opcional quando coluna numérica comparável e unidade definida), `ChartBlock` (recharts, já dep), `RankingBlock`, `AlertBlock`, `EvidenceBlock` (link a fontes), `RecommendationBlock`, `NextStepBlock` (CTAs).
- Todos com `aria-label`, descrição textual equivalente para leitores de tela, badge de confiança e chips de fontes. HTML da IA nunca renderizado — apenas texto escapado + markdown seguro (react-markdown já presente com allowlist).

### 3. Sofia premium
- `SofiaChatbot.tsx`: header contextual (rota atual, país/eixo se detectáveis via `useLocation` + store), hierarquia visual pergunta → interpretação → evidência → recomendação → próximo passo, estados vazio/erro/carregando/incompleto, CTAs contextuais ("Abrir síntese", "Aprofundar eixo X", "Ver evidências"), integração com `AIInsightRenderer` quando resposta contém blocos estruturados. Fallback: markdown puro segue funcionando.
- Microinterações discretas, respeita `prefers-reduced-motion`.

### 4. Atalhos — anti-conflito
Auditar `KeyboardShortcuts.tsx` + `GlobalCommandPalette.tsx` + `SofiaChatbot.tsx`:
- Ctrl/⌘+K → apenas paleta; `preventDefault` + `stopPropagation`.
- Ctrl/⌘+J → apenas Sofia; guardar contra propagação para paleta.
- Esc → fecha overlay ativo (paleta > sofia > help), com stack de prioridade.
- Guardar em `useRef` que a paleta está aberta para bloquear J e vice-versa.

### 5. CTAs contextuais reutilizáveis
- `src/components/ai-insights/ContextualCTAs.tsx` — lista tipada de ações; respeita rota, estado da análise, permissões.

## Fase 2 — Qualidade

- TypeScript estrito, zero `any` novo. Tipagem explícita nas props.
- Sanitização: react-markdown com `disallowedElements=['script','iframe','style']`, sem `rehype-raw`.
- Testes vitest novos em `src/test/`:
  - `aiInsights.schema.test.ts` — bloco válido / inválido / parcial.
  - `aiInsights.parse.test.ts` — extração de bloco, fallback texto.
  - `proportionalBar.test.tsx` — escala calculada, valor visível, aria.
  - `sofia.shortcut.test.tsx` — Ctrl+K não abre Sofia, Ctrl+J não abre paleta.
  - `axis-navigation.test.tsx` — smoke: síntese → eixo → voltar (preservação).

## Fase 3 — Não escopo (evita regressão)

- Não altero: `AIPromptTransparency`, `AISkillsPanel`, `AxisDashboard`, `FinalSynthesisDashboard`, `comparativeStore`, edge functions, RLS, rotas.
- Não porto `ComparativeHeroCTA` do Kiro (base tem fluxo mais maduro).
- Não introduzo dependências novas (Zod, Recharts, react-markdown, framer-motion já presentes).

## Entrega
Resumo de arquivos + matriz + testes + checklist de aceite ao final da implementação.

---
Aprovar para eu implementar em uma sequência: (1) schema+parser+testes, (2) renderer+componentes, (3) Sofia premium+CTAs, (4) hardening de atalhos+testes.