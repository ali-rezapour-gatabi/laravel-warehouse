<?php

namespace App\Http\Controllers;

use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class WarehouseController extends Controller
{
    public function create(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'name' => ['required', 'string', 'max:255','unique:warehouses,name'],
                'quantity' => ['nullable', 'integer'],
                'measurement_id' => ['nullable', 'integer', 'exists:measurements,id'],
                'description' => ['nullable', 'string'],
            ],
            [
                'name.required' => 'نام انبار را وارد کنید.',
                'name.max' => 'نام انبار حداکثر می‌تواند ۲۵۵ کاراکتر باشد.',
                'name.unique' => 'انبار با نام مشخص شده از قبل وجود دارد.',
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'اطلاعات واردشده معتبر نیست.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $warehouse = Warehouse::create($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'انبار اضافه شد.',
            'data' => $warehouse,
        ]);
    }

    public function list(Request $request)
    {

        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:100'],
            'is_active' => ['nullable', 'boolean'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = Warehouse::query()->with('measurement');

        if (!empty($validated['name'])) {
            $query->where('name', 'like', '%' . $validated['name'] . '%');
        }

        if (array_key_exists('is_active', $validated)) {
            $query->where('is_active', $validated['is_active']);
        }

        $warehouses = $query ->orderByDesc('updated_at')->paginate($validated['per_page'] ?? 15);

        return response()->json([
            'success' => true,
            'message' => 'اطلاعات انبار با موفقیت دریافت شد.',
            'result' => $warehouses,
        ]);
    }

    public function updateStatus(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'id' => ['required', 'integer'],
                'is_active' => ['required', 'boolean'],
            ],
            [
                'id.required' => 'شناسه انبار اجباری است.',
                'is_active.required' => 'وضعیت انبار اجباری است.',
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'اطلاعات واردشده معتبر نیست.',
                'errors' => $validator->errors(),
            ], 422);
        }
        $warehouse = Warehouse::find($request->id);
        if (!$warehouse) {
            return response()->json([
                'success' => false,
                'message' => 'انبار مورد نظر یافت نشد.',
            ]);
        } else {
            $warehouse->is_active = $request->is_active;
            $warehouse->save();
            return response()->json([
                'success' => true,
                'message' => 'اطلاعات انبار با موفقیت به روز رسانی شد.',
                'data' => $warehouse,
            ]);
        }
    }

    public function update(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'id' => ['required', 'integer', 'exists:warehouses,id'],
                'name' => [
                    'sometimes',
                    'required',
                    'string',
                    'max:255',
                    Rule::unique('warehouses', 'name')->ignore($request->input('id')),
                ],
                'description' => ['sometimes', 'nullable', 'string'],
                'is_active' => ['sometimes', 'boolean'],
                'measurement_id' => ['sometimes', 'nullable', 'integer', 'exists:measurements,id'],
                "quantity" => ['sometimes', 'nullable', 'integer'],
            ],
            [
                'id.required' => 'شناسه انبار اجباری است.',
                'id.integer' => 'شناسه انبار معتبر نیست.',
                'id.exists' => 'انبار مورد نظر یافت نشد.',
                'name.required' => 'نام انبار را وارد کنید.',
                'name.max' => 'نام انبار حداکثر می‌تواند ۲۵۵ کاراکتر باشد.',
                'name.unique' => 'انبار با نام مشخص شده از قبل وجود دارد.',
                'description.string' => 'توضیحات باید متن باشد.',
                'is_active.boolean' => 'وضعیت انبار معتبر نیست.',
                'measurement_id.integer' => 'واحد اندازه‌گیری معتبر نیست.',
                'measurement_id.exists' => 'واحد اندازه‌گیری مورد نظر یافت نشد.',
                "quantity.integer" => "ظرفیت انبار معتبر نیست.",
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'اطلاعات واردشده معتبر نیست.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();
        $warehouse = Warehouse::findOrFail($validated['id']);
        $warehouse->fill(collect($validated) ->except('id') ->all());
        $warehouse->save();

        return response()->json([
            'success' => true,
            'message' => 'به‌روزرسانی انبار با موفقیت انجام شد.',
            'data' => $warehouse->fresh(),
        ]);
    }
}
