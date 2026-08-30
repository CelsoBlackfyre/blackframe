export type PeopleView = 'discover' | 'followers' | 'following';

export interface PersonSummary {
    id: number;
    name: string;
    username: string;
    bio: string | null;
    avatar_url: string | null;
    followers_count: number;
    posts_count: number;
    is_following: boolean;
    follows_you: boolean;
}

export interface PeopleFilters {
    view: PeopleView;
    query: string;
}

export interface PeopleNetwork {
    followers_count: number;
    following_count: number;
}
