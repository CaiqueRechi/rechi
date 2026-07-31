<?php

namespace Tests\Feature;

use App\Models\DeviceProfile;
use App\Models\ManagedDevice;
use App\Services\DeviceManagement\DeviceIdentifier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Tests\TestCase;

class DeviceConfigurationApiTest extends TestCase
{
    use RefreshDatabase;

    private string $privateKeyPem;

    private string $publicKeyPem;

    protected function setUp(): void
    {
        parent::setUp();

        $this->privateKeyPem = self::TEST_PRIVATE_KEY;
        $this->publicKeyPem = self::TEST_PUBLIC_KEY;

        config()->set([
            'device-management.device_lookup_key' => 'base64:'.base64_encode(random_bytes(32)),
            'device-management.jwt.private_key_base64' => base64_encode($this->privateKeyPem),
            'device-management.jwt.private_key_path' => null,
            'device-management.jwt.private_key_passphrase' => null,
            'device-management.jwt.issuer' => 'rechi-mdm-api',
            'device-management.jwt.audience' => 'rechi-mdm-device',
            'device-management.jwt.ttl_seconds' => 300,
        ]);
    }

    public function test_unknown_revoked_and_inactive_devices_fail_closed(): void
    {
        $unknownId = strtolower((string) Str::uuid());

        $this->getJson(route('api.v1.devices.configuration', $unknownId))
            ->assertNotFound();

        $revoked = ManagedDevice::factory()->revoked()->create();
        $this->getJson(route('api.v1.devices.configuration', $revoked->device_uuid))
            ->assertNotFound();

        $inactiveProfile = DeviceProfile::factory()->inactive()->create();
        $inactiveDevice = ManagedDevice::factory()
            ->for($inactiveProfile, 'profile')
            ->create();
        $this->getJson(route('api.v1.devices.configuration', $inactiveDevice->device_uuid))
            ->assertNotFound();
    }

    public function test_http_profile_url_is_allowed_in_device_configuration(): void
    {
        [$profile, $device] = $this->activeDevice('http://portal.example.com/');

        $response = $this->withHeader('Accept', 'application/jwt')
            ->get(route('api.v1.devices.configuration', $device->device_uuid))
            ->assertOk();

        [, $claims] = $this->decodeToken($response->getContent());

        $this->assertSame($profile->config['url'], $claims['url']);
    }

    public function test_bare_profile_domain_is_normalized_in_device_configuration(): void
    {
        [, $device] = $this->activeDevice('portal.example.com');

        $response = $this->withHeader('Accept', 'application/jwt')
            ->get(route('api.v1.devices.configuration', $device->device_uuid))
            ->assertOk();

        [, $claims] = $this->decodeToken($response->getContent());

        $this->assertSame('http://portal.example.com', $claims['url']);
    }

    public function test_tampered_invalid_profile_url_fails_closed(): void
    {
        [$profile, $device] = $this->activeDevice('https://portal.example.com/');

        DeviceProfile::withoutEvents(fn () => $profile->update([
            'config' => ['url' => 'ftp://portal.example.com/'],
        ]));

        $this->get(route('api.v1.devices.configuration', $device->device_uuid))
            ->assertServiceUnavailable()
            ->assertContent('');

        $this->assertNull($device->fresh()->first_connection_date);
    }

    public function test_api_returns_short_lived_rs256_jwt_with_required_claims(): void
    {
        $this->travelTo(Carbon::parse('2026-07-30 12:00:00', 'UTC'));
        [$profile, $device] = $this->activeDevice('https://portal.example.com/');

        $response = $this->withHeader('Accept', 'application/jwt')
            ->get(route('api.v1.devices.configuration', $device->device_uuid))
            ->assertOk()
            ->assertHeader('Content-Type', 'application/jwt')
            ->assertHeader('Cache-Control', 'no-store, private')
            ->assertHeader('X-Content-Type-Options', 'nosniff');

        [$header, $claims, $signature, $signingInput] = $this->decodeToken($response->getContent());

        $this->assertSame('RS256', $header['alg']);
        $this->assertSame('JWT', $header['typ']);
        $this->assertSame('rechi-mdm-api', $claims['iss']);
        $this->assertSame('rechi-mdm-device', $claims['aud']);
        $this->assertSame($device->device_uuid, $claims['sub']);
        $this->assertSame('2026-07-30', $claims['firstConnectionDate']);
        $this->assertSame($profile->config['url'], $claims['url']);
        $this->assertSame(1785412800, $claims['iat']);
        $this->assertSame($claims['iat'], $claims['nbf']);
        $this->assertSame($claims['iat'] + 300, $claims['exp']);
        $this->assertTrue(Str::isUuid($claims['jti']));
        $this->assertSame(
            1,
            openssl_verify($signingInput, $signature, $this->publicKeyPem, OPENSSL_ALGO_SHA256),
        );

        $device->refresh();
        $this->assertSame('2026-07-30', $device->first_connection_date?->format('Y-m-d'));
        $this->assertSame(hash('sha256', $claims['jti']), $device->last_token_jti_hash);
        $this->assertNotNull($device->last_connected_at);
    }

