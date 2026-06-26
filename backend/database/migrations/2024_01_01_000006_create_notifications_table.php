<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title', 255);
            $table->text('message');
            $table->enum('type', ['info','success','warning','error'])->default('info');
            $table->boolean('is_read')->default(false);
            $table->unsignedBigInteger('related_id')->nullable();
            $table->string('related_type', 50)->nullable();
            $table->timestamps();
            $table->index(['user_id','is_read']);
        });
    }
    public function down(): void { Schema::dropIfExists('notifications'); }
};
