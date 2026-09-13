<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('follows', function (Blueprint $table) {
            $table->timestampTz('accepted_at')->nullable()->index();
        });

        DB::table('follows')->whereNull('accepted_at')->update([
            'accepted_at' => DB::raw('created_at'),
        ]);

        DB::statement('ALTER TABLE follows ADD CONSTRAINT follows_distinct_users_check CHECK (follower_id <> following_id)');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE follows DROP CONSTRAINT IF EXISTS follows_distinct_users_check');

        Schema::table('follows', function (Blueprint $table) {
            $table->dropColumn('accepted_at');
        });
    }
};
