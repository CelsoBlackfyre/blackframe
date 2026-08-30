import { SubjectSummary } from '@/types/subjects';

export type PeopleView = 'discover' | 'followers' | 'following';

export interface PersonSummary {
    id: number;
    name: string;
    username: string;
    bio: string | null;
    avatar_url: string | null;
    is_private: boolean;
    followers_count: number;
    posts_count: number;
    is_following: boolean;
    follows_you: boolean;
    follow_request_pending: boolean;
    incoming_follow_request: boolean;
    shared_titles_count: number;
    mutual_connections_count: number;
    shared_subjects: Array<Pick<SubjectSummary, 'id' | 'name' | 'slug' | 'type' | 'type_label' | 'image_url'>>;
    current_activity: {
        label: string;
        subject: Pick<SubjectSummary, 'id' | 'name' | 'slug' | 'type' | 'type_label' | 'image_url'>;
    } | null;
    recommendation_reason: string | null;
}

export interface PeopleFilters {
    view: PeopleView;
    query: string;
}

export interface PeopleNetwork {
    followers_count: number;
    following_count: number;
    follow_requests_count: number;
}
