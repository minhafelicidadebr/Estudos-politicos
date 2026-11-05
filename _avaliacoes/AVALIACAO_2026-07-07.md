# AVALIAÇÃO SISTÊMICA FABLE 5 — politica-fable5-2026

**App:** "Ágora — Inteligência Política Comparada" (codinome interno: AEGIS)
**Data:** 2026-07-07 · **Protocolo:** `_avaliacoes/SUPER_PROMPT_AVALIACAO_SISTEMICA_FABLE5.md`
**Código avaliado:** `_avaliacoes/politica-fable5-2026/app/` (zip `politica-fable5-2026-main.zip`, repo `github.com/minhafelicidadebr/politica-fable5-2026`)
**Doutrina local detectada:** apenas `.lovable/plan.md` (plano de UX aprovado — usado como régua de "prometido vs entregue" na lente 1). Não há CLAUDE.md, skill mestra ou gates.
**Vertical regulatória (lente 13):** LGPD + integridade político-eleitoral + transparência de IA (produto brasileiro que analisa governos e políticos nominalmente com IA).
**Stack:** Vite + React 18.3 + TypeScript 5.8 (não-strict) + Tailwind/shadcn + Supabase (2 migrations, 4 tabelas, 4 edge functions) + IA via Lovable AI Gateway (Gemini). Gerado na plataforma Lovable (`index.html:21` og:image em bucket GPT-Engineer). `package.json:2-4`: nome de scaffold `vite_react_shadcn_ts`, versão `0.0.0`.

---

## SCORECARD (baseline)

| # | Lente | Peso | Nota | Veredicto em uma frase |
|---|-------|------|------|------------------------|
| 1 | Técnica / Engenharia | 1,5 | **6,0** | Arquitetura frontend limpa e disciplinada, sem compilador estrito, sem CI e com 12 dos 16 serviços sem um único teste |
| 2 | Maturidade SaaS | 1,5 | **3,5** | RLS de elite protegendo um SaaS que não cobra, não mede, não se observa e expõe suas funções de IA a anônimos |
| 3 | Modelo de negócio | 1,5 | **2,5** | Três planos bem desenhados cujos botões de compra não fazem nada — pricing é cenografia, não funil |
| 4 | Narrativa & marca | 1,0 | **5,5** | Copy de criação de categoria excepcional, minada por três números fabricados no próprio hero |
| 5 | UX | 1,0 | **6,0** | Arquitetura de informação sofisticada diluída em 30 rotas sem jornada primária nem onboarding |
| 6 | IX (interação) | 1,0 | **7,0** | Motion orquestrado, atalhos anti-conflito reais e paleta de comando — acabamento de interação acima do estágio do produto |
| 7 | Design (visual/sistema) | 1,0 | **8,0** | Sistema de tokens duplo (TS + Tailwind) coerente, tipografia fluida e estética autoral consistente |
| 8 | Usabilidade & acessibilidade | 1,0 | **6,0** | aria-labels e badges de confiança genuínos no módulo novo; UI monolíngue que declara 3 idiomas e labs sem auditoria a11y |
| 9 | Marketing de alta conversão | 1,5 | **3,0** | Zero analytics, um único title para 30 rotas, CTAs de pricing mortos — não há funil para converter nem régua para medi-lo |
| 10 | Inovação tecnológica & IA | 1,0 | **5,5** | Prompt engineering de altíssimo nível (PIR+, insights estruturados com Zod) ao lado do módulo de confiança mais importante — falsificado |
| 11 | Inovação educacional | 1,0 | **5,5** | Pedagogia em 3 camadas implementada de verdade no schema do LLM; trilhas e certificação prometidas sem uma tabela sequer |
| 12 | Criatividade | 1,0 | **7,5** | Political Wrapped, auto-auditoria de viés e Debate Viewer são ideias de categoria — a maioria ainda em maquete |
| 13 | Vertical regulatória (LGPD/eleitoral/IA) | 1,5 | **3,5** | Neutralidade estrutural séria nos prompts; sem Política de Privacidade, com "certificado" sem certificador e auditoria de viés inventada |

**Score global ponderado (baseline): 5,1 / 10**

---

## AS 13 LENTES

