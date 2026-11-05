# ÁGORA — AEGIS Political Governance Intelligence (FABLE 5.0)

Plataforma de inteligência comparativa de governança pública orientada a evidências (**Evidence-First Comparative Intelligence — ÁGORA FABLE 5.0**).

O Ágora combina análise assistida por modelos de linguagem com um **motor determinístico de verificação, custódia de evidências, auditoria econométrica e governança de elegibilidade** em TypeScript/Zod, garantindo que nenhuma narrativa ou pontuação seja apresentada sem contrato explícito de proveniência, escada de degradação e critérios de falseabilidade.

---

## Stack Tecnológica Real

- **Frontend & Runtime**: Vite 5 + React 18 + TypeScript 5
- **Design System & UI**: Tailwind CSS 3 + Radix UI / shadcn-ui + Framer Motion + Lucide Icons + Recharts
- **Estado & Validação Runtime**: Zustand 5 + Zod 3 + TanStack Query 5
- **Backend & Funções Serverless**: Supabase (Auth, PostgreSQL Database e Edge Functions em `supabase/functions/*`)
- **Testes Automatizados**: Vitest + Testing Library + Playwright

---

## Arquitetura Epistemológica — ÁGORA FABLE 5.0

### 1. Hierarquia de Verdade
1. **Nível 1 — Dados Oficiais ou Primários Auditáveis** (`src/data/sourceRegistry.ts`)
2. **Nível 2 — Séries Secundárias Reconhecidas e Padronizadas**
3. **Nível 3 — Literatura Científica Revisada por Pares**
4. **Nível 4 — Índices Compostos / Perceptivos** (sinalizados como *Percepção / Composto*, com proibição de sustentar sozinhos conclusão causal forte)
5. **Nível 5 — Síntese Analítica Derivada**
6. **Nível 6 — Inferência de IA** (nunca tratada como prova factual autônoma)

### 2. Modos de Execução (`ExecutionMode`)
- **`VERIFIED_LIVE`**: Fontes primárias consultadas e validadas com correspondência documental em tempo real.
- **`RESEARCH_PARTIAL`**: Fontes catalogadas identificadas no Registro Canônico de Fontes, mas sem recuperação documental HTTP em tempo real na sessão (`SOURCE_IDENTIFIED` como teto determinístico de verificação).
- **`DEMO_FIXTURE`**: Demonstração metodológica com dados sintéticos/fixtures explícitos (rótulo obrigatório `[DEMONSTRAÇÃO METODOLÓGICA — DADOS SINTÉTICOS]`).

### 3. Máquina de Estados de Verificação (`VerificationState`)
A localização da fonte, a consulta ao conteúdo, a extração do dado e a correspondência do valor são etapas estritamente separadas:
- `UNVERIFIED`
- `SOURCE_IDENTIFIED`
- `SOURCE_RETRIEVED`
- `CLAIM_LOCATED`
- `VALUE_MATCHED`
- `FACTUALLY_SUPPORTED`
- `PARTIALLY_SUPPORTED`
- `INCONCLUSIVE`
- `QUARANTINED`

Campos autodeclarados pelo LLM (`verified: true`, `eligible: true`, `quarantine: false`) são **ignorados e sobrescritos** pelo motor determinístico (`src/lib/evidence/engine.ts`).

### 4. Separação das 4 Dimensões de Avaliação
Nenhuma nota mistura desempenho do governo com qualidade dos dados:
1. **`observedPerformanceScore`**: Desempenho observado nos indicadores do eixo (`number | null` — **nunca** `0.0` quando faltam dados).
2. **`methodologicalQualityScore`**: Rigor de comparabilidade temporal, unidades e controle contextual (0–10).
3. **`evidenceReliabilityIndex`**: Índice de confiabilidade probatória (0–100) calculado pela fórmula determinística do SIB.
4. **`rankingEligibility`**: Status de elegibilidade (`ELIGIBLE`, `PARTIAL_SUFFICIENCY`, `INELIGIBLE`, `QUARANTINED`) com códigos de razão auditáveis (`ReasonCode`).

Quando qualquer governo ou eixo entra em `INELIGIBLE` ou `QUARANTINED`, o **pódio competitivo e o ranking agregado são bloqueados** para evitar comparações assimétricas ou injustas.

---

## Biblioteca de 8 Skills Operacionais (`SK-01` a `SK-08` — v5.0.0)

