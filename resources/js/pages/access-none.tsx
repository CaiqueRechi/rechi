import { Head, Link } from '@inertiajs/react';
import { LockKeyhole, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logout } from '@/routes';

export default function AccessNone() {
    return (
        <>
            <Head title="Acessos pendentes">
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <main className="grid min-h-[70vh] place-items-center p-6">
                <section className="w-full max-w-lg rounded-3xl border bg-card p-8 text-center shadow-sm">
                    <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                        <LockKeyhole className="size-6" />
                    </span>
                    <p className="mt-6 font-mono text-[10px] tracking-[0.2em] text-violet-600 uppercase dark:text-violet-400">
                        Conta ativa / acessos pendentes
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold">
                        Ainda não há um módulo disponível
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        Sua conta está pronta, mas ainda não recebeu acesso a
                        uma área navegável. Fale com o administrador para
                        revisar suas permissões.
                    </p>
                    <Button asChild variant="outline" className="mt-7">
                        <Link href={logout()} method="post" as="button">
                            <LogOut className="size-4" />
                            Sair com segurança
                        </Link>
                    </Button>
                </section>
            </main>
        </>
    );
}
