# Controle de acesso e Kanban

Este documento descreve a arquitetura, as decisões de segurança e a operação dos módulos de controle de acesso e Kanban.

## Arquitetura de autorização

O catálogo canônico fica em `config/access.php`. Cada permissão usa a notação `module.action` e declara rótulo, valor padrão e, quando aplicável, criticidade. Os valores explícitos de cada usuário são persistidos na coluna JSON `access.accesses`; relações como participantes, responsáveis e etiquetas usam tabelas relacionais.

`AccessManager`:

- valida módulos, ações e valores booleanos;
- combina valores persistidos com o catálogo atual;
- fornece padrões seguros e a navegação autorizada;
- memoriza o resultado apenas durante a requisição;
- concede acesso efetivo total ao proprietário.

`AccessUpdater` centraliza as alterações, usa transação e bloqueio de linha, compara o timestamp esperado para impedir sobrescritas concorrentes e grava o antes/depois em `access_audits`.

As regras administrativas são:

- `APP_OWNER_USER_ID` identifica o proprietário;
- o proprietário possui todas as permissões efetivas, mesmo que o JSON esteja incompleto;
- ninguém pode editar o próprio acesso;
- ninguém pode editar o proprietário;
- um administrador delegado só pode conceder permissões não críticas que ele próprio possui;
- somente o proprietário pode conceder permissões críticas;
- `is_admin` é mantido apenas por compatibilidade e não autoriza rotas.

O middleware `access` protege os endpoints. Policies acrescentam o vínculo com o quadro para recursos Kanban. Esconder um item do menu é apenas consequência da autorização, nunca a única proteção.

## Padrões e evolução

Por padrão, usuários podem usar o Kanban, checkout e configurações da própria conta. Dashboard, administração, integrações, uploads e exclusões permanentes são negados. Revise esses padrões em `config/access.php` antes de criar contas em ambientes com outra política.

Para adicionar uma permissão:

1. inclua a ação no módulo correto de `config/access.php`;
2. defina um padrão seguro e marque `critical` quando houver impacto administrativo ou sensível;
3. proteja a rota com `access:module.action`;
4. aplique a mesma habilidade na policy/Form Request da ação;
5. se houver navegação, declare `navigation` no módulo;
6. adicione testes de acesso permitido e negado;
7. execute `php artisan access:sync`.

Não é necessária migration para uma nova chave. Valores ausentes passam a usar o padrão atual; chaves desconhecidas e valores não booleanos são rejeitados.

## Proprietário e migração de usuários

Configure o ID real no ambiente:

```dotenv
APP_OWNER_USER_ID=1
```

Sincronize depois das migrations:

```bash
php artisan access:sync
```

Também é possível validar um proprietário em uma execução, sem substituir a configuração permanente:

```bash
php artisan access:sync --owner=1
```

O comando é idempotente: cria somente registros ausentes e não sobrescreve decisões existentes. Se não houver proprietário configurado, ele emite um aviso e aplica apenas padrões seguros.

## Matriz rota/ação → permissão

Rotas públicas (`/`, `/alt-tab`, `/me`, páginas legais, produtos públicos, sitemap, webhook e autenticação) não usam permissões de aplicação. Autenticação, status ativo, verificação de e-mail, rate limiting e assinatura continuam sendo aplicados onde já eram exigidos.

| Rota ou ação | Permissão |
| --- | --- |
| `GET /dashboard` | `dashboard.view` |
| `GET /checkout/{produto}` | `checkout.view` |
| `POST /checkout` | `checkout.create` |
| `GET /orders/{pedido}` | `checkout.view_own_orders`, além da propriedade do pedido |
| `GET /users/create`, `POST /users` | `users.create` |
| listar produtos administrativos | `commercial_products.view` |
| criar produto administrativo | `commercial_products.create` |
| editar produto administrativo | `commercial_products.update` |
| desativar produto administrativo | `commercial_products.archive` |
| listar ou abrir pedidos administrativos | `admin_orders.view` |
| abrir controle de acessos | `access_management.view` |
| alterar acesso de usuário | `access_management.update`, além das regras de delegação |
| perfil | `account_settings.profile` |
| senha, 2FA e passkeys | `account_settings.security` |
| aparência | `account_settings.appearance` |
| abrir chaves de aplicativos | `integration_settings.view` |
| salvar, conectar, sincronizar ou remover integração | `integration_settings.update` |
| abrir configurações de upload | `upload_settings.view` |
| alterar configurações de upload | `upload_settings.update` |
| qualquer tela ou endpoint Kanban | `kanban.view`, mais vínculo com o quadro |
| criar quadro | `kanban.create_board` |
| editar quadro | `kanban.edit_board` |
| arquivar/restaurar quadro | `kanban.archive_board` |
| excluir quadro permanentemente | `kanban.delete_board`, somente após arquivamento |
| alterar participantes | `kanban.manage_participants`, proprietário do quadro |
| criar coluna | `kanban.create_column` |
| editar/ordenar coluna | `kanban.edit_column` |
| arquivar coluna | `kanban.archive_column` |
| excluir coluna vazia | `kanban.delete_column` |
| visualizar card | `kanban.view_card` |
| criar card | `kanban.create_card` |
| editar card | `kanban.edit_card` |
| arquivar/restaurar card | `kanban.archive_card` |
| excluir card permanentemente | `kanban.delete_card`, somente após arquivamento |
| mover/reordenar card | `kanban.move_card` |
| criar/sincronizar/remover etiquetas | `kanban.manage_labels` |
| alterar responsáveis | `kanban.manage_assignees` |
| criar/alterar/remover checklists | `kanban.manage_checklists` |
| criar/remover comentários | `kanban.comment` |
| enviar, baixar ou remover anexos | `kanban.manage_attachments` |

