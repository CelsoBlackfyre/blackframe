import { FeedPost, Paginated } from '@/types/feed';
import { PulsePost } from '@/types/pulse';
import { ShelfStatus, SubjectSummary } from '@/types/subjects';

export type ProfileView = 'posts' | 'pulse' | 'shelf' | 'about';

export interface ProfileCounts {
    posts: number;
    visual_posts: number;
    pulse_posts: number;
    shelf: number;
    followers: number;
    following: number;
}

export interface ProfileActivity {
    label: string;
    progress: string | null;
    subject: Pick<SubjectSummary, 'id' | 'name' | 'slug' | 'type' | 'type_label' | 'image_url'>;
}

export interface PublicProfile {
    id: number;
    name: string;
    username: string;
    bio: string | null;
    website: string | null;
    avatar_url: string | null;
    is_private: boolean;
    is_self: boolean;
    is_following: boolean;
    follows_you: boolean;
    follow_request_pending: boolean;
    incoming_follow_request: boolean;
    can_view_content: boolean;
    joined_at: string;
    counts: ProfileCounts;
    shared_subjects: Array<Pick<SubjectSummary, 'id' | 'name' | 'slug' | 'type' | 'type_label' | 'image_url'>>;
    current_activity: ProfileActivity | null;
}

export interface ProfileShelfEntry {
    id: number;
    status: ShelfStatus;
    status_label: string;
    favorite: boolean;
    rating: number | null;
    progress: string | null;
    subject: Pick<SubjectSummary, 'id' | 'name' | 'slug' | 'type' | 'type_label' | 'image_url'>;
}

export interface ProfilePageProps {
    profile: PublicProfile;
    filters: { tab: ProfileView };
    posts: Paginated<FeedPost> | null;
    pulse: Paginated<PulsePost> | null;
    shelf: Paginated<ProfileShelfEntry> | null;
}
