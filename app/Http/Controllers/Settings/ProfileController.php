<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $validated = $request->safe()->except(['avatar', 'banner']);

        $uploads = [
            'avatar_path' => ['file' => $request->file('avatar'), 'directory' => 'avatars'],
            'banner_path' => ['file' => $request->file('banner'), 'directory' => 'banners'],
        ];

        foreach ($uploads as $column => $upload) {
            if (! $upload['file']) {
                continue;
            }

            $validated[$column] = $this->storeProfileImage($upload['file'], $request->user(), $upload['directory']);
            $this->deletePreviousProfileImage($request->user()->getOriginal($column));
        }

        $request->user()->fill($validated);

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return to_route('profile.edit');
    }

    private function storeProfileImage(UploadedFile $file, User $user, string $directory): string
    {
        $path = $file->store($directory.'/'.$user->getKey(), 'public');

        if (! $path) {
            throw new RuntimeException('The image could not be stored.');
        }

        return $path;
    }

    private function deletePreviousProfileImage(?string $path): void
    {
        if ($path && ! str_starts_with($path, 'http')) {
            Storage::disk('public')->delete($path);
        }
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
