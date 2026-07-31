import type { ComponentType, SVGProps } from 'react';
import bootstrapIconsSprite from 'bootstrap-icons/bootstrap-icons.svg';

export type BootstrapIcon = ComponentType<SVGProps<SVGSVGElement>>;

function bootstrapIcon(name: string, displayName: string): BootstrapIcon {
    const Icon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
        <svg
            {...props}
            className={className}
            aria-hidden="true"
            focusable="false"
            fill="currentColor"
        >
            <use href={`${bootstrapIconsSprite}#${name}`} />
        </svg>
    );

    Icon.displayName = displayName;

    return Icon;
}

export const Activity = bootstrapIcon('activity', 'Activity');
export const AlertCircleIcon = bootstrapIcon(
    'exclamation-circle',
    'AlertCircleIcon',
);
export const AlertTriangle = bootstrapIcon(
    'exclamation-triangle',
    'AlertTriangle',
);
export const Archive = bootstrapIcon('archive', 'Archive');
export const ArrowDown = bootstrapIcon('arrow-down', 'ArrowDown');
export const ArrowDownRight = bootstrapIcon(
    'arrow-down-right',
    'ArrowDownRight',
);
export const ArrowRight = bootstrapIcon('arrow-right', 'ArrowRight');
export const ArrowUpRight = bootstrapIcon('arrow-up-right', 'ArrowUpRight');
export const Asterisk = bootstrapIcon('asterisk', 'Asterisk');
export const BarChart3 = bootstrapIcon('bar-chart', 'BarChart3');
export const BookOpen = bootstrapIcon('book', 'BookOpen');
export const Braces = bootstrapIcon('braces', 'Braces');
export const CalendarClock = bootstrapIcon('calendar-week', 'CalendarClock');
export const CalendarDays = bootstrapIcon('calendar-date', 'CalendarDays');
export const Check = bootstrapIcon('check', 'Check');
export const CheckCircle2 = bootstrapIcon('check-circle', 'CheckCircle2');
export const CheckIcon = bootstrapIcon('check', 'CheckIcon');
export const ChevronDownIcon = bootstrapIcon(
    'chevron-down',
    'ChevronDownIcon',
);
export const ChevronLeft = bootstrapIcon('chevron-left', 'ChevronLeft');
export const ChevronRight = bootstrapIcon('chevron-right', 'ChevronRight');
export const ChevronRightIcon = bootstrapIcon(
    'chevron-right',
    'ChevronRightIcon',
);
export const ChevronUpIcon = bootstrapIcon('chevron-up', 'ChevronUpIcon');
export const ChevronsUpDown = bootstrapIcon(
    'chevron-expand',
    'ChevronsUpDown',
);
export const CircleDollarSign = bootstrapIcon(
    'currency-dollar',
    'CircleDollarSign',
);
export const CircleIcon = bootstrapIcon('circle', 'CircleIcon');
export const Clock3 = bootstrapIcon('clock', 'Clock3');
export const Code2 = bootstrapIcon('code-slash', 'Code2');
export const Coffee = bootstrapIcon('cup-hot', 'Coffee');
export const Columns3 = bootstrapIcon('kanban', 'Columns3');
export const Copy = bootstrapIcon('copy', 'Copy');
export const Database = bootstrapIcon('database', 'Database');
export const DatabaseZap = bootstrapIcon('database-fill', 'DatabaseZap');
export const Download = bootstrapIcon('download', 'Download');
export const ExternalLink = bootstrapIcon(
    'box-arrow-up-right',
    'ExternalLink',
);
export const Eye = bootstrapIcon('eye', 'Eye');
export const EyeOff = bootstrapIcon('eye-slash', 'EyeOff');
export const FileText = bootstrapIcon('file-text', 'FileText');
export const Flame = bootstrapIcon('fire', 'Flame');
export const Folder = bootstrapIcon('folder', 'Folder');
export const Gamepad2 = bootstrapIcon('controller', 'Gamepad2');
export const Gauge = bootstrapIcon('speedometer2', 'Gauge');
export const Ghost = bootstrapIcon('incognito', 'Ghost');
export const GripVertical = bootstrapIcon('grip-vertical', 'GripVertical');
export const Headphones = bootstrapIcon('headphones', 'Headphones');
export const KeyRound = bootstrapIcon('key', 'KeyRound');
export const Layers3 = bootstrapIcon('layers', 'Layers3');
export const LayoutGrid = bootstrapIcon('grid', 'LayoutGrid');
export const Link2 = bootstrapIcon('link-45deg', 'Link2');
export const ListChecks = bootstrapIcon('list-check', 'ListChecks');
export const Loader2Icon = bootstrapIcon('arrow-clockwise', 'Loader2Icon');
export const LoaderCircle = bootstrapIcon('arrow-clockwise', 'LoaderCircle');
export const LockKeyhole = bootstrapIcon('lock', 'LockKeyhole');
export const LogOut = bootstrapIcon('box-arrow-right', 'LogOut');
export const Mail = bootstrapIcon('envelope', 'Mail');
export const MapPin = bootstrapIcon('geo-alt', 'MapPin');
export const Menu = bootstrapIcon('list', 'Menu');
export const MessageCircle = bootstrapIcon('chat', 'MessageCircle');
export const MessageSquare = bootstrapIcon('chat-square', 'MessageSquare');
export const Monitor = bootstrapIcon('display', 'Monitor');
export const MonitorSmartphone = bootstrapIcon('phone', 'MonitorSmartphone');
export const Moon = bootstrapIcon('moon', 'Moon');
export const MoonStar = bootstrapIcon('moon-stars', 'MoonStar');
export const MoreHorizontal = bootstrapIcon('three-dots', 'MoreHorizontal');
export const Minus = bootstrapIcon('dash', 'Minus');
export const Orbit = bootstrapIcon('circle', 'Orbit');
export const Package = bootstrapIcon('box-seam', 'Package');
export const PanelLeftCloseIcon = bootstrapIcon(
    'layout-sidebar-inset-reverse',
    'PanelLeftCloseIcon',
);
export const PanelLeftOpenIcon = bootstrapIcon(
    'layout-sidebar-inset',
    'PanelLeftOpenIcon',
);
export const Paperclip = bootstrapIcon('paperclip', 'Paperclip');
export const Plus = bootstrapIcon('plus', 'Plus');
export const Radio = bootstrapIcon('record-circle', 'Radio');
export const RadioTower = bootstrapIcon('broadcast', 'RadioTower');
export const ReceiptText = bootstrapIcon('receipt', 'ReceiptText');
export const RefreshCw = bootstrapIcon('arrow-clockwise', 'RefreshCw');
export const ScanLine = bootstrapIcon('qr-code-scan', 'ScanLine');
export const Search = bootstrapIcon('search', 'Search');
export const Settings = bootstrapIcon('gear', 'Settings');
export const Settings2 = bootstrapIcon('sliders', 'Settings2');
export const ShieldCheck = bootstrapIcon('shield-check', 'ShieldCheck');
export const ShieldQuestion = bootstrapIcon(
    'shield-question',
    'ShieldQuestion',
);
export const Signal = bootstrapIcon('reception-4', 'Signal');
export const SignalZero = bootstrapIcon('reception-0', 'SignalZero');
export const Skull = bootstrapIcon('skull', 'Skull');
export const Smartphone = bootstrapIcon('phone', 'Smartphone');
export const Sparkles = bootstrapIcon('stars', 'Sparkles');
export const SquareTerminal = bootstrapIcon('terminal', 'SquareTerminal');
export const Sun = bootstrapIcon('sun', 'Sun');
export const Tag = bootstrapIcon('tag', 'Tag');
export const Target = bootstrapIcon('bullseye', 'Target');
export const Terminal = bootstrapIcon('terminal', 'Terminal');
export const Trash2 = bootstrapIcon('trash', 'Trash2');
export const Trophy = bootstrapIcon('trophy', 'Trophy');
export const Unplug = bootstrapIcon('plug', 'Unplug');
export const UserCog = bootstrapIcon('person-gear', 'UserCog');
export const UserPlus = bootstrapIcon('person-plus', 'UserPlus');
export const UserRoundPlus = bootstrapIcon('person-plus', 'UserRoundPlus');
export const Users = bootstrapIcon('people', 'Users');
export const UsersRound = bootstrapIcon('people', 'UsersRound');
export const WifiOff = bootstrapIcon('wifi-off', 'WifiOff');
export const Wrench = bootstrapIcon('wrench', 'Wrench');
export const XCircle = bootstrapIcon('x-circle', 'XCircle');
export const XIcon = bootstrapIcon('x', 'XIcon');
export const Zap = bootstrapIcon('lightning-charge', 'Zap');
