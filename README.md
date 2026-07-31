# Rechi

Portfólio e aplicação pessoal construída com Laravel 13, Inertia 3, React 19 e TypeScript. O projeto reúne a landing page pública, as experiências `/alt-tab` e `/me`, dashboard privado, integrações e um Kanban colaborativo com controle centralizado de acesso.

## Stack

- PHP 8.3 e Laravel 13
- React 19, TypeScript e Inertia 3
- Tailwind CSS 4 e shadcn/ui
- Laravel Fortify
- PHPUnit e Larastan

## Desenvolvimento

```bash
composer install
npm install
copy .env.example .env
php artisan key:generate
php artisan migrate
composer run dev
```

Para validar uma alteração:

```bash
php artisan test --compact
php vendor/bin/phpstan analyse --memory-limit=512M
php vendor/bin/pint --dirty
npm run lint
npm run format:check
npm run types:check
npm run build
```

## Controle de acesso e Kanban

As permissões são definidas em `config/access.php` e persistidas como JSON validado na tabela singular `access`. A interface, as rotas, as policies e o redirecionamento pós-login usam o mesmo catálogo. O campo legado `is_admin` não concede autorização.

Configure o proprietário da instalação:

```dotenv
APP_OWNER_USER_ID=1
```

Depois sincronize os registros existentes:

```bash
php artisan access:sync
```

O proprietário tem acesso efetivo total e não pode ser rebaixado pela interface. Novos usuários recebem apenas os padrões seguros do catálogo. O dashboard permanece privado por padrão.

O Kanban oferece quadros, participantes, colunas, cards, movimentação otimista, responsáveis, etiquetas, checklists, comentários, anexos privados e histórico de atividades. A documentação de arquitetura, segurança, permissões, deploy e rollback está em [`docs/ACCESS_AND_KANBAN.md`](docs/ACCESS_AND_KANBAN.md).

## Device profile management

O painel administrativo inclui profiles extensíveis para dispositivos MDM. O primeiro tipo,
`kiosk`, associa UUIDs previamente autorizados a uma URL HTTPS e entrega a configuração em JWT
`RS256` de curta duração. UUIDs são cifrados em repouso e localizados por índice cego HMAC.

Contrato da API, gestão de chaves, modelo de dados, rotação e deploy estão documentados em
[`docs/DEVICE_PROFILE_MANAGEMENT.md`](docs/DEVICE_PROFILE_MANAGEMENT.md).

## ALT / TAB e integrações

As configurações ficam disponíveis somente para usuários com `integration_settings.view` ou `integration_settings.update`, em **Configurações gerais → Chaves de aplicativos**.

| Provedor | Conexão | Dados armazenados |
| --- | --- | --- |
| Spotify | OAuth 2.0 | conta, tokens e músicas recentes |
| Steam | OpenID + Web API key | Steam ID, conta e jogos recentes |
| Last.fm | API key + username | scrobbles recentes |
| WakaTime | OAuth 2.0 | conta, tokens e resumos de código |
| Discord | OAuth 2.0 + widget oficial | conta e dados públicos do widget |

Quando uma conexão ou seu histórico estiver vazio, `/alt-tab` mostra dados artificiais marcados como **demo** e **not connected**. Eles não são gravados no banco.

### Credenciais das integrações

Credenciais e tokens ficam cifrados em `integration_connections.credentials`, ocultos da serialização e protegidos por uma chave separada de `APP_KEY`:

```bash
php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"
```

Copie o valor para `APP_SETTINGS_KEY` no `.env`. Perder essa chave torna as credenciais existentes irrecuperáveis; nunca a publique no Git ou no frontend.

Os callbacks de produção são:

```text
https://rechi.net.br/settings/general/app-keys/spotify/callback
https://rechi.net.br/settings/general/app-keys/wakatime/callback
https://rechi.net.br/settings/general/app-keys/discord/callback
```

### Cyber Garden

Em desktops compatíveis, `/alt-tab` usa um mundo 2D procedural em Canvas. Mobile, redução de movimento e economia de dados recebem um fallback estático. Consulte [`docs/CYBER_GARDEN.md`](docs/CYBER_GARDEN.md).

## Produção

Não versione o `.env`. Antes do deploy, configure `APP_OWNER_USER_ID`, `APP_SETTINGS_KEY` e `KANBAN_ATTACHMENTS_DISK`. A ordem segura completa, incluindo backup e rollback, está em [`docs/ACCESS_AND_KANBAN.md`](docs/ACCESS_AND_KANBAN.md#deploy-seguro).
