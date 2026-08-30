<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('match_decisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('target_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('decision', 16);
            $table->timestamps();

            $table->unique(['user_id', 'target_user_id']);
            $table->index(['target_user_id', 'decision']);
            $table->index(['user_id', 'decision']);
        });

        DB::statement("ALTER TABLE match_decisions ADD CONSTRAINT match_decisions_type_check CHECK (decision IN ('connect', 'pass'))");
        DB::statement('ALTER TABLE match_decisions ADD CONSTRAINT match_decisions_distinct_users_check CHECK (user_id <> target_user_id)');
    }

    public function down(): void
    {
        Schema::dropIfExists('match_decisions');
    }
};
