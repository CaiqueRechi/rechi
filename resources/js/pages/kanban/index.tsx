import { Form, Head, Link, router } from '@inertiajs/react';
import {
    Archive,
    ArrowRight,
    Columns3,
    LockKeyhole,
    Plus,
    Search,
    Sparkles,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    index as boardsIndex,
    show as showBoard,
    store as storeBoard,
} from '@/routes/kanban/boards';

type BoardSummary = {
    id: number;
    title: string;
    description: string | null;
    color: string;
    visibility: 'private' | 'shared';
    archivedAt: string | null;
    owner: { id: number; name: string };
    participants: Array<{ id: number; name: string }>;
    columnCount: number;
    cardCount: number;
    updatedAt: string | null;
};

type PaginatedBoards = {
    data: BoardSummary[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    total: number;
};

type Props = {
    boards: PaginatedBoards;
    filters: { search: string; archived: boolean };
};

export default function KanbanIndex({ boards, filters }: Props) {
    const [search, setSearch] = useState(filters.search);

    const submitSearch = (event: React.FormEvent) => {
        event.preventDefault();
        router.get(
            boardsIndex().url,
            { search, archived: filters.archived ? 1 : undefined },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Kanban">
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <div className="relative flex flex-1 flex-col overflow-hidden p-4 sm:p-6">
                <div className="pointer-events-none absolute -top-32 right-0 size-96 rounded-full bg-violet-500/10 blur-3xl" />
                <header className="relative flex flex-col justify-between gap-5 border-b pb-6 lg:flex-row lg:items-end">
                    <div>
                        <p className="font-mono text-[10px] tracking-[0.2em] text-violet-600 uppercase dark:text-violet-400">
                            Oficina / fluxo de trabalho
                        </p>
                        <h1 className="mt-2 flex items-center gap-3 text-3xl font-bold tracking-tight">
                            Quadros
                            <span className="rounded-full bg-violet-500/10 px-2.5 py-1 font-mono text-xs text-violet-600 dark:text-violet-400">
                                {boards.total}
                            </span>
                        </h1>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                            Organize ideias, entregas e experimentos em espaços
                            privados ou compartilhados.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <form
                            onSubmit={submitSearch}
                            className="flex min-w-64 gap-2"
                        >
                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Buscar quadros"
                                aria-label="Buscar quadros"
                            />
                            <Button type="submit" size="icon" variant="outline">
                                <Search className="size-4" />
                            </Button>
                        </form>
                        <CreateBoardDialog />
                    </div>
                </header>

                <nav className="relative mt-5 flex gap-2">
                    <Button
                        asChild
                        size="sm"
                        variant={!filters.archived ? 'default' : 'outline'}
                    >
                        <Link href={boardsIndex()}>
                            <Sparkles className="size-3.5" />
                            Ativos
                        </Link>
                    </Button>
                    <Button
                        asChild
                        size="sm"
                        variant={filters.archived ? 'default' : 'outline'}
                    >
                        <Link
                            href={boardsIndex({
                                query: { archived: 1 },
                            })}
                        >
                            <Archive className="size-3.5" />
                            Arquivados
                        </Link>
                    </Button>
                </nav>

                {boards.data.length === 0 ? (
                    <section className="relative mt-8 grid min-h-96 place-items-center rounded-3xl border border-dashed bg-card/50 p-8 text-center">
                        <div>
                            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-violet-500/10 text-violet-500">
                                <Columns3 className="size-6" />
                            </span>
                            <h2 className="mt-5 text-lg font-semibold">
                                {filters.archived
                                    ? 'Nenhum quadro arquivado'
                                    : 'Seu primeiro fluxo começa aqui'}
                            </h2>
                            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                                Crie um quadro e adapte as colunas ao ritmo do
                                projeto.
                            </p>
                        </div>
                    </section>
                ) : (
                    <section className="relative mt-6 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                        {boards.data.map((board) => (
                            <Link
                                key={board.id}
                                href={showBoard(board.id)}
                                prefetch
                                className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:shadow-xl hover:shadow-violet-500/5"
                            >
                                <span
                                    className="absolute inset-x-0 top-0 h-1"
                                    style={{ backgroundColor: board.color }}
                                />
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <span className="flex items-center gap-2 text-[10px] tracking-wider text-muted-foreground uppercase">
                                            {board.visibility === 'private' ? (
                                                <LockKeyhole className="size-3" />
                                            ) : (
                                                <Users className="size-3" />
                                            )}
                                            {board.visibility === 'private'
                                                ? 'Privado'
                                                : 'Compartilhado'}
                                        </span>
                                        <h2 className="mt-3 text-lg font-semibold">
                                            {board.title}
                                        </h2>
                                    </div>
                                    <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-violet-500" />
                                </div>
                                <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
                                    {board.description ||
                                        'Quadro sem descrição — espaço livre para uma nova ideia.'}
                                </p>
                                <div className="mt-5 grid grid-cols-3 gap-2 border-t pt-4 text-xs">
                                    <div>
                                        <strong className="block">
                                            {board.columnCount}
                                        </strong>
                                        <span className="text-muted-foreground">
                                            colunas
                                        </span>
                                    </div>
                                    <div>
                                        <strong className="block">
                                            {board.cardCount}
                                        </strong>
                                        <span className="text-muted-foreground">
                                            cards
                                        </span>
                                    </div>
                                    <div>
                                        <strong className="block">
                                            {board.participants.length + 1}
                                        </strong>
                                        <span className="text-muted-foreground">
                                            pessoas
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </section>
                )}

                <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {boards.links.map((link) => (
                        <Button
                            key={link.label}
                            asChild={Boolean(link.url)}
                            size="sm"
                            variant={link.active ? 'default' : 'outline'}
                            disabled={!link.url}
                        >
                            {link.url ? (
                                <Link href={link.url}>
                                    {paginationLabel(link.label)}
                                </Link>
                            ) : (
                                <span>{paginationLabel(link.label)}</span>
                            )}
                        </Button>
                    ))}
                </div>
            </div>
        </>
    );
}

function paginationLabel(label: string): string {
    return label
        .replace('&laquo;', '«')
        .replace('&raquo;', '»')
        .replace('Previous', 'Anterior')
        .replace('Next', 'Próxima');
}

function CreateBoardDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="size-4" />
                    Novo quadro
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Criar quadro</DialogTitle>
                    <DialogDescription>
                        Um conjunto inicial de três colunas será criado para
                        você começar.
                    </DialogDescription>
                </DialogHeader>
                <Form
                    {...storeBoard.form()}
                    resetOnSuccess
                    className="grid gap-4"
                >
                    {({ errors, processing }) => (
                        <>
                            <label className="grid gap-1.5 text-sm">
                                Título
                                <Input name="title" required maxLength={120} />
                                {errors.title && (
                                    <span className="text-xs text-destructive">
                                        {errors.title}
                                    </span>
                                )}
                            </label>
                            <label className="grid gap-1.5 text-sm">
                                Descrição
                                <textarea
                                    name="description"
                                    rows={4}
                                    maxLength={5000}
                                    className="rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                            </label>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="grid gap-1.5 text-sm">
                                    Cor
                                    <Input
                                        name="color"
                                        type="color"
                                        defaultValue="#7c3aed"
                                        className="h-10"
                                    />
                                </label>
                                <label className="grid gap-1.5 text-sm">
                                    Visibilidade
                                    <select
                                        name="visibility"
                                        defaultValue="private"
                                        className="h-10 rounded-md border bg-background px-3 text-sm"
                                    >
                                        <option value="private">Privado</option>
                                        <option value="shared">
                                            Compartilhado
                                        </option>
                                    </select>
                                </label>
                            </div>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Criando…' : 'Criar quadro'}
                            </Button>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
