import { FeedAuthor, Paginated } from '@/types/feed';
import { PostSubject } from '@/types/subjects';

export interface PulsePost {
    id: number;
    body: string;
    published_at: string | null;
    author: FeedAuthor;
    likes_count: number;
    comments_count: number;
    liked_by_viewer: boolean;
    subjects: PostSubject[];
}

export type PulsePosts = Paginated<PulsePost>;