Definidas em `src/data/aiSkills.ts` e acopladas ao motor determinístico `src/lib/evidence/engine.ts`:

| ID | Nome | Garantia Operacional no FABLE 5.0 |
|---|---|---|
| **SK-01** | **Triangulação Probatória (SIB)** | Deduplica fontes pelo `originGroup` no Registro Canônico (`src/data/sourceRegistry.ts`), recalcula o SIB em código e exibe aviso explícito de que os pesos do SIB são convenção metodológica (não teoremas naturais). |
| **SK-02** | **Dialética Hegeliana Estruturada** | Separa fatos observados (`VERIFIED_FACT`), argumentos favoráveis, argumentos críticos e síntese condicional, auditando se tese e antítese citam indicadores verificáveis. |
| **SK-03** | **Neutralidade Semântica e Paridade de Escopo** | Rejeita equivalência artificial (*false balance*), aplica detector lexical de termos partidários/pejorativos e verifica invariância determinística sob troca de nomes e reordenação (`verifyLabelSwapAndOrderInvariance`). |
| **SK-04** | **Rigor Econométrico Comparado** | Valida compatibilidade nominal vs real, detecta confusão entre `%` e `p.p.`, verifica sobreposição temporal de mandatos, recalcula `Δ%`, `Δ p.p.` e `CAGR` em TypeScript e rejeita alegações de cálculos não executados (ex.: "bootstrap ×1000"). |
| **SK-05** | **Cadeia de Custódia de Evidências (CCE)** | Vincula cada indicador a `EvidenceClaim` + `EvidenceSource`, executa parser numérico estrito (bloqueando `NaN`, `Infinity` e separadores ambíguos como `"1,000"` sem contexto) e alimenta o **Passaporte de Evidências Ágora**. |
| **SK-06** | **Auditoria Adversária Pós-Doc** | Gera achados estruturados (`finding → evidence → severity → impact → correctiveAction`) e publica obrigatoriamente a seção **"O que poderia mudar esta conclusão?"**. |
| **SK-07** | **Anti-Alucinação Bayesiana (AAM)** | Arquitetura Zero-Trust para respostas de LLM via Zod (`src/lib/evidence/schema.ts`), sanitização contra *prompt injection* (`src/data/promptRegistry.ts`), bloqueio de nota `0.0` para dados ausentes e escada de degradação em 4 degraus. |
| **SK-08** | **Contextualização Macro-Histórica** | Decompõe variação em componente global, tendência herdada e resíduo doméstico com **disclaimer obrigatório** de que o resíduo não constitui prova automática de efeito causal do governante. |

---

## Principais Módulos do FABLE 5.0

- `src/types/evidence.ts` — Contratos TypeScript (`EvidenceClaim`, `EvidenceSource`, `EvidenceTransformation`, `EvidenceAudit`, `EvaluationDimensions`, `AxisEvidenceGovernance`, `PipelineExecutionReport`).
- `src/lib/evidence/schema.ts` — Schemas Zod de validação em tempo de execução para entradas do modelo e contratos governados.
- `src/data/sourceRegistry.ts` — Registro Canônico de Fontes Oficiais, Internacionais e Científicas com deduplicação por `originGroup` e bloqueio de agregadores/espelhos.
- `src/lib/evidence/engine.ts` — Motor determinístico de 13 estágios: parser numérico seguro, recálculo econométrico, auditoria lexical e de invariância, máquina de estados de verificação, cálculo do SIB e governança de ranking.
- `src/data/promptRegistry.ts` — Biblioteca de Prompts Canônicos e Prompts de Tarefa Versionados (`PROMPT_REGISTRY_VERSION = "5.0.0"`) com sanitização contra *prompt injection*.
- `src/components/comparative/EvidencePassportModal.tsx` — **Passaporte de Evidências Ágora** com 8 seções auditáveis (**Origem**, **Definição**, **Temporalidade**, **Verificação**, **Transformações**, **Comparabilidade**, **Incerteza**, **Contestabilidade**).
- `src/test/fable5.adversarial.test.ts` — Suíte automatizada com os **20 cenários adversariais obrigatórios** do protocolo FABLE 5.0.

---

## Como Executar Localmente

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (porta 3000)
npm run dev

# Executar suíte completa de testes (incluindo os 20 cenários adversariais FABLE 5.0)
npm test

# Verificar tipagem TypeScript e ESLint estrito
npx tsc -p tsconfig.app.json --noEmit
npm run lint

# Gerar build de produção
npm run build
```
