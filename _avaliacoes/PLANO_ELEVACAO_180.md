# PLANO DE ELEVAÇÃO 180% — Ágora (politica-fable5-2026)

**Baseline:** 5,1/10 (ponderado, `AVALIACAO_2026-07-07.md`)
**Data:** 2026-07-07

## Meta operacionalizada (declaração de forma — §2.3 da doutrina)

A meta nominal de +180% (índice ×2,8) exigiria score 14,2 — **aritmeticamente impossível** no teto de 10. Adota-se a **forma convertida honesta**:

> **Toda lente com fratura P0 atinge ≥ 8/10 com evidência verificável em código/produto**, com duas exceções declaradas: as lentes 3 (Modelo de negócio) e 9 (Marketing de conversão) têm meta 7,5, porque a fração final delas depende de tração real de mercado (clientes pagando, funil com volume), que nenhuma onda de código pode fabricar — e fabricar métrica é exatamente o que este plano existe para eliminar.

**Alvo ponderado estimado ao fim das 6 ondas: ~7,7/10** (Índice de Elevação real ≈ +51%). Reavaliação com este mesmo scorecard após a última onda fecha o ciclo e mede o índice real, não o prometido.

**Invariantes herdados (inegociáveis em todas as ondas):**
- A neutralidade estrutural dos prompts (tese+antítese, APP+, proibição de léxico partidário) **nunca** é relaxada para melhorar conversão ou engajamento — é FORÇA do app, registrada como tal na avaliação.
- As "garantias constitucionais" do Radar Epistêmico (autonomia do usuário, opt-in, direito de encerrar) permanecem intactas.
- Os engines determinísticos continuam rotulados como determinísticos — a correção é alinhar o marketing ao código, jamais o contrário.
- Proibições permanentes do protocolo: sem overclaim regulatório, sem dark patterns, sem gamificação coercitiva, sem remoção de disclaimers.

---

## AS ONDAS (fatias verticais, sequenciadas por dependência)

### ONDA 0 · "Operação Verdade" — Vetores: Plataforma + IA
**Pergunta-guia:** *"Se um jornalista de tecnologia ler o código-fonte amanhã, o que ele encontra?"* — em 60s: nenhum número na tela que não venha de dado vivo.

| | |
|---|---|
| **Lentes elevadas** | L4 5,5→7,5 · L13 3,5→5,5 · L9 3,0→4,0 · L10 5,5→6,0 |
| **Impacto × esforço** | ALTÍSSIMO × BAIXO (dias) — a maior alavanca do plano |

**Entregas:**
1. Hero: "190+ países cobertos" → "20 países com dados curados — e qualquer país do mundo via análise de IA" (`HeroSection.tsx:9`); "Anti-alucinação certificado" → "Protocolo anti-alucinação auditável" (`HeroSection.tsx:7`).
2. Corpus: apagar `totalAnalysesInCorpus: 127450` (`emergentIntelligenceEngine.ts:138`) e "100.000+ análises" (`AdvancedModulesShowcase.tsx:272,278,290`); substituir por `COUNT(*)` real da tabela `analyses` (RPC pública agregada) com rótulo honesto ("corpus em crescimento desde 2026").
3. AR+: banner "Protocolo em validação — resultados abaixo são cenários ilustrativos do método, não medições" no topo de `AuditPage.tsx`, e remoção dos nomes GPT-4o/Claude 3.5 dos mocks (elimina exposição jurídica) — até a Onda 4 implementar auditoria real.
4. `computeEpistemicProfile`: remover `Math.random()` (`epistemicTransformationEngine.ts:113`) e ler `totalAnalyses` da tabela real (`:122`).
5. Páginas `/terms` e `/privacy` reais (LGPD: base legal, dado sensível de opinião política art. 5º II, direitos do titular, DPO/contato) + rotas em `App.tsx`; corrigir links mortos `/about`, `/blog` do Footer (criar ou remover).
6. Typo "Àgora"→"Ágora" no `index.html:6`.

**Critério de aceite:** grep por `127450|190+|certificado` retorna zero; `/privacy` e `/terms` renderizam conteúdo jurídico real; AuditPage declara status de validação.
**Prova de demo day:** abrir o site e o código lado a lado — cada número da landing tem origem apontável.

