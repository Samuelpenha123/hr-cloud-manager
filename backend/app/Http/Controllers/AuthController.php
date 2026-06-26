<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $v = Validator::make($request->all(), [
            'name'         => 'required|string|max:255',
            'email'        => 'required|string|email|max:255|unique:users',
            'password'     => 'required|string|min:8|confirmed',
            'company_name' => 'required|string|max:255',
        ], [
            'email.unique'       => 'Este correo ya está registrado.',
            'password.min'       => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
        ]);

        if ($v->fails()) {
            return response()->json(['success' => false, 'message' => 'Error de validación', 'errors' => $v->errors()], 422);
        }

        $user = User::create([
            'name'         => $request->name,
            'email'        => $request->email,
            'password'     => Hash::make($request->password),
            'company_name' => $request->company_name,
            'role'         => 'admin',
            'is_active'    => true,
        ]);

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'success' => true,
            'message' => 'Usuario registrado exitosamente',
            'data'    => ['user' => $this->userResource($user), 'token' => $token, 'token_type' => 'Bearer']
        ], 201);
    }

    public function login(Request $request)
    {
        $v = Validator::make($request->all(), [
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if ($v->fails()) {
            return response()->json(['success' => false, 'message' => 'Error de validación', 'errors' => $v->errors()], 422);
        }

        if (!$token = JWTAuth::attempt($request->only('email', 'password'))) {
            return response()->json(['success' => false, 'message' => 'Credenciales incorrectas.'], 401);
        }

        $user = Auth::user();
        if (!$user->is_active) {
            return response()->json(['success' => false, 'message' => 'Cuenta desactivada.'], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Inicio de sesión exitoso',
            'data'    => ['user' => $this->userResource($user), 'token' => $token, 'token_type' => 'Bearer']
        ]);
    }

    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
            return response()->json(['success' => true, 'message' => 'Sesión cerrada']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error al cerrar sesión'], 500);
        }
    }

    public function me()
    {
        return response()->json(['success' => true, 'data' => $this->userResource(Auth::user())]);
    }

    public function refresh()
    {
        try {
            $token = JWTAuth::refresh(JWTAuth::getToken());
            return response()->json(['success' => true, 'token' => $token, 'token_type' => 'Bearer']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'No se pudo renovar el token'], 401);
        }
    }

    private function userResource(User $user): array
    {
        return [
            'id'           => $user->id,
            'name'         => $user->name,
            'email'        => $user->email,
            'company_name' => $user->company_name,
            'role'         => $user->role,
            'is_active'    => $user->is_active,
            'employee_id'  => $user->employee_id,
            'created_at'   => $user->created_at,
        ];
    }
}
