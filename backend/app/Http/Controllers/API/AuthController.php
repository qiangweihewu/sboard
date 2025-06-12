<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Tymon\JWTAuth\Facades\JWTAuth; // Correct facade
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthController extends Controller
{
    public function __construct()
    {
        // Apply auth:api middleware to all methods except register and login
        $this->middleware('auth:api', ['except' => ['login', 'register']]);
    }

    public function register(Request $request)
    {
        Log::info('Register attempt', ['email' => $request->email]);
        
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed', // password_confirmation field
        ]);

        if ($validator->fails()) {
            Log::warning('Registration validation failed', $validator->errors()->toArray());
            return response()->json($validator->errors(), 400);
        }

        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'is_active' => true, // Or based on business logic, e.g., email verification needed
            // 'role_id' => default_user_role_id, // Assign a default role if applicable
        ]);

        Log::info('User registered successfully', ['user_id' => $user->id]);
        return response()->json(['message' => 'User successfully registered'], 201);
    }

    public function login(Request $request)
    {
        Log::info('Login attempt', ['email' => $request->email]);
        
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            if ($validator->fails()) {
                Log::warning('Login validation failed', $validator->errors()->toArray());
                return response()->json($validator->errors(), 422);
            }

            $credentials = $request->only('email', 'password');

            if (! $token = JWTAuth::attempt($credentials)) {
                Log::warning('Login failed - invalid credentials', ['email' => $request->email]);
                return response()->json(['error' => 'Unauthorized: Invalid credentials'], 401);
            }
            
            $user = JWTAuth::user();
            if (!$user->is_active) {
                JWTAuth::invalidate($token); // Invalidate token if user is not active
                Log::warning('Login failed - user inactive', ['email' => $request->email]);
                return response()->json(['error' => 'Unauthorized: User account is inactive.'], 401);
            }

            Log::info('Login successful', ['user_id' => $user->id]);
            return $this->respondWithToken($token);
            
        } catch (JWTException $e) {
            Log::error('JWT Exception during login', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Could not create token'], 500);
        } catch (\Exception $e) {
            Log::error('Unexpected error during login', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
            return response()->json(['message' => 'Successfully logged out']);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Failed to logout, please try again.'], 500);
        }
    }

    public function refresh()
    {
        try {
            return $this->respondWithToken(JWTAuth::refresh(JWTAuth::getToken()));
        } catch (JWTException $e) {
            return response()->json(['error' => 'Could not refresh token'], 500);
        }
    }

    public function me()
    {
        try {
            return response()->json(JWTAuth::parseToken()->authenticate());
        } catch (JWTException $e) {
            return response()->json(['error' => 'Not authorized'], 401);
        }
    }

    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => JWTAuth::factory()->getTTL() * 60 // Default is 1 hour (60 minutes)
        ]);
    }
}