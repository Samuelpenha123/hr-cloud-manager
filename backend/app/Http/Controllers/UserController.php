<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function index()
    {
        $users = User::where('created_by', Auth::id())
            ->with('linkedEmployee:id,first_name,last_name,department,position')
            ->get()
            ->map(fn($u) => $this->resource($u));

        return response()->json(['success' => true, 'data' => $users]);
    }

    public function store(Request $request)
    {
        $v = Validator::make($request->all(), [
            'name'        => 'required|string|max:255',
            'email'       => 'required|email|max:255|unique:users',
            'password'    => 'required|string|min:8',
            'role'        => 'required|in:manager,hr,employee',
            'employee_id' => 'nullable|integer|exists:employees,id',
        ], [
            'email.unique'  => 'Este correo ya está registrado.',
            'password.min'  => 'La contraseña debe tener al menos 8 caracteres.',
        ]);

        if ($v->fails()) {
            return response()->json(['success' => false, 'message' => 'Error de validación', 'errors' => $v->errors()], 422);
        }

        // Si el rol es employee, el employee_id es obligatorio
        if ($request->role === 'employee' && !$request->employee_id) {
            return response()->json(['success' => false, 'message' => 'Debes vincular un empleado para el rol "Empleado".', 'errors' => ['employee_id' => ['El campo empleado es obligatorio para este rol.']]], 422);
        }

        // Verificar que el employee_id pertenezca a esta empresa
        if ($request->employee_id) {
            $emp = Employee::forUser(Auth::id())->find($request->employee_id);
            if (!$emp) {
                return response()->json(['success' => false, 'message' => 'Empleado no pertenece a tu empresa.'], 403);
            }
            // Un empleado solo puede tener un usuario
            if (User::where('employee_id', $request->employee_id)->exists()) {
                return response()->json(['success' => false, 'message' => 'Este empleado ya tiene una cuenta de usuario.'], 409);
            }
        }

        $user = User::create([
            'name'         => $request->name,
            'email'        => $request->email,
            'password'     => Hash::make($request->password),
            'company_name' => Auth::user()->company_name,
            'role'         => $request->role,
            'is_active'    => true,
            'created_by'   => Auth::id(),
            'employee_id'  => $request->employee_id ?: null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Usuario creado exitosamente',
            'data'    => $this->resource($user->load('linkedEmployee')),
        ], 201);
    }

    public function show($id)
    {
        $user = User::where('created_by', Auth::id())->with('linkedEmployee:id,first_name,last_name,department')->find($id);
        if (!$user) return response()->json(['success' => false, 'message' => 'Usuario no encontrado'], 404);
        return response()->json(['success' => true, 'data' => $this->resource($user)]);
    }

    public function update(Request $request, $id)
    {
        $user = User::where('created_by', Auth::id())->find($id);
        if (!$user) return response()->json(['success' => false, 'message' => 'Usuario no encontrado'], 404);

        $v = Validator::make($request->all(), [
            'name'      => 'required|string|max:255',
            'email'     => 'required|email|max:255|unique:users,email,' . $id,
            'role'      => 'required|in:manager,hr,employee',
            'is_active' => 'boolean',
            'password'  => 'nullable|string|min:8',
            'employee_id' => 'nullable|integer|exists:employees,id',
        ]);

        if ($v->fails()) {
            return response()->json(['success' => false, 'message' => 'Error de validación', 'errors' => $v->errors()], 422);
        }

        if ($request->role === 'employee' && !$request->employee_id) {
            return response()->json(['success' => false, 'message' => 'Debes vincular un empleado para el rol "Empleado".'], 422);
        }

        if ($request->employee_id && $request->employee_id != $user->employee_id) {
            $emp = Employee::forUser(Auth::id())->find($request->employee_id);
            if (!$emp) return response()->json(['success' => false, 'message' => 'Empleado no pertenece a tu empresa.'], 403);
            if (User::where('employee_id', $request->employee_id)->where('id', '!=', $id)->exists()) {
                return response()->json(['success' => false, 'message' => 'Este empleado ya tiene una cuenta de usuario.'], 409);
            }
        }

        $data = $request->only(['name', 'email', 'role', 'is_active', 'employee_id']);
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }
        if ($request->role !== 'employee') {
            $data['employee_id'] = null;
        }

        $user->update($data);
        return response()->json(['success' => true, 'message' => 'Usuario actualizado', 'data' => $this->resource($user->fresh()->load('linkedEmployee'))]);
    }

    public function destroy($id)
    {
        $user = User::where('created_by', Auth::id())->find($id);
        if (!$user) return response()->json(['success' => false, 'message' => 'Usuario no encontrado'], 404);
        $user->delete();
        return response()->json(['success' => true, 'message' => 'Usuario eliminado']);
    }

    /** Empleados de la empresa que aún no tienen cuenta de usuario */
    public function availableEmployees()
    {
        $usedEmployeeIds = User::where('created_by', Auth::id())->whereNotNull('employee_id')->pluck('employee_id');
        $employees = Employee::forUser(Auth::id())
            ->whereNotIn('id', $usedEmployeeIds)
            ->where('status', 'active')
            ->get(['id', 'first_name', 'last_name', 'department', 'position']);
        return response()->json(['success' => true, 'data' => $employees]);
    }

    private function resource(User $u): array
    {
        return [
            'id'          => $u->id,
            'name'        => $u->name,
            'email'       => $u->email,
            'role'        => $u->role,
            'is_active'   => $u->is_active,
            'employee_id' => $u->employee_id,
            'employee'    => $u->linkedEmployee ? [
                'id'         => $u->linkedEmployee->id,
                'full_name'  => $u->linkedEmployee->first_name . ' ' . $u->linkedEmployee->last_name,
                'department' => $u->linkedEmployee->department,
                'position'   => $u->linkedEmployee->position ?? null,
            ] : null,
            'created_at'  => $u->created_at,
        ];
    }
}
