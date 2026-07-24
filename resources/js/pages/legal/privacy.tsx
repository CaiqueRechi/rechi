import type { ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import SeoHead from '@/components/seo-head';

export default function Privacy() {
    return (
        <>
            <SeoHead
                title="Política de privacidade | RECHI/"
                description="Saiba como a RECHI/ coleta, utiliza, protege e armazena dados pessoais."
                canonicalPath="/privacidade"
            />
            <main className="min-h-screen bg-[#f7f7f2] px-5 py-12 text-[#151510] sm:px-8">
                <article className="mx-auto grid max-w-3xl gap-8">
                    <Link href="/" className="text-sm font-semibold">
                        Voltar
                    </Link>
                    <header className="grid gap-3">
                        <h1 className="text-4xl font-black">
                            Politica de privacidade
                        </h1>
                        <p className="text-sm text-black/60">
                            Ultima atualizacao: 22 de julho de 2026.
                        </p>
                    </header>

                    <LegalSection title="Dados coletados">
                        Podemos coletar nome, e-mail, telefone, dados de conta,
                        informacoes do briefing, arquivos enviados, dados de
                        pagamento processados pelo Mercado Pago e registros
                        tecnicos necessarios para seguranca e operacao.
                    </LegalSection>

                    <LegalSection title="Finalidade">
                        Os dados sao usados para criar conta, processar pedidos,
                        liberar briefing, prestar suporte, cumprir obrigacoes
                        legais, prevenir fraude e melhorar a experiencia do
                        servico.
                    </LegalSection>

                    <LegalSection title="Compartilhamento">
                        Dados podem ser compartilhados com provedores
                        necessarios a operacao, como hospedagem, e-mail e
                        pagamento. Nao vendemos dados pessoais.
                    </LegalSection>

                    <LegalSection title="Arquivos de briefing">
                        Arquivos enviados pelo cliente sao usados apenas para a
                        execucao do servico contratado, respeitando limites de
                        tipo, tamanho e quantidade definidos nas configuracoes
                        gerais do sistema.
                    </LegalSection>

                    <LegalSection title="Direitos do titular">
                        O titular pode solicitar acesso, correcao, exclusao,
                        portabilidade ou revisao do tratamento de seus dados,
                        observadas obrigacoes legais e necessidades contratuais.
                    </LegalSection>

                    <LegalSection title="Contato">
                        Solicitacoes sobre privacidade podem ser enviadas para{' '}
                        <a
                            href="mailto:caique.rechi.dev@gmail.com"
                            className="underline"
                        >
                            caique.rechi.dev@gmail.com
                        </a>
                        .
                    </LegalSection>
                </article>
            </main>
        </>
    );
}

function LegalSection({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <section className="grid gap-2 border-t border-black/10 pt-6">
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="leading-relaxed text-black/70">{children}</p>
        </section>
    );
}