### Lente 1 · Técnica / Engenharia — 6,0/10 (peso 1,5)
**Cético:** arquiteto principal — "levo a sério quando o compilador, a suíte e o pipeline provam o que o código promete."
**Forças:** (1) Code-splitting quase total: ~28 páginas via `React.lazy` com apenas `Index`/`NotFound` eager (`src/App.tsx:16-51`) e separação nítida `integrations → services → stores → pages → components`. (2) Disciplina de tipos apesar da config frouxa: 7 ocorrências de `: any` em todo o `src/` (3 delas `catch (e: any)`), zero `as any`, zero `@ts-ignore`. (3) O módulo `ai-insights` é engenharia de produção real: parser tolerante que nunca lança sobre JSON malformado de LLM (`src/lib/aiInsights/parse.ts`, testado em `src/test/aiInsights.parse.test.ts:28-32`), schema Zod com discriminated union e dispatcher com exhaustiveness check via `never` (`AIInsightRenderer.tsx:396-401`).
**Fraturas:** (1) **P1** Strict mode desligado em todo o projeto: `tsconfig.json:4,13` (`noImplicitAny: false`, `strictNullChecks: false`) e `tsconfig.app.json` com `strict: false` explícito — a fundação não prova nada do que o código declara. (2) **P1** Cobertura de teste ínfima: 33 páginas e 16 serviços, com testes apenas para o módulo `ai-insights` (3 arquivos reais + `example.test.ts:1-7` placeholder `expect(true).toBe(true)`); os 12 engines determinísticos (SCM, PCA, ABM, SIR...) têm zero testes; Playwright é config vazia sem nenhum spec (`playwright.config.ts:1-10`). (3) **P1** Zero CI/CD: não existe `.github/`, nenhum pipeline roda `lint`/`test`/`build`; e o próprio `.lovable/plan.md:47-52` prometia 5 arquivos de teste — entregou 3 (faltam `sofia.shortcut.test.tsx` e `axis-navigation.test.tsx`).
**Veredicto:** um frontend bem arquitetado andando sem cinto, sem airbag e sem revisão — a qualidade existe por convenção do gerador, não por enforcement.

### Lente 2 · Maturidade SaaS — 3,5/10 (peso 1,5)
**Cético:** operador SaaS — "levo a sério quando consigo cobrar, medir e operar às 3h da manhã."
**Forças:** (1) RLS acima da média: 4/4 tabelas com `ENABLE ROW LEVEL SECURITY`, políticas restritivas `auth.uid() = user_id` em `analyses` e `user_civic_actions` (`supabase/migrations/20260504031640_*.sql:105-113,133-138`), função `has_role()` SECURITY DEFINER com `search_path` travado (`:50-58`) e migration dedicada revogando EXECUTE de `PUBLIC`/`anon` (`20260504031658_*.sql:1-3`). (2) Auth correto: `onAuthStateChange` assinado antes de `getSession()` com defer anti-deadlock (`AuthContext.tsx:44-63`); serviços nunca aceitam `user_id` do chamador (`analysesService.ts:48-53`). (3) PWA/SW funcional com estratégia diferenciada e exclusão correta de chamadas Supabase do cache (`public/sw.js:26-27`).
**Fraturas:** (1) **P0** Edge functions desprotegidas contra abuso de custo: as 4 functions usam CORS `Access-Control-Allow-Origin: "*"` (`comparative-analysis/index.ts:4`, `sofia-chat/index.ts:5`), não validam input, não têm rate limit próprio, e são acionáveis de rotas que não exigem login (`App.tsx:80,84-85` — `/analyze/:countryId` e `/compare` são públicas) — qualquer visitante anônimo ou script externo pode drenar os créditos de IA da workspace. (2) **P0** Observabilidade zero: nenhum Sentry/PostHog/GA em `package.json` nem `index.html`; o único rastro de erro é `console.error` no `ErrorBoundary` — o SaaS é cego sobre si mesmo. (3) **P0** Não existe camada de billing: nenhuma tabela `subscription`/`plan` nas migrations; `ProtectedRoute.tsx` só checa login, nunca plano. (4) **P1** i18n de fachada: 3 locales declarados com ~30 chaves cada, cobrindo só nav/History/Settings (`src/i18n/index.tsx:9-106`); toda a landing e os 11 labs são pt-BR hardcoded. (5) **P2** `.env` presente e não listado no `.gitignore`, sem `.env.example` — higiene errada mesmo sendo anon key.
**Veredicto:** governança de dados de nível sério embrulhando um negócio que não pode faturar, não enxerga usuários e deixa a porta da IA aberta para a rua.

