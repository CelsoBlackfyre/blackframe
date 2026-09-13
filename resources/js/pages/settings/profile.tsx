import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Camera, ImagePlus } from 'lucide-react';
import { ChangeEvent, FormEventHandler, useState } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useInitials } from '@/hooks/use-initials';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: route('profile.edit'),
    },
];

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;
    const [preview, setPreview] = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<{
        name: string;
        username: string;
        email: string;
        bio: string;
        website: string;
        is_private: boolean;
        avatar: File | null;
        banner: File | null;
    }>({
        name: auth.user.name,
        username: auth.user.username,
        email: auth.user.email,
        bio: auth.user.bio ?? '',
        website: auth.user.website ?? '',
        is_private: auth.user.is_private,
        avatar: null,
        banner: null,
    });

    const getInitials = useInitials();
    const initials = getInitials(auth.user.name);

    const pickImage = (files: FileList | null, current: string | null, setUrl: (url: string | null) => void): File | null => {
        const file = files?.[0] ?? null;

        if (current) {
            URL.revokeObjectURL(current);
        }

        setUrl(file ? URL.createObjectURL(file) : null);

        return file;
    };

    const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = pickImage(e.target.files, preview, setPreview);
        setData('avatar', file);
        e.target.value = '';
    };

    const handleBannerChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = pickImage(e.target.files, bannerPreview, setBannerPreview);
        setData('banner', file);
        e.target.value = '';
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            onSuccess: () => {
                if (preview) {
                    URL.revokeObjectURL(preview);
                }

                if (bannerPreview) {
                    URL.revokeObjectURL(bannerPreview);
                }

                setPreview(null);
                setBannerPreview(null);
                setData('avatar', null);
                setData('banner', null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Profile information" description="Update your name and email address" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label>Profile banner</Label>

                            <div
                                className={cn(
                                    'border-border bg-accent relative h-28 overflow-hidden rounded-xl border sm:h-36',
                                    !bannerPreview && !auth.user.banner_url && 'border-dashed',
                                )}
                            >
                                {bannerPreview || auth.user.banner_url ? (
                                    <img
                                        src={bannerPreview ?? auth.user.banner_url ?? undefined}
                                        alt="Profile banner preview"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="text-muted-foreground flex h-full items-center justify-center">
                                        <ImagePlus className="size-6" strokeWidth={1.5} aria-hidden="true" />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <div>
                                    <input
                                        id="banner"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="sr-only"
                                        onChange={handleBannerChange}
                                        aria-describedby="banner-help"
                                    />
                                    <Label
                                        htmlFor="banner"
                                        className="border-input hover:bg-accent hover:text-accent-foreground inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border px-5 text-sm font-medium"
                                    >
                                        <ImagePlus className="h-4 w-4" aria-hidden="true" />
                                        {bannerPreview || auth.user.banner_url ? 'Change banner' : 'Add banner'}
                                    </Label>
                                </div>

                                <p id="banner-help" className="text-muted-foreground text-xs">
                                    Shown across the top of your profile. JPG, PNG, or WebP. Up to 4 MB.
                                </p>
                            </div>

                            <InputError message={errors.banner} />
                        </div>

                        <div className="grid gap-2">
                            <Label>Profile photo</Label>

                            <div className="flex items-center gap-4">
                                <Avatar className="border-border h-20 w-20 border">
                                    <AvatarImage src={preview ?? auth.user.avatar_url ?? undefined} alt={`${auth.user.name}'s profile photo`} />
                                    <AvatarFallback>{initials}</AvatarFallback>
                                </Avatar>

                                <div className="grid gap-2">
                                    <div>
                                        <input
                                            id="avatar"
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            className="sr-only"
                                            onChange={handleAvatarChange}
                                            aria-describedby="avatar-help"
                                        />
                                        <Label
                                            htmlFor="avatar"
                                            className="border-input hover:bg-accent hover:text-accent-foreground inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border px-5 text-sm font-medium"
                                        >
                                            <Camera className="h-4 w-4" aria-hidden="true" />
                                            {preview || auth.user.avatar_url ? 'Change photo' : 'Upload photo'}
                                        </Label>
                                    </div>

                                    <p id="avatar-help" className="text-muted-foreground text-xs">
                                        JPG, PNG, or WebP. Up to 2 MB.
                                    </p>

                                    <InputError message={errors.avatar} />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>

                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder="Full name"
                            />

                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="username">Username</Label>

                            <Input
                                id="username"
                                className="mt-1 block w-full"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value.toLowerCase())}
                                required
                                autoComplete="username"
                                placeholder="your.username"
                                aria-describedby="username-help"
                            />
                            <p id="username-help" className="text-muted-foreground text-xs">
                                Lowercase letters, numbers, periods, and underscores only.
                            </p>

                            <InputError className="mt-2" message={errors.username} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />

                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                value={data.bio}
                                onChange={(e) => setData('bio', e.target.value)}
                                maxLength={160}
                                rows={4}
                                className="min-h-28 resize-y px-3 py-2 text-sm"
                                placeholder="What do you like to share?"
                            />
                            <div className="text-muted-foreground flex items-center justify-between gap-4 text-xs">
                                <span>Shown on your public profile.</span>
                                <span className="tabular-nums">{data.bio.length}/160</span>
                            </div>
                            <InputError className="mt-2" message={errors.bio} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="website">Website</Label>
                            <Input
                                id="website"
                                type="url"
                                value={data.website}
                                onChange={(e) => setData('website', e.target.value)}
                                autoComplete="url"
                                placeholder="https://example.com"
                            />
                            <InputError className="mt-2" message={errors.website} />
                        </div>

                        <div className="border-border flex items-start gap-3 rounded-xl border p-4">
                            <Checkbox
                                id="is_private"
                                checked={data.is_private}
                                onCheckedChange={(checked) => setData('is_private', checked === true)}
                            />
                            <div className="grid gap-1">
                                <Label htmlFor="is_private">Private profile</Label>
                                <p className="text-muted-foreground text-xs leading-5">
                                    Only followers you approve can see your posts, Pulse updates, Geek Shelf, and cultural activity.
                                </p>
                                <InputError message={errors.is_private} />
                            </div>
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="mt-2 text-sm text-neutral-800">
                                    Your email address is unverified.
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="rounded-md text-sm text-neutral-600 underline hover:text-neutral-900 focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
                                    >
                                        Click here to re-send the verification email.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing} className="min-h-11 cursor-pointer rounded-xl px-5">
                                {processing ? 'Saving...' : 'Save profile'}
                            </Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
