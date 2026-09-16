import { PageHeading } from '@/components/page-heading';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { Languages, LockKeyhole, Palette, UserRound } from 'lucide-react';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const currentPath = usePage().url.split('?')[0];
    const { t } = useTranslation();
    const sections = [
        { title: t('Profile'), url: '/settings/profile', icon: UserRound },
        { title: t('Password'), url: '/settings/password', icon: LockKeyhole },
        { title: t('Appearance'), url: '/settings/appearance', icon: Palette },
        { title: t('Language'), url: '/settings/language', icon: Languages },
    ];
    return (
        <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-[1100px] px-4 py-6 pb-28 sm:px-6 sm:py-8 md:pb-10">
            <PageHeading title={t('Make yourself at home.')} description={t('Your profile, your preferences, your BlackFrame.')} />
            <div className="mt-8 grid gap-8 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-12">
                <aside>
                    <nav aria-label={t('Settings')} className="flex flex-wrap gap-2 lg:flex-col">
                        {sections.map((section) => (
                            <Button
                                key={section.url}
                                asChild
                                variant="ghost"
                                className={cn('justify-start gap-3 lg:w-full', currentPath === section.url && 'bg-accent text-accent-foreground')}
                            >
                                <Link href={section.url} prefetch aria-current={currentPath === section.url ? 'page' : undefined}>
                                    <section.icon aria-hidden="true" />
                                    {section.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>
                <div className="border-border bg-card min-w-0 rounded-2xl border p-5 sm:p-8">
                    <section className="max-w-xl space-y-10">{children}</section>
                </div>
            </div>
        </main>
    );
}
