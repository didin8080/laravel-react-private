<?php


namespace App\Http\Controllers\Api;


use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;


class AuthController extends Controller
{
public function register(Request $request)
{
$v = Validator::make($request->all(), [
'name' => 'required|string|max:255',
'email' => 'required|email|unique:users,email',
'password' => 'required|string|min:6|confirmed',
]);


if ($v->fails()) {
return response()->json(['errors' => $v->errors()], 422);
}


$user = User::create([
'name' => $request->name,
'email' => $request->email,
'password' => Hash::make($request->password),
]);


$token = $user->createToken('api-token')->plainTextToken;


return response()->json([
'user' => $user,
'token' => $token,
], 201);
}


public function login(Request $request)
{
$v = Validator::make($request->all(), [
'email' => 'required|email',
'password' => 'required|string',
]);


if ($v->fails()) {
return response()->json(['errors' => $v->errors()], 422);
}


$user = User::where('email', $request->email)->first();


if (! $user || ! Hash::check($request->password, $user->password)) {
return response()->json(['message' => 'Invalid credentials'], 401);
}


// revoke previous tokens if you want
// $user->tokens()->delete();


$token = $user->createToken('api-token')->plainTextToken;


return response()->json(['user' => $user, 'token' => $token]);
}


public function logout(Request $request)
{
$user = $request->user();
}   
}
