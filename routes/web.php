<?php

use App\Http\Controllers\CatalogController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\DirectController;
use App\Http\Controllers\DirectConversationController;
use App\Http\Controllers\DirectMessageController;
use App\Http\Controllers\FeedController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\MatchController;
use App\Http\Controllers\MatchDecisionController;
use App\Http\Controllers\PeopleController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\PostMediaController;
use App\Http\Controllers\ProfileConnectionsController;
use App\Http\Controllers\PublicProfileController;
use App\Http\Controllers\PulseController;
use App\Http\Controllers\ShelfController;
use App\Http\Controllers\SubjectSuggestionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::post('locale', [LocaleController::class, 'update'])->name('locale.update');

Route::middleware(['auth'])->group(function () {
    Route::get('feed', FeedController::class)->name('feed');
    Route::get('pulse', PulseController::class)->name('pulse');
    Route::get('people', PeopleController::class)
        ->middleware('throttle:people-search')
        ->name('people.index');
    Route::get('profiles/{user:username}', PublicProfileController::class)->name('profiles.show');
    Route::get('profiles/{user:username}/connections', ProfileConnectionsController::class)
        ->name('profiles.connections');
    Route::get('matches', MatchController::class)->name('matches.index');
    Route::post('matches/{user}/decision', [MatchDecisionController::class, 'store'])
        ->middleware('throttle:match-decisions')
        ->name('matches.decisions.store');
    Route::delete('matches/{user}/decision', [MatchDecisionController::class, 'destroy'])
        ->middleware('throttle:match-decisions')
        ->name('matches.decisions.destroy');

    Route::get('direct', [DirectController::class, 'index'])->name('direct.index');
    Route::post('direct/{user}', [DirectConversationController::class, 'store'])
        ->middleware('throttle:direct-conversations')
        ->name('direct.start');
    Route::get('direct/{conversation}', [DirectController::class, 'show'])->name('direct.show');
    Route::post('direct/{conversation}/messages', [DirectMessageController::class, 'store'])
        ->middleware('throttle:direct-messages')
        ->name('direct.messages.store');
    Route::redirect('dashboard', 'feed')->name('dashboard');

    Route::get('catalog/search', [CatalogController::class, 'search'])
        ->middleware('throttle:catalog-search')
        ->name('catalog.search');
    Route::post('catalog/suggestions', [SubjectSuggestionController::class, 'store'])
        ->middleware('throttle:catalog-suggestions')
        ->name('catalog.suggestions.store');

    Route::get('shelf', [ShelfController::class, 'index'])->name('shelf.index');
    Route::post('shelf', [ShelfController::class, 'store'])
        ->middleware('throttle:social-interactions')
        ->name('shelf.store');
    Route::patch('shelf/{shelfEntry}', [ShelfController::class, 'update'])
        ->middleware('throttle:social-interactions')
        ->name('shelf.update');
    Route::delete('shelf/{shelfEntry}', [ShelfController::class, 'destroy'])
        ->middleware('throttle:social-interactions')
        ->name('shelf.destroy');

    Route::get('posts/create', [PostController::class, 'create'])->name('posts.create');
    Route::get('posts/{post}/media/{media}', PostMediaController::class)->name('posts.media.show');
    Route::get('posts/{post}/comments', [CommentController::class, 'index'])->name('posts.comments.index');
    Route::post('posts/{post}/comments', [CommentController::class, 'store'])
        ->middleware('throttle:social-interactions')
        ->name('posts.comments.store');
    Route::delete('posts/{post}/comments/{comment}', [CommentController::class, 'destroy'])
        ->middleware('throttle:social-interactions')
        ->name('posts.comments.destroy');
    Route::post('posts', [PostController::class, 'store'])
        ->middleware('throttle:content-creation')
        ->name('posts.store');
    Route::delete('posts/{post}', [PostController::class, 'destroy'])
        ->middleware('throttle:social-interactions')
        ->name('posts.destroy');

    Route::post('posts/{post}/likes', [LikeController::class, 'store'])
        ->middleware('throttle:social-interactions')
        ->name('posts.likes.store');
    Route::delete('posts/{post}/likes', [LikeController::class, 'destroy'])
        ->middleware('throttle:social-interactions')
        ->name('posts.likes.destroy');

    Route::post('people/{user}/follow', [FollowController::class, 'store'])
        ->middleware('throttle:social-interactions')
        ->name('people.follow.store');
    Route::delete('people/{user}/follow', [FollowController::class, 'destroy'])
        ->middleware('throttle:social-interactions')
        ->name('people.follow.destroy');
    Route::patch('people/follow-requests/{user}/accept', [FollowController::class, 'accept'])
        ->middleware('throttle:social-interactions')
        ->name('people.follow-requests.accept');
    Route::delete('people/follow-requests/{user}', [FollowController::class, 'decline'])
        ->middleware('throttle:social-interactions')
        ->name('people.follow-requests.decline');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
