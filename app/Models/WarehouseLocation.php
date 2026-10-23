<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['warehouse_id', 'name', 'location', 'is_active'])]
class WarehouseLocation extends Model
{
    //
}
