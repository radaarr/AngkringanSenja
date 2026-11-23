<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TableResource;
use App\Models\Table;

class TableController extends Controller
{
    public function resolve(string $token)
    {
        $table = Table::query()->where('qr_token', $token)->where('is_active', true)->first();
        if (! $table) {
            return response()->json(['message' => 'Meja tidak ditemukan atau tidak aktif.'], 404);
        }
        return new TableResource($table);
    }
}
