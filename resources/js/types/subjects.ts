export type SubjectType = 'game' | 'movie' | 'series' | 'anime' | 'manga' | 'book' | 'comic' | 'character' | 'franchise' | 'tabletop_game';

export type ShelfStatus = 'current' | 'completed' | 'backlog' | 'paused' | 'dropped';

export interface SubjectSummary {
    id: number;
    name: string;
    slug: string;
    type: SubjectType;
    type_label: string;
    description: string | null;
    image_url: string | null;
    parent: string | null;
}

export interface CatalogCandidate {
    key: string;
    subject_id: number | null;
    reference: string | null;
    name: string;
    year: number | null;
    type: SubjectType;
    type_label: string;
    description: string | null;
    image_url: string | null;
    source: string;
    source_label: string;
    source_url: string | null;
}

export interface CatalogSearchResponse {
    data: CatalogCandidate[];
    meta: {
        query: string;
        type: SubjectType | null;
        sources: string[];
        unavailable_sources: string[];
    };
}

export type PostSubject = Pick<SubjectSummary, 'id' | 'name' | 'slug' | 'type' | 'type_label'>;

export interface ShelfEntry {
    id: number;
    status: ShelfStatus;
    status_label: string;
    favorite: boolean;
    rating: number | null;
    progress: string | null;
    subject: SubjectSummary;
}

export interface SelectOption<T extends string = string> {
    value: T;
    label: string;
}
