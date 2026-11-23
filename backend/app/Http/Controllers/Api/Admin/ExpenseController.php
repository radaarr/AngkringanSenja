<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $q = Expense::query()->with('creator')->latest('expense_date')->latest('id');
        if ($request->filled('category')) $q->where('category', $request->string('category'));
        if ($request->filled('from')) $q->whereDate('expense_date', '>=', $request->date('from'));
        if ($request->filled('to')) $q->whereDate('expense_date', '<=', $request->date('to'));
        return response()->json(['data' => $q->get()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'category' => ['required','string','max:100'],
            'description' => ['required','string','max:255'],
            'amount' => ['required','numeric','gt:0'],
            'expense_date' => ['required','date'],
        ]);
        $expense = Expense::query()->create($data + ['created_by' => $request->user()->id]);
        return response()->json(['data' => $expense->load('creator')], 201);
    }

    public function show(Expense $expense)
    {
        return response()->json(['data' => $expense->load('creator')]);
    }

    public function update(Request $request, Expense $expense)
    {
        $data = $request->validate([
            'category' => ['sometimes','required','string','max:100'],
            'description' => ['sometimes','required','string','max:255'],
            'amount' => ['sometimes','required','numeric','gt:0'],
            'expense_date' => ['sometimes','required','date'],
        ]);
        $expense->update($data);
        return response()->json(['data' => $expense->fresh('creator')]);
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();
        return response()->noContent();
    }
}
