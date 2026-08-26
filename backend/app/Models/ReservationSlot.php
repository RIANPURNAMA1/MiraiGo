<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReservationSlot extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'starts_at', 'ends_at', 'capacity', 'booked_count'];

    protected function casts(): array
    {
        return ['starts_at' => 'datetime', 'ends_at' => 'datetime'];
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function hasAvailableSlot(): bool
    {
        return $this->booked_count < $this->capacity;
    }
}