    public function test_first_connection_date_remains_stable_and_jti_rotates(): void
    {
        $this->travelTo(Carbon::parse('2026-07-30 23:59:00', 'UTC'));
        [, $device] = $this->activeDevice();
        [, $firstClaims] = $this->decodeToken(
            $this->get(route('api.v1.devices.configuration', $device->device_uuid))->getContent(),
        );

        $this->travelTo(Carbon::parse('2026-07-31 00:01:00', 'UTC'));
        [, $secondClaims] = $this->decodeToken(
            $this->get(route('api.v1.devices.configuration', $device->device_uuid))->getContent(),
        );

        $this->assertSame('2026-07-30', $firstClaims['firstConnectionDate']);
        $this->assertSame($firstClaims['firstConnectionDate'], $secondClaims['firstConnectionDate']);
        $this->assertNotSame($firstClaims['jti'], $secondClaims['jti']);
    }

    public function test_missing_signing_key_returns_generic_service_unavailable(): void
    {
        [, $device] = $this->activeDevice();
        config()->set('device-management.jwt.private_key_base64', null);

        $this->get(route('api.v1.devices.configuration', $device->device_uuid))
            ->assertServiceUnavailable()
            ->assertContent('')
            ->assertHeader('Cache-Control', 'no-store, private');

        $this->assertNull($device->refresh()->first_connection_date);
    }

    /** @return array{DeviceProfile, ManagedDevice} */
    private function activeDevice(string $url = 'https://portal.example.com/'): array
    {
        $profile = DeviceProfile::factory()->create([
            'config' => ['url' => $url],
            'is_active' => true,
        ]);
        $deviceId = strtolower((string) Str::uuid());
        $device = ManagedDevice::factory()->for($profile, 'profile')->create([
            'device_uuid' => $deviceId,
            'device_uuid_hash' => app(DeviceIdentifier::class)->blindIndex($deviceId),
        ]);

        return [$profile, $device];
    }

    /**
     * @return array{
     *     0: array<string, mixed>,
     *     1: array<string, mixed>,
     *     2: string,
     *     3: string
     * }
     */
    private function decodeToken(string $token): array
    {
        $parts = explode('.', trim($token));
        $this->assertCount(3, $parts);
        $header = json_decode($this->base64UrlDecode($parts[0]), true, flags: JSON_THROW_ON_ERROR);
        $claims = json_decode($this->base64UrlDecode($parts[1]), true, flags: JSON_THROW_ON_ERROR);

        return [
            $header,
            $claims,
            $this->base64UrlDecode($parts[2]),
            "{$parts[0]}.{$parts[1]}",
        ];
    }

    private function base64UrlDecode(string $value): string
    {
        $padding = (4 - strlen($value) % 4) % 4;
        $decoded = base64_decode(strtr($value.str_repeat('=', $padding), '-_', '+/'), true);
        $this->assertIsString($decoded);

        return $decoded;
    }

    private const TEST_PUBLIC_KEY = <<<'PEM'
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAznB5EXYzsbmeBztNk6Yy
YhzM4YPriaOMUI9kISgas9c31aPaR4Ji/kqhv6s2MYbIQz/J1o/AhAyk3I6nBJh9
kiQJpaOZWAgE/bhvskSrLmgGeRRwVOjgr9JOaENtHgmS95Be1rQhVRqCXZ9Xq/8z
rzIrj0ywoJuJI3MGh5vQZ2XK6SMiHUr4DSvgemUcZcA6s2P4yCmrsyTNEbm9Avsv
eMr0BoyKdrL49FPHqozLkfpDZmKpF4lWy8NTCajVXaYef/5XjtLFM55lqhGujq08
teedYRcAFIGS1a0WW32HO7UZvB5WFUIF3SZKaEre3wAAd85vWTB5e9D2vKqE+IXK
uQIDAQAB
-----END PUBLIC KEY-----
PEM;

