<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id','user_id','title','type',
        'file_path','file_name','file_size','expiry_date','notes',
    ];

    protected $casts = ['expiry_date' => 'date', 'file_size' => 'integer'];

    public function employee() { return $this->belongsTo(Employee::class); }
    public function uploader() { return $this->belongsTo(User::class, 'user_id'); }
}
