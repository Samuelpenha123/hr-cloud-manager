<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->dateTime('check_in')->nullable();
            $table->dateTime('check_out')->nullable();
            $table->enum('status', ['present','absent','late','half_day','holiday'])->default('present');
            $table->text('notes')->nullable();
            $table->integer('late_minutes')->default(0);
            $table->timestamps();
            $table->unique(['employee_id','date']);
            $table->index(['employee_id','date']);
        });
    }
    public function down(): void { Schema::dropIfExists('attendances'); }
};
