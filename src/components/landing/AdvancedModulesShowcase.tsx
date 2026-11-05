/**
 * AdvancedModulesShowcase — Landing page section for advanced simulation modules.
 * Each card now exposes a mini-CTA "Saiba mais" that opens a deep-dive modal
 * with methodology, value proposition, innovation, process flow and pedagogical hook.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FlaskConical, Dna, Users, Radio, Gavel, ArrowRight, Sparkles, Shield, Brain,
  TrendingUp, HeartHandshake, Compass, Wallet, Building2, Network, Info,
} from 'lucide-react';
import ModuleDeepDiveModal, { type ModuleDeepDive } from './ModuleDeepDiveModal';

const modules: ModuleDeepDive[] = [
  {
    id: 'scenarios',
    title: 'Motor de Cenários Alternativos',
    subtitle: 'E se a história tivesse tomado outro caminho?',
    description: 'Análise contrafactual com Synthetic Control Method. Simule bifurcações históricas e veja o impacto quantificado de decisões políticas alternativas.',
    icon: FlaskConical,
    color: '#F59E0B',
    link: '/analyze/br/scenarios',
    badges: ['SCM Determinístico', 'Fan Charts', 'Bifurcações Históricas'],
    jsonTag: 'JSON_18',
    methodology: 'Synthetic Control Method (Abadie & Gardeazabal) construindo um país-controle sintético via combinação convexa de unidades doadoras, com pesos otimizados para minimizar pré-tratamento RMSPE.',
    valueProp: 'Quantificar com rigor estatístico o impacto de decisões políticas que NÃO foram tomadas — separar causa de correlação em decisões históricas reais.',
    innovation: 'Primeiro motor brasileiro a aplicar SCM + Fan Charts probabilísticos em bifurcações políticas, com intervalos de confiança de 80%/95% calibrados via permutation inference.',
    process: [
      'Selecione uma bifurcação histórica (ex.: Plano Real 1994, Reforma Trabalhista 2017).',
      'O motor constrói o país-controle sintético com unidades doadoras comparáveis.',
      'Geração de trajetória contrafactual com Fan Charts (P10/P50/P90).',
      'Comparação determinística entre o real e o sintético — gap quantificado.',
      'Relatório com placebo tests e robustez de pesos para auditoria.',
    ],
    pedagogicalHook: 'Decisões políticas têm custos invisíveis. O SCM torna o "caminho não tomado" mensurável e cria literacia causal — não apenas opinativa.',
    scientificBase: ['Abadie & Gardeazabal (2003)', 'Athey & Imbens (2017)', 'Permutation Inference', 'Convex Optimization'],
    inputs: ['Bifurcação histórica selecionada + janela temporal', 'Pool de países doadores (BR, US, DE, UY, KR, CL...)', 'Indicadores macro/institucionais pré-tratamento (≥5 anos)'],
    outputs: ['Fan Chart P10/P50/P90 real vs. sintético', 'Gap contrafactual quantificado por variável', 'Placebo tests + RMSPE ratio para robustez'],
    kpis: ['RMSPE pré-tratamento < 0,15', 'Peso doador dominante < 0,60 (evita mono-dependência)', 'IC 95% via permutation inference (n≥100)'],
    integrations: ['Biblioteca — papers seminais Abadie/Athey', 'DNA Institucional — comparar arquétipo do país sintético', 'Sofia — narração pedagógica do gap'],
    ctaLabel: 'Simular bifurcação histórica',
  },
  {
    id: 'dna',
    title: 'DNA Institucional',
    subtitle: 'A genética oculta das instituições',
    description: 'PCA de 2 componentes para distinguir padrões estruturais de conjunturais. Descubra o arquétipo institucional de cada governo e compare trajetórias.',
    icon: Dna,
    color: '#8B5CF6',
    link: '/analyze/br/dna',
    badges: ['PCA 2D', 'Arquetipos', 'Padrão Estrutural'],
    jsonTag: 'JSON_19',
    methodology: 'Principal Component Analysis (PCA) sobre 28 eixos de governança, reduzindo dimensionalidade a 2 componentes (estrutural × conjuntural) que explicam >70% da variância.',
    valueProp: 'Distinguir o que é DNA institucional persistente do que é apenas conjuntura — separar identidade de circunstância em cada governo.',
    innovation: 'Mapeamento bidimensional de arquétipos institucionais que permite ver, ao longo do tempo, se um governo permaneceu fiel ao seu DNA ou pivotou estruturalmente.',
    process: [
      'Carregamento dos 28 eixos PIR+ de cada governo analisado.',
      'Normalização Z-score e cálculo da matriz de covariância.',
      'Decomposição em autovalores → 2 componentes principais.',
      'Projeção dos governos no plano fatorial 2D.',
      'Identificação automática de arquétipo + cluster de proximidade.',
    ],
    pedagogicalHook: 'Permite enxergar continuidades e rupturas reais — combater o viés narrativo de que "cada governo é único" ou que "todos são iguais".',
    scientificBase: ['Pearson (1901) PCA', 'Hotelling (1933)', 'Análise Fatorial', 'Clustering Hierárquico'],
    inputs: ['Governos selecionados + janela temporal', 'Scores dos 28 eixos PIR+ (normalizados)', 'Matriz de covariância inter-eixos'],
    outputs: ['Plano fatorial 2D com governos plotados', 'Arquétipo institucional dominante rotulado', 'Trajetória temporal (drift estrutural)'],
    kpis: ['Variância explicada pelos 2 PCs ≥ 70%', 'KMO ≥ 0,7 (adequação amostral)', 'Bartlett p < 0,01 (esfericidade)'],
    integrations: ['Comparação — sobrepor DNA de múltiplos governos', 'Cenários — usar arquétipo como prior', 'Metodologia — leitura pedagógica de PCA'],
    ctaLabel: 'Revelar o DNA institucional',
  },
  {
    id: 'politisim',
    title: 'PolitiSim Engine',
    subtitle: 'Agentes políticos em ação',
    description: 'Simulação multi-agente com 6 atores institucionais, vetores ideológicos 8D e grafos de lealdade. Visualize como choques políticos reverberam no sistema.',
    icon: Users,
    color: '#3B82F6',
    link: '/analyze/br/politisim',
    badges: ['Multi-Agente', 'Radar 8D', 'Coalizões'],
    jsonTag: 'JSON_21',
    methodology: 'Agent-Based Modeling (ABM) com 6 atores institucionais (Executivo, Legislativo, Judiciário, Mídia, Mercado, Sociedade Civil) operando em espaço ideológico 8D.',
    valueProp: 'Antecipar reverberações sistêmicas de choques políticos — entender que política é rede de interações, não decisão isolada.',
    innovation: 'Único simulador a combinar ABM clássico (Epstein/Axtell) com grafos dinâmicos de lealdade e radar ideológico 8 dimensões em tempo real.',
    process: [
      'Configure o cenário inicial e selecione o choque a aplicar.',
      'Cada agente recalcula utilidade esperada com base em lealdades.',
      'Formação dinâmica de coalizões via game theory cooperativa.',
      'Visualização do radar 8D evoluindo turno a turno.',
      'Relatório de equilíbrio final + caminhos alternativos não tomados.',
    ],
    pedagogicalHook: 'Substitui a leitura monocausal ("foi culpa de X") por compreensão sistêmica de incentivos e coalizões.',
    scientificBase: ['Epstein & Axtell (1996)', 'Schelling (1971)', 'Game Theory', 'Network Science'],
    inputs: ['Cenário inicial + choque aplicado', 'Vetores ideológicos 8D dos 6 atores', 'Matriz de lealdade e custos de defecção'],
    outputs: ['Radar 8D turno a turno (animado)', 'Grafo de coalizões dinâmicas', 'Equilíbrio final + trajetórias alternativas'],
    kpis: ['Convergência de coalizão em ≤ 12 turnos', 'Índice de Shapley por ator', 'Estabilidade de equilíbrio (σ < 0,10)'],
    integrations: ['Legislativo — feeding de coalizão base', 'Oráculo — impacto na opinião pública', 'Sofia — narrativa do choque'],
    ctaLabel: 'Aplicar choque político',
  },
  {
    id: 'opinion',
    title: 'Oráculo de Opinião Pública',
    subtitle: 'Ondas de sentimento popular',
    description: 'Modelo SIR-Opinion Extended com 6 segmentos populacionais e 4 canais de propagação. Simule como choques políticos se propagam na sociedade em timelines paralelas.',
    icon: Radio,
    color: '#06B6D4',
    link: '/analyze/br/opinion-oracle',
    badges: ['SIR-Opinion', '3 Timelines', 'Tipping Points'],
    jsonTag: 'JSON_22',
    methodology: 'Extensão epidemiológica SIR (Susceptible-Infected-Recovered) adaptada à propagação de opinião, com 6 segmentos populacionais e 4 canais (TV, redes, interpessoal, institucional).',
    valueProp: 'Visualizar como narrativas conquistam ou perdem terreno — identificar tipping points antes que se cristalizem.',
    innovation: 'Aplicação inédita de modelagem epidemiológica a dinâmicas de opinião pública política, com timelines paralelas para análise contrafactual.',
    process: [
      'Definição do choque narrativo inicial (evento, escândalo, política).',
      'Calibração de taxas de exposição por canal e segmento.',
      'Simulação determinística do espalhamento ao longo de 90 dias.',
      'Identificação automática de tipping points e pontos de saturação.',
      'Comparação entre 3 timelines (otimista, central, pessimista).',
    ],
    pedagogicalHook: 'Mostra que opinião pública não é "manipulada" linearmente — é sistema dinâmico com saturação, imunidade e ressurgência.',
    scientificBase: ['Kermack-McKendrick (1927)', 'Daley-Kendall (1965)', 'Watts-Dodds (2007)', 'Complex Contagion'],
    inputs: ['Choque narrativo + data-zero', 'Taxas β/γ por canal e segmento', 'Composição demográfica dos 6 segmentos'],
    outputs: ['3 curvas SIR paralelas (90 dias)', 'Tipping points sinalizados no timeline', 'Mapa de saturação por segmento'],
    kpis: ['R₀ efetivo por canal', 'Time-to-peak (dias)', 'Half-life da narrativa'],
    integrations: ['PolitiSim — realimenta pressão sobre atores', 'Cenários — testar contra-narrativas', 'Story Cards — compartilhar tipping point'],
    ctaLabel: 'Simular onda de opinião',
  },
  {
    id: 'legislative',
    title: 'Simulador Legislativo',
    subtitle: 'O jogo do poder parlamentar',
    description: 'Simule o processo de negociação e votação com 4 bancadas, emendas, obstrução e trade de votos. Visualize a probabilidade de aprovação em tempo real.',
    icon: Gavel,
    color: '#10B981',
    link: '/analyze/br/legis-sim',
    badges: ['Hemiciclo', '8 Sessões', 'Emendas'],
    jsonTag: 'JSON_23',
    methodology: 'Spatial Voting Theory (Downs/Black) + Cooperative Game Theory para modelar formação de maiorias com 4 bancadas, custos de fricção e trade de votos.',
    valueProp: 'Demonstrar que aprovar lei é cálculo de coalizão, não apenas vontade política — torna o jogo parlamentar transparente.',
    innovation: 'Único simulador com hemiciclo interativo + emendas dinâmicas + cálculo bayesiano de probabilidade de aprovação atualizado em tempo real.',
    process: [
      'Escolha a matéria legislativa e a composição inicial das bancadas.',
      'Configure pontos ideais e custos de cruzar linhas partidárias.',
      'Negocie emendas e observe Shapley value de cada bancada.',
      'Execute as 8 sessões com obstrução e quórum dinâmico.',
      'Análise final: probabilidade de aprovação + atribuição decisiva.',
    ],
    pedagogicalHook: 'Combate a ilusão de que "presidente decide sozinho" — revela arquitetura institucional do consenso.',
    scientificBase: ['Downs (1957)', 'Shapley-Shubik Index', 'Banzhaf Power Index', 'Pivotal Politics (Krehbiel)'],
    inputs: ['Matéria legislativa + pontos ideais das bancadas', 'Custo de defecção partidária', 'Regras (quórum, obstrução, emendas)'],
    outputs: ['Hemiciclo animado por sessão', 'Probabilidade bayesiana de aprovação (live)', 'Ranking de bancadas decisivas (Shapley)'],
    kpis: ['P(aprovação) com IC 90%', 'Índice de fragmentação (ENP)', 'Custo político da coalizão vencedora'],
    integrations: ['PolitiSim — importar equilíbrio de atores', 'Fiscal — projetar impacto pós-aprovação', 'Biblioteca — jurisprudência correlata'],
    ctaLabel: 'Abrir hemiciclo interativo',
  },
  {
    id: 'wellbeing',
    title: 'Mapa de Bem-Estar Governado',
    subtitle: 'PIB não é felicidade',
    description: 'C-WBIG operacionaliza Economia do Bem-Estar (Kahneman, Deaton, VanderWeele) como eixo de governança. Detecta o Paradoxo de Easterlin e separa Experiencing vs Remembering Self.',
    icon: HeartHandshake,
    color: '#D4537E',
    link: '/wellbeing',
    badges: ['Easterlin Gap', 'VanderWeele 5D', 'Kahneman Split'],
    jsonTag: 'JSON_24',
    methodology: 'Composite Well-Being Index for Governance (C-WBIG): integra 5 dimensões VanderWeele + split Kahneman (Experiencing × Remembering Self) + detecção do Paradoxo de Easterlin.',
    valueProp: 'Sair da tirania do PIB — medir o que importa: florescimento humano sob diferentes regimes.',
    innovation: 'Primeiro índice a fundir economia da felicidade, psicologia positiva e governança comparada em métrica auditável.',
    process: [
      'Coleta de microdados de bem-estar subjetivo + indicadores objetivos.',
      'Cálculo do split Kahneman: experiencing vs remembering self.',
      'Composição das 5 dimensões VanderWeele (saúde, sentido, virtude, vínculos, segurança).',
      'Teste do Paradoxo de Easterlin: PIB↑ implica bem-estar↑?',
      'Mapa comparativo dos governos analisados em C-WBIG.',
    ],
    pedagogicalHook: 'Combate o reducionismo economicista e mostra que crescimento sem florescimento é desenvolvimento amputado.',
    scientificBase: ['Kahneman (2010)', 'Deaton (2008)', 'VanderWeele (2017)', 'Easterlin (1974)'],
    inputs: ['Microdados subjetivos (Gallup/PNAD-C)', 'Indicadores objetivos (saúde, renda, vínculos)', 'Série de PIB per capita comparável'],
    outputs: ['C-WBIG score por governo (0–100)', 'Radar 5D VanderWeele', 'Curva Easterlin (PIB vs bem-estar)'],
    kpis: ['Cobertura de dimensões ≥ 4/5', 'Consistência Kahneman split (r ≥ 0,6)', 'Gap Easterlin significativo (p < 0,05)'],
    integrations: ['Org Wellbeing — camada organizacional', 'Fiscal — testar hipótese renda→bem-estar', 'Comparação — ranking multi-governo'],
    ctaLabel: 'Medir bem-estar governado',
  },
  {
    id: 'career',
    title: 'Navegador de Carreira',
    subtitle: 'Governança → mercado de trabalho',
    description: 'Correlações VAR entre eixos de governança e setores profissionais. Identifica tendências estruturais e oportunidades com horizonte de 3, 5 e 10 anos.',
    icon: Compass,
    color: '#10B981',
    link: '/career',
    badges: ['VAR Engine', 'CAGED/RAIS', 'Becker/Sims'],
    jsonTag: 'JSON_25',
    methodology: 'Vector Autoregression (VAR) acoplando eixos PIR+ com microdados CAGED/RAIS, com decomposição de Cholesky para identificação de choques estruturais.',
    valueProp: 'Conectar decisão política a decisão de carreira — orientar capital humano com base em macrotendências, não modismo.',
    innovation: 'Primeira ferramenta a transformar análise de governança em sinal acionável de mercado de trabalho com horizontes calibrados.',
    process: [
      'Selecione área profissional ou perfil de carreira.',
      'Motor VAR identifica eixos PIR+ mais correlacionados.',
      'Projeções para 3, 5 e 10 anos com intervalos de confiança.',
      'Lista de competências emergentes e em declínio.',
      'Recomendações personalizadas calibradas Becker/Sims.',
    ],
    pedagogicalHook: 'Politica não é abstrata — define quais carreiras florescerão. Conecta cidadania a planejamento de vida.',
    scientificBase: ['Sims (1980) VAR', 'Becker (1964) Human Capital', 'Acemoglu (2002)', 'Cholesky Decomposition'],
    inputs: ['Perfil profissional + geografia', 'Séries CAGED/RAIS (últimos 10 anos)', 'Eixos PIR+ correlacionados ao setor'],
    outputs: ['Projeção 3/5/10 anos com fan chart', 'Skills emergentes vs. em declínio', 'Trilha de reskilling recomendada'],
    kpis: ['R² preditivo out-of-sample ≥ 0,55', 'Impulse-response significativo (95% IC)', 'Cobertura CNAE ≥ 80% do setor'],
    integrations: ['Fiscal — impacto salarial por governo', 'Wellbeing — trade-off renda × florescimento', 'Biblioteca — literatura Becker/Acemoglu'],
    ctaLabel: 'Projetar minha carreira',
  },
  {
    id: 'fiscal',
    title: 'Orçamento Pessoal Governado',
    subtitle: 'O que cada governo fez com seu dinheiro',
    description: 'Microsimulação de impacto fiscal por 5 canais de transmissão. 100% determinístico — calibrado com dados BCB/FMI/IPEA. Personalizado por faixa de renda.',
    icon: Wallet,
    color: '#F97316',
    link: '/fiscal-impact',
    badges: ['5 Canais', 'Piketty/Lusardi', 'SIB ≤0.75'],
    jsonTag: 'JSON_26',
    methodology: 'Microsimulação de incidência fiscal por 5 canais: tributário direto, indireto, transferências, inflação real e juros — calibrada com séries BCB/FMI/IPEA.',
    valueProp: 'Transformar política fiscal abstrata em impacto concreto no bolso — por faixa de renda, com rastreabilidade total.',
    innovation: 'Único motor a separar inflação como imposto regressivo invisível e quantificar perda real por decil sob cada governo.',
    process: [
      'Informe sua faixa de renda e composição de consumo.',
      'O motor aplica os 5 canais de transmissão fiscal.',
      'Cálculo determinístico do impacto líquido em R$ por governo.',
      'Comparação entre governos com SIB ≤0.75 (cobertura mínima).',
      'Visualização do efeito acumulado em horizonte de 4 anos.',
    ],
    pedagogicalHook: 'Acaba com a abstração tributária — você vê literalmente quem ganhou e quem perdeu sob cada modelo.',
    scientificBase: ['Piketty (2014)', 'Lusardi (2008) Financial Literacy', 'Atkinson (1980)', 'Mirrlees Review'],
    inputs: ['Faixa de renda + cesta de consumo', 'Séries BCB/IPEA/FMI (juros, inflação, tributos)', 'Regime fiscal do governo analisado'],
    outputs: ['Impacto líquido em R$ (nominal e real)', 'Decomposição pelos 5 canais', 'Curva acumulada 4 anos'],
    kpis: ['SIB ≤ 0,75 (cobertura mínima)', 'Erro de calibração < 3% vs. IPCA oficial', 'Cobertura de decis 1–10 completa'],
    integrations: ['Wellbeing — traduzir R$ em florescimento', 'Cenários — testar reformas alternativas', 'Biblioteca — Mirrlees & Piketty'],
    ctaLabel: 'Calcular meu impacto fiscal',
  },
  {
    id: 'org-wellbeing',
    title: 'Bem-Estar Organizacional',
    subtitle: 'PERMA × Trabalho × Governança',
    description: 'OWBIG conecta PERMA (Seligman) + JCM (Hackman & Oldham) aos eixos de governança. Mede como cada governo criou ou destruiu condições para trabalho significativo.',
    icon: Building2,
    color: '#534AB7',
    link: '/org-wellbeing',
    badges: ['PERMA 5D', 'JCM × Gov', 'Edmondson ψ'],
    jsonTag: 'JSON_27',
    methodology: 'Organizational Well-Being Index for Governance (OWBIG): PERMA (Seligman) × JCM (Hackman & Oldham) × Psychological Safety (Edmondson) atrelados aos eixos PIR+.',
    valueProp: 'Demonstrar que governança molda — para bem ou mal — a possibilidade de trabalho com sentido na economia.',
    innovation: 'Primeira métrica a unir psicologia positiva, design de cargos e governança comparada em índice único auditável.',
    process: [
      'Carrega indicadores de mercado de trabalho + condições laborais.',
      'Aplica framework PERMA 5D sobre dados agregados.',
      'Pondera por dimensões JCM (variedade, identidade, autonomia, feedback).',
      'Calcula índice de segurança psicológica Edmondson ψ.',
      'Comparação OWBIG entre governos analisados.',
    ],
    pedagogicalHook: 'Mostra que ambiente de trabalho é resultado de política pública — não apenas escolha empresarial.',
    scientificBase: ['Seligman (2011) PERMA', 'Hackman & Oldham (1976) JCM', 'Edmondson (1999)', 'OECD Job Quality'],
    inputs: ['Indicadores laborais (informalidade, jornada, salário)', 'Surveys de engajamento e clima', 'Eixos PIR+ trabalho/proteção social'],
    outputs: ['OWBIG score por governo', 'Radar PERMA 5D × JCM', 'Edmondson ψ (segurança psicológica)'],
    kpis: ['Cobertura PERMA ≥ 4/5', 'JCM MPS calculado para ≥ 70% da amostra', 'Reprodutibilidade determinística 100%'],
    integrations: ['Wellbeing — nível macro complementar', 'Career — projeção qualitativa do trabalho', 'Comparação — ranking multi-governo'],
    ctaLabel: 'Mapear trabalho significativo',
  },
  {
    id: 'emergent-intelligence',
    title: 'Inteligência Cívica Emergente',
    subtitle: 'O todo é maior que as partes',
    description: 'Complex Adaptive Systems (Holland, 1992) aplicados ao corpus agregado da plataforma. Detecta convergências inesperadas, padrões fractais, pontos de inflexão e invariâncias universais.',
    icon: Network,
    color: '#10B981',
    link: '/intelligence-commons',
    badges: ['CAS Theory', 'Fractal', 'CUSUM'],
    jsonTag: 'JSON_28',
    methodology: 'Complex Adaptive Systems (Holland) + análise fractal multiescala + CUSUM para detecção de mudanças estruturais sobre o corpus agregado de análises da plataforma.',
    valueProp: 'Descobrir padrões que ninguém previu — extrair inteligência coletiva genuína do conjunto das análises individuais.',
    innovation: 'Primeira aplicação de CAS + análise fractal sobre commons de análises cívicas brasileiras para descoberta de invariâncias.',
    process: [
      'Indexação contínua de todas as análises da plataforma.',
      'Análise fractal multiescala em busca de auto-similaridade.',
      'CUSUM detecta pontos de inflexão estruturais.',
      'Identificação de convergências inesperadas entre cenários.',
      'Publicação de invariâncias com p-value e tamanho de efeito.',
    ],
    pedagogicalHook: 'Demonstra que coletivamente sabemos mais — combate hiperindividualismo analítico com inteligência emergente.',
    scientificBase: ['Holland (1992) CAS', 'Mandelbrot (1982)', 'Page (2011) Diversity', 'CUSUM (Page, 1954)'],
    inputs: ['Corpus agregado (análises anonimizadas da plataforma)', 'Grade de escalas fractais (federal → municipal)', 'Janela temporal para CUSUM'],
    outputs: ['Mapa de convergências inesperadas', 'Padrões fractais federal/estadual/municipal', 'Pontos de inflexão com lead-time histórico'],
    kpis: ['p-value < 0,01 para invariâncias publicadas', 'Cobertura fractal ≥ 3 escalas', 'SIB agregado ≥ 0,75'],
    integrations: ['DNA — validar arquétipos contra invariâncias', 'Cenários — priors emergentes', 'Biblioteca — publicações do commons'],
    ctaLabel: 'Explorar inteligência coletiva',
  },
  {
    id: 'epistemic-radar',
    title: 'Radar Epistêmico',
    subtitle: 'A ciência de atualizar crenças',
    description: 'Bayesian Belief Updating + Motivational Interviewing + Constitutional AI. Detecta vieses e oferece diálogo socrático de 7 turnos com autonomia total.',
    icon: Brain,
    color: '#8B5CF6',
    link: '/epistemic-radar',
    badges: ['MI Protocol', 'Bayesian', 'Constitutional AI'],
    jsonTag: 'JSON_29',
    methodology: 'Bayesian Belief Updating sobre crenças declaradas + Motivational Interviewing (Miller & Rollnick) + Constitutional AI (Anthropic) para diálogo socrático respeitoso da autonomia.',
    valueProp: 'Oferecer espelho epistêmico — não convencer, mas iluminar vieses e abrir possibilidade de atualização autônoma.',
    innovation: 'Único motor a aplicar MI + Bayesian + Constitutional AI em um diálogo de 7 turnos calibrado para crescimento, não persuasão.',
    process: [
      'Você declara uma crença política e seu grau de certeza inicial.',
      'O radar mapeia vieses cognitivos detectáveis na formulação.',
      'Diálogo socrático de 7 turnos com perguntas calibradas MI.',
      'A cada turno, atualização bayesiana opcional da sua confiança.',
      'Relatório final preserva sua posição — só você decide se mudar.',
    ],
    pedagogicalHook: 'Ensina a separar identidade de crença — torna o desacordo civilizado e a mudança de opinião saudável.',
    scientificBase: ['Bayes (1763)', 'Miller & Rollnick (1991) MI', 'Anthropic Constitutional AI', 'Tversky & Kahneman (1974)'],
    inputs: ['Crença declarada + certeza inicial (0–100%)', 'Contexto/fontes que embasam a crença', 'Preferências de diálogo (ritmo, profundidade)'],
    outputs: ['Mapa de vieses cognitivos detectados', 'Trajetória bayesiana da confiança (7 turnos)', 'Relatório reflexivo preservando autonomia'],
    kpis: ['Aderência ao protocolo MI ≥ 90%', 'Zero linguagem persuasiva (Constitutional AI check)', 'Delta de confiança auto-declarado (não imposto)'],
    integrations: ['Sofia — mediação socrática contínua', 'Biblioteca — leituras Kahneman/Rollnick', 'Auditoria — trilha completa do diálogo'],
    ctaLabel: 'Iniciar diálogo socrático',
  },
];

// Card-level gradient/border presets (visual only).
const cardStyle: Record<string, { gradient: string; border: string }> = {
  scenarios:   { gradient: 'from-amber-600/20 to-amber-400/5',    border: 'border-amber-500/20 hover:border-amber-500/50' },
  dna:         { gradient: 'from-purple-600/20 to-purple-400/5',  border: 'border-purple-500/20 hover:border-purple-500/50' },
  politisim:   { gradient: 'from-blue-600/20 to-blue-400/5',      border: 'border-blue-500/20 hover:border-blue-500/50' },
  opinion:     { gradient: 'from-cyan-600/20 to-cyan-400/5',      border: 'border-cyan-500/20 hover:border-cyan-500/50' },
  legislative: { gradient: 'from-emerald-600/20 to-emerald-400/5', border: 'border-emerald-500/20 hover:border-emerald-500/50' },
  wellbeing:   { gradient: 'from-pink-600/20 to-pink-400/5',      border: 'border-pink-500/20 hover:border-pink-500/50' },
  career:      { gradient: 'from-teal-600/20 to-teal-400/5',      border: 'border-teal-500/20 hover:border-teal-500/50' },
  fiscal:      { gradient: 'from-orange-600/20 to-orange-400/5',  border: 'border-orange-500/20 hover:border-orange-500/50' },
  'org-wellbeing': { gradient: 'from-violet-600/20 to-violet-400/5', border: 'border-violet-500/20 hover:border-violet-500/50' },
  'emergent-intelligence': { gradient: 'from-emerald-600/20 to-emerald-400/5', border: 'border-emerald-500/20 hover:border-emerald-500/50' },
  'epistemic-radar': { gradient: 'from-purple-600/20 to-purple-400/5', border: 'border-purple-500/20 hover:border-purple-500/50' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const AdvancedModulesShowcase = () => {
  const [activeModule, setActiveModule] = useState<ModuleDeepDive | null>(null);
  const [open, setOpen] = useState(false);

  const openDeepDive = (mod: ModuleDeepDive) => {
    setActiveModule(mod);
    setOpen(true);
  };

  return (
    <section className="py-24 px-4 lg:px-8 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-accent/[0.02] to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-accent/[0.03] blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-accent/20 bg-brand-accent/5 mb-6">
            <Sparkles className="w-4 h-4 text-brand-accent" />
            <span className="text-xs font-medium text-brand-accent">LABORATÓRIO DE SIMULAÇÃO AVANÇADA</span>
          </div>
          <h2 className="font-display text-3xl lg:text-4xl text-neutral-50 mb-4">
            Ferramentas que transformam <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent via-amber-400 to-brand-accent">
              dados em inteligência política
            </span>
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto text-sm lg:text-base">
            Motores determinísticos de simulação e análise construídos com rigor científico.
            Cada módulo usa modelos matemáticos validados — sem alucinação, com trilha de auditoria completa.
          </p>

          <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
            {[
              { icon: Brain, label: '100% Determinístico' },
              { icon: Shield, label: 'Protocolo SIB' },
              { icon: TrendingUp, label: 'Auditável' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-neutral-500 text-xs">
                <item.icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Link
              to="/lab"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-accent text-[#0A1628] text-sm font-medium hover:bg-brand-accent/90 transition-colors shadow-lg shadow-brand-accent/10"
            >
              <Sparkles className="w-4 h-4" />
              Entrar no Hub do Laboratório
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-[11px] text-neutral-500 mt-2">Fluxo guiado · filtro por intenção · jornada pedagógica</p>
          </div>
        </motion.div>

        {/* Module Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {modules.map((mod) => {
            const style = cardStyle[mod.id] ?? { gradient: 'from-white/[0.04] to-transparent', border: 'border-white/10 hover:border-white/30' };
            return (
              <motion.div key={mod.id} variants={itemVariants} className="h-full">
                <article
                  className={`group relative flex flex-col h-full p-6 rounded-2xl border bg-gradient-to-br ${style.gradient} ${style.border} transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl`}
                  style={{
                    // soft accent glow on hover
                    boxShadow: undefined,
                  }}
                >
                  {/* Top accent bar */}
                  <div
                    className="absolute inset-x-6 top-0 h-[2px] rounded-b-full opacity-50 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: mod.color }}
                  />

                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center ring-1 ring-inset transition-transform group-hover:scale-110"
                      style={{
                        backgroundColor: mod.color + '15',
                        boxShadow: `0 0 0 1px ${mod.color}22 inset`,
                      }}
                    >
                      <mod.icon className="w-6 h-6" style={{ color: mod.color }} />
                    </div>
                    <span
                      className="text-[10px] font-mono px-2 py-1 rounded"
                      style={{ color: mod.color + 'cc', backgroundColor: mod.color + '10' }}
                    >
                      {mod.jsonTag}
                    </span>
                  </div>

                  <h3 className="font-display text-lg text-neutral-100 mb-1 group-hover:text-neutral-50 transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-brand-accent/70 italic mb-3">{mod.subtitle}</p>
                  <p className="text-xs text-neutral-400 leading-relaxed mb-4 flex-1">
                    {mod.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {mod.badges.map((badge) => (
                      <span
                        key={badge}
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium border"
                        style={{
                          borderColor: mod.color + '30',
                          color: mod.color,
                          backgroundColor: mod.color + '08',
                        }}
                      >
                        {badge}
                      </span>
                    ))}
                  </div>

                  {/* Dual CTA: Saiba mais (mini) + Explorar */}
                  <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => openDeepDive(mod)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-400 hover:text-neutral-100 transition-colors px-2 py-1 rounded-md hover:bg-white/5"
                      aria-label={`Saiba mais sobre ${mod.title}`}
                    >
                      <Info className="w-3 h-3" />
                      Saiba mais
                    </button>

                    <Link
                      to={mod.link}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-300 group-hover:text-neutral-50 transition-colors"
                    >
                      <span>Explorar</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" style={{ color: mod.color }} />
                    </Link>
                  </div>
                </article>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <ModuleDeepDiveModal module={activeModule} open={open} onOpenChange={setOpen} />
    </section>
  );
};

export default AdvancedModulesShowcase;