## Modelagem do Kanban

- `boards`: proprietário, título, descrição, cor e arquivamento;
- `board_user`: participantes;
- `board_columns`: posição, limite opcional e arquivamento;
- `cards`: coluna, posição, prioridade, prazo, conteúdo e arquivamento;
- `card_user`: responsáveis;
- `labels` e `card_label`: etiquetas por quadro;
- `checklists` e `checklist_items`;
- `card_comments`;
- `card_attachments`: somente metadados seguros, nunca caminho público;
- `card_activities`: trilha de criação, alteração, movimentação e colaboração.

Índices cobrem filtros de quadro/coluna/posição e relações. Exclusões comuns usam arquivamento ou soft delete; exclusão definitiva é uma ação explícita e restrita.

## Movimentação e concorrência

O frontend usa `@dnd-kit/react` e `@dnd-kit/helpers` na versão `0.5.0`, ambos sob licença MIT. O movimento é otimista e reverte visualmente quando a requisição falha.

O endpoint dedicado recebe apenas `target_column_id` e `target_position`. O serviço:

1. bloqueia card e colunas envolvidas;
2. confirma que a coluna pertence ao mesmo quadro e está ativa;
3. aplica o limite de cards;
4. bloqueia os cards envolvidos;
5. reinsere o card e renumera posições contíguas a partir de zero;
6. persiste tudo em transação com repetição em caso de conflito;
7. registra a atividade.

`board_id`, `board_column_id` e `position` não são aceitos no update comum do card.

## Anexos

Anexos usam `KANBAN_ATTACHMENTS_DISK`, cujo padrão é o disco privado `local`. Nomes físicos são gerados pela aplicação. A resposta ao frontend expõe ID, nome original, tipo, tamanho e endpoint autorizado de download, mas não o caminho interno.

Limites atuais:

- até 10 MiB;
- PDF, PNG, JPEG, WebP, TXT, Markdown e ZIP;
- validação simultânea de extensão e MIME;
- rate limit de 10 uploads por minuto;
- download sempre por controller, permissionamento global e vínculo com o quadro.

Ao remover um anexo, o registro é excluído e o arquivo é removido após o commit. Ao excluir um quadro permanentemente, seus arquivos são removidos após a transação. Arquivar preserva arquivos e histórico.

## Testes e verificações

Cobertura funcional inclui:

- proprietário e padrões seguros;
- JSON inválido e novas permissões sem migration;
- acesso negado em HTML e JSON;
- redirecionamento pós-login;
- autoedição, delegação superior e proteção do proprietário;
- auditoria e conflito de atualização;
- CRUD, participação e isolamento entre quadros;
- movimentos internos/entre colunas, ordem, concorrência lógica e limites;
- etiquetas, responsáveis, checklists e comentários;
- anexos válidos, inválidos, privados e exclusão.

Execute:

```bash
php artisan test --compact
php vendor/bin/phpstan analyse --memory-limit=512M
php vendor/bin/pint --dirty
npm run lint
npm run format:check
npm run types:check
npm run build
composer audit
npm audit
```

## Deploy seguro

1. faça backup do banco, do `.env`, de `storage/app` e da chave de integrações;
2. confirme que `APP_OWNER_USER_ID` aponta para o usuário correto;
3. configure `KANBAN_ATTACHMENTS_DISK=local` ou outro disco privado compatível;
4. publique código, dependências Composer sem desenvolvimento e assets compilados;
5. coloque a aplicação em manutenção, se o ambiente exigir consistência durante a migration;
6. execute:

```bash
/opt/alt/php83/usr/bin/php artisan migrate --force
/opt/alt/php83/usr/bin/php artisan access:sync
/opt/alt/php83/usr/bin/php artisan optimize:clear
/opt/alt/php83/usr/bin/php artisan config:cache
/opt/alt/php83/usr/bin/php artisan route:cache
/opt/alt/php83/usr/bin/php artisan view:cache
```

7. confira permissões de escrita de `storage` e `bootstrap/cache`;
8. autentique como proprietário, valide `/dashboard`, `/admin/access` e `/kanban/boards`;
9. teste upload e download de um anexo não sensível;
10. retire a manutenção e monitore logs.

O deploy via GitHub Actions deve compilar Composer e frontend no runner, pois o PHP da hospedagem pode bloquear `proc_open`. O `.env` e arquivos privados não devem ser enviados pelo workflow.

### Rollback

Prefira restaurar o release anterior sem remover as tabelas: as mudanças de banco são aditivas e o código antigo pode ignorá-las. Se for indispensável reverter o banco:

1. ative manutenção;
2. faça outro backup;
3. identifique o batch exato com `php artisan migrate:status`;
4. reverta somente esse batch com `php artisan migrate:rollback --batch=N --force`;
5. restaure `storage/app` se arquivos já tiverem sido removidos;
6. restaure o release anterior e limpe caches.

Rollback de migrations pode apagar quadros, auditorias e metadados de anexos. Nunca o execute sem backup validado.
