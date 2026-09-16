import { PasswordInput } from '@/components/ui/password-input';
import { useTranslation } from '@/lib/i18n';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface RegisterForm {
    [key: string]: string;
    name: string;
    username: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export default function Register() {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title={t('Join BlackFrame')} description={t('Create a profile for the photos and people you care about.')}>
            <Head title={t('Register')} />
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">{t('Name')}</Label>
                        <Input
                            id="name"
                            aria-invalid={!!errors.name}
                            aria-describedby="name-error"
                            type="text"
                            required
                            autoFocus
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder={t('Full name')}
                        />
                        <InputError id="name-error" message={errors.name} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="username">{t('Username')}</Label>
                        <Input
                            id="username"
                            type="text"
                            required
                            autoComplete="username"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value.toLowerCase())}
                            disabled={processing}
                            placeholder="maya.santos"
                            aria-describedby="username-help"
                        />
                        <p id="username-help" className="text-muted-foreground text-xs">
                            {t('Use lowercase letters, numbers, periods, or underscores.')}
                        </p>
                        <InputError message={errors.username} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">{t('Email address')}</Label>
                        <Input
                            id="email"
                            aria-invalid={!!errors.email}
                            aria-describedby="email-error"
                            type="email"
                            required
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="email@example.com"
                        />
                        <InputError id="email-error" message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">{t('Password')}</Label>
                        <PasswordInput
                            id="password"
                            aria-invalid={!!errors.password}
                            aria-describedby="password-error"
                            required
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder={t('Password')}
                        />
                        <InputError id="password-error" message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">{t('Confirm password')}</Label>
                        <PasswordInput
                            id="password_confirmation"
                            aria-invalid={!!errors.password_confirmation}
                            aria-describedby="password_confirmation-error"
                            required
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder={t('Confirm password')}
                        />
                        <InputError id="password_confirmation-error" message={errors.password_confirmation} />
                    </div>

                    <Button type="submit" className="mt-2 min-h-11 w-full cursor-pointer rounded-xl" disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {t('Create account')}
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    {t('Already have an account?')} <TextLink href={route('login')}>{t('Log in')}</TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
