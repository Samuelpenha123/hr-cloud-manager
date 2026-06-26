<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VacationRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id','start_date','end_date','days_requested',
        'reason','status','approved_by','approved_at','rejection_reason',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'approved_at' => 'datetime',
        'days_requested' => 'integer',
    ];

    public function employee() { return $this->belongsTo(Employee::class); }
    public function approver() { return $this->belongsTo(User::class, 'approved_by'); }
    public function scopePending($query) { return $query->where('status', 'pending'); }
}