### Lente 3 · Modelo de negócio — 2,5/10 (peso 1,5)
**Cético:** investidor série A — "levo a sério quando o funil existe fora do slide."
**Forças:** (1) Segmentação de personas clara e plausível: cidadão (L1) / jornalista-gestor (L2) / pesquisador (L3) com ancoragem em `ValuePropSection.tsx:78` e planos correspondentes. (2) Estrutura de preços racional: Grátis limitado → Analista R$ 59/mês → Institucional sob consulta com API/white-label (`PricingSection.tsx:4-20`). (3) O tier grátis tem limites desenhados ("3 análises por mês", "5 países") que dariam um motor de upgrade natural — o design do funil existe no papel.
**Fraturas:** (1) **P0** Os CTAs de conversão são botões mortos: os `<button>` do pricing não têm `onClick` nem link (`PricingSection.tsx:71-79`) — o caminho de receita termina num clique que não faz nada. (2) **P0** Os entregáveis premium são cadeados permanentes: `ExportPanel.tsx:40-52` — `const locked = opt.tier !== 'free'` + `disabled={locked}` hardcoded, sem fluxo de upgrade; PDF premium, infográfico, slides e CSV não podem ser comprados nem entregues por nenhum caminho. (3) **P0** Nenhum enforcement dos limites do plano grátis: não há código contando análises/mês nem restringindo países; "14 dias grátis" não tem lógica de trial (sem data de expiração, sem verificação). (4) **P1** Três personas com disposição a pagar radicalmente diferentes (B2C-educação, B2B-mídia, B2G-institucional) sem priorização — pré-MVP tentando três mercados ao mesmo tempo.
**Veredicto:** não é um modelo de negócio com bugs — é uma pintura de modelo de negócio; nada liga interesse a receita, nem receita a entrega.

### Lente 4 · Narrativa & marca — 5,5/10 (peso 1,0)
**Cético:** estrategista de categoria — "levo a sério quando o app cria a régua pela qual quer ser medido — e passa nela."
**Forças:** (1) Criação de categoria genuína: "A Ágora não é uma plataforma de opinião. É uma infraestrutura epistêmica" (`ValuePropSection.tsx:87`) e "O debate político afogou-se em ruído. Nós trouxemos o método de volta." (`ValuePropSection.tsx:187-189`) — manifesto com espinha, raro em SaaS BR. (2) Coerência narrativa vertical incomum: o framework PIR+/SIB/AAM/APP+ aparece com os mesmos nomes na landing, na página de metodologia e dentro dos system prompts das edge functions (`comparative-analysis/index.ts:66-73`) — o marketing e o prompt falam a mesma língua. (3) Fechamento de arco retórico forte: "Não precisamos de mais opiniões. Precisamos de mais método." (`FinalCTASection.tsx:27`).
**Fraturas:** (1) **P0** O hero contém dois claims falsos verificáveis: "190+ países cobertos" (`HeroSection.tsx:9`) contra 20 países seed no dataset real (`src/data/countries.ts:3-25`, comentário literal "20 strategic seed countries for MVP") e histórico de governos para apenas 4 países (`src/data/governments.ts` — BR, US, DE, UY); e "Anti-alucinação certificado" (`HeroSection.tsx:7`) sem nenhum certificador, selo ou auditoria real por trás. (2) **P0** Métrica de corpo fabricada e repetida: "100.000+ análises" na landing (`AdvancedModulesShowcase.tsx:272,278,290`) e `totalAnalysesInCorpus: 127450` como constante hardcoded exibida como dado vivo (`emergentIntelligenceEngine.ts:59,138`). (3) **P2** Identidade com ruído: título do site com typo "App Àgora" (acento grave, `index.html:6`) versus "Ágora" em todo o resto; codinome AEGIS vazando em chaves de storage (`aegis_locale`, `i18n/index.tsx:118`); og:image hospedada em bucket do GPT-Engineer, não em asset próprio (`index.html:21`).
**Veredicto:** a melhor escrita de posicionamento que este comitê viu em app deste estágio — comprometida na primeira dobra por números que um único cético com acesso ao código-fonte desmonta em cinco minutos.

