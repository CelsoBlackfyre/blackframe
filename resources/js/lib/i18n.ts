import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useCallback, useEffect } from 'react';

export type TranslationParams = Record<string, string | number>;

/**
 * English strings are the translation keys. A catalog entry may hold two forms
 * separated by "|" (singular|plural), chosen by the `count` param, which is how
 * the fallback also keeps English plurals correct without a catalog entry.
 */
export function translate(key: string, params?: TranslationParams, catalog: Record<string, string> = {}): string {
    const entry = catalog[key] ?? key;
    const forms = entry.split('|');
    const count = params?.count === undefined ? undefined : Number(params.count);
    let text = count !== undefined && forms.length > 1 ? (count === 1 ? forms[0] : forms[1]) : forms[0];

    if (params) {
        for (const [name, value] of Object.entries(params)) {
            text = text.replaceAll(`{${name}}`, String(value));
        }
    }

    return text;
}

/** BCP 47 tag for Intl formatters, e.g. pt_BR -> pt-BR. */
export function intlLocale(locale: string): string {
    return locale.replace('_', '-');
}

export function useTranslation() {
    const { locale, translations } = usePage<SharedData>().props;
    const tag = intlLocale(locale);

    // A language switch happens without a full page load, so the document
    // language has to follow the active locale for assistive technology.
    useEffect(() => {
        document.documentElement.lang = tag;
    }, [tag]);

    // Stable per page, so callers can safely list `t` as a hook dependency.
    const t = useCallback((key: string, params?: TranslationParams) => translate(key, params, translations ?? {}), [translations]);

    return {
        locale,
        intlLocale: tag,
        t,
    };
}
