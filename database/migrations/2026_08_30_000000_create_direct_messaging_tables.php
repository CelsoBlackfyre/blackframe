<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->string('direct_key', 64)->unique();
            $table->timestampTz('last_message_at')->nullable();
            $table->timestampsTz();

            $table->index('last_message_at');
        });

        Schema::create('conversation_user', function (Blueprint $table) {
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestampTz('last_read_at')->nullable();
            $table->unsignedInteger('unread_count')->default(0);
            $table->timestampsTz();

            $table->primary(['conversation_id', 'user_id']);
            $table->index(['user_id', 'unread_count']);
        });

        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('body');
            $table->timestampsTz();
            $table->softDeletesTz();

            $table->index(['conversation_id', 'created_at']);
            $table->index(['user_id', 'created_at']);
        });

        DB::statement('ALTER TABLE messages ADD CONSTRAINT messages_body_check CHECK (char_length(btrim(body)) BETWEEN 1 AND 2000)');
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
        Schema::dropIfExists('conversation_user');
        Schema::dropIfExists('conversations');
    }
};