---

### ONDA 1 · "Cofre" — Vetores: Plataforma + Engenharia de software
**Pergunta-guia:** *"Um script anônimo consegue gastar meu dinheiro de IA às 3h da manhã?"* — em 60s: tentativa anônima de chamar a IA morre com 401.

| | |
|---|---|
| **Lentes elevadas** | L2 3,5→5,0 · L1 6,0→6,5 · L13 5,5→6,5 |
| **Impacto × esforço** | ALTO × MÉDIO |

**Entregas:**
1. Verificação de JWT nas 4 edge functions (auth obrigatório para `comparative-analysis`, `chat-analysis`, `narrate-analysis`; Sofia pode aceitar anônimo com rate limit agressivo, decisão de produto).
2. Rate limit por usuário via tabela `ai_usage` + RPC `consume_ai_quota()` (o padrão do app irmão kiro-playbook serve de referência).
3. Validação Zod do body em todas as functions (shape, tamanho máximo, tipos).
4. CORS: wildcard → allowlist do domínio de produção + localhost dev.
5. `.env` no `.gitignore` + `.env.example` versionado.

**Critério de aceite:** `curl` anônimo em `comparative-analysis` → 401; usuário autenticado excedendo quota → 429 com mensagem amigável; teste automatizado de ambos.
**Prova de demo day:** rodar o curl ao vivo e mostrar o 401.

---

### ONDA 2 · "Bilheteria" — Vetores: Plataforma + Design/UX
**Pergunta-guia:** *"Alguém consegue nos pagar?"* — em 60s: assinar o plano Analista e exportar um PDF premium.

| | |
|---|---|
| **Lentes elevadas** | L3 2,5→6,5 · L2 5,0→6,5 · L9 4,0→5,5 |
| **Impacto × esforço** | ALTÍSSIMO × ALTO (depende da Onda 1) |

**Entregas:**
1. Tabela `subscriptions` (plan, status, período, trial_ends_at) + integração de pagamento (Stripe ou o billing nativo do Lovable Cloud — decidir pelo caminho mais curto da plataforma).
2. CTAs do pricing ligados: "Começar grátis"→signup; "Começar 14 dias grátis"→checkout com trial real; "Falar com o time"→formulário/e-mail com persistência em banco (não localStorage).
3. Enforcement do plano grátis: contagem de análises/mês lida de `analyses` (a tabela já existe), bloqueio suave no 4º uso com CTA de upgrade contextual (sem dark pattern: contador visível desde a 1ª análise).
4. `ExportPanel` gated por plano real: `locked = !hasActivePlan` em vez de hardcoded; upgrade em 1 clique a partir do cadeado.
5. Se o billing não puder ir ao ar de imediato: waitlist com e-mail persistido em banco — jamais botão morto.

**Critério de aceite:** fluxo pagamento→plano ativo→export desbloqueado completo em staging; usuário grátis bloqueado na 4ª análise do mês; zero botões sem handler no app.
**Prova de demo day:** assinar e exportar um PDF premium em menos de 90 segundos, ao vivo.

---

### ONDA 3 · "Luzes" — Vetores: Plataforma + Engenharia
**Pergunta-guia:** *"O que os usuários fizeram ontem?"* — em 60s: dashboard PostHog com o funil real.

| | |
|---|---|
| **Lentes elevadas** | L9 5,5→6,5 · L2 6,5→7,5 · L3 6,5→7,0 (mensuração habilita iteração) |
| **Impacto × esforço** | ALTO × BAIXO — deveria idealmente correr em paralelo à Onda 2 |

**Entregas:**
1. PostHog (funil: landing→país→análise→signup→pagamento; eventos nomeados) + Sentry (erros de frontend e das edge functions).
2. Telemetria de custo de IA: log por chamada (função, modelo, tokens, usuário) em tabela `ai_usage` — visibilidade de margem por usuário.
3. `<title>` e meta description por rota (react-helmet-async) para as 30 rotas + sitemap.xml + canonical — a Biblioteca e a Liga viram superfície indexável.
4. Web vitals básicos monitorados (a landing tem motion pesado; medir antes de otimizar).

