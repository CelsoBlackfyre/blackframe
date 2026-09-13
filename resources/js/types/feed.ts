import { PostSubject } from '@/types/subjects';

export interface FeedAuthor {
    id: number;
    name: string;
    username: string;
    avatar_url: string | null;
}

export interface FeedMedia {
    id: number;
    url: string;
    thumb_url: string;
    medium_url: string;
    alt_text: string;
    width: number | null;
    height: number | null;
}

export interface FeedComment {
    id: number;
    body: string;
    author: Pick<FeedAuthor, 'name' | 'username'>;
}

export interface FeedPost {
    id: number;
    caption: string | null;
    location: string | null;
    published_at: string | null;
    author: FeedAuthor;
    media: FeedMedia[];
    likes_count: number;
    comments_count: number;
    liked_by_viewer: boolean;
    subjects: PostSubject[];
    comments: FeedComment[];
}

export interface CreatorSuggestion extends FeedAuthor {
    followers_count: number;
    posts_count: number;
    shared_titles_count: number;
    recommendation_reason: string | null;
}

export interface FeedActivation {
    shelf_count: number;
    following_count: number;
    published_posts_count: number;
}

export interface FeedShelfEntry {
    id: number;
    status_label: string;
    progress: string | null;
    subject: PostSubject & { image_url: string | null };
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    links: PaginationLink[];
    next_page_url: string | null;
    prev_page_url: string | null;
    total: number;
}
