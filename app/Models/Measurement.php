<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'symbol', 'type', 'is_active'])]
class Measurement extends Model
{
    //
}
