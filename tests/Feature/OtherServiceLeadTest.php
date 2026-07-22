<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OtherServiceLeadTest extends TestCase
{
    use RefreshDatabase;

    public function test_visitors_can_request_other_services(): void
    {
        $this->post(route('other-service-leads.store'), [
            'name' => 'Cliente Teste',
            'email' => 'cliente@example.com',
            'phone' => '(43) 99999-9999',
            'technology' => 'Laravel',
            'url' => 'https://example.com',
            'problem_description' => 'Preciso de um sistema interno para organizar pedidos e pagamentos.',
            'consent_accepted' => '1',
        ])->assertRedirect();

        $this->assertDatabaseHas('leads', [
            'email' => 'cliente@example.com',
            'type' => 'other_service',
            'status' => 'new',
            'lead_source' => 'home_other_services',
        ]);
    }
}
