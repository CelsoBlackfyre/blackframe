<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('subjects')->nullOnDelete();
            $table->string('type', 24);
            $table->string('name', 160);
            $table->string('slug', 180)->unique();
            $table->text('description')->nullable();
            $table->string('image_url')->nullable();
            $table->jsonb('metadata')->nullable();
            $table->timestamps();

            $table->index(['type', 'name']);
        });

        Schema::create('post_subject', function (Blueprint $table) {
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();

            $table->primary(['post_id', 'subject_id']);
            $table->index(['subject_id', 'post_id']);
        });

        Schema::create('user_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->string('status', 24);
            $table->boolean('favorite')->default(false);
            $table->decimal('rating', 3, 1)->nullable();
            $table->string('progress', 120)->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'subject_id']);
            $table->index(['user_id', 'status']);
            $table->index(['subject_id', 'status']);
        });

        DB::statement("ALTER TABLE subjects ADD CONSTRAINT subjects_type_check CHECK (type IN ('game', 'movie', 'series', 'anime', 'manga', 'book', 'comic', 'character', 'franchise', 'tabletop_game'))");
        DB::statement("ALTER TABLE user_subjects ADD CONSTRAINT user_subjects_status_check CHECK (status IN ('current', 'completed', 'backlog', 'paused', 'dropped'))");
        DB::statement('ALTER TABLE user_subjects ADD CONSTRAINT user_subjects_rating_check CHECK (rating IS NULL OR (rating >= 1 AND rating <= 10))');
    }

    public function down(): void
    {
        Schema::dropIfExists('user_subjects');
        Schema::dropIfExists('post_subject');
        Schema::dropIfExists('subjects');
    }
};
