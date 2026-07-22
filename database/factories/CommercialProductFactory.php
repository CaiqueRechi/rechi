<?php

namespace Database\Factories;

use App\Models\CommercialProduct;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CommercialProduct>
 */
class CommercialProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'type' => 'landing_page',
            'name' => fake()->words(3, true),
            'slug' => fake()->unique()->slug(3),
            'short_description' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'price_cents' => 45000,
            'promotional_price_cents' => null,
            'currency' => 'BRL',
            'estimated_delivery' => 'até 3 dias úteis',
            'max_sections' => 5,
            'included_features' => ['design responsivo', 'formulário de contato'],
            'excluded_features' => ['tráfego pago'],
            'revision_count' => 1,
            'is_featured' => false,
            'is_active' => true,
            'category' => 'landing-pages',
            'sort_order' => 10,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
