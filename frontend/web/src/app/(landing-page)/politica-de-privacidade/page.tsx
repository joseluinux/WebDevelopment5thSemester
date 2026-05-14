export const metadata = {
  title: "Política de Privacidade — LUMEMEI",
  description:
    "Saiba como a LUMEMEI coleta, usa e protege seus dados pessoais.",
};

export default function PoliticaDePrivacidade() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 text-on-surface">
      <h1 className="font-headline text-4xl font-bold mb-4 text-on-surface">
        Política de Privacidade
      </h1>
      <p className="text-on-surface-variant text-sm mb-12">
        Última atualização: maio de 2026
      </p>

      <div className="space-y-10 text-on-surface-variant leading-relaxed">
        <section>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-3">
            1. Dados que Coletamos
          </h2>
          <p>Coletamos os seguintes tipos de dados:</p>
          <ul className="list-disc list-inside mt-3 space-y-2">
            <li>
              <strong className="text-on-surface">Dados de cadastro:</strong>{" "}
              nome, e-mail e senha (armazenada com criptografia).
            </li>
            <li>
              <strong className="text-on-surface">Dados do MEI:</strong> CNPJ,
              razão social, atividade econômica e receitas/despesas inseridas.
            </li>
            <li>
              <strong className="text-on-surface">Dados de uso:</strong> logs de
              acesso, endereço IP e informações do dispositivo para fins de
              segurança.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-3">
            2. Como Usamos seus Dados
          </h2>
          <p>Utilizamos suas informações para:</p>
          <ul className="list-disc list-inside mt-3 space-y-2">
            <li>Fornecer e melhorar os serviços da plataforma;</li>
            <li>Gerar relatórios financeiros e insights personalizados;</li>
            <li>Enviar comunicações relevantes sobre sua conta;</li>
            <li>Garantir a segurança e prevenir fraudes.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-3">
            3. Compartilhamento de Dados
          </h2>
          <p>
            Não vendemos seus dados pessoais. Podemos compartilhar informações
            com prestadores de serviço que nos auxiliam na operação da
            plataforma (ex.: serviços de nuvem), sempre sob acordos de
            confidencialidade. Dados também poderão ser divulgados quando
            exigido por lei.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-3">
            4. Segurança
          </h2>
          <p>
            Aplicamos criptografia em trânsito (TLS) e em repouso para proteger
            suas informações. Realizamos revisões periódicas de segurança e
            seguimos as melhores práticas do setor para minimizar riscos de
            acesso não autorizado.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-3">
            5. Seus Direitos (LGPD)
          </h2>
          <p>
            Conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você
            tem direito a:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-2">
            <li>Acessar os dados que temos sobre você;</li>
            <li>Solicitar correção de dados incompletos ou incorretos;</li>
            <li>Solicitar a exclusão de seus dados;</li>
            <li>Revogar o consentimento a qualquer momento.</li>
          </ul>
          <p className="mt-3">
            Para exercer esses direitos, entre em contato com{" "}
            <span className="text-primary">privacidade@lumemei.com.br</span>.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-3">
            6. Retenção de Dados
          </h2>
          <p>
            Mantemos seus dados enquanto sua conta estiver ativa ou conforme
            necessário para cumprir obrigações legais. Após o encerramento da
            conta, os dados serão excluídos em até 90 dias, salvo exigência
            legal em contrário.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-3">
            7. Contato
          </h2>
          <p>
            Dúvidas ou solicitações relacionadas à privacidade podem ser
            enviadas para{" "}
            <span className="text-primary">privacidade@lumemei.com.br</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
