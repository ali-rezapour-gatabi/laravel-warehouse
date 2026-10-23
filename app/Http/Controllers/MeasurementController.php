<?php

namespace App\Http\Controllers;

use App\Models\Measurement;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class MeasurementController extends Controller
{
    public function create(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'name' => ['required', 'string', 'unique:measurements,name', 'max:100'],
                'symbol' => ['required', 'string', 'max:40'],
            ],
            [
                'name.required' => 'نام واحد اندازی گیری اجباری است.',
                'name.max' => 'نام واحد اندازی گیری حداکثر می‌تواند ۱۰۰ کاراکتر باشد.',
                'symbol.required' => 'نماد اجباری است.',
                'symbol.max' => 'نماد حداکثر می‌تواند ۴۰ کاراکتر باشد.',
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'اطلاعات واردشده معتبر نیست.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $measurement = Measurement::create($validator->validated());
        if ($measurement) {
            return response()->json([
                'success' => true,
                'message' => 'اطلاعات واحد اندازی گیری با موفقیت اضافه شد.',
                'data' => $measurement,
            ]);
        }
        return response()->json([
            'success' => false,
            'message' => 'افزودن واحد اندازه گیری با خطا مواجه شد.',
            'data' => $measurement,
        ]);
    }

    public function list()
    {
        $query = Measurement::all();

        return response()->json([
            'success' => true,
            'message' => 'اطلاعات واحد های اندازی گیری با موفقیت دریافت شد.',
            'data' => $query,
        ]);
    }

    public function update(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'id' => ['required', 'integer', 'exists:measurements,id'],
                'name' => [
                    'sometimes',
                    'required',
                    'string',
                    'max:100',
                    Rule::unique('measurements', 'name')->ignore($request->input('id')),
                ],
                'symbol' => ['sometimes', 'required', 'string', 'max:40'],
            ],
            [
                'id.required' => 'شناسه واحد اندازه‌گیری اجباری است.',
                'id.integer' => 'شناسه واحد اندازه‌گیری معتبر نیست.',
                'id.exists' => 'واحد اندازه‌گیری مورد نظر یافت نشد.',
                'name.required' => 'نام واحد اندازه‌گیری اجباری است.',
                'name.unique' => 'واحد اندازه‌گیری با این نام قبلاً ثبت شده است.',
                'name.max' => 'نام واحد اندازه‌گیری حداکثر می‌تواند ۱۰۰ کاراکتر باشد.',
                'symbol.required' => 'نماد اجباری است.',
                'symbol.max' => 'نماد حداکثر می‌تواند ۴۰ کاراکتر باشد.',
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

        $measurement = Measurement::findOrFail($validated['id']);

        $measurement->fill(collect($validated)->except('id')->all());

        $measurement->save();

        return response()->json([
            'success' => true,
            'message' => 'اطلاعات واحد اندازه‌گیری با موفقیت به‌روزرسانی شد.',
        ]);
    }

    public function delete(Request $request)
    {

        $validated = $request->validate([
            'id' => ['required', 'integer', 'min:1'],
        ]);
        $deletedId = $validated['id'];

        $measurement = Measurement::find($deletedId);
        if (!$measurement) {
            return response()->json([
                'success' => false,
                'message' => 'واحد اندازی گیری مورد نظر یافت نشد.',
            ]);
        }

        $usedInWarehouse = Warehouse::where('measurement_id', $measurement->id)->exists();

        if ($usedInWarehouse) {
            return response()->json([
                'success' => false,
                'message' => 'این واحد اندازه‌گیری مورد استفاده قرار گرفته است, امکان حذف آن وجود ندارد.',
            ], 422);
        }
        $measurement->delete();
        return response()->json([
            'success' => true,
            'message' => 'واحد اندازی گیری با موفقیت حذف شد.',
        ]);
    }
}
