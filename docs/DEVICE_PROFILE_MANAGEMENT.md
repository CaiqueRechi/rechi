# Device profile management e configuração MDM

## Objetivo

O módulo administra configurações de dispositivos sem colocar segredos no payload enviado ao
Android. Um administrador autorizado cria um profile, vincula previamente o UUID de uma
instalação e a API emite um JWT compacto `RS256` somente quando profile e dispositivo estão
ativos.

O primeiro tipo disponível é `kiosk`. A arquitetura usa uma coluna `type` textual e validação de
schema por tipo para permitir novos profiles sem alterar o contrato dos registros existentes.

## Modelo de dados

### `device_profiles`

- `name` e `slug`: identificação administrativa;
- `type`: tipo extensível do profile (`kiosk` inicialmente);
- `description`: contexto operacional;
- `config`: objeto JSON validado de acordo com o tipo;
- `is_active`: interrupção imediata da emissão;
- autoria, timestamps e soft delete.

O JSON do profile `kiosk` possui somente:

```json
{
  "url": "https://portal.exemplo.com/"
}
```

`config` não é um cofre. Chaves privadas, senhas, tokens ou credenciais nunca devem ser colocados
nesse JSON. Quando um tipo futuro precisar de segredo, ele deve usar armazenamento cifrado
separado, com autorização e rotação próprias.

### `managed_devices`

- UUID cifrado pelo cast `encrypted` do Laravel;
- índice cego HMAC-SHA-256 para busca sem descriptografar a tabela;
- profile atribuído;
- data UTC da primeira conexão;
- última conexão;
- hash do último `jti`;
- revogação sem apagamento do histórico.

Um UUID ativo não pode ser silenciosamente transferido para outro profile. Um dispositivo
revogado pode ser reativado explicitamente por um administrador; a data da primeira conexão é
reiniciada nesse processo.

### `device_profile_audits`

Registra criação, alteração e remoção de profiles, além de vinculação, reativação e revogação de
dispositivos. O UUID em texto puro não é copiado para a auditoria.

## Autorização

O módulo `device_profiles` adiciona permissões independentes:

- `view`;
- `create`;
- `update`;
- `delete`;
- `manage_devices`.

Todas são críticas e começam desabilitadas para usuários comuns. O proprietário configurado por
`APP_OWNER_USER_ID` recebe acesso efetivo completo.

## Contrato da API

```http
GET /api/v1/devices/{deviceId}/configuration
Accept: application/jwt
```

Em caso de sucesso:

```http
HTTP/1.1 200 OK
Content-Type: application/jwt
Cache-Control: no-store, private
X-Content-Type-Options: nosniff
```

Claims:

```json
{
  "iss": "rechi-mdm-api",
  "aud": "rechi-mdm-device",
  "sub": "UUID_DO_APLICATIVO",
  "firstConnectionDate": "2026-07-30",
  "url": "https://portal.exemplo.com/",
  "iat": 1785360000,
  "nbf": 1785360000,
  "exp": 1785360300,
  "jti": "UUID_UNICO_DO_TOKEN"
}
```

O endpoint:

1. valida e canonicaliza o UUID;
2. calcula o índice cego;
3. bloqueia a linha do dispositivo em transação;
4. exige dispositivo não revogado e profile ativo;
5. fixa `firstConnectionDate` na primeira emissão usando UTC;
6. reutiliza exatamente essa data nas emissões posteriores;
7. valida a configuração do tipo;
8. gera `jti` novo e JWT com validade curta;
9. assina exclusivamente com RSA/SHA-256;
10. salva apenas o hash do `jti`.

UUID desconhecido, revogado e profile inativo retornam a mesma resposta `404`. Falha de chave ou
assinatura retorna `503` sem detalhes internos. O rate limit combina IP e hash do UUID.

## Chaves e variáveis de ambiente

Prefira uma chave privada RSA de 3072 bits em arquivo fora do diretório público:

```bash
openssl genpkey -algorithm RSA \
  -pkeyopt rsa_keygen_bits:3072 \
  -out /home/USUARIO/.keys/rechi-mdm-private.pem

chmod 600 /home/USUARIO/.keys/rechi-mdm-private.pem
```

