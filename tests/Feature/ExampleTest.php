<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_homepage_returns_the_portfolio_page(): void
    {
        $response = $this->get(route('home'));

        $response
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('welcome'));
    }

    public function test_old_lp_1_returns_the_original_portfolio_page_backup(): void
    {
        $response = $this->get(route('old-lp-1'));

        $response
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('old-lp-1'));
    }

    public function test_legal_policy_pages_are_public(): void
    {
        $this->get(route('legal.terms'))->assertOk();
        $this->get(route('legal.privacy'))->assertOk();
        $this->get(route('legal.refund'))->assertOk();
    }
}
