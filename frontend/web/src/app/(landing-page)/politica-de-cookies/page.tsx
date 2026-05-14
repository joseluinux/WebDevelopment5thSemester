export const metadata = {
  title: "Política de Cookies — LUMEMEI",
  description:
    "Entenda como a LUMEMEI utiliza cookies e tecnologias similares.",
};

export default function PoliticaDeCookies() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 text-on-surface">
      <h1 className="font-headline text-4xl font-bold mb-4 text-on-surface">
        Política de Cookies
      </h1>
      <p className="text-on-surface-variant text-sm mb-12">
        Última atualização: maio de 2026
      </p>

      <div className="space-y-10 text-on-surface-variant leading-relaxed">
        <section>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-3">
            1. O que são Cookies?
          </h2>
          <p>
            Cookies são pequenos arquivos de texto armazenados no seu
            dispositivo quando você visita um site. Eles permitem que a
            plataforma reconheça seu navegador e mantenha preferências entre
            sessões.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-3">
            2. Cookies que Utilizamos
          </h2>

          <div className="space-y-6 mt-4">
            <div className="bg-surface-container-low border border-outline-variant/10 rounded-xl p-5">
              <h3 className="font-headline font-bold text-on-surface mb-2">
                Estritamente Necessários
              </h3>
              <p className="text-sm">
                Essenciais para o funcionamento da plataforma. Incluem tokens de
                autenticação e preferências de sessão. Não podem ser
                desativados.
              </p>
            </div>

            <div className="bg-surface-container-low border border-outline-variant/10 rounded-xl p-5">
              <h3 className="font-headline font-bold text-on-surface mb-2">
                Funcionais
              </h3>
              <p className="text-sm">
                Lembram suas preferências (ex.: MEI ativo selecionado) para
                oferecer uma experiência personalizada entre sessões.
              </p>
            </div>

            <div className="bg-surface-container-low border border-outline-variant/10 rounded-xl p-5">
              <h3 className="font-headline font-bold text-on-surface mb-2">
                Analíticos
              </h3>
              <p className="text-sm">
                Coletamos dados anônimos de uso para entender como a plataforma
                é utilizada e identificar melhorias. Os dados são agregados e
                não identificam usuários individualmente.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-3">
            3. Gerenciamento de Cookies
          </h2>
          <p>
            Você pode controlar ou excluir cookies pelas configurações do seu
            navegador. Desativar cookies essenciais pode prejudicar o
            funcionamento da plataforma, incluindo o login e a manutenção de
            sessão.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-3">
            4. Armazenamento Local
          </h2>
          <p>
            Além de cookies, utilizamos <code>localStorage</code> para armazenar
            o refresh token de autenticação de forma segura no seu dispositivo.
            Esses dados não são transmitidos para terceiros.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-3">
            5. Contato
          </h2>
          <p>
            Dúvidas sobre esta política podem ser enviadas para{" "}
            <span className="text-primary">privacidade@lumemei.com.br</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
