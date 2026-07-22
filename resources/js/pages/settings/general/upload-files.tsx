import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Settings = {
    allowedMimeTypes: string[];
    allowedExtensions: string[];
    maxFileSizeKb: number;
    maxTotalSizeKb: number;
    maxFilesPerBriefing: number;
    isActive: boolean;
};

export default function UploadFilesSettings({
    settings,
    status,
}: {
    settings: Settings;
    status?: string;
}) {
    return (
        <>
            <Head title="Upload files" />
            <h1 className="sr-only">General settings - Upload files</h1>
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-semibold">Upload files</h2>
                    <p className="text-sm text-muted-foreground">
                        Configure limites e tipos permitidos para arquivos de
                        briefing.
                    </p>
                </div>
                {status && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        {status}
                    </div>
                )}
                <Form
                    action="/settings/general/upload-files"
                    method="put"
                    className="grid gap-5"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="allowed_mime_types">
                                    MIME types permitidos, um por linha
                                </Label>
                                <textarea
                                    id="allowed_mime_types"
                                    name="allowed_mime_types"
                                    defaultValue={settings.allowedMimeTypes.join(
                                        '\n',
                                    )}
                                    className="min-h-28 rounded-md border bg-background px-3 py-2 text-sm"
                                />
                                <InputError
                                    message={errors.allowed_mime_types}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="allowed_extensions">
                                    Extensões permitidas, uma por linha
                                </Label>
                                <textarea
                                    id="allowed_extensions"
                                    name="allowed_extensions"
                                    defaultValue={settings.allowedExtensions.join(
                                        '\n',
                                    )}
                                    className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm"
                                />
                                <InputError
                                    message={errors.allowed_extensions}
                                />
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="max_file_size_kb">
                                        Máximo por arquivo KB
                                    </Label>
                                    <Input
                                        id="max_file_size_kb"
                                        name="max_file_size_kb"
                                        type="number"
                                        defaultValue={settings.maxFileSizeKb}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="max_total_size_kb">
                                        Máximo total KB
                                    </Label>
                                    <Input
                                        id="max_total_size_kb"
                                        name="max_total_size_kb"
                                        type="number"
                                        defaultValue={settings.maxTotalSizeKb}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="max_files_per_briefing">
                                        Arquivos por briefing
                                    </Label>
                                    <Input
                                        id="max_files_per_briefing"
                                        name="max_files_per_briefing"
                                        type="number"
                                        defaultValue={
                                            settings.maxFilesPerBriefing
                                        }
                                    />
                                </div>
                            </div>
                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                    name="is_active"
                                    value="1"
                                    defaultChecked={settings.isActive}
                                />
                                Upload ativo
                            </label>
                            <Button disabled={processing}>
                                Salvar configurações
                            </Button>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

UploadFilesSettings.layout = {
    breadcrumbs: [
        {
            title: 'General settings / Upload files',
            href: '/settings/general/upload-files',
        },
    ],
};
