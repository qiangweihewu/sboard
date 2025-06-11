<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User; // Assuming User model has role relationship

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  mixed  ...$roles  The roles allowed to access the route.
     * @return mixed
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized. User not authenticated.'], 401);
        }

        $user = Auth::user();

        // Eager load the role relationship if it's not already loaded
        if ($user instanceof User && !$user->relationLoaded('role')) {
            $user->load('role');
        }

        // Check if user has a role and if that role's name is in the allowed $roles array
        if ($user instanceof User && $user->role && in_array($user->role->name, $roles)) {
            return $next($request);
        }

        return response()->json(['error' => 'Forbidden. You do not have the required role.'], 403);
    }
}
