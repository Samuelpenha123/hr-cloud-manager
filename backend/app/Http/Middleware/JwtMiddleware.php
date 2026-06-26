<?php
namespace App\Http\Middleware;

use Closure;
use Exception;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;

class JwtMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Usuario no encontrado'], 401);
            }
        } catch (TokenExpiredException $e) {
            return response()->json(['success' => false, 'message' => 'Token expirado'], 401);
        } catch (TokenInvalidException $e) {
            return response()->json(['success' => false, 'message' => 'Token inválido'], 401);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Token no proporcionado'], 401);
        }
        return $next($request);
    }
}
