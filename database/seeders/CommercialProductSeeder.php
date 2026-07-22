<?php

namespace Database\Seeders;

use App\Models\CommercialProduct;
use Illuminate\Database\Seeder;

class CommercialProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        CommercialProduct::query()->updateOrCreate(
            ['slug' => 'landing-page-essencial'],
            [
                'type' => 'landing_page',
                'name' => 'Landing Page Essencial',
                'short_description' => 'Landing page responsiva para apresentar uma oferta e receber contatos.',
                'description' => 'Página com escopo fechado para profissionais e pequenos negócios que precisam validar uma oferta, receber contatos e direcionar clientes para WhatsApp ou formulário.',
                'price_cents' => 45000,
                'currency' => 'BRL',
                'estimated_delivery' => 'até 3 dias úteis após o recebimento do material',
                'max_sections' => 5,
                'included_features' => [
                    'até 5 seções',
                    'design responsivo',
                    'botão para WhatsApp',
                    'formulário de contato',
                    'SEO técnico básico',
                    'configuração inicial na hospedagem',
                    'uma rodada de ajustes',
                ],
                'excluded_features' => [
                    'redação completa de textos comerciais',
                    'produção de fotos ou vídeos',
                    'tráfego pago',
                ],
                'revision_count' => 1,
                'is_featured' => true,
                'is_active' => true,
                'category' => 'landing-pages',
                'sort_order' => 10,
                'seo_title' => 'Landing Page Essencial | Rechi',
                'seo_description' => 'Landing page responsiva com WhatsApp, formulário de contato e SEO técnico básico.',
            ],
        );

        CommercialProduct::query()->updateOrCreate(
            ['slug' => 'diagnostico-correcao-bugs-2h'],
            [
                'type' => 'bug_fix',
                'name' => 'Diagnóstico e correção de bugs - 2h',
                'short_description' => 'Bloco inicial para diagnóstico de bugs em PHP, Laravel, JavaScript, APIs ou banco de dados.',
                'description' => 'Contratação mínima de duas horas para investigar, reproduzir e corrigir bugs técnicos. Horas extras precisam de autorização antes de continuar.',
                'price_cents' => 16000,
                'currency' => 'BRL',
                'estimated_delivery' => 'agendamento conforme disponibilidade e urgência',
                'max_sections' => null,
                'included_features' => [
                    'até 2 horas técnicas',
                    'análise do erro reportado',
                    'tentativa de reprodução',
                    'correção ou diagnóstico documentado',
                    'orientação antes de exceder o limite contratado',
                ],
                'excluded_features' => [
                    'reescrita completa do sistema',
                    'acesso sem autorização',
                    'garantia de correção para erro não reproduzível',
                ],
                'revision_count' => 0,
                'is_featured' => true,
                'is_active' => true,
                'category' => 'correcao-de-bugs',
                'sort_order' => 20,
                'seo_title' => 'Correção de bugs PHP e Laravel | Rechi',
                'seo_description' => 'Diagnóstico e correção de bugs em PHP, Laravel, JavaScript, APIs e banco de dados.',
            ],
        );
    }
}
