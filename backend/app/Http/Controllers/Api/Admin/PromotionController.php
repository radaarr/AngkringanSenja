<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    public function index()
    {
        $items = Promotion::query()->orderByDesc('created_at')->get()->map(function ($p) {
            $now = now();
            $active = $p->is_active
                && (!$p->starts_at || $p->starts_at <= $now)
                && (!$p->ends_at || $p->ends_at >= $now);
            return array_merge($p->toArray(), ['is_currently_active' => $active]);
        });
        return response()->json(['data' => $items]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        $promo = Promotion::query()->create($data);
        return response()->json(['data' => $promo], 201);
    }

    public function show(Promotion $promotion)
    {
        return response()->json(['data' => $promotion]);
    }

    public function update(Request $request, Promotion $promotion)
    {
        $data = $this->validateData($request, $promotion->id, $promotion);
        $promotion->update($data);
        return response()->json(['data' => $promotion->fresh()]);
    }

    public function destroy(Promotion $promotion)
    {
        $promotion->delete();
        return response()->noContent();
    }

    private function validateData(Request $request, ?int $id = null, ?Promotion $promotion = null): array
    {
        if ($request->has('code')) {
            $request->merge(['code' => strtoupper(trim((string) $request->input('code')))]);
        }

        $isUpdate = $id !== null;
        $rules = [
            'name' => [$isUpdate ? 'sometimes' : 'required', 'string', 'max:150'],
            'code' => [$isUpdate ? 'sometimes' : 'required', 'string', 'max:50', 'unique:promotions,code'.($id ? ",$id" : '')],
            'type' => [$isUpdate ? 'sometimes' : 'required', 'in:PERCENTAGE,FIXED'],
            'value' => [$isUpdate ? 'sometimes' : 'required', 'numeric', 'gt:0'],
            'min_order' => ['nullable', 'numeric', 'min:0'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'is_active' => ['boolean'],
        ];
        $data = $request->validate($rules);
        $type = $data['type'] ?? $promotion?->type;
        $value = $data['value'] ?? $promotion?->value;
        if ($type === 'PERCENTAGE' && (float) $value > 100) {
            throw \Illuminate\Validation\ValidationException::withMessages(['value' => ['Persentase maksimal 100.']]);
        }
        return $data;
    }
}
