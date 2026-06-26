<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $empIds = $this->companyEmployeeIds();
        $q = Attendance::whereIn('employee_id', $empIds)->with('employee:id,first_name,last_name,department');

        if ($request->employee_id) $q->where('employee_id', $request->employee_id);
        if ($request->date_from)   $q->where('date', '>=', $request->date_from);
        if ($request->date_to)     $q->where('date', '<=', $request->date_to);
        if ($request->status && $request->status !== 'all') $q->where('status', $request->status);

        return response()->json(['success' => true, 'data' => $q->orderBy('date', 'desc')->paginate($request->get('per_page', 20))]);
    }

    /** Empleado marca su propia entrada */
    public function checkIn()
    {
        $empId = $this->myEmployeeId();
        if (!$empId) return response()->json(['success' => false, 'message' => 'Tu cuenta no tiene un empleado vinculado.'], 403);

        $today = Carbon::today()->toDateString();
        $now   = Carbon::now();

        $existing = Attendance::where('employee_id', $empId)->where('date', $today)->first();
        if ($existing) {
            return response()->json(['success' => false, 'message' => 'Ya registraste tu entrada hoy.', 'data' => $existing], 409);
        }

        $workStart = Carbon::today()->setTimeFromTimeString('09:00');
        $lateMin   = $now->gt($workStart) ? (int) $workStart->diffInMinutes($now) : 0;
        $status    = $lateMin > 0 ? 'late' : 'present';

        $att = Attendance::create([
            'employee_id'  => $empId,
            'date'         => $today,
            'check_in'     => $now,
            'status'       => $status,
            'late_minutes' => $lateMin,
        ]);

        return response()->json(['success' => true, 'message' => 'Entrada registrada correctamente.', 'data' => $att], 201);
    }

    /** Empleado marca su propia salida */
    public function checkOut()
    {
        $empId = $this->myEmployeeId();
        if (!$empId) return response()->json(['success' => false, 'message' => 'Tu cuenta no tiene un empleado vinculado.'], 403);

        $today = Carbon::today()->toDateString();
        $att   = Attendance::where('employee_id', $empId)->where('date', $today)->first();

        if (!$att) {
            return response()->json(['success' => false, 'message' => 'No tienes una entrada registrada hoy. Marca tu entrada primero.'], 404);
        }
        if ($att->check_out) {
            return response()->json(['success' => false, 'message' => 'Ya registraste tu salida hoy.', 'data' => $att], 409);
        }

        $att->update(['check_out' => Carbon::now()]);
        return response()->json(['success' => true, 'message' => 'Salida registrada correctamente.', 'data' => $att->fresh()]);
    }

    /** Estado de asistencia del empleado para hoy */
    public function todayStatus()
    {
        $empId = $this->myEmployeeId();
        if (!$empId) return response()->json(['success' => false, 'message' => 'Sin empleado vinculado.'], 403);

        $att = Attendance::where('employee_id', $empId)->where('date', Carbon::today()->toDateString())->first();
        return response()->json(['success' => true, 'data' => $att]);
    }

    public function store(Request $request)
    {
        if ($this->isEmployee()) {
            return response()->json(['success' => false, 'message' => 'No autorizado para registrar asistencia.'], 403);
        }

        $v = Validator::make($request->all(), [
            'employee_id' => 'required|integer|exists:employees,id',
            'date'        => 'required|date',
            'check_in'    => 'nullable|date_format:H:i',
            'check_out'   => 'nullable|date_format:H:i',
            'status'      => 'required|in:present,absent,late,half_day,holiday',
        ]);

        if ($v->fails()) return response()->json(['success' => false, 'message' => 'Error de validación', 'errors' => $v->errors()], 422);

        $emp = Employee::forUser($this->companyAdminId())->find($request->employee_id);
        if (!$emp) return response()->json(['success' => false, 'message' => 'Empleado no autorizado'], 403);

        if (Attendance::where('employee_id', $request->employee_id)->where('date', $request->date)->exists()) {
            return response()->json(['success' => false, 'message' => 'Ya existe un registro para este empleado en esa fecha.'], 409);
        }

        $lateMin = 0;
        if ($request->check_in) {
            $ci = Carbon::createFromFormat('H:i', $request->check_in);
            $ws = Carbon::createFromFormat('H:i', '09:00');
            if ($ci->gt($ws)) $lateMin = $ws->diffInMinutes($ci);
        }

        $att = Attendance::create([
            'employee_id'  => $request->employee_id,
            'date'         => $request->date,
            'check_in'     => $request->check_in ? Carbon::parse($request->date . ' ' . $request->check_in) : null,
            'check_out'    => $request->check_out ? Carbon::parse($request->date . ' ' . $request->check_out) : null,
            'status'       => $request->status,
            'notes'        => $request->notes,
            'late_minutes' => $lateMin,
        ]);

        return response()->json(['success' => true, 'message' => 'Asistencia registrada', 'data' => $att->load('employee:id,first_name,last_name')], 201);
    }

    public function show($id)
    {
        $empIds = $this->companyEmployeeIds();
        $att = Attendance::whereIn('employee_id', $empIds)->with('employee')->find($id);
        if (!$att) return response()->json(['success' => false, 'message' => 'No encontrado'], 404);
        return response()->json(['success' => true, 'data' => $att]);
    }

    public function update(Request $request, $id)
    {
        if ($this->isEmployee()) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $empIds = $this->companyEmployeeIds();
        $att = Attendance::whereIn('employee_id', $empIds)->find($id);
        if (!$att) return response()->json(['success' => false, 'message' => 'No encontrado'], 404);

        $att->update([
            'check_in'  => $request->check_in ? Carbon::parse($att->date . ' ' . $request->check_in) : null,
            'check_out' => $request->check_out ? Carbon::parse($att->date . ' ' . $request->check_out) : null,
            'status'    => $request->status ?? $att->status,
            'notes'     => $request->notes,
        ]);

        return response()->json(['success' => true, 'message' => 'Registro actualizado', 'data' => $att->fresh()]);
    }

    public function destroy($id)
    {
        if ($this->isEmployee()) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $empIds = $this->companyEmployeeIds();
        $att = Attendance::whereIn('employee_id', $empIds)->find($id);
        if (!$att) return response()->json(['success' => false, 'message' => 'No encontrado'], 404);
        $att->delete();
        return response()->json(['success' => true, 'message' => 'Registro eliminado']);
    }

    public function report(Request $request)
    {
        if ($this->isEmployee()) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $empIds = $this->companyEmployeeIds();
        $from = $request->get('from', Carbon::now()->startOfMonth()->toDateString());
        $to   = $request->get('to', Carbon::now()->endOfMonth()->toDateString());

        $report = Attendance::whereIn('employee_id', $empIds)
            ->with('employee:id,first_name,last_name,department')
            ->whereBetween('date', [$from, $to])->get()
            ->groupBy('employee_id')
            ->map(fn($recs) => [
                'employee'     => $recs->first()->employee->full_name,
                'department'   => $recs->first()->employee->department,
                'present'      => $recs->where('status', 'present')->count(),
                'absent'       => $recs->where('status', 'absent')->count(),
                'late'         => $recs->where('status', 'late')->count(),
                'half_day'     => $recs->where('status', 'half_day')->count(),
                'late_minutes' => $recs->sum('late_minutes'),
            ])->values();

        return response()->json(['success' => true, 'data' => ['from' => $from, 'to' => $to, 'report' => $report]]);
    }
}
