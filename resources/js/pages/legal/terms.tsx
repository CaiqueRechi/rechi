import type { ReactNode } from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Terms() {
    return (
        <>
            <Head title="Termos de uso" />
            <main className="min-h-screen bg-[#f7f7f2] px-5 py-12 text-[#151510] sm:px-8">
                <article className="mx-auto grid max-w-3xl gap-8">
                    <Link href="/" className="text-sm font-semibold">
                        Voltar
                    </Link>
                    <header className="grid gap-3">
                        <h1 className="text-4xl font-black">Termos de uso</h1>
                        <p className="text-sm text-black/60">
                            Ultima atualizacao: 22 de julho de 2026.
                        </p>
                    </header>

                    <LegalSection title="Contratacao">
                        Os servicos sao contratados por escopo fechado ou por
                        horas previamente aprovadas. O checkout exige conta
                        autenticada, aceite destes termos e confirmacao do valor
                        calculado pelo sistema.
                    </LegalSection>

                    <LegalSection title="Pagamento">
                        Os pagamentos online sao processados pelo Mercado Pago,
                        com Pix e cartao. Quando houver parcelamento, as
                        condicoes exibidas no checkout do provedor prevalecem.
                    </LegalSection>

                    <LegalSection title="Execucao do servico">
                        O prazo comeca apos confirmacao de pagamento e
                        recebimento das informacoes minimas do briefing. Atrasos
                        no envio de conteudo, aprovacoes ou acessos podem
                        alterar o cronograma.
                    </LegalSection>

                    <LegalSection title="Escopo e revisoes">
                        Cada oferta informa itens incluidos, itens nao incluidos
                        e quantidade de revisoes. Solicitacoes fora do escopo
                        podem gerar novo orcamento antes da execucao.
                    </LegalSection>

                    <LegalSection title="Arrependimento e cancelamento">
                        Compras online seguem o direito de arrependimento de ate
                        7 dias previsto no art. 49 do Codigo de Defesa do
                        Consumidor, quando aplicavel. Detalhes estao na{' '}
                        <Link
                            href="/arrependimento-e-reembolso"
                            className="underline"
                        >
                            politica de arrependimento e reembolso
                        </Link>
                        .
                    </LegalSection>

                    <LegalSection title="Responsabilidades">
                        O cliente deve fornecer materiais que tem direito de
                        usar, revisar informacoes antes da publicacao e manter
                        acessos sensiveis em canais seguros. A prestacao nao
                        inclui hospedagem, trafego pago, manutencao continua ou
                        garantias comerciais, salvo quando isso estiver
                        expressamente descrito na oferta.
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
