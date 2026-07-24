<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Lead;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page(): void
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertOk();
    }

    public function test_administrators_can_see_business_analytics(): void
    {
        $admin = User::factory()->admin()->create();
        $customer = User::factory()->create();

        $approvedOrder = Order::factory()->create([
            'user_id' => $customer->id,
            'status' => OrderStatus::Paid,
            'payment_status' => PaymentStatus::Approved,
            'total_cents' => 125000,
            'paid_at' => now(),
        ]);

        Order::factory()->create([
            'user_id' => $customer->id,
            'payment_status' => PaymentStatus::Pending,
        ]);

        Payment::factory()->create([
            'order_id' => $approvedOrder->id,
            'status' => PaymentStatus::Approved,
            'method' => 'pix',
            'amount_cents' => 125000,
            'approved_at' => now(),
        ]);

        Lead::query()->create([
            'name' => 'Cliente SEO',
            'email' => 'seo@example.com',
            'type' => 'landing_page',
            'status' => 'new',
            'lead_source' => 'home_other_services',
            'consent_accepted_at' => now(),
        ]);

        $this->actingAs($admin)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard')
                ->where('isAdminView', true)
                ->where('summary.revenueCents', 125000)
                ->where('summary.orderCount', 2)
                ->where('summary.leadCount', 1)
                ->where('summary.approvalRate', 50)
                ->has('monthlyPerformance', 6)
                ->has('orderStatuses', 2)
                ->where('paymentMethods.0.label', 'Pix')
                ->where('paymentMethods.0.value', 1)
                ->has('recentOrders', 2));
    }

    public function test_regular_users_only_see_their_own_analytics(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        Order::factory()->create([
            'user_id' => $user->id,
            'status' => OrderStatus::Paid,
            'payment_status' => PaymentStatus::Approved,
            'total_cents' => 30000,
            'paid_at' => now(),
        ]);

        Order::factory()->create([
            'user_id' => $otherUser->id,
            'status' => OrderStatus::Paid,
            'payment_status' => PaymentStatus::Approved,
            'total_cents' => 90000,
            'paid_at' => now(),
        ]);

        Lead::query()->create([
            'user_id' => $user->id,
            'name' => 'Lead do usuário',
            'email' => 'user-lead@example.com',
            'type' => 'bug_fix',
            'status' => 'new',
            'consent_accepted_at' => now(),
        ]);

        Lead::query()->create([
            'user_id' => $otherUser->id,
            'name' => 'Lead externo',
            'email' => 'other-lead@example.com',
            'type' => 'landing_page',
            'status' => 'new',
            'consent_accepted_at' => now(),
        ]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('isAdminView', false)
                ->where('summary.revenueCents', 30000)
                ->where('summary.orderCount', 1)
                ->where('summary.leadCount', 1)
                ->where('summary.approvalRate', 100)
                ->where('summary.connectedIntegrations', null)
                ->has('recentOrders', 1));
    }
}
