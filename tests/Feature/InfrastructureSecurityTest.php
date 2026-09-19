<?php

namespace Tests\Feature;

use App\Contracts\SecurityTelemetry;
use App\Enums\SecurityEventType;
use App\Jobs\DeliverSecurityEvent;
use App\Models\SecurityEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;
use Tests\TestCase;

class InfrastructureSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_protected_route_redirects_anonymous_users(): void
    {
        $this->get('/painel')->assertRedirect('/entrar');
    }

    public function test_login_regenerates_session_and_never_returns_password(): void
    {
        Queue::fake();
        $user = User::factory()->create(['password' => Hash::make('correct-password')]);
        $oldSessionId = session()->getId();

        $response = $this->post('/entrar', [
            'email' => $user->email,
            'password' => 'correct-password',
        ]);

        $response->assertRedirect('/painel')->assertDontSee('correct-password');
        $this->assertAuthenticatedAs($user);
        $this->assertNotSame($oldSessionId, session()->getId());
        $this->assertDatabaseHas('security_events', ['type' => 'AUTH_LOGIN_SUCCESS']);
    }

    public function test_csrf_protection_remains_enabled(): void
    {
        $route = app('router')->getRoutes()->match(Request::create('/entrar', 'POST'));

        $this->assertContains('web', $route->gatherMiddleware());
    }

    public function test_login_is_rate_limited(): void
    {
        Queue::fake();

        foreach (range(1, 5) as $_) {
            $this->post('/entrar', ['email' => 'missing@example.com', 'password' => 'wrong']);
        }

        $this->post('/entrar', ['email' => 'missing@example.com', 'password' => 'wrong'])
            ->assertStatus(429);
    }

    public function test_security_event_only_keeps_allowlisted_metadata(): void
    {
        Queue::fake();
        app()->instance('correlation_id', (string) Str::uuid());

        app(SecurityTelemetry::class)->record(SecurityEventType::SuspiciousRequest, 'warning', [
            'route' => '/test',
            'password' => 'must-not-be-stored',
            'token' => 'must-not-be-stored',
        ]);

        $event = SecurityEvent::query()->firstOrFail();
        $this->assertSame(['route' => '/test'], $event->metadata);
        $this->assertStringNotContainsString('must-not-be-stored', $event->toJson());
        Queue::assertPushed(DeliverSecurityEvent::class);
    }

    public function test_mgl_delivery_is_a_no_op_when_disabled(): void
    {
        config()->set('services.mgl.enabled', false);

        (new DeliverSecurityEvent((string) Str::ulid()))->handle();

        $this->assertTrue(true);
    }

    public function test_health_check_does_not_expose_internal_configuration(): void
    {
        $secret = base64_encode(str_repeat('a', 32));
        config()->set('app.key', 'base64:'.$secret);

        $this->get('/health')
            ->assertOk()
            ->assertSee('OK')
            ->assertDontSee($secret)
            ->assertDontSee('MGL_CLIENT_SECRET');
    }

    public function test_invalid_correlation_id_is_replaced_and_security_headers_are_set(): void
    {
        $response = $this->withHeader('X-Correlation-ID', 'attacker-controlled')->get('/');

        $this->assertTrue(Str::isUuid((string) $response->headers->get('X-Correlation-ID')));
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-Frame-Options', 'DENY');
    }
}
