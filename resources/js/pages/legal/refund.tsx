import type { ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import SeoHead from '@/components/seo-head';

export default function Refund() {
    return (
        <>
            <SeoHead
                title="Arrependimento e reembolso | RECHI/"
                description="Política de arrependimento, cancelamento e reembolso aplicável aos serviços digitais da RECHI/."
                canonicalPath="/arrependimento-e-reembolso"
            />
            <main className="min-h-screen bg-[#f7f7f2] px-5 py-12 text-[#151510] sm:px-8">
                <article className="mx-auto grid max-w-3xl gap-8">
                    <Link href="/" className="text-sm font-semibold">
                        Voltar
                    </Link>
                    <header className="grid gap-3">
                        <h1 className="text-4xl font-black">
                            Arrependimento e reembolso
                        </h1>
                        <p className="text-sm text-black/60">
                            Ultima atualizacao: 22 de julho de 2026.
                        </p>
                    </header>

                    <LegalSection title="Direito de arrependimento">
                        Em contratacoes online, o cliente pode exercer o direito
                        de arrependimento em ate 7 dias corridos, contados da
                        contratacao, conforme o art. 49 do Codigo de Defesa do
                        Consumidor, quando aplicavel.
                    </LegalSection>

                    <LegalSection title="Como solicitar">
                        A solicitacao deve ser enviada por e-mail com nome,
                        e-mail da conta e numero do pedido. Apos validacao, a
                        devolucao seguira o mesmo meio de pagamento ou o fluxo
                        operacional disponibilizado pelo Mercado Pago.
                    </LegalSection>

                    <LegalSection title="Servicos personalizados">
                        Como landing pages e correcoes de bugs sao servicos
                        personalizados, pedidos de cancelamento fora do prazo
                        legal ou apos execucao relevante serao analisados
                        conforme etapa do trabalho, materiais ja produzidos e
                        direitos obrigatorios do consumidor.
                    </LegalSection>

                    <LegalSection title="Sem renuncia de direitos">
                        Nenhuma regra desta politica limita direitos
                        irrenunciaveis previstos em lei. Em caso de conflito,
                        prevalece a legislacao brasileira aplicavel.
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
