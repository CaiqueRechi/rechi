<?php

return [
    'owner_user_id' => env('APP_OWNER_USER_ID'),

    'modules' => [
        'dashboard' => [
            'label' => 'Dashboard',
            'navigation' => ['label' => 'Dashboard', 'route' => 'dashboard'],
            'permissions' => [
                'view' => ['label' => 'Visualizar dashboard', 'default' => false, 'critical' => true],
            ],
        ],
        'kanban' => [
            'label' => 'Kanban',
            'navigation' => ['label' => 'Kanban', 'route' => 'kanban.boards.index'],
            'permissions' => [
                'view' => ['label' => 'Visualizar Kanban', 'default' => true],
                'create_board' => ['label' => 'Criar quadros', 'default' => true],
                'edit_board' => ['label' => 'Editar quadros', 'default' => true],
                'archive_board' => ['label' => 'Arquivar e restaurar quadros', 'default' => true],
                'delete_board' => ['label' => 'Excluir quadros definitivamente', 'default' => false],
                'manage_participants' => ['label' => 'Gerenciar participantes', 'default' => true],
                'create_column' => ['label' => 'Criar colunas', 'default' => true],
                'edit_column' => ['label' => 'Editar e ordenar colunas', 'default' => true],
                'archive_column' => ['label' => 'Arquivar colunas', 'default' => true],
                'delete_column' => ['label' => 'Excluir colunas vazias', 'default' => false],
                'view_card' => ['label' => 'Visualizar cards', 'default' => true],
                'create_card' => ['label' => 'Criar cards', 'default' => true],
                'edit_card' => ['label' => 'Editar cards', 'default' => true],
                'archive_card' => ['label' => 'Arquivar e restaurar cards', 'default' => true],
                'delete_card' => ['label' => 'Excluir cards definitivamente', 'default' => false],
                'move_card' => ['label' => 'Mover e reordenar cards', 'default' => true],
                'manage_labels' => ['label' => 'Gerenciar etiquetas', 'default' => true],
                'manage_assignees' => ['label' => 'Gerenciar responsáveis', 'default' => true],
                'manage_checklists' => ['label' => 'Gerenciar checklists', 'default' => true],
                'comment' => ['label' => 'Comentar em cards', 'default' => true],
                'manage_attachments' => ['label' => 'Gerenciar anexos', 'default' => true],
            ],
        ],
        'device_profiles' => [
            'label' => 'Configuração MDM',
            'navigation' => ['label' => 'Configuração MDM', 'route' => 'admin.device-profiles.index'],
            'permissions' => [
                'view' => ['label' => 'Visualizar profiles de dispositivos', 'default' => false, 'critical' => true],
                'create' => ['label' => 'Criar profiles de dispositivos', 'default' => false, 'critical' => true],
                'update' => ['label' => 'Alterar profiles de dispositivos', 'default' => false, 'critical' => true],
                'delete' => ['label' => 'Remover profiles de dispositivos', 'default' => false, 'critical' => true],
                'manage_devices' => ['label' => 'Vincular e revogar dispositivos', 'default' => false, 'critical' => true],
            ],
        ],
        'access_management' => [
            'label' => 'Controle de acessos',
            'navigation' => ['label' => 'Controle de acessos', 'route' => 'admin.access.index'],
            'permissions' => [
                'view' => ['label' => 'Visualizar acessos', 'default' => false, 'critical' => true],
                'update' => ['label' => 'Alterar acessos', 'default' => false, 'critical' => true],
            ],
        ],
        'users' => [
            'label' => 'Usuários',
            'navigation' => ['label' => 'Criar usuário', 'route' => 'users.create'],
            'permissions' => [
                'create' => ['label' => 'Criar usuários', 'default' => false, 'critical' => true],
            ],
        ],
        'commercial_products' => [
            'label' => 'Produtos comerciais',
            'navigation' => ['label' => 'Produtos', 'route' => 'admin.commercial-products.index'],
            'permissions' => [
                'view' => ['label' => 'Visualizar produtos administrativos', 'default' => false],
                'create' => ['label' => 'Criar produtos', 'default' => false, 'critical' => true],
                'update' => ['label' => 'Editar produtos', 'default' => false, 'critical' => true],
                'archive' => ['label' => 'Desativar produtos', 'default' => false, 'critical' => true],
            ],
        ],
        'admin_orders' => [
            'label' => 'Pedidos administrativos',
            'navigation' => ['label' => 'Pedidos', 'route' => 'admin.orders.index'],
            'permissions' => [
                'view' => ['label' => 'Visualizar todos os pedidos', 'default' => false, 'critical' => true],
            ],
        ],
        'checkout' => [
            'label' => 'Checkout e pedidos',
            'permissions' => [
                'view' => ['label' => 'Visualizar checkout', 'default' => true],
                'create' => ['label' => 'Criar pedidos', 'default' => true],
                'view_own_orders' => ['label' => 'Visualizar pedidos próprios', 'default' => true],
            ],
        ],
        'account_settings' => [
            'label' => 'Configurações da conta',
            'permissions' => [
                'profile' => ['label' => 'Editar perfil', 'default' => true],
                'security' => ['label' => 'Editar segurança', 'default' => true],
                'appearance' => ['label' => 'Editar aparência', 'default' => true],
            ],
        ],
        'integration_settings' => [
            'label' => 'Integrações',
            'navigation' => ['label' => 'Chaves de aplicativos', 'route' => 'settings.integrations.index'],
            'permissions' => [
                'view' => ['label' => 'Visualizar integrações', 'default' => false, 'critical' => true],
                'update' => ['label' => 'Alterar e sincronizar integrações', 'default' => false, 'critical' => true],
            ],
        ],
        'upload_settings' => [
            'label' => 'Configurações de upload',
            'navigation' => ['label' => 'Arquivos enviados', 'route' => 'settings.upload-files.edit'],
            'permissions' => [
                'view' => ['label' => 'Visualizar configurações de upload', 'default' => false, 'critical' => true],
                'update' => ['label' => 'Alterar configurações de upload', 'default' => false, 'critical' => true],
            ],
        ],
    ],
];
