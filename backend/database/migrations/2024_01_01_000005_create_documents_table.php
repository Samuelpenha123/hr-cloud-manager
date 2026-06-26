<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title', 255);
            $table->enum('type', ['contract','certificate','id_document','payroll','other']);
            $table->string('file_path', 500);
            $table->string('file_name', 255);
            $table->integer('file_size')->nullable();
            $table->date('expiry_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['employee_id','type']);
        });
    }
    public function down(): void { Schema::dropIfExists('documents'); }
};
