import { Head, Link } from '@inertiajs/react';
import {
    ArrowUpRight,
    BarChart3,
    CircleDollarSign,
    Link2,
    ReceiptText,
    Target,
    UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/money';
import { dashboard } from '@/routes';

type Summary = {
    revenueCents: number;
    orderCount: number;
    leadCount: number;
    approvalRate: number;
    connectedIntegrations: number | null;
};

type MonthlyPerformance = {
    label: string;
    revenueCents: number;
    orders: number;
};

type DistributionItem = {
    label: string;
    value: number;
};

type RecentOrder = {
    id: number;
    publicNumber: string;
    customerName: string;
    status: string;
    statusLabel: string;
    totalCents: number;
    currency: string;
    createdAt: string | null;
};

type DashboardProps = {
    isAdminView: boolean;
    summary: Summary;
    monthlyPerformance: MonthlyPerformance[];
    orderStatuses: DistributionItem[];
    leadTypes: DistributionItem[];
    paymentMethods: DistributionItem[];
    recentOrders: RecentOrder[];
};

const chartColors = ['#8b5cf6', '#22c55e', '#38bdf8', '#f59e0b', '#f43f5e'];

export default function Dashboard({
    isAdminView,
    summary,
    monthlyPerformance,
    orderStatuses,
    leadTypes,
    paymentMethods,
    recentOrders,
}: DashboardProps) {
    const summaryCards = [
        {
            label: 'Receita aprovada',
            value: formatCurrency(summary.revenueCents, 'BRL'),
            hint: 'Pagamentos confirmados',
            icon: CircleDollarSign,
            accent: 'text-emerald-600 dark:text-emerald-400',
        },
        {
            label: 'Pedidos',
            value: summary.orderCount.toLocaleString('pt-BR'),
            hint: 'Total registrado',
            icon: ReceiptText,
            accent: 'text-sky-600 dark:text-sky-400',
        },
        {
            label: 'Leads',
            value: summary.leadCount.toLocaleString('pt-BR'),
            hint: 'Oportunidades recebidas',
            icon: UsersRound,
            accent: 'text-violet-600 dark:text-violet-400',
        },
        {
            label: 'Aprovação',
            value: `${summary.approvalRate.toLocaleString('pt-BR')}%`,
            hint: 'Pedidos com pagamento aprovado',
            icon: Target,
            accent: 'text-amber-600 dark:text-amber-400',
        },
    ];

    return (
        <>
            <Head title="Dashboard">
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <div className="flex flex-1 flex-col gap-6 overflow-x-hidden p-4 sm:p-6">
                <header className="flex flex-col justify-between gap-5 border-b pb-6 sm:flex-row sm:items-end">
                    <div>
                        <p className="font-mono text-[10px] tracking-[0.18em] text-violet-600 uppercase dark:text-violet-400">
                            Analytics / visão geral
                        </p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight">
                            {isAdminView
                                ? 'Pulso do negócio'
                                : 'Seus projetos em números'}
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                            Dados operacionais do sistema, organizados para
                            mostrar volume, valor, distribuição e movimento.
                        </p>
                    </div>
                    {isAdminView && summary.connectedIntegrations !== null && (
                        <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
                            <span className="grid size-9 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <Link2 className="size-4" />
                            </span>
                            <div>
                                <strong className="block text-sm">
                                    {summary.connectedIntegrations} integrações
                                </strong>
                                <span className="text-xs text-muted-foreground">
                                    conectadas agora
                                </span>
                            </div>
                        </div>
                    )}
                </header>

                <section
                    aria-label="Resumo"
                    className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
                >
                    {summaryCards.map((card) => (
                        <MetricCard key={card.label} {...card} />
                    ))}
                </section>

                <section className="grid gap-4 xl:grid-cols-3">
                    <ChartCard
                        className="xl:col-span-2"
                        eyebrow="Últimos 6 meses"
                        title="Receita ao longo do tempo"
                        description="Somente pedidos com pagamento aprovado."
                    >
                        <RevenueAreaChart data={monthlyPerformance} />
                    </ChartCard>

                    <ChartCard
                        eyebrow="Composição"
                        title="Status dos pedidos"
                        description="Distribuição de toda a carteira visível."
                    >
                        <DonutChart data={orderStatuses} />
                    </ChartCard>
                </section>

                <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                    <ChartCard
                        eyebrow="Demanda"
                        title="Pedidos por mês"
                        description="Volume criado, independentemente do pagamento."
                    >
                        <ColumnChart data={monthlyPerformance} />
                    </ChartCard>

                    <ChartCard
                        eyebrow="Aquisição"
                        title="Tipos de lead"
                        description="O que as pessoas estão procurando."
                    >
                        <HorizontalBarChart data={leadTypes} />
                    </ChartCard>

                    <ChartCard
                        eyebrow="Checkout"
                        title="Formas de pagamento"
                        description="Preferências registradas nos pagamentos."
                    >
                        <HorizontalBarChart data={paymentMethods} />
                    </ChartCard>
                </section>

                <section className="overflow-hidden rounded-xl border bg-card">
                    <div className="flex items-center justify-between gap-4 border-b px-5 py-4">
                        <div>
                            <p className="font-mono text-[9px] tracking-[0.16em] text-muted-foreground uppercase">
                                Atividade recente
                            </p>
                            <h2 className="mt-1 font-semibold">
                                Últimos pedidos
                            </h2>
                        </div>
                        {isAdminView && (
                            <Link
                                href="/admin/orders"
                                className="flex items-center gap-1 text-xs font-medium text-violet-600 hover:underline dark:text-violet-400"
                            >
                                Ver todos
                                <ArrowUpRight className="size-3.5" />
                            </Link>
                        )}
                    </div>

                    {recentOrders.length === 0 ? (
                        <EmptyChart
                            title="Nenhum pedido registrado"
                            description="A atividade aparecerá aqui assim que o primeiro pedido for criado."
                        />
                    ) : (
                        <div className="divide-y">
                            {recentOrders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={
                                        isAdminView
                                            ? `/admin/orders/${order.id}`
                                            : `/orders/${order.id}`
                                    }
                                    className="grid gap-3 px-5 py-4 transition hover:bg-muted/60 sm:grid-cols-[1fr_auto_auto] sm:items-center"
                                >
                                    <div>
                                        <strong className="block text-sm">
                                            {order.publicNumber}
                                        </strong>
                                        <span className="text-xs text-muted-foreground">
                                            {order.customerName}
                                        </span>
                                    </div>
                                    <StatusBadge
                                        status={order.status}
                                        label={order.statusLabel}
                                    />
                                    <div className="sm:text-right">
                                        <strong className="block text-sm">
                                            {formatCurrency(
                                                order.totalCents,
                                                order.currency,
                                            )}
                                        </strong>
                                        <span className="text-xs text-muted-foreground">
                                            {order.createdAt
                                                ? new Intl.DateTimeFormat(
                                                      'pt-BR',
                                                      {
                                                          dateStyle: 'short',
                                                      },
                                                  ).format(
                                                      new Date(order.createdAt),
                                                  )
                                                : '—'}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}

function MetricCard({
    label,
    value,
    hint,
    icon: Icon,
    accent,
}: {
    label: string;
    value: string;
    hint: string;
    icon: LucideIcon;
    accent: string;
}) {
    return (
        <article className="relative overflow-hidden rounded-xl border bg-card p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-medium text-muted-foreground">
                        {label}
                    </p>
                    <strong className="mt-3 block text-3xl tracking-tight">
                        {value}
                    </strong>
                    <span className="mt-2 block text-xs text-muted-foreground">
                        {hint}
                    </span>
                </div>
                <span
                    className={`grid size-10 place-items-center rounded-xl bg-muted ${accent}`}
                >
                    <Icon className="size-5" />
                </span>
            </div>
        </article>
    );
}

function ChartCard({
    eyebrow,
    title,
    description,
    className = '',
    children,
}: {
    eyebrow: string;
    title: string;
    description: string;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <article className={`rounded-xl border bg-card p-5 ${className}`}>
            <header>
                <p className="font-mono text-[9px] tracking-[0.16em] text-muted-foreground uppercase">
                    {eyebrow}
                </p>
                <h2 className="mt-1 font-semibold">{title}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                    {description}
                </p>
            </header>
            <div className="mt-6 min-h-64">{children}</div>
        </article>
    );
}

function RevenueAreaChart({ data }: { data: MonthlyPerformance[] }) {
    const values = data.map((item) => item.revenueCents);
    const maximum = Math.max(...values, 1);
    const points = data.map((item, index) => {
        const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100;
        const y = 86 - (item.revenueCents / maximum) * 72;

        return { ...item, x, y };
    });
    const linePath = points
        .map(
            (point, index) =>
                `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`,
        )
        .join(' ');
    const areaPath = `${linePath} L 100 90 L 0 90 Z`;
    const hasData = values.some((value) => value > 0);

    if (!hasData) {
        return (
            <EmptyChart
                title="Ainda sem receita aprovada"
                description="A curva será formada quando os pagamentos forem confirmados."
            />
        );
    }

    return (
        <div>
            <svg
                viewBox="-4 0 108 100"
                role="img"
                aria-label="Gráfico de linha da receita aprovada nos últimos seis meses"
                className="h-52 w-full overflow-visible"
            >
                <defs>
                    <linearGradient
                        id="revenue-gradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop
                            offset="0%"
                            stopColor="#8b5cf6"
                            stopOpacity="0.4"
                        />
                        <stop
                            offset="100%"
                            stopColor="#8b5cf6"
                            stopOpacity="0"
                        />
                    </linearGradient>
                </defs>
                {[20, 40, 60, 80].map((y) => (
                    <line
                        key={y}
                        x1="0"
                        x2="100"
                        y1={y}
                        y2={y}
                        className="stroke-border"
                        strokeWidth="0.4"
                    />
                ))}
                <path d={areaPath} fill="url(#revenue-gradient)" />
                <path
                    d={linePath}
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {points.map((point) => (
                    <circle
                        key={point.label}
                        cx={point.x}
                        cy={point.y}
                        r="2.2"
                        fill="#8b5cf6"
                        className="stroke-card"
                        strokeWidth="1.5"
                    />
                ))}
            </svg>
            <div className="grid grid-cols-6 gap-1">
                {points.map((point) => (
                    <div key={point.label} className="text-center">
                        <span className="block text-[10px] text-muted-foreground uppercase">
                            {point.label}
                        </span>
                        <span className="hidden text-[10px] font-medium sm:block">
                            {formatCompactCurrency(point.revenueCents)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function DonutChart({ data }: { data: DistributionItem[] }) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const circumference = 2 * Math.PI * 44;

    if (total === 0) {
        return (
            <EmptyChart
                title="Sem status para distribuir"
                description="Os segmentos surgirão com os primeiros pedidos."
            />
        );
    }

    return (
        <div className="grid items-center gap-5 sm:grid-cols-[9rem_1fr] xl:grid-cols-1 2xl:grid-cols-[9rem_1fr]">
            <div className="relative mx-auto size-36">
                <svg
                    viewBox="0 0 120 120"
                    role="img"
                    aria-label="Gráfico de rosca da distribuição de status dos pedidos"
                    className="size-full"
                >
                    <circle
                        cx="60"
                        cy="60"
                        r="44"
                        fill="none"
                        className="stroke-muted"
                        strokeWidth="13"
                    />
                    {data.map((item, index) => {
                        const segmentLength =
                            (item.value / total) * circumference;
                        const offset = data
                            .slice(0, index)
                            .reduce(
                                (sum, previousItem) =>
                                    sum +
                                    (previousItem.value / total) *
                                        circumference,
                                0,
                            );

                        return (
                            <circle
                                key={item.label}
                                cx="60"
                                cy="60"
                                r="44"
                                fill="none"
                                stroke={chartColors[index % chartColors.length]}
                                strokeWidth="13"
                                strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                                strokeDashoffset={-offset}
                                transform="rotate(-90 60 60)"
                            />
                        );
                    })}
                </svg>
                <div className="absolute inset-0 grid place-content-center text-center">
                    <strong className="text-2xl">{total}</strong>
                    <span className="text-[10px] text-muted-foreground uppercase">
                        pedidos
                    </span>
                </div>
            </div>
            <div className="grid gap-2.5">
                {data.slice(0, 5).map((item, index) => (
                    <div
                        key={item.label}
                        className="flex items-center justify-between gap-3 text-xs"
                    >
                        <span className="flex min-w-0 items-center gap-2">
                            <span
                                className="size-2.5 shrink-0 rounded-full"
                                style={{
                                    backgroundColor:
                                        chartColors[index % chartColors.length],
                                }}
                            />
                            <span className="truncate text-muted-foreground">
                                {item.label}
                            </span>
                        </span>
                        <strong>{item.value}</strong>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ColumnChart({ data }: { data: MonthlyPerformance[] }) {
    const maximum = Math.max(...data.map((item) => item.orders), 1);
    const hasData = data.some((item) => item.orders > 0);

    if (!hasData) {
        return (
            <EmptyChart
                title="Ainda sem volume"
                description="As colunas acompanharão a criação de pedidos."
            />
        );
    }

    return (
        <div
            role="img"
            aria-label="Gráfico de colunas com os pedidos criados nos últimos seis meses"
            className="flex h-64 items-end gap-3 border-b px-2 pb-6"
        >
            {data.map((item) => (
                <div
                    key={item.label}
                    className="group flex h-full flex-1 flex-col justify-end gap-2"
                >
                    <span className="text-center text-xs font-semibold">
                        {item.orders}
                    </span>
                    <div
                        className="min-h-1 rounded-t-md bg-sky-500 transition group-hover:bg-violet-500"
                        style={{
                            height: `${Math.max((item.orders / maximum) * 82, 2)}%`,
                        }}
                    />
                    <span className="text-center text-[10px] text-muted-foreground uppercase">
                        {item.label}
                    </span>
                </div>
            ))}
        </div>
    );
}

function HorizontalBarChart({ data }: { data: DistributionItem[] }) {
    const maximum = Math.max(...data.map((item) => item.value), 1);

    if (data.length === 0) {
        return (
            <EmptyChart
                title="Nenhum dado disponível"
                description="A distribuição será exibida quando houver registros."
            />
        );
    }

    return (
        <div
            role="img"
            aria-label="Gráfico de barras horizontais"
            className="grid gap-5"
        >
            {data.slice(0, 5).map((item, index) => (
                <div key={item.label} className="grid gap-2">
                    <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="truncate text-muted-foreground">
                            {item.label}
                        </span>
                        <strong>{item.value}</strong>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full"
                            style={{
                                width: `${(item.value / maximum) * 100}%`,
                                backgroundColor:
                                    chartColors[index % chartColors.length],
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyChart({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="grid min-h-56 place-content-center justify-items-center gap-3 px-6 text-center">
            <span className="grid size-11 place-items-center rounded-xl bg-muted text-muted-foreground">
                <BarChart3 className="size-5" />
            </span>
            <div>
                <strong className="text-sm">{title}</strong>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                    {description}
                </p>
            </div>
        </div>
    );
}

function StatusBadge({ status, label }: { status: string; label: string }) {
    const style =
        status === 'completed' || status === 'paid'
            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
            : status === 'canceled' ||
                status === 'failed' ||
                status === 'refunded'
              ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
              : 'bg-amber-500/10 text-amber-700 dark:text-amber-400';

    return (
        <span
            className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-medium ${style}`}
        >
            {label}
        </span>
    );
}

function formatCompactCurrency(valueCents: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(valueCents / 100);
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
