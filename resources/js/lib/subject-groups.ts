import { SubjectType } from '@/types/subjects';
import { BookOpen, Clapperboard, Compass, Gamepad2, Shapes, type LucideIcon } from 'lucide-react';

export interface SubjectGroup {
    id: string;
    label: string;
    types: SubjectType[];
    icon: LucideIcon;
}

/**
 * Media buckets mirror ShelfStatus::labelFor, so a shelf reads the same way
 * whether it is grouped by medium or labelled by status: watching, reading,
 * playing, and exploring. Add new subject types here to place them.
 */
export const SUBJECT_GROUPS: SubjectGroup[] = [
    { id: 'screen', label: 'Films & TV', types: ['movie', 'series', 'anime'], icon: Clapperboard },
    { id: 'print', label: 'Books & comics', types: ['book', 'manga', 'comic'], icon: BookOpen },
    { id: 'games', label: 'Games', types: ['game', 'tabletop_game'], icon: Gamepad2 },
    { id: 'lore', label: 'Characters & franchises', types: ['character', 'franchise'], icon: Compass },
];

const OTHER_GROUP: SubjectGroup = { id: 'other', label: 'Other', types: [], icon: Shapes };

export function subjectGroupFor(type: SubjectType): SubjectGroup {
    return SUBJECT_GROUPS.find((group) => group.types.includes(type)) ?? OTHER_GROUP;
}

/**
 * Splits a taste list into non-empty medium sections, keeping the section order
 * above and grouping identical types together inside each section.
 */
export function groupBySubjectGroup<T>(items: T[], getType: (item: T) => SubjectType): Array<{ group: SubjectGroup; items: T[] }> {
    const sections = SUBJECT_GROUPS.map((group) => {
        const order = new Map(group.types.map((type, index) => [type, index]));

        return {
            group,
            items: items.filter((item) => order.has(getType(item))).sort((a, b) => (order.get(getType(a)) ?? 0) - (order.get(getType(b)) ?? 0)),
        };
    });

    const ungrouped = items.filter((item) => !SUBJECT_GROUPS.some((group) => group.types.includes(getType(item))));

    return [...sections, ...(ungrouped.length > 0 ? [{ group: OTHER_GROUP, items: ungrouped }] : [])].filter((section) => section.items.length > 0);
}

/**
 * Keeps a flat list flat but clusters identical media, so compact surfaces
 * (badge rows, poster grids) group by medium without sparse headings.
 */
export function sortBySubjectGroup<T>(items: T[], getType: (item: T) => SubjectType): T[] {
    return groupBySubjectGroup(items, getType).flatMap((section) => section.items);
}