**Critério de aceite:** funil de 5 passos visível no PostHog com dados reais; erro forçado aparece no Sentry; `curl` de 3 rotas retorna titles distintos.
**Prova de demo day:** abrir o dashboard e mostrar a jornada de um usuário real de ontem.

---

### ONDA 4 · "Prova" — Vetores: IA + Engenharia de software
**Pergunta-guia:** *"O selo de confiança aguenta um cético?"* — em 60s: a página AR+ mostra uma auditoria que rodou de verdade esta semana, com timestamp.

| | |
|---|---|
| **Lentes elevadas** | L10 6,0→8,0 · L13 6,5→8,0 · L4 7,5→8,5 · L1 6,5→8,0 |
| **Impacto × esforço** | ALTÍSSIMO × ALTO |

**Entregas:**
1. **AR+ real mínimo:** edge function `run-audit` que executa N testes pareados reais (mesma pergunta variando idioma/fraseamento/perfil) contra os modelos que o app realmente usa (Gemini via gateway), calcula assimetria com métrica documentada, persiste em tabela `audit_runs`; `AuditPage` lê do banco com data e metodologia linkada. Cron semanal (agendador do Supabase). *Nota de honestidade: auditar apenas os modelos próprios — nunca publicar números sobre modelos de terceiros que não rodamos.*
2. CI GitHub Actions: lint + test + build em todo push; badge no README.
3. Testes unitários para os 3 engines mais expostos (politiSim, syntheticControl, fiscalImpact — são determinísticos com PRNG seedado: perfeitos para golden tests) + os 2 testes prometidos e não entregues do plan.md (atalhos Sofia, navegação de eixos).
4. `strictNullChecks: true` progressivo: primeiro em `src/services/` e `src/lib/` (código mais novo e mais limpo), depois páginas.
5. Remover `example.test.ts` placeholder.

**Critério de aceite:** AuditPage 100% livre de mock, exibindo runs reais com timestamp; CI verde obrigatório; ≥25 testes passando; `src/services` compila com strictNullChecks.
**Prova de demo day:** disparar uma auditoria ao vivo e ver o resultado entrar na página.

---

### ONDA 5 · "Corredor" — Vetores: Arquitetura de informação + Design/UX
**Pergunta-guia:** *"Um novo usuário chega ao momento-aha sem mapa?"* — em 60s: da landing à primeira síntese comparativa sem nenhuma decisão desnecessária.

| | |
|---|---|
| **Lentes elevadas** | L5 6,0→8,0 · L8 6,0→7,5 · L11 5,5→6,5 |
| **Impacto × esforço** | ALTO × MÉDIO |

**Entregas:**
1. Jornada primária única e sinalizada: país → análise comparativa → síntese → salvar/compartilhar. Tudo o mais (11 labs, Wrapped, Liga...) reorganizado sob "Laboratório (beta)" com badge honesto de status por módulo (real/beta/em validação).
2. Onboarding de primeira análise (3 passos, dispensável) + empty states que conduzem à próxima ação.
3. Decisão de idioma honesta: ou i18n completo da jornada primária (não das 30 rotas), ou remover o seletor EN/ES até existir — sem fachada.
4. Auditoria a11y da jornada primária (teclado, leitor de tela, contraste) aplicando o padrão do `ai-insights` aos fluxos principais; registro linkado na Metodologia.
5. Camadas pedagógicas L1/L2/L3 como controle visível na análise (o schema do LLM já entrega os 3 níveis — a UI precisa expô-los como feature).

**Critério de aceite:** novo usuário (teste moderado ou métrica PostHog) chega à primeira síntese em <3 min; taxa landing→primeira análise medida como baseline de CRO; zero rotas 404 linkadas.
**Prova de demo day:** entregar o app a alguém que nunca o viu e cronometrar.

---

### ONDA 6 · "Vitrine" — Vetores: Design/UX + IA
**Pergunta-guia:** *"Qual peça vai para a vitrine?"* — em 60s: uma demo que gera "uau" e um share que gera aquisição.

| | |
|---|---|
| **Lentes elevadas** | L12 7,5→8,5 · L4 8,5→9,0 · L9 6,5→7,5 · L11 6,5→7,0 |
| **Impacto × esforço** | MÉDIO × MÉDIO |

