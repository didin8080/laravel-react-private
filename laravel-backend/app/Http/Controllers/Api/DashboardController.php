<?php


namespace App\Http\Controllers\Api;


use App\Http\Controllers\Controller;
use Illuminate\Http\Request;


class DashboardController extends Controller
{
public function index(Request $request)
{
$user = $request->user();


// return whatever dashboard data you need
return response()->json([
'message' => 'Welcome to your dashboard',
'user' => $user,
'stats' => [
'projects' => 3,
'notifications' => 5,
],
]);
}
}