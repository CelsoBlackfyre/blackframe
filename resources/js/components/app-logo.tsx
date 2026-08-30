import AppLogoIcon from './app-logo-icon';

export default function AppLogo({ compact = false }: { compact?: boolean }) {
    return (
        <>
            <div className="bg-primary flex aspect-square size-9 shrink-0 items-center justify-center rounded-xl p-1 shadow-sm ring-1 ring-black/5">
                <AppLogoIcon className="size-full" aria-hidden="true" />
            </div>
            {!compact && (
                <div className="ml-1 grid flex-1 text-left text-sm">
                    <span className="truncate text-base leading-none font-semibold tracking-tight">BlackFrame</span>
                </div>
            )}
        </>
    );
}
