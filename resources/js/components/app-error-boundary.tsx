import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { Component, ErrorInfo, ReactNode } from 'react';

export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
    state = { failed: false };
    static getDerivedStateFromError() {
        return { failed: true };
    }
    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('BlackFrame could not render this page.', error, info);
    }
    render() {
        if (!this.state.failed) return this.props.children;
        return <Fallback />;
    }
}

function Fallback() {
    const { t } = useTranslation();
    return (
        <main className="bg-background flex min-h-dvh items-center justify-center p-6">
            <div className="max-w-md text-center">
                <h1 className="text-3xl font-semibold tracking-tight">{t('Let’s try that again.')}</h1>
                <p className="text-muted-foreground mt-3 leading-7">{t('This page couldn’t load. Reload to get back to your community.')}</p>
                <Button className="mt-6" onClick={() => window.location.reload()}>
                    {t('Reload page')}
                </Button>
            </div>
        </main>
    );
}