Extraia a chave pública X.509 DER em Base64 para o build do Android:

```bash
openssl pkey \
  -in /home/USUARIO/.keys/rechi-mdm-private.pem \
  -pubout -outform DER |
openssl base64 -A
```

Configuração:

```env
DEVICE_LOOKUP_KEY=base64:VALOR_ALEATORIO_DE_32_BYTES_OU_MAIS
DEVICE_JWT_ISSUER=rechi-mdm-api
DEVICE_JWT_AUDIENCE=rechi-mdm-device
DEVICE_JWT_TTL_SECONDS=300
DEVICE_JWT_KEY_ID=2026-07
DEVICE_JWT_PRIVATE_KEY_PATH=/home/USUARIO/.keys/rechi-mdm-private.pem
DEVICE_JWT_PRIVATE_KEY_BASE64=
DEVICE_JWT_PRIVATE_KEY_PASSPHRASE=
```

`DEVICE_JWT_PRIVATE_KEY_BASE64` existe para ambientes sem arquivo seguro, mas o arquivo externo
com permissão mínima é preferível. Nunca use as duas origens ao mesmo tempo; o caminho tem
precedência. A API rejeita RSA menor que 2048 bits. O TTL é limitado pelo servidor ao intervalo de
60 a 900 segundos.

O painel administrativo exibe a chave **pública** derivada e permite copiá-la para
`serverJwtPublicKeyBase64`. A chave privada nunca é enviada ao frontend.

## Build Android

```powershell
.\gradlew.bat assembleRelease `
  -PconfigurationApiBaseUrl=https://rechi.net.br/ `
  -PserverJwtPublicKeyBase64=CHAVE_PUBLICA_X509_DER_BASE64 `
  -PserverJwtIssuer=rechi-mdm-api `
  -PserverJwtAudience=rechi-mdm-device
```

## Adicionando um novo tipo de profile

1. adicione um caso em `App\Enums\DeviceProfileType`;
2. defina o schema permitido nos Form Requests;
3. crie os campos condicionais no formulário;
4. faça o emissor interpretar o novo tipo de forma explícita e fail-closed;
5. adicione testes de validação, autorização e emissão;
6. documente quais campos são públicos no JWT e quais precisam de armazenamento secreto.

Tipos desconhecidos nunca usam fallback para `kiosk`.

## Deploy

Depois de publicar o código:

```bash
/opt/alt/php83/usr/bin/php artisan migrate --force
/opt/alt/php83/usr/bin/php artisan access:sync --owner=1
/opt/alt/php83/usr/bin/php artisan optimize:clear
```

Em seguida:

1. configure as chaves no `.env`;
2. execute `php artisan config:cache` se esse cache for usado no ambiente;
3. confirme no painel que “Assinatura RS256” aparece como configurada;
4. crie um profile `kiosk`;
5. vincule o UUID mostrado pelo aplicativo;
6. teste a emissão antes de distribuir o APK.

## Rotação

A rotação continua coordenada com o APK porque o cliente possui uma chave pública fixa. Use
`DEVICE_JWT_KEY_ID` para identificar gerações, publique um APK que confie na nova chave e somente
então substitua a chave privada do servidor. Para rotação sem atualização simultânea, a evolução
recomendada é o cliente aceitar temporariamente um pequeno keyring por `kid`.

## Testes

Os testes verificam:

- autorização do CRUD;
- schema JSON e rejeição de HTTP, credenciais e campos desconhecidos;
- criptografia do UUID em repouso;
- índice cego determinístico;
- bloqueio de reatribuição silenciosa;
- revogação ao remover profile;
- respostas fail-closed;
- claims obrigatórias;
- assinatura criptográfica real;
- data UTC estável entre dias;
- rotação de `jti`;
- ausência de cache;
- falha segura quando a chave não está configurada.

A chave privada versionada dentro do teste é uma fixture sem uso fora da suíte e nunca deve ser
copiada para nenhum ambiente.
