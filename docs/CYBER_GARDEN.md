# Cyber Garden — background procedural da ALT / TAB

## Objetivo

O Cyber Garden é um mundo 2D procedural usado exclusivamente como background da rota `/alt-tab`. Ele cria a ilusão de um personagem caminhando por um jardim digital infinito sem transformar o portfólio em uma aplicação de jogo.

As prioridades são, nesta ordem:

1. não interferir na navegação;
2. baixo consumo de CPU, GPU e memória;
3. movimento convincente;
4. acessibilidade e fallback seguro;
5. código determinístico e extensível.

O Laravel apenas entrega a página. Todo o motor roda no navegador e não realiza requisições durante o loop.

## Decisões técnicas

### Canvas 2D puro

O MVP usa `CanvasRenderingContext2D`, sem PixiJS ou engine de jogos. O Canvas 2D oferece o controle necessário sobre pixels, mantém o bundle pequeno e evita uma abstração adicional para um cenário com apenas um personagem e poucos efeitos.

PixiJS deve ser reconsiderado somente se o projeto ganhar dezenas de sprites simultâneos, sistemas complexos de partículas ou filtros de GPU.

### Arquitetura híbrida

- Terreno: chunks procedurais pré-renderizados.
- Personagem: pequenos frames pré-renderizados em canvases auxiliares.
- Movimento: coordenadas globais da câmera.
- Ambiente: poucos pontos luminosos calculados em baixa resolução.
- Interface: React monta e desmonta o canvas, mas não participa do loop.

Essa separação impede rerenders React a cada frame.

## Estrutura de arquivos

```text
resources/js/background/
├── bootstrap.ts                # resolve a seed e inicia o motor
├── config.ts                   # perfis de qualidade, paleta e constantes
├── types.ts                    # contratos do domínio
├── core.ts                     # matemática determinística testável
├── InputController.ts          # posição e velocidade do ponteiro
├── ChunkCache.ts               # geração e cache LRU do terreno
├── CharacterRenderer.ts        # geração e desenho dos frames do personagem
├── QualityMonitor.ts           # redução automática de qualidade
└── ProceduralBackground.ts     # loop, câmera e coordenação geral

resources/js/components/
└── procedural-background.tsx   # adaptador React e importação dinâmica

tests/Frontend/
└── ProceduralBackground.test.mjs
```

## Ciclo de carregamento

O componente React é pequeno e faz a importação dinâmica de `background/bootstrap` somente quando todas as condições abaixo são verdadeiras:

- viewport com pelo menos `1024px`;
- dispositivo com ponteiro preciso;
- usuário não solicitou redução de movimento;
- economia de dados não está ativa.

No mobile ou em dispositivos incompatíveis, o módulo do motor não é baixado. A decoração CSS original da `/alt-tab` permanece como fallback estático.

O canvas possui `pointer-events: none` e `aria-hidden="true"`. Links, seleção de texto e formulários continuam funcionando normalmente.

## Seed e determinismo

A seed é resolvida nesta ordem:

1. parâmetro `?worldSeed=` da URL;
2. valor persistido em `localStorage`;
3. número criado por `crypto.getRandomValues()`;
4. fallback derivado do navegador se o storage estiver indisponível.

Exemplo para reproduzir um mundo durante desenvolvimento:

```text
/alt-tab?worldSeed=cyber-garden-demo
```

`normalizeSeed`, `hashCoordinate`, `valueNoise` e `sampleTerrain` são funções puras. A mesma seed e as mesmas coordenadas sempre retornam o mesmo resultado.

## Geração do mundo

O mundo utiliza cinco biomas:

| Bioma | Papel visual |
| --- | --- |
| `deepWater` | água roxa profunda |
| `water` | margens e lagos violetas |
| `moss` | transição escura entre água e jardim |
| `grass` | grama verde neon |
| `rock` | formações azuladas |

O terreno combina duas frequências de value noise:

- frequência baixa para grandes regiões;
- frequência intermediária para irregularidade local.

Detalhes como flores, reflexos e pedras claras usam `hashCoordinate`. Eles não precisam ser armazenados porque podem ser reconstruídos a qualquer momento.

## Chunks e cache

