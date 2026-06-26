<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('email')->nullable();
            $table->string('phone', 20)->nullable();
            $table->enum('document_type', ['CI','RUT','DNI','PASAPORTE'])->default('CI');
            $table->string('document_number', 20);
            $table->date('birth_date')->nullable();
            $table->date('hire_date');
            $table->string('department', 100);
            $table->string('position', 100);
            $table->decimal('salary', 12, 2)->default(0);
            $table->enum('status', ['active','inactive','suspended'])->default('active');
            $table->string('address', 255)->nullable();
            $table->string('emergency_contact', 100)->nullable();
            $table->string('emergency_phone', 20)->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['user_id','status']);
            $table->index(['user_id','department']);
        });
    }
    public function down(): void { Schema::dropIfExists('employees'); }
};
