# Rechi

Aplicação construída com Laravel 13 e o starter kit oficial React. Além da landing page principal, `/alt-tab` apresenta sinais pessoais de música, jogos, código e comunidade em uma interface cyberpunk clara/escura. A página não é vinculada pela index.

## Stack

- Laravel 13 e PHP 8.3
- React 19 e TypeScript
- Inertia 3
- Tailwind CSS 4
- shadcn/ui
- Laravel Fortify

## Autenticação

- Login e cadastro
- Recuperação de senha
- Verificação de e-mail
- Autenticação em dois fatores
- Passkeys

## Desenvolvimento

```bash
composer install
npm install
php artisan migrate
composer run dev
```

## ALT / TAB e integrações

As configurações ficam disponíveis apenas para administradores em **General settings → App keys**.

| Provedor | Conexão | Dados armazenados |
| --- | --- | --- |
| Spotify | OAuth 2.0 | conta, tokens e músicas recentes |
| Steam | OpenID + Web API key | Steam ID, conta e jogos recentes |
| Last.fm | API key + username | scrobbles recentes |
| WakaTime | OAuth 2.0 | conta, tokens e resumos de código |
| Discord | OAuth 2.0 + widget oficial do servidor | conta e membros/atividades públicas do widget |

Os serviços são APIs oficiais e confiáveis, mas continuam sujeitos a indisponibilidade, limites e mudanças dos provedores. Spotify pode exigir uma conta Premium para novos aplicativos; Discord usa somente OAuth e o widget oficial, sem simular presença pessoal por bot.

### Cyber Garden

Em desktops compatíveis, `/alt-tab` carrega dinamicamente um mundo 2D procedural em Canvas 2D. O personagem reage ao ponteiro enquanto chunks determinísticos criam a impressão de um jardim digital infinito. Mobile, redução de movimento e economia de dados usam apenas o fallback estático.

A arquitetura, algoritmos, controles de performance e caminhos de evolução estão documentados em [`docs/CYBER_GARDEN.md`](docs/CYBER_GARDEN.md).

Quando uma conexão ou seu histórico estiver vazio, `/alt-tab` mostra dados artificiais claramente marcados como **demo** e **not connected**. Esses exemplos não são gravados no banco e somem quando dados reais forem sincronizados.

### Criptografia das credenciais

Credenciais e tokens são armazenados em um único payload cifrado em `integration_connections.credentials`. O atributo fica oculto na serialização e usa uma chave exclusiva, separada de `APP_KEY`:

```bash
php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"
```

Copie o resultado para `APP_SETTINGS_KEY` no `.env` de cada ambiente. Faça backup seguro dessa chave: perdê-la torna as credenciais existentes irrecuperáveis. Nunca a publique no Git e nunca a exponha ao frontend.

Depois de configurar a URL final em `APP_URL`, cadastre estes callbacks nos painéis dos provedores:

```text
https://rechi.net.br/settings/general/app-keys/spotify/callback
https://rechi.net.br/settings/general/app-keys/wakatime/callback
https://rechi.net.br/settings/general/app-keys/discord/callback
```

O histórico normalizado é salvo em `integration_activities` e preservado ao desconectar uma conta. O botão **Synchronize** busca novos dados com timeout e tentativas curtas; os testes usam respostas HTTP artificiais e nunca chamam APIs reais.

### Ativação em produção

Após publicar o código e adicionar `APP_SETTINGS_KEY` ao `.env` da Hostinger:

```bash
/opt/alt/php83/usr/bin/php artisan migrate --force
/opt/alt/php83/usr/bin/php artisan optimize:clear
```

## Verificações

```bash
composer test
npm run lint
npm run build
```
