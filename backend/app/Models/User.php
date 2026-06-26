<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'company_name',
        'role', 'is_active', 'created_by', 'employee_id',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
        'is_active'         => 'boolean',
    ];

    public function getJWTIdentifier() { return $this->getKey(); }
    public function getJWTCustomClaims(): array
    {
        return ['role' => $this->role, 'company' => $this->company_name];
    }

    /** ID del admin-dueño de la empresa (para filtrar datos por compañía). */
    public function companyAdminId(): int
    {
        return $this->role === 'admin' ? $this->id : (int) $this->created_by;
    }

    public function isEmployee(): bool { return $this->role === 'employee'; }
    public function canManage(): bool  { return in_array($this->role, ['admin', 'manager', 'hr']); }
    public function isAdmin(): bool    { return $this->role === 'admin'; }

    public function employees()       { return $this->hasMany(Employee::class); }
    public function notifications()   { return $this->hasMany(Notification::class); }
    public function linkedEmployee()  { return $this->belongsTo(Employee::class, 'employee_id'); }
    public function createdUsers()    { return $this->hasMany(User::class, 'created_by'); }
    public function creator()         { return $this->belongsTo(User::class, 'created_by'); }
}
