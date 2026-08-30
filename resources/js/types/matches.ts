import { ShelfStatus, SubjectType } from '@/types/subjects';

export type MatchView = 'discover' | 'connections';
export type MatchDecision = 'connect' | 'pass';

export interface SharedMatchSubject {
    id: number;
    name: string;
    slug: string;
    type: SubjectType;
    type_label: string;
    image_url: string | null;
    viewer_status: ShelfStatus;
    candidate_status: ShelfStatus;
    both_favorite: boolean;
    same_status: boolean;
    rating_gap: number | null;
}

export interface MatchCompatibility {
    score: number;
    shared_count: number;
    shared_favorites_count: number;
    same_status_count: number;
    rated_pairs_count: number;
    type_affinities: string[];
    shared_subjects: SharedMatchSubject[];
}

export interface MatchCandidate {
    id: number;
    name: string;
    username: string;
    bio: string | null;
    avatar_url: string | null;
    is_following: boolean;
    follows_you: boolean;
    compatibility: MatchCompatibility;
}

export interface MatchSummary {
    shelf_count: number;
    remaining_count: number | null;
    connections_count: number;
}

export interface MatchScoreWeight {
    label: string;
    weight: number;
}
