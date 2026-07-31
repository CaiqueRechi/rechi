import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Check,
    Search,
    ShieldCheck,
    ShieldQuestion,
    UserCog,
} from '@/components/bootstrap-icons';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { update as updateAccess } from '@/routes/admin/access';
import { index as accessIndex } from '@/routes/admin/access';

type Permission = {
    key: string;
    label: string;
    default: boolean;
    critical: boolean;
};

type Module = {
    key: string;
    label: string;
    permissions: Permission[];
};

type ManagedUser = {
    id: number;
    name: string;
    email: string;
    isOwner: boolean;
    accesses: Record<string, Record<string, boolean>>;
    configured: Record<string, boolean>;
    version: string | null;
};

type PaginatedUsers = {
    data: ManagedUser[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    current_page: number;
    last_page: number;
    total: number;
};

type Props = {
    catalogue: Module[];
    users: PaginatedUsers;
    filters: { search: string };
};

export default function AccessIndex({ catalogue, users, filters }: Props) {
    const { access, auth } = usePage().props;
    const [search, setSearch] = useState(filters.search);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(
        users.data[0]?.id ?? null,
    );
    const selectedUser = useMemo(
        () => users.data.find((user) => user.id === selectedUserId) ?? null,
        [selectedUserId, users.data],
    );

    const submitSearch = (event: React.FormEvent) => {
        event.preventDefault();
        router.get(
            accessIndex().url,
            { search },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Controle de acessos">
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
                <header className="flex flex-col justify-between gap-5 border-b pb-6 lg:flex-row lg:items-end">
                    <div>
                        <p className="font-mono text-[10px] tracking-[0.18em] text-violet-600 uppercase dark:text-violet-400">
                            Segurança / autorização
                        </p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight">
                            Controle de acessos
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                            Permissões explícitas, extensíveis e auditadas para
                            cada pessoa.
                        </p>
                    </div>
                    <form
                        onSubmit={submitSearch}
                        className="flex w-full max-w-md gap-2"
                    >
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Buscar nome ou e-mail"
                            aria-label="Buscar usuários"
                        />
                        <Button type="submit" variant="outline" size="icon">
                            <Search className="size-4" />
                        </Button>
                    </form>
                </header>

                <div className="grid min-h-[36rem] gap-4 xl:grid-cols-[19rem_minmax(0,1fr)]">
                    <aside className="overflow-hidden rounded-2xl border bg-card">
                        <div className="border-b px-4 py-3 text-xs text-muted-foreground">
                            {users.total} usuário(s)
                        </div>
                        <div className="grid max-h-[34rem] gap-1 overflow-y-auto p-2">
                            {users.data.map((user) => (
                                <button
                                    key={user.id}
                                    type="button"
                                    onClick={() => setSelectedUserId(user.id)}
                                    className={`rounded-xl px-3 py-3 text-left transition ${
                                        selectedUserId === user.id
                                            ? 'bg-violet-500/10 ring-1 ring-violet-500/25'
                                            : 'hover:bg-muted'
                                    }`}
                                >
                                    <span className="flex items-center gap-2 text-sm font-medium">
                                        {user.isOwner ? (
                                            <ShieldCheck className="size-4 text-violet-500" />
                                        ) : (
                                            <UserCog className="size-4 text-muted-foreground" />
                                        )}
                                        {user.name}
                                    </span>
                                    <span className="mt-1 block truncate text-xs text-muted-foreground">
                                        {user.email}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </aside>

                    {selectedUser ? (
                        <AccessEditor
                            key={`${selectedUser.id}-${selectedUser.version}`}
                            user={selectedUser}
                            catalogue={catalogue}
                            canUpdate={
                                Boolean(
                                    access?.permissions.access_management
                                        ?.update,
                                ) &&
                                !selectedUser.isOwner &&
                                selectedUser.id !== auth.user.id
                            }
                        />
                    ) : (
                        <div className="grid place-items-center rounded-2xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
                            Nenhum usuário encontrado.
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function AccessEditor({
    user,
    catalogue,
    canUpdate,
}: {
    user: ManagedUser;
    catalogue: Module[];
    canUpdate: boolean;
}) {
    const { data, setData, put, processing, errors, recentlySuccessful } =
        useForm({
            accesses: structuredClone(user.accesses),
            version: user.version,
        });

    const togglePermission = (
        moduleKey: string,
        permissionKey: string,
        granted: boolean,
    ) => {
        setData('accesses', {
            ...data.accesses,
            [moduleKey]: {
                ...data.accesses[moduleKey],
                [permissionKey]: granted,
            },
        });
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        put(updateAccess(user.id).url, { preserveScroll: true });
    };

    return (
        <form
            onSubmit={submit}
            className="overflow-hidden rounded-2xl border bg-card"
        >
            <div className="flex flex-col justify-between gap-4 border-b px-5 py-4 sm:flex-row sm:items-center">
                <div>
                    <h2 className="font-semibold">{user.name}</h2>
                    <p className="text-xs text-muted-foreground">
                        {user.email}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {recentlySuccessful && (
                        <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                            <Check className="size-3.5" />
                            Salvo
                        </span>
                    )}
                    <Button type="submit" disabled={!canUpdate || processing}>
                        {processing ? 'Salvando…' : 'Salvar acessos'}
                    </Button>
                </div>
            </div>

            {user.isOwner && (
                <div className="m-5 flex gap-3 rounded-xl border border-violet-500/25 bg-violet-500/10 p-4 text-sm">
                    <ShieldCheck className="mt-0.5 size-5 shrink-0 text-violet-500" />
                    O proprietário mantém acesso total efetivo e não pode ser
                    rebaixado por esta interface.
                </div>
            )}

            {(errors.accesses || errors.version) && (
                <p className="mx-5 mt-5 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {errors.accesses || errors.version}
                </p>
            )}

            <div className="grid gap-4 p-5 lg:grid-cols-2">
                {catalogue.map((module) => (
                    <fieldset
                        key={module.key}
                        disabled={!canUpdate}
                        className="rounded-xl border p-4"
                    >
                        <legend className="px-2 text-sm font-semibold">
                            {module.label}
                        </legend>
                        <div className="mt-2 grid gap-3">
                            {module.permissions.map((permission) => {
                                const path = `${module.key}.${permission.key}`;
                                const configured =
                                    user.configured[path] ?? false;

                                return (
                                    <label
                                        key={permission.key}
                                        className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition hover:bg-muted/60"
                                    >
                                        <Checkbox
                                            checked={
                                                data.accesses[module.key]?.[
                                                    permission.key
                                                ] ?? permission.default
                                            }
                                            onCheckedChange={(checked) =>
                                                togglePermission(
                                                    module.key,
                                                    permission.key,
                                                    checked === true,
                                                )
                                            }
                                            aria-label={permission.label}
                                        />
                                        <span className="min-w-0">
                                            <span className="flex items-center gap-2 text-sm">
                                                {permission.label}
                                                {permission.critical && (
                                                    <ShieldQuestion className="size-3.5 text-amber-500" />
                                                )}
                                            </span>
                                            <span className="mt-0.5 block text-[10px] tracking-wide text-muted-foreground uppercase">
                                                {configured
                                                    ? 'Configurada'
                                                    : 'Nova / usando padrão'}
                                            </span>
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </fieldset>
                ))}
            </div>
        </form>
    );
}