### Lente 5 · UX — 6,0/10 (peso 1,0)
**Cético:** designer de produto sênior — "levo a sério quando um novo usuário chega ao valor central sem mapa."
**Forças:** (1) Arquitetura de informação com profundidade em camadas (L1 leigo / L2 gestor / L3 especialista) refletida na UI e nos outputs de IA (`comparative-analysis/index.ts:123` gera `pedagogicalOutput: {citizen, manager, specialist, socraticQuestion}`). (2) Hub de laboratórios organizado com hierarquia e breadcrumbs consistentes (`LabHubPage.tsx`, breadcrumb padrão em `AuditPage.tsx:77-81`). (3) Estados de espera desenhados: `PageLoader` com identidade (`App.tsx:55-66`), skeleton loaders no design system.
**Fraturas:** (1) **P1** 30 rotas sem jornada primária: o usuário aterrissa numa landing excelente e depois se perde num arquipélago de 11 motores + 8 páginas de engajamento sem "comece por aqui" nem onboarding de primeira análise. (2) **P1** Links quebrados no rodapé: `/terms`, `/privacy`, `/about`, `/blog` (`Footer.tsx:25-28`) caem no catch-all 404 (`App.tsx:113`) — inclusive os Termos citados no consentimento do signup (`AuthPages.tsx:325`). (3) **P1** Limites do plano grátis exibidos mas não reais criam expectativa falsa de sistema ("3 análises por mês" que nunca bloqueia).
**Veredicto:** cada cômodo é bem acabado; a casa não tem corredor — falta o fio que transforme 30 telas numa jornada.

### Lente 6 · IX (interação) — 7,0/10 (peso 1,0)
**Cético:** especialista em interação — "levo a sério quando dois atalhos de teclado não brigam entre si."
**Forças:** (1) Coordenação anti-conflito de atalhos de fato implementada: Ctrl+K exclusivo da paleta (`GlobalCommandPalette.tsx:36-45`), Ctrl+J exclusivo da Sofia com `stopPropagation` (`SofiaChatbot.tsx:302-305`) — exatamente como especificado no `.lovable/plan.md:33-38`. (2) Motion orquestrado com stagger e easing consistentes em toda a landing (`HeroSection.tsx:28-110`), com `prefers-reduced-motion` respeitado no plano da Sofia. (3) Feedback de dados com coreografia própria: `ProportionalBar` com animação `whileInView` e clamping (`AuditPage.tsx:42-59`, `ProportionalBar.tsx:22-23`).
**Fraturas:** (1) **P2** Os atalhos que funcionam não têm rede de regressão — os 2 testes prometidos não existem. (2) **P2** Estados de longa espera das análises de IA (até 120s de timeout, `comparative-analysis/index.ts:11`) sem progresso perceptível granular em todos os fluxos. (3) **P2** Densidade de animação da landing pode custar performance em mobile modesto (globo SVG com spin infinito, `HeroSection.tsx:117-136`).
**Veredicto:** interação com acabamento acima do estágio do produto — um dos poucos lugares onde a entrega supera a promessa.

### Lente 7 · Design (visual/sistema) — 8,0/10 (peso 1,0)
**Cético:** diretor de design — "levo a sério quando reconheço a marca com o logo coberto."
**Forças:** (1) Sistema de tokens em duas camadas espelhadas: `src/lib/design-tokens.ts:3-45` (TS para Framer/Recharts) e `tailwind.config.ts:34-105` (CSS vars semânticas `hsl(var(--brand-accent))`), com nomenclatura idêntica (`brand.accent`, `neutral.900`, `confidence.high`). (2) Escala tipográfica fluida com `clamp()` e 3 famílias nomeadas display/body/mono (`tailwind.config.ts:16-33`). (3) Semântica de cor própria do domínio: paleta de confiança (high/medium/low) e de eixos analíticos como tokens de primeira classe (`tailwind.config.ts:95-105`) — o design system codifica a epistemologia do produto.
**Fraturas:** (1) **P2** Quebra de DRY nos gráficos: `AIInsightRenderer.tsx:210-226` usa hex literais (`#0A1628`, `#C9A84C`) em vez de importar de `design-tokens.ts`. (2) **P2** Dark-only sem verificação de contraste documentada (texto `neutral-400` sobre fundo escuro em massa). (3) **P2** Ativos de marca terceirizados: og:image em bucket alheio, favicon genérico.
**Veredicto:** um design system autoral e maduro — a lente mais forte do app, e visivelmente o lugar onde o esforço foi investido.

