import { arrayMove } from '@dnd-kit/helpers';
import { DragDropProvider, useDroppable } from '@dnd-kit/react';
import type { DragEndEvent } from '@dnd-kit/react';
import { isSortableOperation, useSortable } from '@dnd-kit/react/sortable';
import {
    Form,
    Head,
    Link,
    router,
    useForm,
    useHttp,
    usePage,
} from '@inertiajs/react';
import {
    Archive,
    CalendarClock,
    Check,
    CheckCircle2,
    ChevronLeft,
    Download,
    FileText,
    GripVertical,
    ListChecks,
    MessageSquare,
    MoreHorizontal,
    Paperclip,
    Plus,
    Search,
    Settings2,
    Tag,
    Trash2,
    UserRoundPlus,
    Users,
} from '@/components/bootstrap-icons';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import {
    archive as archiveBoard,
    destroy as destroyBoard,
    index as boardsIndex,
    restore as restoreBoard,
    update as updateBoard,
} from '@/routes/kanban/boards';
import { update as updateParticipants } from '@/routes/kanban/boards/participants';
import {
    archive as archiveCard,
    move as moveCard,
    store as storeCard,
    update as updateCard,
} from '@/routes/kanban/cards';
import { update as updateAssignees } from '@/routes/kanban/cards/assignees';
import { update as updateLabels } from '@/routes/kanban/cards/labels';
import {
    archive as archiveColumn,
    destroy as destroyColumn,
    store as storeColumn,
    update as updateColumn,
} from '@/routes/kanban/columns';
import {
    destroy as destroyAttachment,
    download as downloadAttachment,
    store as storeAttachment,
} from '@/routes/kanban/attachments';
import {
    destroy as destroyChecklistItem,
    store as storeChecklistItem,
    update as updateChecklistItem,
} from '@/routes/kanban/checklist-items';
import {
    destroy as destroyChecklist,
    store as storeChecklist,
} from '@/routes/kanban/checklists';
import {
    destroy as destroyComment,
    store as storeComment,
} from '@/routes/kanban/comments';
import { store as storeLabel } from '@/routes/kanban/labels';
import type {
    KanbanBoard,
    KanbanCard,
    KanbanColumn,
    KanbanUser,
} from '@/types';

type Props = {
    board: KanbanBoard;
    availableUsers: KanbanUser[];
};

type MovePayload = {
    target_column_id: number;
    target_position: number;
};

const priorityStyles = {
    low: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
    medium: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
    high: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    urgent: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
};

