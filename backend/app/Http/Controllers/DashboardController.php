<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Attendance;
use App\Models\VacationRequest;
use App\Models\Document;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today()->toDateString();
        $user  = Auth::user();

        // Dashboard personalizado para el empleado
        if ($this->isEmployee()) {
            return $this->employeeDashboard($user, $today);
        }

        $uid    = $this->companyAdminId();
        $empIds = Employee::forUser($uid)->pluck('id');

        return response()->json(['success' => true, 'data' => [
            'employees' => [
                'total'       => Employee::forUser($uid)->count(),
                'active'      => Employee::forUser($uid)->where('status', 'active')->count(),
                'on_vacation' => VacationRequest::whereIn('employee_id', $empIds)->where('status', 'approved')->where('start_date', '<=', $today)->where('end_date', '>=', $today)->count(),
            ],
            'attendance_today' => [
                'present' => Attendance::whereIn('employee_id', $empIds)->where('date', $today)->where('status', 'present')->count(),
                'absent'  => Attendance::whereIn('employee_id', $empIds)->where('date', $today)->where('status', 'absent')->count(),
                'late'    => Attendance::whereIn('employee_id', $empIds)->where('date', $today)->where('status', 'late')->count(),
            ],
            'vacations' => [
                'pending'     => VacationRequest::whereIn('employee_id', $empIds)->where('status', 'pending')->count(),
                'on_vacation' => VacationRequest::whereIn('employee_id', $empIds)->where('status', 'approved')->where('start_date', '<=', $today)->where('end_date', '>=', $today)->count(),
            ],
            'documents' => [
                'expiring_soon' => Document::whereIn('employee_id', $empIds)->whereNotNull('expiry_date')->whereBetween('expiry_date', [$today, Carbon::now()->addDays(30)->toDateString()])->count(),
            ],
            'recent_activity'    => Attendance::whereIn('employee_id', $empIds)->with('employee:id,first_name,last_name')->orderBy('created_at', 'desc')->limit(5)->get(),
            'upcoming_vacations' => VacationRequest::whereIn('employee_id', $empIds)->with('employee:id,first_name,last_name')->where('status', 'approved')->where('start_date', '>=', $today)->orderBy('start_date')->limit(5)->get(),
            'unread_notifications' => Notification::forUser($uid)->unread()->count(),
            'today'  => $today,
            'role'   => $user->role,
        ]]);
    }

    private function employeeDashboard($user, string $today): \Illuminate\Http\JsonResponse
    {
        $empId = $user->employee_id;

        if (!$empId) {
            return response()->json(['success' => true, 'data' => [
                'role'        => 'employee',
                'employee'    => null,
                'no_employee' => true,
            ]]);
        }

        $employee  = Employee::find($empId);
        $myEmpIds  = [$empId];

        return response()->json(['success' => true, 'data' => [
            'role'     => 'employee',
            'employee' => $employee,
            'attendance_today' => [
                'my_status' => Attendance::where('employee_id', $empId)->where('date', $today)->value('status') ?? 'Sin registro',
            ],
            'vacations' => [
                'pending'  => VacationRequest::where('employee_id', $empId)->where('status', 'pending')->count(),
                'approved' => VacationRequest::where('employee_id', $empId)->where('status', 'approved')->count(),
                'on_vacation' => VacationRequest::where('employee_id', $empId)->where('status', 'approved')->where('start_date', '<=', $today)->where('end_date', '>=', $today)->count(),
            ],
            'recent_attendance'  => Attendance::where('employee_id', $empId)->orderBy('date', 'desc')->limit(5)->get(),
            'upcoming_vacations' => VacationRequest::where('employee_id', $empId)->where('status', 'approved')->where('start_date', '>=', $today)->orderBy('start_date')->limit(3)->get(),
            'unread_notifications' => Notification::forUser($user->id)->unread()->count(),
            'today' => $today,
        ]]);
    }
}
