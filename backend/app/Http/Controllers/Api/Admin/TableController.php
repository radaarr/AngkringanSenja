<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\TableResource;
use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class TableController extends Controller
{
    public function index()
    {
        $tables = Table::query()->orderBy('name')->get();
        return TableResource::collection($tables);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:50', 'unique:tables,code'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $table = Table::query()->create([
            'name' => $data['name'],
            'code' => $data['code'],
            'qr_token' => Str::random(32),
            'is_active' => $data['is_active'] ?? true,
        ]);

        return (new TableResource($table))->response()->setStatusCode(201);
    }

    public function update(Request $request, Table $table)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:100'],
            'code' => ['sometimes', 'string', 'max:50', Rule::unique('tables', 'code')->ignore($table->id)],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $table->update($data);
        return new TableResource($table->fresh());
    }

    public function destroy(Table $table)
    {
        $table->delete();
        return response()->json(['message' => 'Meja dihapus.']);
    }

    public function regenerate(Table $table)
    {
        $table->update(['qr_token' => Str::random(32)]);
        return new TableResource($table->fresh());
    }
}
