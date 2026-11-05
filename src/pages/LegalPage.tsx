import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";

interface LegalSection {
  heading: string;
  body: string;
}

interface LegalPageProps {
  title: string;
  updatedAt: string;
  intro: string;
  sections: LegalSection[];
}

export function LegalPage({ title, updatedAt, intro, sections }: LegalPageProps) {
  return (
    <>
      <NavBar />
      <main className="min-h-screen pt-16">
        <div className="max-w-[820px] mx-auto px-6 py-12">
          <nav className="flex items-center gap-2 text-body-sm text-neutral-500 mb-8" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-neutral-200 transition-colors">Início</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-neutral-200">{title}</span>
          </nav>

          <h1 className="font-display text-display-lg text-neutral-50 mb-2">{title}</h1>
          <p className="text-body-sm text-neutral-500 mb-8">Última atualização: {updatedAt}</p>
          <p className="text-body-md text-neutral-300 leading-relaxed mb-10">{intro}</p>

          <div className="space-y-8">
            {sections.map((s) => (
              <section key={s.heading}>
                <h2 className="text-body-lg font-semibold text-neutral-100 mb-2">{s.heading}</h2>
                <p className="text-body-sm text-neutral-400 leading-relaxed whitespace-pre-line">{s.body}</p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export function TermsPage() {
  return (
    <LegalPage
      title="Termos de Uso"
      updatedAt="julho de 2026"
      intro="A Ágora é um produto em estágio de validação de conceito. Estes termos regem o uso da plataforma enquanto ela evolui — vamos revisá-los conforme o produto amadurece, e avisaremos sobre mudanças relevantes."
      sections={[
        {
          heading: "1. O que é a Ágora",
          body: "A Ágora oferece análises de governos e políticas públicas combinando dados de fontes públicas (Banco Mundial, FMI, V-Dem, entre outras) com sínteses geradas por modelos de linguagem (IA). As análises são material de apoio à compreensão — não são aconselhamento jurídico, financeiro ou eleitoral, e podem conter imprecisões inerentes a sistemas de IA.",
        },
        {
          heading: "2. Estágio do produto",
          body: "A Ágora está em desenvolvimento ativo. Alguns módulos usam dados de demonstração claramente identificados como tal na interface; funcionalidades podem mudar ou ser descontinuadas sem aviso prévio nesta fase.",
        },
        {
          heading: "3. Sua conta",
          body: "Você é responsável por manter a confidencialidade das credenciais da sua conta e por toda atividade realizada com ela. Notifique-nos imediatamente sobre qualquer uso não autorizado.",
        },
        {
          heading: "4. Uso aceitável",
          body: "Não é permitido usar a plataforma para automatizar extração massiva de dados sem autorização, tentar contornar limites técnicos das funções de IA, ou usar o serviço para gerar ou disseminar desinformação.",
        },
        {
          heading: "5. Planos e cobrança",
          body: "Os planos pagos descritos na página de preços entrarão em vigor progressivamente. Nenhuma cobrança é feita sem confirmação explícita do usuário no momento da assinatura.",
        },
        {
          heading: "6. Contato",
          body: "Dúvidas sobre estes termos podem ser enviadas para o e-mail de suporte listado no rodapé do site.",
        },
      ]}
    />
  );
}

export function PrivacyPage() {
  return (
    <LegalPage
      title="Política de Privacidade"
      updatedAt="julho de 2026"
      intro="Esta política descreve quais dados a Ágora coleta, por quê, e quais direitos você tem sobre eles, em conformidade com a Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018)."
      sections={[
        {
          heading: "1. Dados que coletamos",
          body: "Dados de conta (nome, e-mail, senha criptografada) fornecidos no cadastro; preferências de perfil (idioma, camada de leitura preferida); histórico de análises que você salva; e ações de engajamento cívico que você registra na plataforma.",
        },
        {
          heading: "2. Base legal e natureza sensível dos dados",
          body: "Como a Ágora trata de temas políticos, seu histórico de análises e ações cívicas pode revelar opiniões políticas — dado pessoal sensível nos termos do art. 5º, II da LGPD. Tratamos esses dados com base no seu consentimento explícito no cadastro, com controles de acesso restritos ao próprio usuário (row-level security no banco de dados).",
        },
        {
          heading: "3. Como usamos seus dados",
          body: "Para autenticar sua conta, personalizar a experiência (idioma, camada pedagógica), salvar e recuperar suas análises, e operar funcionalidades de IA — parte do conteúdo de suas consultas pode ser enviada a provedores de IA (Google Gemini via Lovable AI Gateway) para gerar respostas.",
        },
        {
          heading: "4. Compartilhamento",
          body: "Não vendemos dados pessoais. Compartilhamos dados apenas com provedores de infraestrutura necessários à operação do serviço (Supabase para banco de dados e autenticação; Lovable AI Gateway para processamento de IA), sob contratos de processamento de dados.",
        },
        {
          heading: "5. Seus direitos (LGPD art. 18)",
          body: "Você pode solicitar acesso, correção, exclusão, portabilidade ou anonimização dos seus dados a qualquer momento. Análises marcadas como públicas por você permanecem visíveis até que você as exclua. Para exercer esses direitos, use as configurações da sua conta ou entre em contato pelo e-mail de suporte.",
        },
        {
          heading: "6. Retenção",
          body: "Mantemos seus dados enquanto sua conta estiver ativa. Ao excluir sua conta, seus dados pessoais são removidos ou anonimizados, exceto quando a retenção for exigida por obrigação legal.",
        },
      ]}
    />
  );
}
