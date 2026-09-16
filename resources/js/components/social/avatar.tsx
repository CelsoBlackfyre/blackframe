import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface SocialAvatarProps {
    name: string;
    src?: string | null;
    className?: string;
}

export function SocialAvatar({ name, src, className }: SocialAvatarProps) {
    const { t } = useTranslation();
    const getInitials = useInitials();

    return (
        <Avatar className={cn('border-border bg-muted size-11 border', className)}>
            {src && <AvatarImage src={src} alt={t("{name}'s profile photo", { name })} />}
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">{getInitials(name)}</AvatarFallback>
        </Avatar>
    );
}
