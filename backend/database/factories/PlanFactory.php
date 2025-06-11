<?php
namespace Database\Factories;

use App\Models\Plan;
use Illuminate\Database\Eloquent\Factories\Factory;

class PlanFactory extends Factory
{
    protected $model = Plan::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->word . ' Plan',
            'description' => $this->faker->sentence,
            'duration_days' => $this->faker->randomElement([30, 90, 365]),
            'traffic_limit_gb' => $this->faker->randomElement([100, 500, 1024]),
            'device_limit' => $this->faker->randomElement([1, 3, 5]),
            'price' => $this->faker->optional()->randomFloat(2, 5, 100),
            'node_selection_criteria' => json_encode(['tags' => [$this->faker->word]]),
            'is_active' => true,
            // 'target_user_group_id' can be null or set if UserGroupFactory is used first
        ];
    }
}
