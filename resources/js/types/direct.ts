export interface DirectPerson {
    id: number;
    name: string;
    username: string;
    bio: string | null;
    avatar_url: string | null;
}

export interface DirectMessage {
    id: number;
    body: string;
    created_at: string;
    is_mine: boolean;
    author: DirectPerson;
}

export interface DirectConversationSummary {
    id: number;
    person: DirectPerson;
    last_message: {
        body: string;
        created_at: string;
        is_mine: boolean;
    } | null;
    unread_count: number;
}

export interface DirectSharedSubject {
    id: number;
    name: string;
    type_label: string;
    image_url: string | null;
}

export interface DirectActiveConversation {
    id: number;
    person: DirectPerson;
    messages: DirectMessage[];
    shared_subjects: DirectSharedSubject[];
}