Cada chunk possui `48 × 48` células e cada célula ocupa `2 × 2` pixels internos. Um chunk renderizado mede `96 × 96` pixels no canvas auxiliar.

Ao desenhar um frame:

1. o motor calcula quais chunks cruzam a viewport;
2. recupera chunks existentes do cache;
3. gera apenas os chunks ainda ausentes;
4. desenha os canvases cacheados em relação à câmera;
5. remove os chunks menos usados quando o limite é excedido.

Limites atuais:

| Qualidade | Chunks máximos |
| --- | ---: |
| Low | 16 |
| Medium | 25 |
| High | 36 |

Para adicionar um bioma, atualize `TerrainType`, `WorldPalette`, `CyberGardenPalette`, `sampleTerrain` e `ChunkCache.drawTerrainDetail`.

## Personagem procedural

O personagem mede `24 × 32` pixels internos. A seed define tom de pele, cabelo e a combinação lima/fúcsia da roupa.

Os frames são gerados uma vez no construtor e guardados em memória. Durante o loop, `CharacterRenderer.draw` usa apenas `drawImage`, evitando reconstruir camadas do corpo continuamente.

Estados atuais:

| Estado | Gatilho |
| --- | --- |
| `idle` | ponteiro no centro |
| `looking` | ponteiro dentro da zona morta |
| `walking` | distância moderada |
| `running` | ponteiro distante |
| `surprised` | movimento muito rápido do ponteiro |

Novos estados devem ser adicionados ao tipo `CharacterState`, à geração de frames e à regra correspondente no núcleo ou no motor.

## Movimento e câmera

O ponteiro determina uma direção normalizada. A velocidade alvo é suavizada exponencialmente antes de alterar a câmera. O personagem permanece visualmente no centro enquanto as coordenadas globais do mundo avançam.

Valores principais:

```text
Dead zone: 58px
Início da corrida: 260px
Velocidade de caminhada: 24 células/s
Velocidade de corrida: 39 células/s
```

Movimentos bruscos acionam `surprised` por aproximadamente `420ms` e reduzem temporariamente a velocidade alvo a zero.

## Qualidade e performance

O motor começa em Medium:

| Qualidade | Largura interna máxima | FPS | Partículas |
| --- | ---: | ---: | ---: |
| Low | 320px | 24 | 5 |
| Medium | 480px | 30 | 10 |
| High | 640px | 45 | 16 |

O `QualityMonitor` mede o tempo gasto em atualização e renderização. Depois de 120 amostras, reduz um nível se a média ultrapassar o limite configurado. A qualidade não sobe automaticamente durante a sessão para evitar oscilações.

O loop também:

- limita a frequência independentemente de monitores de 120/144Hz;
- pausa o trabalho quando `document.hidden` é verdadeiro;
- limita o delta máximo para evitar saltos após suspensão;
- remove listeners, cancela `requestAnimationFrame` e limpa chunks no unmount.

O canvas expõe atributos de diagnóstico:

```text
data-quality
data-character-state
data-cached-chunks
```

Eles podem ser inspecionados no DevTools sem adicionar uma interface de debug ao site.

## Testes

O núcleo matemático usa o runner nativo do Node, sem dependências adicionais:

```bash
npm run test:background
```

Os testes verificam:

- determinismo por seed e coordenadas;
- biomas válidos;
- transições por distância e velocidade do ponteiro;
- normalização da velocidade;
- direção do personagem;
- redução gradual da qualidade;
- limites de frames de animação.

Validação geral:

```bash
npm run test:background
npm run types:check
npm run lint:check
npm run build
php artisan test --compact tests/Feature/AltTabTest.php
```

## Evoluções recomendadas

1. Adicionar estados `bored` e `sleeping` sem aumentar o número de entidades.
2. Animar somente células de água visíveis em uma camada separada.
3. Criar eventos raros determinados pela seed, como chuva de pixels.
4. Permitir selecionar seed e qualidade em um painel de desenvolvimento.
5. Medir P95 do tempo de frame com `PerformanceObserver` antes de elevar a qualidade padrão.
6. Levar uma versão reduzida ao hero da landing page somente após medir dispositivos reais.

Evite adicionar física, colisão, pathfinding ou estado React ao loop sem uma necessidade concreta. A força do efeito vem da ilusão, não da quantidade de sistemas.
