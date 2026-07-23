export type ProfileActivity = {
    appId?: number;
    title?: string;
    subtitle?: string;
    meta?: string;
    imageUrl?: string;
    url?: string;
    status?: string;
    nowPlaying?: boolean;
    occurredAt?: string;
    seconds?: number;
    minutesPlayed?: number;
    minutesPlayedTwoWeeks?: number;
    minutesPlayedWindows?: number;
    minutesPlayedMac?: number;
    minutesPlayedLinux?: number;
    minutesPlayedDeck?: number;
    lastPlayedAt?: string | null;
};

export type ProfileIntegration = {
    provider: string;
    label: string;
    connected: boolean;
    isDemo: boolean;
    notice: string | null;
    account: { name: string | null; avatarUrl: string | null } | null;
    lastSyncedAt: string | null;
    activities: ProfileActivity[];
};

export type PersonalProfileProps = {
    integrations: Record<string, ProfileIntegration>;
};

export const formatHours = (minutes: number): string => {
    const hours = minutes / 60;

    return hours >= 100
        ? `${Math.round(hours).toLocaleString('en-US')}h`
        : `${hours.toFixed(1)}h`;
};

export const formatCodingTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);

    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};
