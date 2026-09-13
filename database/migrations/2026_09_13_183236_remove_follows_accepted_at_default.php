<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // accepted_at must be written explicitly: a CURRENT_TIMESTAMP default
        // turns any omitted value into an instantly accepted follow.
        DB::statement('ALTER TABLE follows ALTER COLUMN accepted_at DROP DEFAULT');
    }

    public function down(): void
    {
        if (! Schema::hasColumn('follows', 'accepted_at')) {
            return;
        }

        DB::statement('ALTER TABLE follows ALTER COLUMN accepted_at SET DEFAULT CURRENT_TIMESTAMP');
    }
};
