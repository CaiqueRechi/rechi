export type KanbanUser = {
    id: number;
    name: string;
    email: string;
};

export type KanbanLabel = {
    id: number;
    name: string;
    color: string;
};

export type ChecklistItem = {
    id: number;
    content: string;
    position: number;
    completedAt: string | null;
};

export type Checklist = {
    id: number;
    title: string;
    position: number;
    items: ChecklistItem[];
};

export type CardComment = {
    id: number;
    body: string;
    author: Pick<KanbanUser, 'id' | 'name'> | null;
    createdAt: string | null;
};

export type CardAttachment = {
    id: number;
    name: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: string | null;
};

export type CardActivity = {
    id: number;
    type: string;
    changes: Record<string, unknown> | null;
    actor: Pick<KanbanUser, 'id' | 'name'> | null;
    createdAt: string | null;
};

export type KanbanCard = {
    id: number;
    boardId: number;
    columnId: number;
    title: string;
    description: string | null;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    startsAt: string | null;
    dueAt: string | null;
    completedAt: string | null;
    archivedAt: string | null;
    isOverdue: boolean;
    position: number;
    assignees: KanbanUser[];
    labels: KanbanLabel[];
    checklists: Checklist[];
    comments: CardComment[];
    attachments: CardAttachment[];
    activities: CardActivity[];
};

export type KanbanColumn = {
    id: number;
    title: string;
    position: number;
    cardLimit: number | null;
    cardCount: number;
    cards: KanbanCard[];
};

export type KanbanBoard = {
    id: number;
    title: string;
    description: string | null;
    color: string;
    visibility: 'private' | 'shared';
    archivedAt: string | null;
    owner: KanbanUser;
    participants: KanbanUser[];
    labels: KanbanLabel[];
    columns: KanbanColumn[];
};
