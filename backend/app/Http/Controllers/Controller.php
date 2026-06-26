<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;

abstract class Controller
{
    /** ID del admin-empresa para filtrar datos con scope forUser(). */
    protected function companyAdminId(): int
    {
        return Auth::user()->companyAdminId();
    }

    /** IDs de empleados de la empresa (o solo el propio si es rol employee). */
    protected function companyEmployeeIds()
    {
        $user = Auth::user();
        if ($user->isEmployee()) {
            return $user->employee_id ? [$user->employee_id] : [];
        }
        return \App\Models\Employee::forUser($this->companyAdminId())->pluck('id');
    }

    protected function isEmployee(): bool { return Auth::user()->isEmployee(); }
    protected function canManage(): bool  { return Auth::user()->canManage(); }
    protected function isAdmin(): bool    { return Auth::user()->isAdmin(); }
    protected function myEmployeeId(): ?int { return Auth::user()->employee_id; }
}
