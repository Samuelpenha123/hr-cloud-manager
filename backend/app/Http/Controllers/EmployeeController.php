<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        // Empleado solo ve su propio registro
        if ($this->isEmployee()) {
            $emp = $this->myEmployeeId()
                ? Employee::where('id', $this->myEmployeeId())->get()
                : collect();
            return response()->json(['success' => true, 'data' => $emp]);
        }

        $query = Employee::forUser($this->companyAdminId());

        if ($request->status && $request->status !== 'all') $query->where('status', $request->status);
        if ($request->department) $query->where('department', $request->department);
        if ($request->search) {
            $s = $request->search;
            $query->where(fn($q) => $q
                ->where('first_name', 'like', "%$s%")
                ->orWhere('last_name', 'like', "%$s%")
                ->orWhere('email', 'like', "%$s%")
                ->orWhere('document_number', 'like', "%$s%"));
        }

        return response()->json([
            'success' => true,
            'data'    => $query->orderBy('first_name')->paginate($request->get('per_page', 15)),
        ]);
    }

    public function store(Request $request)
    {
        if ($this->isEmployee()) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $v = Validator::make($request->all(), [
            'first_name'      => 'required|string|max:100',
            'last_name'       => 'required|string|max:100',
            'email'           => 'nullable|email|max:255',
            'document_type'   => 'required|in:CI,RUT,DNI,PASAPORTE',
            'document_number' => 'required|string|max:20',
            'hire_date'       => 'required|date',
            'department'      => 'required|string|max:100',
            'position'        => 'required|string|max:100',
            'salary'          => 'required|numeric|min:0',
            'status'          => 'required|in:active,inactive,suspended',
        ]);

        if ($v->fails()) {
            return response()->json(['success' => false, 'message' => 'Error de validación', 'errors' => $v->errors()], 422);
        }

        if (Employee::forUser($this->companyAdminId())->where('document_number', $request->document_number)->exists()) {
            return response()->json(['success' => false, 'message' => 'Ya existe un empleado con ese número de documento.'], 409);
        }

        $employee = Employee::create(array_merge($request->all(), ['user_id' => $this->companyAdminId()]));
        return response()->json(['success' => true, 'message' => 'Empleado registrado exitosamente', 'data' => $employee], 201);
    }

    public function show($id)
    {
        if ($this->isEmployee() && (int)$id !== $this->myEmployeeId()) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $employee = Employee::forUser($this->companyAdminId())
            ->with(['attendances' => fn($q) => $q->latest()->limit(10), 'vacationRequests', 'documents'])
            ->find($id);

        if (!$employee) return response()->json(['success' => false, 'message' => 'Empleado no encontrado'], 404);
        return response()->json(['success' => true, 'data' => $employee]);
    }

    public function update(Request $request, $id)
    {
        if ($this->isEmployee()) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $employee = Employee::forUser($this->companyAdminId())->find($id);
        if (!$employee) return response()->json(['success' => false, 'message' => 'Empleado no encontrado'], 404);

        $v = Validator::make($request->all(), [
            'first_name'      => 'required|string|max:100',
            'last_name'       => 'required|string|max:100',
            'document_type'   => 'required|in:CI,RUT,DNI,PASAPORTE',
            'document_number' => 'required|string|max:20',
            'hire_date'       => 'required|date',
            'department'      => 'required|string|max:100',
            'position'        => 'required|string|max:100',
            'salary'          => 'required|numeric|min:0',
            'status'          => 'required|in:active,inactive,suspended',
        ]);

        if ($v->fails()) {
            return response()->json(['success' => false, 'message' => 'Error de validación', 'errors' => $v->errors()], 422);
        }

        $employee->update($request->all());
        return response()->json(['success' => true, 'message' => 'Empleado actualizado', 'data' => $employee->fresh()]);
    }

    public function destroy($id)
    {
        if ($this->isEmployee()) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $employee = Employee::forUser($this->companyAdminId())->find($id);
        if (!$employee) return response()->json(['success' => false, 'message' => 'Empleado no encontrado'], 404);
        $employee->delete();
        return response()->json(['success' => true, 'message' => 'Empleado eliminado']);
    }

    public function stats()
    {
        if ($this->isEmployee()) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $uid = $this->companyAdminId();
        return response()->json(['success' => true, 'data' => [
            'total'         => Employee::forUser($uid)->count(),
            'active'        => Employee::forUser($uid)->where('status', 'active')->count(),
            'inactive'      => Employee::forUser($uid)->where('status', 'inactive')->count(),
            'by_department' => Employee::forUser($uid)->selectRaw('department, count(*) as total')->groupBy('department')->get(),
        ]]);
    }
}
