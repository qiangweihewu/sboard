<?php
namespace Database\Factories;

use App\Models\UserGroup;
use Illuminate\Database\Eloquent\Factories\Factory;

class UserGroupFactory extends Factory
{
    protected $model = UserGroup::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->word . ' Group',
            'description' => $this->faker->sentence,
        ];
    }
}
