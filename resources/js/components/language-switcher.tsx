import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/lib/i18n';
import { SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Languages } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function LanguageSwitcher({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { locale, locale_options } = usePage<SharedData>().props;
    const { t } = useTranslation();

    const switchTo = (value: string) => {
        if (value === locale) return;

        router.post(route('locale.update'), { locale: value }, { preserveScroll: true });
    };

    return (
        <div className={className} {...props}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-11 rounded-xl">
                        <Languages className="h-5 w-5" aria-hidden="true" />
                        <span className="sr-only">{t('Change language')}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuRadioGroup value={locale} onValueChange={switchTo}>
                        {locale_options.map((option) => (
                            <DropdownMenuRadioItem key={option.value} value={option.value}>
                                {option.label}
                            </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