### Lente 8 · Usabilidade & acessibilidade — 6,0/10 (peso 1,0)
**Cético:** a leitora de 55 anos no celular simples que quer entender o governo dela — "levo a sério quando eu consigo usar sem ajuda e na minha língua."
**Forças:** (1) O módulo novo é exemplar: todo bloco de insight tem `aria-label` e descrição `sr-only` equivalente (`AIInsightRenderer.tsx:64-67,84`), `ProportionalBar` com `role="img"` e escala explícita no label (`ProportionalBar.tsx:37-38`), testado (`proportionalBar.test.tsx:12-17`). (2) Vocabulário de confiança traduzido para linguagem humana: `confidence-badge.tsx:16-41` ("Dados sustentam solidamente esta afirmação"). (3) Breadcrumbs com `aria-label` e navegação consistente.
**Fraturas:** (1) **P1** Interface monolíngue que declara 3 idiomas: seletor de locale funcional persiste `aegis_locale`, mas <5% da superfície usa `t()` — inglês/espanhol declarados entregam uma UI quase toda em português. (2) **P1** Nenhuma auditoria de teclado/leitor de tela nos 11 labs (gráficos Recharts densos, tabelas de simulação) — o padrão bom do `ai-insights` não foi retropropagado. (3) **P2** Textos da landing em registro intelectual denso ("infraestrutura epistêmica") — a persona L1 "cidadão curioso" não é o leitor desse vocabulário.
**Veredicto:** onde o time olhou (ai-insights), a acessibilidade é de primeira; nos outros 90% do app, é fé.

### Lente 9 · Marketing de alta conversão — 3,0/10 (peso 1,5)
**Cético:** líder de growth/CRO — "levo a sério quando cada clique tem trilha auditável até a receita."
**Forças:** (1) Copy de headline tecnicamente forte com hierarquia CTA correta no hero (primário "Escolher um país para analisar" + secundário de metodologia, `HeroSection.tsx:74-87`). (2) Pricing com ancoragem correta (tier destacado "Mais popular", `PricingSection.tsx:52-54`). (3) PWA e robots.txt corretos (`manifest.webmanifest`, `robots.txt` permissivo para os bots relevantes).
**Fraturas:** (1) **P0** Zero instrumentação: nenhum pixel, evento, GTM ou analytics em lugar nenhum — nenhuma conversão pode ser medida, nenhum experimento pode existir. (2) **P0** Os CTAs do pricing — o ponto de conversão máxima da página — são botões sem handler (`PricingSection.tsx:71-79`): o clique em "Começar 14 dias grátis" não faz nada. (3) **P1** SEO de SPA sem gestão: um único `<title>` (com typo) e uma única meta description para 30 rotas (`index.html:6-7`), zero `react-helmet`, sem sitemap — a Biblioteca Pública e a Liga, desenhadas para descoberta orgânica, são invisíveis ao Google. (4) **P1** Prova social é lista de fontes metodológicas (Banco Mundial, FMI, V-Dem — `SocialProofBar.tsx:3-12`), não prova de adoção: nenhum depoimento, logo de cliente ou métrica real.
**Veredicto:** um auditório lindíssimo, de porta fechada para o Google, sem contador de público e com a bilheteria pintada na parede.

