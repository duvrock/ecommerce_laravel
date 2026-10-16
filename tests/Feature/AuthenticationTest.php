<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);
    }

    public function test_customer_can_register_and_is_assigned_the_customer_role(): void
    {
        Notification::fake();

        $response = $this->post('/register', [
            'name' => 'Test Customer',
            'email' => 'customer@example.com',
            'password' => 'StrongPassword2026',
            'password_confirmation' => 'StrongPassword2026',
        ]);

        $user = User::where('email', 'customer@example.com')->firstOrFail();

        $response->assertRedirect(route('verification.notice'));
        $this->assertAuthenticatedAs($user);
        $this->assertFalse($user->hasVerifiedEmail());
        $this->assertTrue($user->hasRole('customer'));
        $this->assertFalse($user->hasRole('admin'));
        $this->assertTrue(Hash::check('StrongPassword2026', $user->password));
        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_registration_rejects_weak_passwords(): void
    {
        $this->from('/register')
            ->post('/register', [
                'name' => 'Test Customer',
                'email' => 'customer@example.com',
                'password' => 'password',
                'password_confirmation' => 'password',
            ])
            ->assertRedirect('/register')
            ->assertSessionHasErrors('password');

        $this->assertDatabaseMissing('users', ['email' => 'customer@example.com']);
    }

    public function test_verified_customer_can_log_in_and_log_out(): void
    {
        $user = User::factory()->create([
            'email' => 'customer@example.com',
            'password' => Hash::make('StrongPassword2026'),
        ]);
        $user->roles()->attach(Role::where('slug', 'customer')->firstOrFail());

        $this->post('/login', [
            'email' => 'customer@example.com',
            'password' => 'StrongPassword2026',
        ])->assertRedirect(route('account'));

        $this->assertAuthenticatedAs($user);

        $this->post('/logout')->assertRedirect(route('home'));
        $this->assertGuest();
    }

    public function test_unverified_customer_is_redirected_to_email_verification_after_login(): void
    {
        $user = User::factory()->unverified()->create([
            'email' => 'customer@example.com',
            'password' => Hash::make('StrongPassword2026'),
        ]);
        $user->roles()->attach(Role::where('slug', 'customer')->firstOrFail());

        $this->post('/login', [
            'email' => 'customer@example.com',
            'password' => 'StrongPassword2026',
        ])->assertRedirect(route('verification.notice'));

        $this->assertAuthenticatedAs($user);
        $this->get('/account')->assertRedirect(route('verification.notice'));
    }

    public function test_invalid_login_does_not_authenticate_user(): void
    {
        $this->from('/login')
            ->post('/login', [
                'email' => 'customer@example.com',
                'password' => 'IncorrectPassword2026',
            ])
            ->assertRedirect('/login')
            ->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_user_can_verify_email_with_a_valid_signed_link(): void
    {
        $user = User::factory()->unverified()->create();
        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            [
                'id' => $user->id,
                'hash' => sha1($user->getEmailForVerification()),
            ],
        );

        $this->actingAs($user)
            ->get($verificationUrl)
            ->assertRedirect(route('account'));

        $this->assertTrue($user->fresh()->hasVerifiedEmail());
    }

    public function test_admin_area_requires_the_access_admin_permission(): void
    {
        $customer = User::factory()->create();
        $customer->roles()->attach(Role::where('slug', 'customer')->firstOrFail());

        $this->actingAs($customer)->get('/admin')->assertForbidden();

        $admin = User::factory()->create();
        $admin->roles()->attach(Role::where('slug', 'admin')->firstOrFail());

        $this->actingAs($admin)
            ->get('/admin')
            ->assertInertia(fn (Assert $page) => $page->component('Admin/Dashboard'));
    }

    public function test_user_can_reset_password_with_a_valid_token(): void
    {
        $user = User::factory()->create([
            'email' => 'customer@example.com',
        ]);
        $token = \Illuminate\Support\Facades\Password::createToken($user);

        $this->post('/reset-password', [
            'token' => $token,
            'email' => 'customer@example.com',
            'password' => 'NewStrongPassword2026',
            'password_confirmation' => 'NewStrongPassword2026',
        ])->assertRedirect(route('login'));

        $this->assertTrue(Hash::check('NewStrongPassword2026', $user->fresh()->password));
    }

    public function test_password_reset_link_is_sent_for_registered_email(): void
    {
        Notification::fake();
        $user = User::factory()->create(['email' => 'customer@example.com']);

        $this->post('/forgot-password', [
            'email' => 'customer@example.com',
        ])->assertSessionHas('status');

        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_password_reset_response_does_not_reveal_unknown_emails(): void
    {
        $this->post('/forgot-password', [
            'email' => 'unknown@example.com',
        ])->assertSessionHas(
            'status',
            'Dacă adresa este asociată unui cont, vei primi un link pentru resetarea parolei.',
        )->assertSessionDoesntHaveErrors();
    }
}
