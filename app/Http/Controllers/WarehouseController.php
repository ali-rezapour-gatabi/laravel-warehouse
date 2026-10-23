<?php

namespace App\Http\Controllers;

use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class WarehouseController extends Controller
{
    public function create(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'name' => ['required', 'string', 'max:255','unique:warehouses,name'],
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

    public function list()
    {
        $warehouses = Warehouse::all();
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
}
