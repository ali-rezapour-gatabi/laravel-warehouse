<?php

namespace App\Http\Controllers;

use App\Models\Measurement;
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
        $measurements = Measurement::all();
        return response()->json([
            'success' => true,
            'message' => 'اطلاعات واحد های اندازی گیری با موفقیت دریافت شد.',
            'data' => $measurements,
        ]);
    }

    public function update(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'id' => ['required', 'integer'],
                'name' => ['required', 'string',  'max:100', Rule::unique('measurements', 'name')->ignore($request->input('id')),],
                'symbol' => ['required', 'string', 'max:40'],
            ],
            [
                'id.required' => 'شناسه واحد اندازی گیری اجباری است.',
                'name.required' => 'نام واحد اندازی گیری اجباری است.',
                "name.unique" => "نام واحد اندازی گیری با این نام قبلا ثبت شده است.",
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

        $validated = $validator->validated();

        $measurement = Measurement::find($validated['id']);
        if (!$measurement) {
            return response()->json([
                'success' => false,
                'message' => 'واحد اندازی گیری مورد نظر یافت نشد.',
            ]);
        }
        $measurement->name = $validated['name'];
        $measurement->symbol = $validated['symbol'];
        $measurement->save();
        return response()->json([
            'success' => true,
            'message' => 'اطلاعات واحد اندازی گیری با موفقیت به روز رسانی شد.',
            'data' => $measurement,
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
                'id.required' => 'شناسه واحد اندازی گیری اجباری است.',
                'is_active.required' => 'وضعیت واحد اندازی گیری اجباری است.',
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'اطلاعات واردشده معتبر نیست.',
                'errors' => $validator->errors(),
            ], 422);
        }
        $measurement = Measurement::find($request->id);
        if (!$measurement) {
            return response()->json([
                'success' => false,
                'message' => 'واحد اندازی گیری مورد نظر یافت نشد.',
            ]);
        } else {
            $measurement->is_active = $request->is_active;
            $measurement->save();
            return response()->json([
                'success' => true,
                'message' => 'اطلاعات واحد اندازی گیری با موفقیت به روز رسانی شد.',
                'data' => $measurement,
            ]);
        }
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
        $measurement->delete();
        return response()->json([
            'success' => true,
            'message' => 'واحد اندازی گیری با موفقیت حذف شد.',
        ]);
    }
}