export default function KanbanShow({
    board: initialBoard,
    availableUsers,
}: Props) {
    const { access } = usePage().props;
    const [optimisticColumns, setOptimisticColumns] = useState<
        KanbanColumn[] | null
    >(null);
    const columns = optimisticColumns ?? initialBoard.columns;
    const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const [priority, setPriority] = useState('all');

    const moveRequest = useHttp<MovePayload, unknown>({
        target_column_id: 0,
        target_position: 0,
    });
    const selectedCard = useMemo(
        () =>
            columns
                .flatMap((column) => column.cards)
                .find((card) => card.id === selectedCardId) ?? null,
        [columns, selectedCardId],
    );
    const visibleColumns = useMemo(
        () =>
            columns.map((column) => ({
                ...column,
                cards: column.cards.filter((card) => {
                    const matchesSearch =
                        search === '' ||
                        card.title
                            .toLocaleLowerCase('pt-BR')
                            .includes(search.toLocaleLowerCase('pt-BR')) ||
                        card.description
                            ?.toLocaleLowerCase('pt-BR')
                            .includes(search.toLocaleLowerCase('pt-BR'));
                    const matchesPriority =
                        priority === 'all' || card.priority === priority;

                    return matchesSearch && matchesPriority;
                }),
            })),
        [columns, priority, search],
    );

    const handleDragEnd = (event: DragEndEvent) => {
        if (event.canceled || !event.operation.source) {
            return;
        }

        const sourceCardId = Number(event.operation.source.id);
        const sourceColumnIndex = columns.findIndex((column) =>
            column.cards.some((card) => card.id === sourceCardId),
        );
        const sourceCardIndex =
            columns[sourceColumnIndex]?.cards.findIndex(
                (card) => card.id === sourceCardId,
            ) ?? -1;

        if (sourceColumnIndex < 0 || sourceCardIndex < 0) {
            return;
        }

        let targetColumnId: number | null = null;
        let targetPosition = 0;

        if (isSortableOperation(event.operation)) {
            targetColumnId = Number(event.operation.target?.sortable.group);
            targetPosition = event.operation.target?.sortable.index ?? 0;
        } else {
            const targetData = event.operation.target?.data as
                { columnId?: number } | undefined;
            targetColumnId = targetData?.columnId ?? null;
            const targetColumn = columns.find(
                (column) => column.id === targetColumnId,
            );
            targetPosition = targetColumn?.cards.length ?? 0;
        }

        if (targetColumnId === null) {
            return;
        }

        const targetColumnIndex = columns.findIndex(
            (column) => column.id === targetColumnId,
        );

        if (targetColumnIndex < 0) {
            return;
        }

        const nextColumns = moveCardLocally(
            columns,
            sourceColumnIndex,
            sourceCardIndex,
            targetColumnIndex,
            targetPosition,
        );
        const payload = {
            target_column_id: targetColumnId,
            target_position: targetPosition,
        };

        window.setTimeout(() => {
            setOptimisticColumns(nextColumns);
            moveRequest.transform(() => payload);
            void moveRequest.patch(moveCard(sourceCardId).url, {
                onSuccess: () => {
                    router.replaceProp(
                        'board',
                        {
                            ...initialBoard,
                            columns: nextColumns,
                        },
                        {
                            onSuccess: () => {
                                setOptimisticColumns(null);
                            },
                        },
                    );
                },
                onError: () => {
                    setOptimisticColumns(null);
                },
                onNetworkError: () => {
                    setOptimisticColumns(null);
                },
            });
        }, 0);
    };

    const can = access?.permissions.kanban ?? {};

    return (
        <>
            <Head title={`${initialBoard.title} · Kanban`}>
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <header className="relative border-b bg-card/60 px-4 py-4 backdrop-blur sm:px-6">
                    <span
                        className="absolute inset-x-0 top-0 h-0.5"
                        style={{ backgroundColor: initialBoard.color }}
                    />
                    <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
                        <div className="flex min-w-0 items-center gap-3">
                            <Button asChild variant="ghost" size="icon">
                                <Link href={boardsIndex()}>
                                    <ChevronLeft className="size-4" />
                                </Link>
                            </Button>
                            <div className="min-w-0">
                                <p className="font-mono text-[9px] tracking-[0.18em] text-muted-foreground uppercase">
                                    Kanban / {initialBoard.visibility}
                                </p>
                                <h1 className="truncate text-xl font-semibold">
                                    {initialBoard.title}
                                </h1>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative min-w-52 flex-1">
                                <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Buscar cards"
                                    className="pl-9"
                                />
                            </div>
                            <select
                                value={priority}
                                onChange={(event) =>
                                    setPriority(event.target.value)
                                }
                                className="h-9 rounded-md border bg-background px-3 text-sm"
                                aria-label="Filtrar por prioridade"
                            >
                                <option value="all">Prioridades</option>
                                <option value="low">Baixa</option>
                                <option value="medium">Média</option>
                                <option value="high">Alta</option>
                                <option value="urgent">Urgente</option>
                            </select>
                            {can.manage_participants && (
                                <ParticipantsDialog
                                    board={initialBoard}
                                    users={availableUsers}
                                />
                            )}
                            {can.edit_board && (
                                <BoardSettingsDialog board={initialBoard} />
                            )}
                        </div>
                    </div>
                </header>

                <DragDropProvider onDragEnd={handleDragEnd}>
                    <main className="flex min-h-0 flex-1 gap-4 overflow-x-auto overflow-y-hidden bg-gradient-to-br from-violet-500/[0.035] via-transparent to-sky-500/[0.035] p-4 sm:p-6">
                        {visibleColumns.map((column) => (
                            <KanbanColumnView
                                key={column.id}
                                column={column}
                                canCreateCard={Boolean(can.create_card)}
                                canMoveCard={Boolean(can.move_card)}
                                canEditColumn={Boolean(can.edit_column)}
                                canArchiveColumn={Boolean(can.archive_column)}
                                canDeleteColumn={Boolean(can.delete_column)}
                                onSelectCard={setSelectedCardId}
                            />
                        ))}
                        {can.create_column && (
                            <AddColumn boardId={initialBoard.id} />
                        )}
                    </main>
                </DragDropProvider>
            </div>

            <Sheet
                open={selectedCard !== null}
                onOpenChange={(open) => !open && setSelectedCardId(null)}
            >
                <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
                    {selectedCard && (
                        <CardDetails
                            card={selectedCard}
                            board={initialBoard}
                            availableUsers={availableUsers}
                            permissions={can}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
}

function KanbanColumnView({
    column,
    canCreateCard,
    canMoveCard,
    canEditColumn,
    canArchiveColumn,
    canDeleteColumn,
    onSelectCard,
}: {
    column: KanbanColumn;
    canCreateCard: boolean;
    canMoveCard: boolean;
    canEditColumn: boolean;
    canArchiveColumn: boolean;
    canDeleteColumn: boolean;
    onSelectCard: (id: number) => void;
}) {
    const { ref, isDropTarget } = useDroppable({
        id: `column-${column.id}`,
        data: { columnId: column.id },
        type: 'kanban-column',
        accept: 'kanban-card',
    });

    return (
        <section
            ref={ref}
            className={cn(
                'flex max-h-full w-[19rem] shrink-0 flex-col rounded-2xl border bg-muted/55 shadow-sm transition',
                isDropTarget && 'border-violet-500/60 bg-violet-500/10',
            )}
        >
            <header className="flex items-center justify-between gap-3 px-3 py-3">
                <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold">
                        {column.title}
                    </h2>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {column.cards.length}
                        {column.cardLimit
                            ? ` / ${column.cardLimit} cards`
                            : ' cards'}
                    </p>
                </div>
                {(canEditColumn || canArchiveColumn || canDeleteColumn) && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                                <MoreHorizontal className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {canEditColumn && (
                                <ColumnEditDialog column={column} />
                            )}
                            {canArchiveColumn && (
                                <DropdownMenuItem
                                    onSelect={() =>
                                        router.post(
                                            archiveColumn(column.id).url,
                                        )
                                    }
                                >
                                    <Archive className="size-4" />
                                    Arquivar
                                </DropdownMenuItem>
                            )}
                            {canDeleteColumn && (
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onSelect={() =>
                                        router.delete(
                                            destroyColumn(column.id).url,
                                        )
                                    }
                                >
                                    <Trash2 className="size-4" />
                                    Excluir se vazia
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </header>

            <div className="grid min-h-20 flex-1 gap-2 overflow-y-auto px-2 pb-2">
                {column.cards.map((card, index) => (
                    <SortableCard
                        key={card.id}
                        card={card}
                        index={index}
                        columnId={column.id}
                        disabled={!canMoveCard}
                        onSelect={() => onSelectCard(card.id)}
                    />
                ))}
                {column.cards.length === 0 && (
                    <div className="grid min-h-24 place-items-center rounded-xl border border-dashed text-center text-xs text-muted-foreground">
                        Solte um card aqui
                    </div>
                )}
            </div>

            {canCreateCard && <AddCard columnId={column.id} />}
        </section>
    );
}

function SortableCard({
    card,
    index,
    columnId,
    disabled,
    onSelect,
}: {
    card: KanbanCard;
    index: number;
    columnId: number;
    disabled: boolean;
    onSelect: () => void;
}) {
    const { ref, handleRef, isDragging } = useSortable({
        id: card.id,
        index,
        group: columnId,
        type: 'kanban-card',
        accept: 'kanban-card',
        data: { cardId: card.id, columnId },
        disabled,
    });
    const checklistItems = card.checklists.flatMap(
        (checklist) => checklist.items,
    );
    const completedItems = checklistItems.filter(
        (item) => item.completedAt !== null,
    ).length;

    return (
        <article
            ref={ref}
            className={cn(
                'group rounded-xl border bg-card p-3 shadow-sm transition hover:border-violet-500/30 hover:shadow-md',
                isDragging && 'scale-[1.02] opacity-55 shadow-xl',
            )}
        >
            <div className="flex items-start gap-2">
                {!disabled && (
                    <button
                        ref={handleRef}
                        type="button"
                        className="mt-0.5 cursor-grab text-muted-foreground opacity-60 outline-none hover:text-violet-500 focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
                        aria-label={`Mover ${card.title}`}
                    >
                        <GripVertical className="size-4" />
                    </button>
                )}
                <button
                    type="button"
                    onClick={onSelect}
                    className="min-w-0 flex-1 text-left outline-none"
                >
                    <div className="flex flex-wrap gap-1">
                        {card.labels.map((label) => (
                            <span
                                key={label.id}
                                className="h-1.5 w-8 rounded-full"
                                style={{ backgroundColor: label.color }}
                                title={label.name}
                            />
                        ))}
                    </div>
                    <h3 className="mt-2 text-sm leading-5 font-medium">
                        {card.title}
                    </h3>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                        <span
                            className={cn(
                                'rounded-full px-2 py-0.5 font-medium',
                                priorityStyles[card.priority],
                            )}
                        >
                            {card.priority}
                        </span>
                        {card.dueAt && (
                            <span
                                className={cn(
                                    'flex items-center gap-1',
                                    card.isOverdue && 'text-rose-500',
                                )}
                            >
                                <CalendarClock className="size-3" />
                                {new Intl.DateTimeFormat('pt-BR').format(
                                    new Date(card.dueAt),
                                )}
                            </span>
                        )}
                        {checklistItems.length > 0 && (
                            <span className="flex items-center gap-1">
                                <ListChecks className="size-3" />
                                {completedItems}/{checklistItems.length}
                            </span>
                        )}
                        {card.comments.length > 0 && (
                            <span className="flex items-center gap-1">
                                <MessageSquare className="size-3" />
                                {card.comments.length}
                            </span>
                        )}
                        {card.attachments.length > 0 && (
                            <span className="flex items-center gap-1">
                                <Paperclip className="size-3" />
                                {card.attachments.length}
                            </span>
                        )}
                    </div>
                </button>
            </div>
        </article>
    );
}

function AddCard({ columnId }: { columnId: number }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    className="m-2 mt-0 justify-start text-muted-foreground"
                >
                    <Plus className="size-4" />
                    Adicionar card
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Novo card</DialogTitle>
                    <DialogDescription>
                        Registre uma tarefa clara e ajuste os detalhes depois.
                    </DialogDescription>
                </DialogHeader>
                <Form
                    {...storeCard.form(columnId)}
                    resetOnSuccess
                    className="grid gap-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <label className="grid gap-1.5 text-sm">
                                Título
                                <Input name="title" required maxLength={160} />
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
                                    className="rounded-md border bg-transparent p-3 text-sm"
                                />
                            </label>
                            <label className="grid gap-1.5 text-sm">
                                Prioridade
                                <select
                                    name="priority"
                                    defaultValue="medium"
                                    className="h-10 rounded-md border bg-background px-3"
                                >
                                    <option value="low">Baixa</option>
                                    <option value="medium">Média</option>
                                    <option value="high">Alta</option>
                                    <option value="urgent">Urgente</option>
                                </select>
                            </label>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Criando…' : 'Criar card'}
                            </Button>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function AddColumn({ boardId }: { boardId: number }) {
    return (
        <Form
            {...storeColumn.form(boardId)}
            resetOnSuccess
            className="h-fit w-[19rem] shrink-0 rounded-2xl border border-dashed bg-card/50 p-3"
        >
            {({ processing, errors }) => (
                <>
                    <Input
                        name="title"
                        placeholder="Nome da nova coluna"
                        required
                        maxLength={80}
                    />
                    {errors.title && (
                        <span className="mt-1 text-xs text-destructive">
                            {errors.title}
                        </span>
                    )}
                    <Button
                        type="submit"
                        size="sm"
                        className="mt-2 w-full"
                        disabled={processing}
                    >
                        <Plus className="size-4" />
                        Adicionar coluna
                    </Button>
                </>
            )}
        </Form>
    );
}

function ColumnEditDialog({ column }: { column: KanbanColumn }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                    <Settings2 className="size-4" />
                    Editar coluna
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar coluna</DialogTitle>
                </DialogHeader>
                <Form {...updateColumn.form(column.id)} className="grid gap-4">
                    {({ processing }) => (
                        <>
                            <Input
                                name="title"
                                defaultValue={column.title}
                                required
                            />
                            <Input
                                name="card_limit"
                                type="number"
                                min={1}
                                max={999}
                                defaultValue={column.cardLimit ?? ''}
                                placeholder="Limite opcional de cards"
                            />
                            <Button type="submit" disabled={processing}>
                                Salvar coluna
                            </Button>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function BoardSettingsDialog({ board }: { board: KanbanBoard }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                    <Settings2 className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Configurar quadro</DialogTitle>
                    <DialogDescription>
                        Aparência, descrição e ciclo de vida do quadro.
                    </DialogDescription>
                </DialogHeader>
                <Form {...updateBoard.form(board.id)} className="grid gap-4">
                    {({ processing }) => (
                        <>
                            <Input
                                name="title"
                                defaultValue={board.title}
                                required
                            />
                            <textarea
                                name="description"
                                defaultValue={board.description ?? ''}
                                rows={4}
                                className="rounded-md border bg-transparent p-3 text-sm"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    name="color"
                                    type="color"
                                    defaultValue={board.color}
                                />
                                <select
                                    name="visibility"
                                    defaultValue={board.visibility}
                                    className="rounded-md border bg-background px-3 text-sm"
                                >
                                    <option value="private">Privado</option>
                                    <option value="shared">
                                        Compartilhado
                                    </option>
                                </select>
                            </div>
                            <Button type="submit" disabled={processing}>
                                Salvar quadro
                            </Button>
                        </>
                    )}
                </Form>
                <div className="flex gap-2 border-t pt-4">
                    <Button
                        variant="outline"
                        onClick={() =>
                            router.post(
                                board.archivedAt
                                    ? restoreBoard(board.id).url
                                    : archiveBoard(board.id).url,
                            )
                        }
                    >
                        <Archive className="size-4" />
                        {board.archivedAt ? 'Restaurar' : 'Arquivar'}
                    </Button>
                    {board.archivedAt && (
                        <Button
                            variant="destructive"
                            onClick={() =>
                                router.delete(destroyBoard(board.id).url)
                            }
                        >
                            <Trash2 className="size-4" />
                            Excluir definitivamente
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function ParticipantsDialog({
    board,
    users,
}: {
    board: KanbanBoard;
    users: KanbanUser[];
}) {
    const participantIds = board.participants.map((user) => user.id);
    const form = useForm<{ user_ids: number[] }>({
        user_ids: participantIds,
    });

    const toggle = (userId: number, checked: boolean) => {
        form.setData(
            'user_ids',
            checked
                ? [...form.data.user_ids, userId]
                : form.data.user_ids.filter((id) => id !== userId),
        );
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Users className="size-4" />
                    {board.participants.length + 1}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Participantes</DialogTitle>
                    <DialogDescription>
                        Somente participantes poderão acessar o conteúdo deste
                        quadro.
                    </DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.put(updateParticipants(board.id).url);
                    }}
                    className="grid gap-4"
                >
                    <div className="grid max-h-72 gap-2 overflow-y-auto">
                        {users
                            .filter((user) => user.id !== board.owner.id)
                            .map((user) => (
                                <label
                                    key={user.id}
                                    className="flex items-center gap-3 rounded-lg border p-3"
                                >
                                    <Checkbox
                                        checked={form.data.user_ids.includes(
                                            user.id,
                                        )}
                                        onCheckedChange={(checked) =>
                                            toggle(user.id, checked === true)
                                        }
                                    />
                                    <span>
                                        <strong className="block text-sm">
                                            {user.name}
                                        </strong>
                                        <span className="text-xs text-muted-foreground">
                                            {user.email}
                                        </span>
                                    </span>
                                </label>
                            ))}
                    </div>
                    <Button type="submit" disabled={form.processing}>
                        Salvar participantes
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function CardDetails({
    card,
    board,
    availableUsers,
    permissions,
}: {
    card: KanbanCard;
    board: KanbanBoard;
    availableUsers: KanbanUser[];
    permissions: Record<string, boolean>;
}) {
    return (
        <>
            <SheetHeader className="border-b">
                <div className="flex flex-wrap gap-1 pr-8">
                    {card.labels.map((label) => (
                        <span
                            key={label.id}
                            className="rounded-full px-2 py-0.5 text-[10px] text-white"
                            style={{ backgroundColor: label.color }}
                        >
                            {label.name}
                        </span>
                    ))}
                </div>
                <SheetTitle className="text-xl">{card.title}</SheetTitle>
                <SheetDescription>
                    Card #{card.id} · {card.priority}
                </SheetDescription>
            </SheetHeader>

            <div className="grid gap-7 p-4">
                {permissions.edit_card && <EditCardForm card={card} />}

                <section className="grid gap-3">
                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                        <UserRoundPlus className="size-4 text-violet-500" />
                        Responsáveis
                    </h3>
                    <AssignmentEditor
                        card={card}
                        board={board}
                        users={availableUsers}
                        disabled={!permissions.manage_assignees}
                    />
                </section>

                <section className="grid gap-3">
                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                        <Tag className="size-4 text-violet-500" />
                        Etiquetas
                    </h3>
                    <LabelEditor
                        card={card}
                        board={board}
                        disabled={!permissions.manage_labels}
                    />
                </section>

                <ChecklistSection
                    card={card}
                    enabled={Boolean(permissions.manage_checklists)}
                />
                <CommentSection
                    card={card}
                    enabled={Boolean(permissions.comment)}
                />
                <AttachmentSection
                    card={card}
                    enabled={Boolean(permissions.manage_attachments)}
                />

                <section className="grid gap-3">
                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                        <FileText className="size-4 text-violet-500" />
                        Atividade
                    </h3>
                    <div className="grid gap-2 border-l pl-4">
                        {card.activities.map((activity) => (
                            <div key={activity.id} className="text-xs">
                                <strong>
                                    {activity.actor?.name ?? 'Sistema'}
                                </strong>{' '}
                                <span className="text-muted-foreground">
                                    {activity.type.replaceAll('_', ' ')}
                                    {activity.createdAt &&
                                        ` · ${new Intl.DateTimeFormat('pt-BR', {
                                            dateStyle: 'short',
                                            timeStyle: 'short',
                                        }).format(
                                            new Date(activity.createdAt),
                                        )}`}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {permissions.archive_card && (
                    <Button
                        variant="outline"
                        onClick={() =>
                            router.post(archiveCard(card.id).url, undefined, {
                                onSuccess: () => router.reload(),
                            })
                        }
                    >
                        <Archive className="size-4" />
                        Arquivar card
                    </Button>
                )}
            </div>
        </>
    );
}

function EditCardForm({ card }: { card: KanbanCard }) {
    return (
        <Form {...updateCard.form(card.id)} className="grid gap-3">
            {({ processing, errors }) => (
                <>
                    <Input name="title" defaultValue={card.title} required />
                    <textarea
                        name="description"
                        defaultValue={card.description ?? ''}
                        rows={5}
                        className="rounded-md border bg-transparent p-3 text-sm"
                    />
                    <div className="grid gap-3 sm:grid-cols-3">
                        <select
                            name="priority"
                            defaultValue={card.priority}
                            className="h-9 rounded-md border bg-background px-3 text-sm"
                        >
                            <option value="low">Baixa</option>
                            <option value="medium">Média</option>
                            <option value="high">Alta</option>
                            <option value="urgent">Urgente</option>
                        </select>
                        <Input
                            type="datetime-local"
                            name="starts_at"
                            defaultValue={toLocalInput(card.startsAt)}
                        />
                        <Input
                            type="datetime-local"
                            name="due_at"
                            defaultValue={toLocalInput(card.dueAt)}
                        />
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                        <input type="hidden" name="completed" value="0" />
                        <Checkbox
                            name="completed"
                            value="1"
                            defaultChecked={card.completedAt !== null}
                        />
                        Concluído
                    </label>
                    {errors.due_at && (
                        <span className="text-xs text-destructive">
                            {errors.due_at}
                        </span>
                    )}
                    <Button type="submit" size="sm" disabled={processing}>
                        <Check className="size-4" />
                        Salvar detalhes
                    </Button>
                </>
            )}
        </Form>
    );
}

function AssignmentEditor({
    card,
    board,
    users,
    disabled,
}: {
    card: KanbanCard;
    board: KanbanBoard;
    users: KanbanUser[];
    disabled: boolean;
}) {
    const allowedIds = new Set([
        board.owner.id,
        ...board.participants.map((user) => user.id),
    ]);
    const form = useForm<{ user_ids: number[] }>({
        user_ids: card.assignees.map((user) => user.id),
    });

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                form.put(updateAssignees(card.id).url, {
                    preserveScroll: true,
                });
            }}
            className="grid gap-2"
        >
            <div className="flex flex-wrap gap-2">
                {users
                    .filter((user) => allowedIds.has(user.id))
                    .map((user) => {
                        const selected = form.data.user_ids.includes(user.id);

                        return (
                            <button
                                key={user.id}
                                type="button"
                                disabled={disabled}
                                onClick={() =>
                                    form.setData(
                                        'user_ids',
                                        selected
                                            ? form.data.user_ids.filter(
                                                  (id) => id !== user.id,
                                              )
                                            : [...form.data.user_ids, user.id],
                                    )
                                }
                                className={cn(
                                    'rounded-full border px-3 py-1 text-xs transition',
                                    selected &&
                                        'border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300',
                                )}
                            >
                                {user.name}
                            </button>
                        );
                    })}
            </div>
            {!disabled && (
                <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    disabled={form.processing}
                >
                    Salvar responsáveis
                </Button>
            )}
        </form>
    );
}

function LabelEditor({
    card,
    board,
    disabled,
}: {
    card: KanbanCard;
    board: KanbanBoard;
    disabled: boolean;
}) {
    const form = useForm<{ label_ids: number[] }>({
        label_ids: card.labels.map((label) => label.id),
    });

    return (
        <div className="grid gap-3">
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    form.put(updateLabels(card.id).url, {
                        preserveScroll: true,
                    });
                }}
                className="grid gap-2"
            >
                <div className="flex flex-wrap gap-2">
                    {board.labels.map((label) => {
                        const selected = form.data.label_ids.includes(label.id);

                        return (
                            <button
                                key={label.id}
                                type="button"
                                disabled={disabled}
                                onClick={() =>
                                    form.setData(
                                        'label_ids',
                                        selected
                                            ? form.data.label_ids.filter(
                                                  (id) => id !== label.id,
                                              )
                                            : [
                                                  ...form.data.label_ids,
                                                  label.id,
                                              ],
                                    )
                                }
                                className={cn(
                                    'rounded-full border px-3 py-1 text-xs',
                                    selected && 'ring-2 ring-violet-500/40',
                                )}
                                style={{
                                    borderColor: label.color,
                                }}
                            >
                                {label.name}
                            </button>
                        );
                    })}
                </div>
                {!disabled && (
                    <Button
                        type="submit"
                        size="sm"
                        variant="outline"
                        disabled={form.processing}
                    >
                        Salvar etiquetas
                    </Button>
                )}
            </form>
            {!disabled && (
                <Form
                    {...storeLabel.form(board.id)}
                    resetOnSuccess
                    className="flex gap-2"
                >
                    <Input
                        name="name"
                        placeholder="Nova etiqueta"
                        className="flex-1"
                    />
                    <Input
                        name="color"
                        type="color"
                        defaultValue="#7c3aed"
                        className="w-14"
                    />
                    <Button type="submit" size="icon" variant="outline">
                        <Plus className="size-4" />
                    </Button>
                </Form>
            )}
        </div>
    );
}

function ChecklistSection({
    card,
    enabled,
}: {
    card: KanbanCard;
    enabled: boolean;
}) {
    return (
        <section className="grid gap-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
                <ListChecks className="size-4 text-violet-500" />
                Checklists
            </h3>
            {card.checklists.map((checklist) => (
                <div key={checklist.id} className="rounded-xl border p-3">
                    <div className="flex items-center justify-between gap-3">
                        <strong className="text-sm">{checklist.title}</strong>
                        {enabled && (
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() =>
                                    router.delete(
                                        destroyChecklist(checklist.id).url,
                                        { preserveScroll: true },
                                    )
                                }
                            >
                                <Trash2 className="size-3.5" />
                            </Button>
                        )}
                    </div>
                    <div className="mt-3 grid gap-2">
                        {checklist.items.map((item) => (
                            <Form
                                key={item.id}
                                {...updateChecklistItem.form(item.id)}
                                className="flex items-center gap-2"
                            >
                                <input
                                    type="hidden"
                                    name="content"
                                    value={item.content}
                                />
                                <input
                                    type="hidden"
                                    name="completed"
                                    value={item.completedAt ? '0' : '1'}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    variant="ghost"
                                    disabled={!enabled}
                                >
                                    {item.completedAt ? (
                                        <CheckCircle2 className="size-4 text-emerald-500" />
                                    ) : (
                                        <span className="size-4 rounded-full border" />
                                    )}
                                </Button>
                                <span
                                    className={cn(
                                        'flex-1 text-sm',
                                        item.completedAt &&
                                            'text-muted-foreground line-through',
                                    )}
                                >
                                    {item.content}
                                </span>
                                {enabled && (
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        onClick={() =>
                                            router.delete(
                                                destroyChecklistItem(item.id)
                                                    .url,
                                                { preserveScroll: true },
                                            )
                                        }
                                    >
                                        <Trash2 className="size-3.5" />
                                    </Button>
                                )}
                            </Form>
                        ))}
                    </div>
                    {enabled && (
                        <Form
                            {...storeChecklistItem.form(checklist.id)}
                            resetOnSuccess
                            className="mt-3 flex gap-2"
                        >
                            <Input
                                name="content"
                                placeholder="Novo item"
                                required
                            />
                            <Button type="submit" size="icon" variant="outline">
                                <Plus className="size-4" />
                            </Button>
                        </Form>
                    )}
                </div>
            ))}
            {enabled && (
                <Form
                    {...storeChecklist.form(card.id)}
                    resetOnSuccess
                    className="flex gap-2"
                >
                    <Input
                        name="title"
                        placeholder="Título do checklist"
                        required
                    />
                    <Button type="submit" variant="outline">
                        <Plus className="size-4" />
                        Checklist
                    </Button>
                </Form>
            )}
        </section>
    );
}

function CommentSection({
    card,
    enabled,
}: {
    card: KanbanCard;
    enabled: boolean;
}) {
    const currentUserId = usePage().props.auth.user.id;

    return (
        <section className="grid gap-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
                <MessageSquare className="size-4 text-violet-500" />
                Comentários
            </h3>
            <div className="grid gap-2">
                {card.comments.map((comment) => (
                    <article
                        key={comment.id}
                        className="rounded-xl bg-muted/60 p-3"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <strong className="text-xs">
                                {comment.author?.name ?? 'Usuário removido'}
                            </strong>
                            {enabled &&
                                comment.author?.id === currentUserId && (
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() =>
                                            router.delete(
                                                destroyComment(comment.id).url,
                                                { preserveScroll: true },
                                            )
                                        }
                                    >
                                        <Trash2 className="size-3" />
                                    </Button>
                                )}
                        </div>
                        <p className="mt-1 text-sm whitespace-pre-wrap">
                            {comment.body}
                        </p>
                    </article>
                ))}
            </div>
            {enabled && (
                <Form
                    {...storeComment.form(card.id)}
                    resetOnSuccess
                    className="grid gap-2"
                >
                    <textarea
                        name="body"
                        rows={3}
                        required
                        placeholder="Escreva um comentário"
                        className="rounded-md border bg-transparent p-3 text-sm"
                    />
                    <Button type="submit" size="sm">
                        Comentar
                    </Button>
                </Form>
            )}
        </section>
    );
}

function AttachmentSection({
    card,
    enabled,
}: {
    card: KanbanCard;
    enabled: boolean;
}) {
    return (
        <section className="grid gap-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Paperclip className="size-4 text-violet-500" />
                Anexos
            </h3>
            <div className="grid gap-2">
                {card.attachments.map((attachment) => (
                    <div
                        key={attachment.id}
                        className="flex items-center gap-3 rounded-xl border p-3"
                    >
                        <FileText className="size-4 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                            <strong className="block truncate text-xs">
                                {attachment.name}
                            </strong>
                            <span className="text-[10px] text-muted-foreground">
                                {formatBytes(attachment.sizeBytes)}
                            </span>
                        </div>
                        <Button asChild size="icon" variant="ghost">
                            <a
                                href={downloadAttachment(attachment.id).url}
                                aria-label={`Baixar ${attachment.name}`}
                            >
                                <Download className="size-4" />
                            </a>
                        </Button>
                        {enabled && (
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() =>
                                    router.delete(
                                        destroyAttachment(attachment.id).url,
                                        { preserveScroll: true },
                                    )
                                }
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        )}
                    </div>
                ))}
            </div>
            {enabled && (
                <Form
                    {...storeAttachment.form(card.id)}
                    resetOnSuccess
                    className="flex gap-2"
                >
                    {({ processing, progress, errors }) => (
                        <>
                            <Input
                                name="file"
                                type="file"
                                required
                                accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,.zip"
                            />
                            <Button type="submit" disabled={processing}>
                                {progress
                                    ? `${progress.percentage ?? 0}%`
                                    : 'Enviar'}
                            </Button>
                            {errors.file && (
                                <span className="text-xs text-destructive">
                                    {errors.file}
                                </span>
                            )}
                        </>
                    )}
                </Form>
            )}
        </section>
    );
}

function moveCardLocally(
    columns: KanbanColumn[],
    sourceColumnIndex: number,
    sourceCardIndex: number,
    targetColumnIndex: number,
    targetPosition: number,
): KanbanColumn[] {
    const next = structuredClone(columns);

    if (sourceColumnIndex === targetColumnIndex) {
        next[sourceColumnIndex].cards = arrayMove(
            next[sourceColumnIndex].cards,
            sourceCardIndex,
            Math.min(targetPosition, next[sourceColumnIndex].cards.length - 1),
        ).map((card, position) => ({ ...card, position }));

        return next;
    }

    const [card] = next[sourceColumnIndex].cards.splice(sourceCardIndex, 1);
    const insertAt = Math.min(
        targetPosition,
        next[targetColumnIndex].cards.length,
    );
    next[targetColumnIndex].cards.splice(insertAt, 0, {
        ...card,
        columnId: next[targetColumnIndex].id,
    });
    next[sourceColumnIndex].cards = next[sourceColumnIndex].cards.map(
        (item, position) => ({ ...item, position }),
    );
    next[targetColumnIndex].cards = next[targetColumnIndex].cards.map(
        (item, position) => ({ ...item, position }),
    );

    return next;
}

function toLocalInput(value: string | null): string {
    if (!value) {
        return '';
    }

    const date = new Date(value);
    const timezoneOffset = date.getTimezoneOffset() * 60000;

    return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
