import { Head, usePage } from '@inertiajs/react';

type StructuredData = Record<string, unknown> | Array<Record<string, unknown>>;

type SharedSeoProps = {
    seo: {
        siteName: string;
        siteUrl: string;
        defaultImageUrl: string;
    };
};

export default function SeoHead({
    title,
    description,
    canonicalPath,
    imageUrl,
    type = 'website',
    noIndex = false,
    structuredData,
}: {
    title: string;
    description: string;
    canonicalPath: string;
    imageUrl?: string;
    type?: 'website' | 'profile' | 'product';
    noIndex?: boolean;
    structuredData?: StructuredData;
}) {
    const { seo } = usePage<SharedSeoProps>().props;
    const canonicalUrl = new URL(canonicalPath, `${seo.siteUrl}/`).toString();
    const socialImageUrl = imageUrl
        ? new URL(imageUrl, `${seo.siteUrl}/`).toString()
        : seo.defaultImageUrl;

    return (
        <Head title={title}>
            <meta name="description" content={description} />
            <meta
                name="robots"
                content={noIndex ? 'noindex, nofollow' : 'index, follow'}
            />
            <link rel="canonical" href={canonicalUrl} />

            <meta property="og:locale" content="pt_BR" />
            <meta property="og:type" content={type} />
            <meta property="og:site_name" content={seo.siteName} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:image" content={socialImageUrl} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={socialImageUrl} />

            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}
        </Head>
    );
}
