import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    Copy,
    KeyRound,
    MonitorSmartphone,
    ShieldCheck,
    Smartphone,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    config: { url: string };
    isActive: boolean;
    deviceCount: number;
    activeDeviceCount: number;
};

type Device = {
    id: number;
    label: string | null;
    deviceUuid: string;
    firstConnectionDate: string | null;
    lastConnectedAt: string | null;
    revokedAt: string | null;
    createdAt: string | null;
};

type ApiConfiguration = {
    baseUrl: string;
    endpoint: string;
    issuer: string;
    audience: string;
    ttlSeconds: number;
    publicKeyBase64: string | null;
    signingKeyConfigured: boolean;
};

export default function DeviceProfileForm({
    profile,
    devices,
    profileTypes,
    apiConfiguration,
    status,
}: {
    profile: Profile | null;
    devices: { data: Device[] } | null;
    profileTypes: ProfileType[];
    apiConfiguration: ApiConfiguration;
    status?: string;
}) {
    const { access } = usePage().props;
    const [selectedType, setSelectedType] = useState(
        profile?.type ?? profileTypes[0]?.value ?? 'kiosk',
    );
    const canUpdate = Boolean(access?.permissions.device_profiles?.update);
    const canManageDevices = Boolean(
        access?.permissions.device_profiles?.manage_devices,
    );
    const canDelete = Boolean(access?.permissions.device_profiles?.delete);
    const action = profile
        ? `/admin/device-profiles/${profile.id}`
        : '/admin/device-profiles';

    return (
        <>
            <Head title={profile ? `Profile: ${profile.name}` : 'Novo profile'}>
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <div className="mx-auto grid w-full max-w-6xl gap-6 p-4 sm:p-6">
                <header className="flex flex-col justify-between gap-4 border-b pb-6 lg:flex-row lg:items-end">
                    <div>
                        <p className="font-mono text-[10px] tracking-[0.18em] text-violet-600 uppercase dark:text-violet-400">
                            MDM /{' '}
                            {profile ? profile.slug : 'novo profile seguro'}
                        </p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight">
                            {profile ? profile.name : 'Criar device profile'}
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                            Profiles mantêm configurações não secretas em JSON.
                            Chaves privadas permanecem somente no ambiente do
                            servidor.
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/admin/device-profiles">
                            Voltar aos profiles
                        </Link>
                    </Button>
                </header>

                {status && (
                    <div className="flex gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-900 dark:text-emerald-100">
                        <CheckCircle2 className="size-5 shrink-0" />
                        {status}
                    </div>
                )}

                <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
                    <Form
                        action={action}
                        method={profile ? 'put' : 'post'}
                        className="grid gap-5 rounded-xl border bg-card p-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div>
                                    <h2 className="font-semibold">
                                        Configuração do profile
                                    </h2>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        O tipo controla o schema aceito dentro
                                        de <code>config</code>.
                                    </p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Nome</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            defaultValue={profile?.name}
                                            maxLength={120}
                                            required
                                            disabled={
                                                profile !== null && !canUpdate
                                            }
                                        />
                                        <InputError message={errors.name} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="slug">
                                            Identificador
                                        </Label>
                                        <Input
                                            id="slug"
                                            name="slug"
                                            defaultValue={profile?.slug}
                                            placeholder="quiosque-producao"
                                            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                                            maxLength={140}
                                            required
                                            disabled={
                                                profile !== null && !canUpdate
                                            }
                                        />
                                        <InputError message={errors.slug} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="type">
                                        Tipo de profile
                                    </Label>
                                    <select
                                        id="type"
                                        name="type"
                                        value={selectedType}
                                        onChange={(event) =>
                                            setSelectedType(event.target.value)
                                        }
                                        className="h-9 rounded-md border bg-background px-3 text-sm"
                                        disabled={
                                            profile !== null && !canUpdate
                                        }
                                    >
                                        {profileTypes.map((type) => (
                                            <option
                                                key={type.value}
                                                value={type.value}
                                            >
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.type} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description">
                                        Descrição
                                    </Label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        defaultValue={
                                            profile?.description ?? ''
                                        }
                                        maxLength={5000}
                                        className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm"
                                        disabled={
                                            profile !== null && !canUpdate
                                        }
                                    />
                                    <InputError message={errors.description} />
                                </div>

                                {selectedType === 'kiosk' && (
                                    <div className="grid gap-4 rounded-xl border border-violet-500/20 bg-violet-500/[0.035] p-4">
                                        <div className="flex items-start gap-3">
                                            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                                                <MonitorSmartphone className="size-4" />
                                            </span>
                                            <div>
                                                <h3 className="text-sm font-semibold">
                                                    Modo quiosque
                                                </h3>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    A URL HTTPS será enviada no
                                                    JWT somente para UUIDs
                                                    autorizados.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="config_url">
                                                URL do portal
                                            </Label>
                                            <Input
                                                id="config_url"
                                                name="config[url]"
                                                type="url"
                                                inputMode="url"
                                                defaultValue={
                                                    profile?.config.url
                                                }
                                                placeholder="https://portal.exemplo.com/"
                                                maxLength={2048}
                                                required
                                                disabled={
                                                    profile !== null &&
                                                    !canUpdate
                                                }
                                            />
                                            <InputError
                                                message={errors['config.url']}
                                            />
                                        </div>
                                    </div>
                                )}

                                <input
                                    type="hidden"
                                    name="is_active"
                                    value="0"
                                />
                                <label className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                                    <Checkbox
                                        name="is_active"
                                        value="1"
                                        defaultChecked={
                                            profile?.isActive ?? true
                                        }
                                        disabled={
                                            profile !== null && !canUpdate
                                        }
                                    />
                                    <span>
                                        <strong className="block">
                                            Profile ativo
                                        </strong>
                                        <span className="text-xs text-muted-foreground">
                                            Profiles inativos deixam de emitir
                                            configurações imediatamente.
                                        </span>
                                    </span>
                                </label>

                                {(profile === null || canUpdate) && (
                                    <div className="flex gap-3">
                                        <Button disabled={processing}>
                                            {profile
                                                ? 'Salvar alterações'
                                                : 'Criar profile'}
                                        </Button>
                                        <Button asChild variant="outline">
                                            <Link href="/admin/device-profiles">
                                                Cancelar
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </Form>

                    <ApiConfigurationCard config={apiConfiguration} />
                </section>

                {profile && (
                    <section className="grid gap-5 rounded-xl border bg-card p-5">
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                            <div>
                                <h2 className="font-semibold">
                                    Dispositivos autorizados
                                </h2>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    O UUID é cifrado no banco. Revogar
                                    interrompe novas emissões sem apagar o
                                    histórico.
                                </p>
                            </div>
                            <Badge variant="outline">
                                {profile.activeDeviceCount} ativos
                            </Badge>
                        </div>

                        {canManageDevices && (
                            <Form
                                action={`/admin/device-profiles/${profile.id}/devices`}
                                method="post"
                                resetOnSuccess
                                className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1fr_15rem_auto]"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div>
                                            <Input
                                                name="device_uuid"
                                                placeholder="UUID informado pelo aplicativo"
                                                required
                                                autoComplete="off"
                                            />
                                            <InputError
                                                message={errors.device_uuid}
                                            />
                                        </div>
                                        <Input
                                            name="label"
                                            placeholder="Nome opcional"
                                            maxLength={120}
                                        />
                                        <Button disabled={processing}>
                                            <Smartphone className="size-4" />
                                            Vincular
                                        </Button>
                                    </>
                                )}
                            </Form>
                        )}

                        <div className="overflow-hidden rounded-lg border">
                            {devices?.data.length ? (
                                devices.data.map((device) => (
                                    <DeviceRow
                                        key={device.id}
                                        device={device}
                                        canManage={canManageDevices}
                                    />
                                ))
                            ) : (
                                <div className="p-8 text-center text-sm text-muted-foreground">
                                    Nenhum dispositivo vinculado.
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {profile && canDelete && (
                    <section className="flex flex-col justify-between gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-5 sm:flex-row sm:items-center">
                        <div>
                            <h2 className="font-semibold text-destructive">
                                Remover profile
                            </h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                A remoção é lógica e revoga todos os
                                dispositivos ativos.
                            </p>
                        </div>
                        <Form
                            action={`/admin/device-profiles/${profile.id}`}
                            method="delete"
                            onSubmit={(event) => {
                                if (
                                    !window.confirm(
                                        'Remover este profile e revogar seus dispositivos?',
                                    )
                                ) {
                                    event.preventDefault();
                                }
                            }}
                        >
                            {({ processing }) => (
                                <Button
                                    variant="destructive"
                                    disabled={processing}
                                >
                                    <Trash2 className="size-4" />
                                    Remover profile
                                </Button>
                            )}
                        </Form>
                    </section>
                )}
            </div>
        </>
    );
}

function ApiConfigurationCard({ config }: { config: ApiConfiguration }) {
    const [copied, setCopied] = useState(false);

    const copyPublicKey = async () => {
        if (!config.publicKeyBase64) {
            return;
        }

        await navigator.clipboard.writeText(config.publicKeyBase64);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
    };

    return (
        <aside className="h-fit space-y-4 rounded-xl border bg-card p-5">
            <div className="flex items-start gap-3">
                <span
                    className={`grid size-9 shrink-0 place-items-center rounded-lg ${
                        config.signingKeyConfigured
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}
                >
                    {config.signingKeyConfigured ? (
                        <ShieldCheck className="size-4" />
                    ) : (
                        <AlertTriangle className="size-4" />
                    )}
                </span>
                <div>
                    <h2 className="text-sm font-semibold">
                        API de configuração
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {config.signingKeyConfigured
                            ? 'Chave RSA válida e pronta para assinar.'
                            : 'Configure a chave privada RSA antes de conectar dispositivos.'}
                    </p>
                </div>
            </div>

            <dl className="grid gap-3 text-xs">
                <div>
                    <dt className="text-muted-foreground">Base URL</dt>
                    <dd className="mt-1 font-mono break-all">
                        {config.baseUrl}
                    </dd>
                </div>
                <div>
                    <dt className="text-muted-foreground">Endpoint</dt>
                    <dd className="mt-1 font-mono break-all">
                        {config.endpoint}
                    </dd>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <dt className="text-muted-foreground">Issuer</dt>
                        <dd className="mt-1 font-mono break-all">
                            {config.issuer}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Audience</dt>
                        <dd className="mt-1 font-mono break-all">
                            {config.audience}
                        </dd>
                    </div>
                </div>
                <div>
                    <dt className="text-muted-foreground">Validade</dt>
                    <dd className="mt-1 font-mono">
                        {config.ttlSeconds} segundos
                    </dd>
                </div>
            </dl>

            {config.publicKeyBase64 && (
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={copyPublicKey}
                >
                    {copied ? (
                        <CheckCircle2 className="size-4" />
                    ) : (
                        <Copy className="size-4" />
                    )}
                    {copied ? 'Chave copiada' : 'Copiar chave pública'}
                </Button>
            )}

            <div className="flex gap-2 rounded-lg bg-muted/50 p-3 text-[11px] leading-relaxed text-muted-foreground">
                <KeyRound className="mt-0.5 size-3.5 shrink-0" />A chave pública
                é segura para o build do APK. A chave privada nunca é exibida.
            </div>
        </aside>
    );
}

function DeviceRow({
    device,
    canManage,
}: {
    device: Device;
    canManage: boolean;
}) {
    const active = device.revokedAt === null;

    return (
        <div className="grid gap-3 border-b p-4 last:border-b-0 lg:grid-cols-[1fr_auto_auto] lg:items-center">
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-sm">
                        {device.label || 'Dispositivo sem nome'}
                    </strong>
                    <Badge variant={active ? 'default' : 'secondary'}>
                        {active ? 'Ativo' : 'Revogado'}
                    </Badge>
                </div>
                <p className="mt-1 font-mono text-[11px] break-all text-muted-foreground">
                    {device.deviceUuid}
                </p>
            </div>
            <div className="text-xs text-muted-foreground">
                <span className="block">
                    Primeira conexão:{' '}
                    {device.firstConnectionDate ?? 'ainda não conectado'}
                </span>
                <span className="block">
                    Última conexão:{' '}
                    {device.lastConnectedAt
                        ? new Intl.DateTimeFormat('pt-BR', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                          }).format(new Date(device.lastConnectedAt))
                        : '—'}
                </span>
            </div>
            {active && canManage && (
                <Form
                    action={`/admin/device-profiles/devices/${device.id}`}
                    method="delete"
                    onSubmit={(event) => {
                        if (!window.confirm('Revogar este dispositivo?')) {
                            event.preventDefault();
                        }
                    }}
                >
                    {({ processing }) => (
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={processing}
                        >
                            Revogar
                        </Button>
                    )}
                </Form>
            )}
        </div>
    );
}

DeviceProfileForm.layout = {
    breadcrumbs: [
        {
            title: 'Device profiles',
            href: '/admin/device-profiles',
        },
    ],
};
