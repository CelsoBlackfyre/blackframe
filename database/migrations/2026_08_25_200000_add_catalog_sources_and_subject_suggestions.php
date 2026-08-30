<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subjects', function (Blueprint $table) {
            $table->string('source', 40)->nullable()->after('image_url');
            $table->string('source_id', 160)->nullable()->after('source');
            $table->text('source_url')->nullable()->after('source_id');
            $table->foreignId('imported_by')->nullable()->after('source_url')->constrained('users')->nullOnDelete();

            $table->unique(['source', 'source_id']);
        });

        Schema::create('subject_suggestions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 24);
            $table->string('name', 160);
            $table->string('normalized_name', 160);
            $table->text('source_url')->nullable();
            $table->text('notes')->nullable();
            $table->string('status', 24)->default('pending');
            $table->timestamps();

            $table->unique(['type', 'normalized_name']);
            $table->index(['status', 'created_at']);
        });

        DB::statement("ALTER TABLE subject_suggestions ADD CONSTRAINT subject_suggestions_type_check CHECK (type IN ('game', 'movie', 'series', 'anime', 'manga', 'book', 'comic', 'character', 'franchise', 'tabletop_game'))");
        DB::statement("ALTER TABLE subject_suggestions ADD CONSTRAINT subject_suggestions_status_check CHECK (status IN ('pending', 'approved', 'rejected'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('subject_suggestions');

        Schema::table('subjects', function (Blueprint $table) {
            $table->dropUnique(['source', 'source_id']);
            $table->dropConstrainedForeignId('imported_by');
            $table->dropColumn(['source', 'source_id', 'source_url']);
        });
    }
};
