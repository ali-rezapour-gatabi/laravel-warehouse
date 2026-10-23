<?php

namespace App\Http\Controllers;

use App\Models\Warehouse;
use App\Models\WarehouseLocation;
use Illuminate\Validation\Rule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class WarehouseLocationController extends Controller
{
    public function create(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'warehouse_id' => ['required', 'integer', 'exists:warehouses,id'],
                'location' => ['required', 'string', 'max:255', 'unique:warehouse_locations,location'],
                'quantity' => ['nullable', 'numeric', 'min:0'],
                'measurement_id' => ['nullable', 'integer', 'exists:measurements,id'],
            ],
            [
                'warehouse_id.required' => 'انتخاب انبار الزامی است.',
                'warehouse_id.integer' => 'شناسه انبار معتبر نیست.',
                'warehouse_id.exists' => 'انبار انتخاب‌شده معتبر نیست.',

                'location.required' => 'وارد کردن عنوان قفسه الزامی است.',
                'location.string' => 'عنوان قفسه باید متن باشد.',
                'location.max' => 'عنوان قفسه نمی‌تواند بیشتر از ۲۵۵ کاراکتر باشد.',
                'location.unique' => 'این عنوان قفسه قبلاً ثبت شده است.',

                'quantity.numeric' => 'ظرفیت باید عددی باشد.',
                'quantity.min' => 'ظرفیت نمی‌تواند منفی باشد.',

                'measurement_id.integer' => 'واحد اندازه‌گیری انتخاب‌شده معتبر نیست.',
                'measurement_id.exists' => 'واحد اندازه‌گیری انتخاب‌شده در سیستم وجود ندارد.',
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
        $warehouse = Warehouse::findOrFail($validated['warehouse_id']);
        $currentQuantity = WarehouseLocation::where('warehouse_id', $validated['warehouse_id'])->sum('quantity');
        if ($validated['quantity'] != null && $validated['quantity'] > 0 && $warehouse->quantity == null) {
            return response()->json([
                'success' => false,
                'message' => 'برای اعمال ظرفیت لطفا به انبار خود ظرفی بدهید',
            ], 422);
        }

        $newQuantity = (float) ($validated['quantity'] ?? 0);
        $totalQuantity = $currentQuantity + $newQuantity;

        if ($totalQuantity >= $warehouse->quantity) {
            return response()->json([
                'success' => false,
                'message' => 'موجودی قفسه‌ها از ظرفیت انبار بیشتر میشود.',
                'errors' => [
                    'quantity' => [
                        'ظرفیت باقی‌مانده انبار '
                        . max(0, $warehouse->quantity - $currentQuantity)
                        . ' است.',
                    ],
                ],
            ], 422);
        }

        $location = WarehouseLocation::create($validated);
        if ($location) {
            return response()->json([
                'success' => true,
                'message' => 'اطلاعات قفسه با موفقیت اضافه شد.',
                'data' => $location,
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'افزودن قفسه با خطا مواجه شد.',
                'data' => $location,
            ]);
        }
    }

    public function update(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'id' => ['required', 'integer', 'exists:warehouse_locations,id'],
                'warehouse_id' => ['required', 'integer', 'exists:warehouses,id'],
                'location' => ['required', 'string', 'max:255',  Rule::unique('warehouse_locations', 'location')->ignore($request->input('id'))],
                'quantity' => ['nullable', 'numeric', 'min:0'],
                'measurement_id' => ['nullable', 'integer', 'exists:measurements,id'],
            ],
            [
                'id.required' => 'شناسه قفسه الزامی اجباری است.',
                'id.integer' => 'شناسه قفسه الزامی معتبر نیست.',
                'id.exists' => 'قفسه الزامی مورد نظر یافت نشد.',

                'warehouse_id.required' => 'انتخاب انبار الزامی است.',
                'warehouse_id.integer' => 'شناسه انبار معتبر نیست.',
                'warehouse_id.exists' => 'انبار انتخاب‌شده معتبر نیست.',

                'location.required' => 'وارد کردن عنوان قفسه الزامی است.',
                'location.string' => 'عنوان قفسه باید متن باشد.',
                'location.max' => 'عنوان قفسه نمی‌تواند بیشتر از ۲۵۵ کاراکتر باشد.',
                'location.unique' => 'این عنوان قفسه قبلاً ثبت شده است.',

                'quantity.numeric' => 'ظرفیت باید عددی باشد.',
                'quantity.min' => 'ظرفیت نمی‌تواند منفی باشد.',

                'measurement_id.integer' => 'واحد اندازه‌گیری انتخاب‌شده معتبر نیست.',
                'measurement_id.exists' => 'واحد اندازه‌گیری انتخاب‌شده در سیستم وجود ندارد.',
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
        $location = WarehouseLocation::findOrFail($validated['id']);
        $warehouse = Warehouse::findOrFail($validated['warehouse_id']);
        $currentQuantity = WarehouseLocation::where('warehouse_id', $validated['warehouse_id']) ->where('id', '!=', $location->id) ->sum('quantity');

        $newQuantity = (float) ($validated['quantity'] ?? 0);
        if ($newQuantity > 0 && $warehouse->quantity === null) {
            return response()->json([
                'success' => false,
                'message' => 'برای ثبت ظرفیت قفسه، ابتدا ظرفیت انبار را مشخص کنید.',
            ], 422);
        }

        $totalQuantity = $currentQuantity + $newQuantity;

        if ($warehouse->quantity !== null && $totalQuantity > $warehouse->quantity) {
            return response()->json([
                'success' => false,
                'message' => 'مجموع ظرفیت قفسه‌ها از ظرفیت انبار بیشتر است.',
            ], 422);
        }


        $location->fill(collect($validated)->except('id')->all());
        $location->save();

        return response()->json([
            'success' => true,
            'message' => 'به‌روزرسانی قفسه با موفقیت انجام شد.',
            'data' => $location->fresh(),
        ]);
    }

    public function list()
    {
        $query = WarehouseLocation::query()->with(['warehouse', 'measurement']);

        return response()->json([
            'success' => true,
            'message' => 'اطلاعات قفسه با موفقیت دریافت شد.',
            'data' => $query->get(),
        ]);
    }

    public function delete(Request $request)
    {
        $validated = $request->validate([
            'id' => ['required', 'integer', 'min:1'],
        ]);
        $deletedId = $validated['id'];

        $location = WarehouseLocation::find($deletedId);
        if (!$location) {
            return response()->json([
                'success' => false,
                'message' => 'قفسه مورد نظر یافت نشد.',
            ]);
        }

        $location->delete();
        return response()->json([
            'success' => true,
            'message' => 'قفسه با موفقیت حذف شد.',
        ]);
    }
}