### Lente 10 · Inovação tecnológica & IA — 5,5/10 (peso 1,0)
**Cético:** CTO de inovação — "levo a sério quando o mecanismo de confiança da IA é arquitetura, não adereço."
**Forças:** (1) Prompt engineering de nível raro: protocolo anti-alucinação com hierarquia de confiança em 3 níveis no system prompt da Sofia (`sofia-chat/index.ts:27-31`), comitê interdisciplinar simulado com 8 skills nomeadas e regra de simetria retórica |Δlen|≤20% no núcleo analítico (`comparative-analysis/index.ts:66-73`). (2) Camada de insights estruturados fim-a-fim: o LLM emite blocos `insights` JSON validados por Zod, com degradação graciosa (bloco inválido descartado sem quebrar o chat) e instrução explícita "não invente números só para preencher" (`sofia-chat/index.ts:64-70` + `src/lib/aiInsights/`). (3) Resiliência operacional real no núcleo: modelo primário + fallback, timeout com `AbortController` de 120s, tratamento distinto de 429/402 (`comparative-analysis/index.ts:9-18,158-169`); engines locais com PRNG seedado para reprodutibilidade (`politiSimEngine.ts:77-80`).
**Fraturas:** (1) **P0** O módulo de confiança âncora é falso: AR+ "Auditoria Algorítmica" exibe 5 resultados hardcoded (`AuditPage.tsx:27-33`) com números de assimetria inventados atribuídos nominalmente a GPT-4o e Claude 3.5, sob promessas verbais "Resultados publicados com metodologia. Qualquer pessoa pode replicar os testes." (`AuditPage.tsx:98-100`) — a tecnologia que existe para provar isenção é uma encenação. (2) **P1** Reprodutibilidade quebrada onde é prometida: `computeEpistemicProfile` se declara determinístico e usa `Math.random()` (`epistemicTransformationEngine.ts:107,113`), inventando estatísticas do usuário (`totalAnalyses: 5 + Math.floor(seed*20)`, `:122`) em vez de ler a tabela `analyses` que já existe. (3) **P1** Apenas 2 de 16 serviços fazem chamada de IA real; dependência total de um gateway de terceiro (Lovable→Gemini) sem abstração de provedor, telemetria de custo ou registro de decisão de modelo (`gemini-3-flash-preview` vs `2.5-flash` sem critério documentado).
**Veredicto:** o vão mais doloroso do app — a mesma equipe que escreveu um dos melhores protocolos anti-alucinação em prompt fabricou os dados do módulo que auditaria alucinação.

### Lente 11 · Inovação educacional — 5,5/10 (peso 1,0)
**Cético:** designer instrucional — "levo a sério quando a pedagogia tem entidade de dados, não só adjetivo."
**Forças:** (1) Pedagogia em camadas implementada onde importa: o output do LLM tem campos estruturais `citizen/manager/specialist/socraticQuestion` (`comparative-analysis/index.ts:123`) — as 3 camadas não são rótulo, são schema. (2) Protocolo de Motivational Interviewing genuíno no Radar Epistêmico: 7 turnos, princípios nomeados e "garantias constitucionais" que preservam a autonomia ("NUNCA prescrever conclusão", `epistemicTransformationEngine.ts:90-103`), com opt-in explícito na UI. (3) Sofia com scaffolding e recall ativo declarados e operacionalizados no prompt (analogias obrigatórias para métodos estatísticos, fechamento com perguntas de aprofundamento, `sofia-chat/index.ts:72-76`).
**Fraturas:** (1) **P1** "Trilhas e Certificação" com "quizzes de raciocínio e certificados" prometidos na landing (`PedagogicalFeaturesSection.tsx:4-11`) sem nenhuma entidade correspondente — não há tabela `trails`, `quizzes` ou `certificates` nas migrations; a única persistência pedagógica é `user_civic_actions`. (2) **P1** Nenhuma mecânica de retenção (espaçamento, prática recuperativa) apesar do vocabulário de learning science. (3) **P1** Nenhuma medição de aprendizagem — o produto que promete transformar compreensão não tem pré/pós de nada.
**Veredicto:** o design pedagógico existe de verdade na camada de IA e morre na camada de dados — pedagogia com cérebro e sem memória.