    private const TEST_PRIVATE_KEY = <<<'PEM'
-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDOcHkRdjOxuZ4H
O02TpjJiHMzhg+uJo4xQj2QhKBqz1zfVo9pHgmL+SqG/qzYxhshDP8nWj8CEDKTc
jqcEmH2SJAmlo5lYCAT9uG+yRKsuaAZ5FHBU6OCv0k5oQ20eCZL3kF7WtCFVGoJd
n1er/zOvMiuPTLCgm4kjcwaHm9BnZcrpIyIdSvgNK+B6ZRxlwDqzY/jIKauzJM0R
ub0C+y94yvQGjIp2svj0U8eqjMuR+kNmYqkXiVbLw1MJqNVdph5//leO0sUznmWq
Ea6OrTy1551hFwAUgZLVrRZbfYc7tRm8HlYVQgXdJkpoSt7fAAB3zm9ZMHl70Pa8
qoT4hcq5AgMBAAECggEAMu/Ah6T1M1x72AfzZ8OBugCmMty0gMUYaYY/7Ahzsj0f
uziPMsbCu0DZ8SuDFyxM/H7gQ+87Trm58evG3RTtIuJ+eN7JhtWPubTI5qEX5b7o
HfcDkofVbLyE+Sft5BPzrd7y76IJeXCtiwE2hitVatyDr/t5t185MsR+b3ZsMR6U
SaH188Uokal+2zlhig17ZnvbG3j0YkXYLKG9UTBLAv2pNz6kphjpTwzZrV8s5kEr
J5FOHHxpK8Pr9rUdDwkx2nQs/+gj574jJ0hrTyXN/APi6xSR8WNE8lwNb/vI3DJg
jZipuvOIIE+X+xm94KPVtMQISjtCpkxVVF+aPdthAwKBgQD8DfB0v+fX4az9AMZA
k9vBc/J6XccKe9njkd/6GiwVTzoD7/q9sMQuV2++wixzPjkIREleeZSJ0Wq/5jqW
2TF1EBh+LxclxVTFGSPS9FHa5iKjq5lHw7F1rQI1peTFGWFjhoCtwdDc8AxGeiu4
i2u2c7SvQh8VRnF8nYA0pXqsNwKBgQDRq71drqXDG8QoevBOeKCbCEh1KC+LX4Qu
wwAdDdAatDzYvQ2+q+3NsVGLUIRXUq9j+2xvQwlpGnda51FnPbWkp1i0txyNiQ7C
msx97ZibhwbTpqpO94t41fsK8lqNPfTvCUrvDvGbGp78WAmWfDT4qEqGlCh7t4/Y
+MBwrSEojwKBgQCV57Bnry6y3RwmCIzgIU/kWRIQJq/XE1u+FabwtxoavljRuKsW
oAe9S/FAsXkAPTRsLzi3gHWQFcV4RfP4fUoFxkHa4iTRKPBGnLIKp5X7Kz3Uu5zY
6pEjXHbg8z4A3xxltbvYG1od3IJgdA6Gnhy8kUoXpaqY26FpLL7wEK7JtwKBgQC8
n3HWa524LqyDdkXlcmOZ1RPKQgKzsZQqtUbO3HRQ8cCjg0BwPh/LIjAn0qGcJUif
+7oLRhWbNjIV12/GHx/gJqSIvwqy0ZAzxisdRrg5gnnDwnYIYG5aoLYdnPWVhx1o
RcXh1mHIlWRdw52sgcTtxgh1laft1K9WFEKbm0TvRQKBgQDx9PfIxMZ1K7SJGu48
KtS1u0d+DW+Ad4VZd+5nMKr3eAAuuyCv6s3I8o0QVCl2WnAUoHhTP15WdWZKZed3
Aaad+tfRveL6BDF08PpG2eDQd+OKXddylhpMvci0JUfnNycQV02+UzsLKo5XNmX/
3JVj7n0JU6OrJxP4vjerY/SnMw==
-----END PRIVATE KEY-----
PEM;
}
