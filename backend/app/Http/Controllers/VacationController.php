<?php

namespace App\Http\Controllers;

use App\Models\VacationRequest;
use App\Models\Employee;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class VacationController extends Controller
{
    public function index(Request $request)
    {
        $empIds = $this->companyEmployeeIds();
        $q = VacationRequest::whereIn('employee_id', $empIds)->with('employee:id,first_name,last_name,department');

        if ($request->status && $request->status !== 'all') $q->where('status', $request->status);
        if ($request->employee_id) $q->where('employee_id', $request->employee_id);

        return response()->json(['success' => true, 'data' => $q->orderBy('created_at', 'desc')->paginate($request->get('per_page', 15))]);
    }

    public function store(Request $request)
    {
        $v = Validator::make($request->all(), [
            'employee_id' => 'required|integer|exists:employees,id',
            'start_date'  => 'required|date',
            'end_date'    => 'required|date|after_or_equal:start_date',
            'reason'      => 'nullable|string|max:500',
        ]);

        if ($v->fails()) return response()->json(['success' => false, 'message' => 'Error de validación', 'errors' => $v->errors()], 422);

        // Empleado solo puede solicitar para sí mismo
        if ($this->isEmployee() && (int)$request->employee_id !== $this->myEmployeeId()) {
            return response()->json(['success' => false, 'message' => 'Solo puedes solicitar vacaciones para ti mismo.'], 403);
        }

        $emp = Employee::forUser($this->companyAdminId())->find($request->employee_id);
        if (!$emp) return response()->json(['success' => false, 'message' => 'Empleado no autorizado'], 403);

        $overlap = VacationRequest::where('employee_id', $request->employee_id)
            ->where('status', '!=', 'rejected')
            ->where(fn($q) => $q
                ->whereBetween('start_date', [$request->start_date, $request->end_date])
                ->orWhereBetween('end_date', [$request->start_date, $request->end_date]))
            ->exists();

        if ($overlap) return response()->json(['success' => false, 'message' => 'Ya existe una solicitud en ese período.'], 409);

        $days = Carbon::parse($request->start_date)->diffInWeekdays(Carbon::parse($request->end_date)) + 1;

        $vac = VacationRequest::create([
            'employee_id'    => $request->employee_id,
            'start_date'     => $request->start_date,
            'end_date'       => $request->end_date,
            'days_requested' => $days,
            'reason'         => $request->reason,
            'status'         => 'pending',
        ]);

        return response()->json(['success' => true, 'message' => 'Solicitud creada', 'data' => $vac->load('employee:id,first_name,last_name')], 201);
    }

    public function show($id)
    {
        $empIds = $this->companyEmployeeIds();
        $vac = VacationRequest::whereIn('employee_id', $empIds)->with('employee')->find($id);
        if (!$vac) return response()->json(['success' => false, 'message' => 'No encontrado'], 404);
        return response()->json(['success' => true, 'data' => $vac]);
    }

    public function update(Request $request, $id)
    {
        if ($this->isEmployee()) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $empIds = $this->companyEmployeeIds();
        $vac = VacationRequest::whereIn('employee_id', $empIds)->where('status', 'pending')->find($id);
        if (!$vac) return response()->json(['success' => false, 'message' => 'No encontrado o no editable'], 404);

        $vac->update($request->only(['start_date', 'end_date', 'reason']));
        return response()->json(['success' => true, 'message' => 'Solicitud actualizada', 'data' => $vac->fresh()]);
    }

    public function destroy($id)
    {
        $empIds = $this->companyEmployeeIds();

        // Empleado solo puede eliminar sus propias solicitudes pendientes
        $query = VacationRequest::whereIn('employee_id', $empIds)->where('status', 'pending');
        if ($this->isEmployee()) $query->where('employee_id', $this->myEmployeeId());

        $vac = $query->find($id);
        if (!$vac) return response()->json(['success' => false, 'message' => 'No encontrado'], 404);
        $vac->delete();
        return response()->json(['success' => true, 'message' => 'Solicitud eliminada']);
    }

    public function approve($id)
    {
        if ($this->isEmployee()) {
            return response()->json(['success' => false, 'message' => 'No autorizado para aprobar vacaciones.'], 403);
        }

        $empIds = $this->companyEmployeeIds();
        $vac = VacationRequest::whereIn('employee_id', $empIds)->where('status', 'pending')->find($id);
        if (!$vac) return response()->json(['success' => false, 'message' => 'No encontrado'], 404);

        $vac->update(['status' => 'approved', 'approved_by' => Auth::id(), 'approved_at' => now()]);

        Notification::create([
            'user_id'      => $this->companyAdminId(),
            'title'        => 'Vacaciones aprobadas',
            'message'      => "Las vacaciones de {$vac->employee->full_name} fueron aprobadas.",
            'type'         => 'success',
            'related_id'   => $vac->id,
            'related_type' => 'vacation',
        ]);

        return response()->json(['success' => true, 'message' => 'Vacaciones aprobadas', 'data' => $vac->fresh()->load('employee')]);
    }

    public function reject(Request $request, $id)
    {
        if ($this->isEmployee()) {
            return response()->json(['success' => false, 'message' => 'No autorizado para rechazar vacaciones.'], 403);
        }

        $empIds = $this->companyEmployeeIds();
        $vac = VacationRequest::whereIn('employee_id', $empIds)->where('status', 'pending')->find($id);
        if (!$vac) return response()->json(['success' => false, 'message' => 'No encontrado'], 404);

        $vac->update(['status' => 'rejected', 'rejection_reason' => $request->reason]);
        return response()->json(['success' => true, 'message' => 'Solicitud rechazada', 'data' => $vac->fresh()]);
    }

    public function calendar(Request $request)
    {
        $empIds = $this->companyEmployeeIds();
        $vacs = VacationRequest::whereIn('employee_id', $empIds)
            ->where('status', 'approved')
            ->with('employee:id,first_name,last_name')
            ->whereYear('start_date', $request->get('year', now()->year))
            ->whereMonth('start_date', $request->get('month', now()->month))
            ->get();
        return response()->json(['success' => true, 'data' => $vacs]);
    }
}