### Lente 12 · Criatividade — 7,5/10 (peso 1,0)
**Cético:** diretor criativo — "levo a sério o que eu nunca vi em outro lugar."
**Forças:** (1) **Political Wrapped** (`PoliticalWrappedPage.tsx`, 445 linhas): retrospectiva anual de engajamento cívico estilo Spotify Wrapped — transposição original de mecânica de cultura pop para educação política, com potencial viral embutido. (2) A ideia do **AR+** — uma plataforma de análise política que audita publicamente o viés dos próprios LLMs que usa, com testes pareados por idioma/localidade/perfil — é conceito de categoria, defensável e inédito no mercado BR (a implementação é mock, mas a invenção é real). (3) Assinatura autoral disseminada: Debate Viewer "cinematográfico" determinístico (`DebateViewerPage.tsx:3-4`), Liga de análises, Oráculo de Opinião com modelo SIR, "Orçamento Pessoal Governado" — o app transborda ideias próprias.
**Fraturas:** (1) **P1** Criatividade em maquete: a maior parte das ideias assinatura roda sobre dados fixos/simulados — o Wrapped de um usuário real com 3 análises seria vazio. (2) **P2** Dispersão dilui assinatura: 11 motores + 8 experiências, nenhum polido até virar O cartão de visita. (3) **P2** A melhor invenção (AR+) está posicionada como selo de confiança no hero em vez de ser tratada como o produto-herói que poderia ser.
**Veredicto:** um portfólio criativo excepcional espalhado numa mesa — falta escolher a peça que vai para a vitrine e terminá-la.

### Lente 13 · Vertical regulatória (LGPD / integridade eleitoral / transparência de IA) — 3,5/10 (peso 1,5)
**Cético:** auditor de proteção de dados + advogado eleitoral — "levo a sério quando o compliance está no banco e na página, não no adjetivo."
**Forças:** (1) Neutralidade estrutural nos prompts, não só declarada: tese e antítese obrigatórias (`ValuePropSection.tsx:47`), proibição de léxico partidário como argumento e simetria retórica quantificada (`comparative-analysis/index.ts:69`), Sofia proibida de tomar lado (`sofia-chat/index.ts:31`) — é o desenho anti-viés mais sério que se pode fazer em camada de prompt. (2) Opt-in explícito com garantias de autonomia no módulo mais sensível (Radar Epistêmico, que modela crenças do usuário) e menção específica a deleção de dados "LGPD Art. 5" (`EpistemicRadarPage.tsx:124`). (3) Infraestrutura de transparência genuína: `AIPromptTransparency.tsx` mostra ao usuário o system prompt real, o Tree-of-Thoughts e permite baixar o prompt completo (`:130-141`).
**Fraturas:** (1) **P0** Coleta dados pessoais (email, senha, perfil, ações cívicas — dado sensível por revelar opinião política sob LGPD art. 5º, II) **sem Política de Privacidade nem Termos de Uso funcionais**: as rotas `/privacy` e `/terms` linkadas no rodapé e no consentimento do signup (`Footer.tsx:25-28`, `AuthPages.tsx:325`) caem em 404 (`App.tsx:113`). (2) **P0** A página de auditoria publica "resultados" fabricados atribuídos a modelos nomeados de terceiros (GPT-4o, Claude 3.5) com afirmações verbais de metodologia replicável (`AuditPage.tsx:27-33,98-100`) — além de eticamente inverter a própria tese, cria exposição jurídica real (publicidade enganosa/CDC; imputação de defeito a produto alheio com dado inventado). (3) **P1** "Anti-alucinação certificado" (`HeroSection.tsx:7`) sem certificador é claim inverificável em vitrine; e não há qualquer tratamento de contexto eleitoral brasileiro (zero menções a TSE/legislação eleitoral) para um produto que compara governos e líderes nominalmente — risco não mapeado para períodos eleitorais.
**Veredicto:** o desenho ético das entranhas (prompts, opt-in, transparência) é sério; a casca jurídica não existe — e o módulo de auditoria, hoje, é exatamente aquilo que ele existe para denunciar.

---

## SÍNTESE SISTÊMICA

### Mapa de coerência (promessa ↔ entrega)