**Entregas:**
1. Eleger 2 módulos-assinatura e poli-los até nível vitrine — recomendação do comitê: **AR+ real** (agora único no mercado, pós-Onda 4) e **Political Wrapped** (viral por natureza, agora com dados reais de uso pós-Onda 3).
2. Compartilhamento real: StoryCardModal gerando cards de síntese com link público (`is_public` já existe na tabela `analyses`) — cada análise compartilhada vira aquisição orgânica indexável (SEO da Onda 3 amplifica).
3. Narrativa atualizada: a landing passa a contar as forças reais que hoje ela omite — segurança de dados (RLS), transparência de prompt, auditoria viva — como pilares da marca "infraestrutura epistêmica".
4. Trilha pedagógica mínima viável (1 trilha real com 5 passos e quiz, persistida) — substitui a promessa órfã de "certificação" por uma entrega pequena e verdadeira.

**Critério de aceite:** demo de 60s roteirizada sem tocar código; ≥1 análise pública compartilhada indexada pelo Google; 1 trilha completável de ponta a ponta.
**Prova de demo day:** o próprio demo day — Wrapped de um usuário real + auditoria AR+ da semana na tela.

---

## SEQUENCIAMENTO E DEPENDÊNCIAS

```
Onda 0 (Verdade)  ─┐  dias — remove risco existencial, custo mínimo
Onda 1 (Cofre)    ─┼─ pré-requisito da Onda 2 (não abrir caixa com porta aberta)
Onda 3 (Luzes)    ─┘  paralela à Onda 1 — medir tudo desde antes da bilheteria
Onda 2 (Bilheteria) → depende de 1; primeiro real de receita possível
Onda 4 (Prova)      → depende de 0 (claims limpos) e idealmente 3 (cron+telemetria)
Onda 5 (Corredor)   → depende de 3 (medição de jornada)
Onda 6 (Vitrine)    → depende de 4 (AR+ real) e 5 (jornada)
```

## SCOREBOARD ALVO (pós-ondas, estimativa honesta)

| # | Lente | Peso | Baseline | Alvo | Δ |
|---|-------|------|----------|------|---|
| 1 | Técnica | 1,5 | 6,0 | 8,0 | +2,0 |
| 2 | Maturidade SaaS | 1,5 | 3,5 | 7,5 | +4,0 |
| 3 | Modelo de negócio | 1,5 | 2,5 | 7,0* | +4,5 |
| 4 | Narrativa & marca | 1,0 | 5,5 | 9,0 | +3,5 |
| 5 | UX | 1,0 | 6,0 | 8,0 | +2,0 |
| 6 | IX | 1,0 | 7,0 | 8,0 | +1,0 |
| 7 | Design | 1,0 | 8,0 | 8,0 | 0 |
| 8 | Usabilidade & a11y | 1,0 | 6,0 | 7,5 | +1,5 |
| 9 | Marketing conversão | 1,5 | 3,0 | 7,5* | +4,5 |
| 10 | Inovação IA | 1,0 | 5,5 | 8,0 | +2,5 |
| 11 | Inovação educacional | 1,0 | 5,5 | 7,0 | +1,5 |
| 12 | Criatividade | 1,0 | 7,5 | 8,5 | +1,0 |
| 13 | Vertical regulatória | 1,5 | 3,5 | 8,0 | +4,5 |

**Alvo ponderado: ~7,7/10** · Índice de Elevação ≈ **+51% real** (declarado na forma convertida: toda lente P0 ≥ 8, exceto L3/L9 com meta 7,5 dependente de tração — ver declaração de meta acima).
\* L3 e L9 acima de 7,0/7,5 exigem clientes e volume reais; prometer mais seria violar a doutrina que este plano corrige.

## O QUE ESTE PLANO NÃO FAZ (proibições ativas)

- Não "resolve" a fratura dos claims inflando entrega — resolve **deflacionando o claim** até a entrega alcançá-lo.
- Não adiciona urgência artificial, contadores falsos ou escassez inventada ao funil.
- Não gamifica o Radar Epistêmico nem nenhum fluxo que toque crença/opinião do usuário.
- Não publica números de auditoria sobre modelos que o app não roda.
- Não constrói a 31ª rota antes de a jornada das 5 primeiras estar medida e convertendo.
