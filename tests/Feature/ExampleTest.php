<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $this->get('/')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Welcome')
                ->where('appName', config('app.name')));
    }

    public function test_the_application_health_endpoint_returns_success(): void
    {
        $this->get('/up')->assertOk();
    }

    public function test_hello_duval_route_returns_expected_response(): void
    {
        $response = $this->get('/hello-duval');

        $response->assertStatus(200)
            ->assertSeeText('hello Duval');
    }

    public function test_react_page_contains_the_mount_element(): void
    {
        $response = $this->get('/react');

        $response->assertOk()
            ->assertSee('id="react-root"', false);
    }
}
