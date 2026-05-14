export const metadata = {
  title: "Termos de Uso — LUMEMEI",
  description: "Leia os Termos de Uso da plataforma LUMEMEI.",
};

export default function TermosDeUso() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 text-on-surface">
      <h1 className="font-headline text-4xl font-bold mb-4 text-on-surface">
        Termos de Uso
      </h1>
      <p className="text-on-surface-variant text-sm mb-12">
        Última atualização: maio de 2026
      </p>

      <div className="space-y-10 text-on-surface-variant leading-relaxed">
        <section>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-3">
            1. Aceitação dos Termos
          </h2>
          <p>
            Ao acessar ou usar a plataforma LUMEMEI, você concorda com estes
            Termos de Uso. Se não concordar com qualquer parte destes termos,
            não utilize nossos serviços.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-3">
            2. Descrição do Serviço
          </h2>
          <p>
            A LUMEMEI é uma plataforma de gestão financeira voltada para
            Microempreendedores Individuais (MEI). Oferecemos ferramentas para
            controle de receitas, despesas, emissão de relatórios e
            acompanhamento de obrigações fiscais do MEI.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-3">
            3. Cadastro e Conta
          </h2>
          <p>
            Para utilizar a plataforma, você deve criar uma conta com
            informações verídicas e mantê-las atualizadas. Você é responsável
            pela confidencialidade de suas credenciais de acesso e por todas as
            atividades realizadas em sua conta.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-3">
            4. Uso Permitido
          </h2>
          <p>É vedado utilizar a plataforma para:</p>
          <ul className="list-disc list-inside mt-3 space-y-2">
            <li>Atividades ilegais ou fraudulentas;</li>
            <li>Violação de direitos de terceiros;</li>
            <li>Envio de conteúdo malicioso ou spam;</li>
            <li>Tentativas de acesso não autorizado a sistemas.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-3">
            5. Propriedade Intelectual
          </h2>
          <p>
            Todo o conteúdo, design e código-fonte da plataforma são propriedade
            exclusiva da LUMEMEI e protegidos pela legislação de propriedade
            intelectual vigente no Brasil. É proibida a reprodução total ou
            parcial sem autorização expressa.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-3">
            6. Limitação de Responsabilidade
          </h2>
          <p>
            A LUMEMEI não se responsabiliza por decisões financeiras tomadas com
            base nas informações da plataforma. Os dados são fornecidos como
            suporte informativo; consulte sempre um contador ou profissional
            habilitado para questões fiscais.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-3">
            7. Modificações
          </h2>
          <p>
            Reservamo-nos o direito de modificar estes Termos a qualquer
            momento. Alterações significativas serão comunicadas via e-mail ou
            aviso na plataforma. O uso continuado após a publicação das
            alterações constitui aceitação dos novos termos.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-3">
            8. Contato
          </h2>
          <p>
            Dúvidas sobre estes Termos podem ser enviadas para{" "}
            <span className="text-primary">contato@lumemei.com.br</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
