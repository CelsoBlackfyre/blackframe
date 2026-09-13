<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'bio',
        'website',
        'avatar_path',
        'banner_path',
        'is_private',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_private' => 'boolean',
        ];
    }

    protected $appends = ['avatar_url', 'banner_url'];

    public function getAvatarUrlAttribute(): ?string
    {
        return $this->profileImageUrl($this->avatar_path);
    }

    public function getBannerUrlAttribute(): ?string
    {
        return $this->profileImageUrl($this->banner_path);
    }

    private function profileImageUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return Storage::disk('public')->url($path);
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function following(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'follower_id', 'following_id')
            ->wherePivotNotNull('accepted_at')
            ->withPivot('accepted_at')
            ->withTimestamps();
    }

    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'following_id', 'follower_id')
            ->wherePivotNotNull('accepted_at')
            ->withPivot('accepted_at')
            ->withTimestamps();
    }

    public function pendingFollowing(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'follower_id', 'following_id')
            ->wherePivotNull('accepted_at')
            ->withPivot('accepted_at')
            ->withTimestamps();
    }

    public function pendingFollowers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'following_id', 'follower_id')
            ->wherePivotNull('accepted_at')
            ->withPivot('accepted_at')
            ->withTimestamps();
    }

    public function canViewContentFrom(User $profile): bool
    {
        return $this->is($profile)
            || ! $profile->is_private
            || $this->following()->whereKey($profile->id)->exists();
    }

    public function shelfEntries(): HasMany
    {
        return $this->hasMany(UserSubject::class);
    }

    public function matchDecisions(): HasMany
    {
        return $this->hasMany(MatchDecision::class);
    }

    public function receivedMatchDecisions(): HasMany
    {
        return $this->hasMany(MatchDecision::class, 'target_user_id');
    }

    public function conversations(): BelongsToMany
    {
        return $this->belongsToMany(Conversation::class)
            ->withPivot(['last_read_at', 'unread_count'])
            ->withTimestamps();
    }
}
