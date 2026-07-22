import { Form, Head } from '@inertiajs/react';
import { KeyRound, Link2, RefreshCw, ShieldCheck, Unplug } from 'lucide-react';
import IntegrationConnectionController from '@/actions/App/Http/Controllers/Settings/IntegrationConnectionController';
import IntegrationOAuthController from '@/actions/App/Http/Controllers/Settings/IntegrationOAuthController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index } from '@/routes/settings/integrations';

type IntegrationField = {
    name: string;
    label: string;
    configured: boolean;
    secret: boolean;
    value: string;
};

type Integration = {
    provider: string;
    label: string;
    fields: IntegrationField[];
    status: string;
    accountName: string | null;
    lastSyncedAt: string | null;
    lastError: string | null;
    automaticConnection: boolean;
    canConnect: boolean;
    callbackUrl: string;
};

export default function AppKeys({
    integrations,
    status,
}: {
    integrations: Integration[];
    status?: string;
}) {
    return (
        <>
            <Head title="App keys" />
            <h1 className="sr-only">General settings — App keys</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="App keys"
                    description="Connect personal services and keep every secret encrypted at rest. Blank secret fields preserve their current values."
                />

                {status && (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
                        <ShieldCheck className="size-4" /> {status}
                    </div>
                )}

                <div className="grid gap-5">
                    {integrations.map((integration) => (
                        <Card key={integration.provider}>
                            <CardHeader className="gap-2">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <KeyRound className="size-4" />{' '}
                                            {integration.label}
                                        </CardTitle>
                                        <CardDescription>
                                            Callback:{' '}
                                            <code className="text-xs break-all">
                                                {integration.callbackUrl}
                                            </code>
                                        </CardDescription>
                                    </div>
                                    <Badge
                                        variant={
                                            integration.status === 'connected'
                                                ? 'default'
                                                : 'outline'
                                        }
                                    >
                                        {integration.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <Form
                                    {...IntegrationConnectionController.update.form()}
                                    options={{ preserveScroll: true }}
                                    className="space-y-4"
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            <input
                                                type="hidden"
                                                name="provider"
                                                value={integration.provider}
                                            />
                                            <div className="grid gap-4 md:grid-cols-2">
                                                {integration.fields.map(
                                                    (field) => (
                                                        <div
                                                            className="grid gap-2"
                                                            key={field.name}
                                                        >
                                                            <Label
                                                                htmlFor={`${integration.provider}-${field.name}`}
                                                            >
                                                                {field.label}
                                                                {field.configured && (
                                                                    <span className="ml-2 text-xs text-emerald-600">
                                                                        configured
                                                                    </span>
                                                                )}
                                                            </Label>
                                                            <Input
                                                                id={`${integration.provider}-${field.name}`}
                                                                name={
                                                                    field.name
                                                                }
                                                                type={
                                                                    field.secret
                                                                        ? 'password'
                                                                        : 'text'
                                                                }
                                                                defaultValue={
                                                                    field.value
                                                                }
                                                                autoComplete="off"
                                                                placeholder={
                                                                    field.configured
                                                                        ? 'Leave blank to preserve'
                                                                        : `Enter ${field.label.toLowerCase()}`
                                                                }
                                                            />
                                                            <InputError
                                                                message={
                                                                    errors[
                                                                        field
                                                                            .name
                                                                    ]
                                                                }
                                                            />
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                            <Button
                                                disabled={processing}
                                                type="submit"
                                            >
                                                Save encrypted settings
                                            </Button>
                                        </>
                                    )}
                                </Form>

                                <div className="flex flex-wrap gap-2 border-t pt-4">
                                    {integration.automaticConnection &&
                                        integration.canConnect && (
                                            <Button asChild variant="secondary">
                                                <a
                                                    href={IntegrationOAuthController.redirect.url(
                                                        integration.provider,
                                                    )}
                                                >
                                                    <Link2 className="size-4" />{' '}
                                                    Connect automatically
                                                </a>
                                            </Button>
                                        )}
                                    {integration.automaticConnection &&
                                        !integration.canConnect && (
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                disabled
                                            >
                                                <Link2 className="size-4" />{' '}
                                                Save keys before connecting
                                            </Button>
                                        )}
                                    <Form
                                        {...IntegrationConnectionController.synchronize.form(
                                            integration.provider,
                                        )}
                                    >
                                        {({ processing }) => (
                                            <Button
                                                type="submit"
                                                variant="outline"
                                                disabled={
                                                    processing ||
                                                    integration.status ===
                                                        'disconnected'
                                                }
                                            >
                                                <RefreshCw className="size-4" />{' '}
                                                Synchronize
                                            </Button>
                                        )}
                                    </Form>
                                    <Form
                                        {...IntegrationConnectionController.destroy.form(
                                            integration.provider,
                                        )}
                                    >
                                        {({ processing }) => (
                                            <Button
                                                type="submit"
                                                variant="ghost"
                                                disabled={
                                                    processing ||
                                                    integration.status ===
                                                        'disconnected'
                                                }
                                            >
                                                <Unplug className="size-4" />{' '}
                                                Disconnect
                                            </Button>
                                        )}
                                    </Form>
                                </div>

                                {integration.accountName && (
                                    <p className="text-sm text-muted-foreground">
                                        Connected as {integration.accountName}
                                    </p>
                                )}
                                {integration.lastError && (
                                    <InputError
                                        message={integration.lastError}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}

AppKeys.layout = {
    breadcrumbs: [{ title: 'General settings / App keys', href: index() }],
};
