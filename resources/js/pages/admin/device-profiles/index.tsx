import { Form, Head, Link } from '@inertiajs/react';
import {
    KeyRound,
    MonitorSmartphone,
    Plus,
    Search,
    ShieldCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type ProfileType = {
    value: string;
    label: string;
};

type Profile = {
    id: number;
    name: string;
    slug: string;
    type: string;
    typeLabel: string;
    description: string | null;
    isActive: boolean;
    deviceCount: number;
    activeDeviceCount: number;
    updatedAt: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type ApiConfiguration = {
    endpoint: string;
    issuer: string;
    audience: string;
    ttlSeconds: number;
    signingKeyConfigured: boolean;
};

export default function DeviceProfileIndex({
    profiles,
    filters,
    profileTypes,
    apiConfiguration,
    status,
}: {
    profiles: {
        data: Profile[];
        links: PaginationLink[];
        total: number;
    };
    filters: { search: string; type: string; status: string };
    profileTypes: ProfileType[];
    apiConfiguration: ApiConfiguration;
    status?: string;
}) {
    return (
        <>
            <Head title="Device profiles">
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <div className="grid gap-6 p-4 sm:p-6">
                <header className="flex flex-col justify-between gap-4 border-b pb-6 lg:flex-row lg:items-end">
                    <div>
                        <p className="font-mono text-[10px] tracking-[0.18em] text-violet-600 uppercase dark:text-violet-400">
                            MDM / profile management
                        </p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight">
                            Device profiles
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                            Defina configurações assinadas e vincule somente
                            instalações previamente autorizadas.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/device-profiles/create">
                            <Plus className="size-4" />
                            Novo profile
                        </Link>
                    </Button>
                </header>

                {status && (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-100">
                        {status}
                    </div>
                )}

                <section className="grid gap-3 sm:grid-cols-3">
                    <StatusCard
                        icon={ShieldCheck}
                        label="Assinatura RS256"
                        value={
                            apiConfiguration.signingKeyConfigured
                                ? 'Configurada'
                                : 'Pendente'
                        }
                        healthy={apiConfiguration.signingKeyConfigured}
                    />
                    <StatusCard
                        icon={KeyRound}
                        label="Emissor"
                        value={apiConfiguration.issuer}
                        healthy
                    />
                    <StatusCard
                        icon={MonitorSmartphone}
                        label="Profiles"
                        value={profiles.total.toLocaleString('pt-BR')}
                        healthy
                    />
                </section>

                <Form
                    action="/admin/device-profiles"
                    method="get"
                    className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-[1fr_13rem_13rem_auto]"
                >
                    <div className="relative">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            name="search"
                            defaultValue={filters.search}
                            placeholder="Buscar por nome ou slug"
                            className="pl-9"
                        />
                    </div>
                    <select
                        name="type"
                        defaultValue={filters.type}
                        className="h-9 rounded-md border bg-background px-3 text-sm"
                    >
                        <option value="">Todos os tipos</option>
                        {profileTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                    <select
                        name="status"
                        defaultValue={filters.status}
                        className="h-9 rounded-md border bg-background px-3 text-sm"
                    >
                        <option value="">Todos os status</option>
                        <option value="active">Ativos</option>
                        <option value="inactive">Inativos</option>
                    </select>
                    <Button variant="outline">Filtrar</Button>
                </Form>

                <section className="grid gap-3">
                    {profiles.data.length === 0 ? (
                        <div className="grid min-h-56 place-items-center rounded-xl border border-dashed text-center">
                            <div>
                                <MonitorSmartphone className="mx-auto size-8 text-muted-foreground" />
                                <h2 className="mt-3 font-semibold">
                                    Nenhum profile encontrado
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Crie o primeiro profile para modo quiosque.
                                </p>
                            </div>
                        </div>
                    ) : (
                        profiles.data.map((profile) => (
                            <article
                                key={profile.id}
                                className="grid gap-4 rounded-xl border bg-card p-5 shadow-sm transition hover:border-violet-500/30 md:grid-cols-[1fr_auto_auto] md:items-center"
                            >
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="font-semibold">
                                            {profile.name}
                                        </h2>
                                        <Badge variant="outline">
                                            {profile.typeLabel}
                                        </Badge>
                                        <Badge
                                            variant={
                                                profile.isActive
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {profile.isActive
                                                ? 'Ativo'
                                                : 'Inativo'}
                                        </Badge>
                                    </div>
                                    <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                                        {profile.slug}
                                    </p>
                                    {profile.description && (
                                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                                            {profile.description}
                                        </p>
                                    )}
                                </div>
                                <div className="text-sm">
                                    <strong className="block">
                                        {profile.activeDeviceCount} ativos
                                    </strong>
                                    <span className="text-xs text-muted-foreground">
                                        {profile.deviceCount} dispositivos
                                        registrados
                                    </span>
                                </div>
                                <Button asChild variant="outline">
                                    <Link
                                        href={`/admin/device-profiles/${profile.id}/edit`}
                                    >
                                        Gerenciar
                                    </Link>
                                </Button>
                            </article>
                        ))
                    )}
                </section>

                {profiles.links.length > 3 && (
                    <nav className="flex flex-wrap gap-2">
                        {profiles.links.map((link, index) => (
                            <Button
                                key={`${link.label}-${index}`}
                                asChild={link.url !== null}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={link.url === null}
                            >
                                {link.url ? (
                                    <Link
                                        href={link.url}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ) : (
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                )}
                            </Button>
                        ))}
                    </nav>
                )}
            </div>
        </>
    );
}

function StatusCard({
    icon: Icon,
    label,
    value,
    healthy,
}: {
    icon: typeof ShieldCheck;
    label: string;
    value: string;
    healthy: boolean;
}) {
    return (
        <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
            <span
                className={`grid size-10 place-items-center rounded-lg ${
                    healthy
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}
            >
                <Icon className="size-5" />
            </span>
            <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <strong className="block truncate text-sm">{value}</strong>
            </div>
        </div>
    );
}

DeviceProfileIndex.layout = {
    breadcrumbs: [
        {
            title: 'Device profiles',
            href: '/admin/device-profiles',
        },
    ],
};