| Promessa pública | Realidade no código | Vão |
|---|---|---|
| "190+ países cobertos" (`HeroSection.tsx:9`) | 20 países seed (`countries.ts:3`), governos históricos para 4 (`governments.ts`) | Fabricação |
| "Anti-alucinação certificado" (`HeroSection.tsx:7`) | Protocolo de prompt (bom) sem certificação de ninguém | Overclaim |
| "100.000+ análises" no corpus (`AdvancedModulesShowcase.tsx:272`) | Constante `127450` hardcoded (`emergentIntelligenceEngine.ts:138`) | Fabricação |
| AR+ "resultados publicados, qualquer pessoa pode replicar" (`AuditPage.tsx:98-100`) | 5 resultados mock inventados citando GPT-4o/Claude 3.5 (`AuditPage.tsx:27-33`) | Fabricação (a mais grave) |
| Planos com trial e premium (`PricingSection.tsx`) | Botões sem handler, exports com `disabled` hardcoded, zero billing | Cenografia |
| "Laboratório de Simulação Avançada" com IA | 12 engines determinísticos locais — honestos no código (`politiSimEngine.ts:2-4`, "zero alucinação" em `LabHubPage.tsx:201`), vendidos com moldura de IA | Ambiguidade calculada |
| 3 idiomas | <5% da UI internacionalizada | Fachada |
| Trilhas + certificação pedagógica | Nenhuma entidade de dados | Promessa órfã |

**E o inverso — engenharia de elite que a narrativa não conta:** a RLS com hardening dedicado, o parser de insights com degradação graciosa, o SW com estratégia de cache correta e a coordenação de atalhos são forças reais que nenhuma linha da landing capitaliza ("segurança dos seus dados" nem aparece).

### Fraturas transversais (aparecem em ≥3 lentes)

1. **Promessa sem lastro** (lentes 2, 3, 4, 9, 10, 13) — números fabricados, auditoria encenada, pricing cenográfico. É a fratura-mãe: cada instância isolada parece "placeholder de MVP", mas o conjunto configura um padrão que destrói o produto no primeiro due diligence externo — fatal para um app cuja tese literal é "evidência, método e honestidade".
2. **Cegueira instrumental** (lentes 2, 3, 9) — zero analytics, zero error tracking, zero telemetria de custo de IA. Não se pode elevar o que não se mede; hoje nem o próprio founder sabe se alguém usa o quê.
3. **Superfície >> profundidade** (lentes 1, 3, 5, 11, 12) — 30 rotas, 11 motores, 16 serviços para 4 tabelas e zero clientes. Cada hora investida na 30ª tela foi tirada do funil, dos testes e da jornada primária.
4. **Qualidade em ilha** (lentes 1, 6, 8) — o módulo `ai-insights` prova que o time sabe fazer certo (Zod + testes + aria + plano cumprido); o padrão não foi propagado para os outros 90% do app.

### Alavancas assimétricas (3–5 mudanças que elevam múltiplas lentes)

1. **Operação Verdade** — substituir todo número fabricado por claim honesto ("20 países curados + qualquer país via IA"; corpus = `COUNT(*)` real de `analyses`; AR+ rotulado "protocolo em validação" até existir; remover "certificado"). Custo: dias. Eleva L4, L9, L13 imediatamente e remove o risco existencial. **Mecanismo:** honestidade é a tese do produto — alinhá-la transforma a maior fraqueza na prova da marca.
2. **Fechar o cofre** — auth JWT obrigatório nas 4 edge functions, rate limit por usuário, validação Zod de input, CORS com allowlist. Eleva L1, L2, L13 e protege o caixa de IA antes de qualquer marketing.
3. **Ligar a bilheteria** — CTAs do pricing → checkout/signup real, enforcement do limite grátis lendo `analyses` (a tabela já existe), ExportPanel gated por plano real. Eleva L2, L3, L9 — é a diferença entre pitch e negócio.
4. **Acender as luzes** — PostHog + Sentry + title/meta por rota + sitemap. Eleva L2, L9 e habilita medir todas as outras ondas.
5. **AR+ de verdade (mínimo)** — rodar semanalmente 5 testes pareados reais via o próprio gateway, persistir em tabela `audit_runs`, página lê do banco com timestamp. Transforma a fratura mais grave na feature mais diferenciada do mercado. Eleva L10, L13, L4, L12.

**Score global ponderado (baseline): 5,1/10** — a nota conta a história exata: um produto com teto altíssimo (design 8,0, criatividade 7,5, interação 7,0) ancorado pelo fundo do poço comercial-regulatório (negócio 2,5, marketing 3,0, SaaS 3,5, vertical 3,5). A distância entre a melhor e a pior lente (5,5 pontos) é a medida da dívida de coerência.
