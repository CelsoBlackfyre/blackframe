import HeadingSmall from '@/components/heading-small';
import { useTranslation } from '@/lib/i18n';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

export default function Language() {
    const { locale, locale_options } = usePage<SharedData>().props;
    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('Language settings'),
            href: route('language'),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Language settings')} />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title={t('Language settings')} description={t('Choose the language you want to read BlackFrame in.')} />

                    <fieldset className="space-y-3">
                        <legend className="text-sm font-medium">{t('Display language')}</legend>
                        {locale_options.map((option) => (
                            <label
                                key={option.value}
                                className="border-border hover:bg-muted/50 flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors"
                            >
                                <input
                                    type="radio"
                                    name="locale"
                                    value={option.value}
                                    checked={locale === option.value}
                                    onChange={() => router.post(route('locale.update'), { locale: option.value }, { preserveScroll: true })}
                                    className="accent-primary size-4"
                                />
                                {option.label}
                            </label>
                        ))}
                    </fieldset>

                    <p className="text-muted-foreground text-sm leading-6">
                        {t('Your choice is remembered in this browser, and the site follows your browser language until you change it.')}
                    </p>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
