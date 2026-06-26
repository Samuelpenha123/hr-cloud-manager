<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id','first_name','last_name','email','phone',
        'document_type','document_number','birth_date','hire_date',
        'department','position','salary','status',
        'address','emergency_contact','emergency_phone',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'hire_date' => 'date',
        'salary' => 'decimal:2',
    ];

    public function user() { return $this->belongsTo(User::class); }
    public function attendances() { return $this->hasMany(Attendance::class); }
    public function vacationRequests() { return $this->hasMany(VacationRequest::class); }
    public function documents() { return $this->hasMany(Document::class); }

    public function getFullNameAttribute() { return "{$this->first_name} {$this->last_name}"; }

    public function scopeForUser($query, $userId) { return $query->where('user_id', $userId); }
    public function scopeActive($query) { return $query->where('status', 'active'); }
}
