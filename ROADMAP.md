# TripPlanner AI - Roadmap de Desenvolvimento

## 1. Visao do Produto

TripPlanner AI sera uma aplicacao web para criar roteiros de viagem personalizados com apoio de IA. O produto deve permitir que o usuario informe destino, datas, orcamento, perfil de viagem, interesses, ritmo desejado e restricoes; a plataforma entao gera um itinerario editavel, com sugestoes de hospedagem, deslocamento, atividades, custos estimados e mapa.

O foco inicial sera entregar uma experiencia real e utilizavel: gerar, revisar, salvar e compartilhar planos de viagem.

## 2. Arquitetura Proposta

Arquitetura inicial recomendada: monorepo com frontend, backend e pacotes compartilhados.

```text
TripPlannerAI/
  apps/
    web/                 # Aplicacao frontend
    api/                 # API backend
  packages/
    shared/              # Tipos, validadores e utilitarios compartilhados
    config/              # Configuracoes comuns de lint, TS e testes
  infra/
    docker/              # Dockerfiles e compose local
    migrations/          # Estrutura auxiliar para banco, se separada do ORM
  docs/                  # Documentacao tecnica e produto
  ROADMAP.md
```

### Componentes Principais

- Frontend web: interface para onboarding, criacao de viagem, edicao de roteiro, mapa, autenticacao e dashboard.
- Backend API: regras de negocio, integracao com IA, persistencia, autenticacao, integracoes externas e geracao de planos.
- Banco de dados: armazenamento de usuarios, viagens, destinos, preferencias, itinerarios, custos e historico de geracoes.
- Camada de IA: prompts, schemas de resposta, validacao, retries e guardrails para gerar dados estruturados.
- Jobs assincronos: tarefas mais lentas como enriquecimento de roteiro, busca de lugares e recalculo de custos.

## 3. Tecnologias

### Frontend

- Next.js com React e TypeScript.
- Tailwind CSS para estilo utilitario.
- shadcn/ui como base de componentes acessiveis.
- TanStack Query para estado de servidor.
- React Hook Form e Zod para formularios e validacao.
- Mapbox GL JS ou Google Maps JavaScript API para mapas.

### Backend

- Node.js com TypeScript.
- NestJS ou Fastify. Recomendacao inicial: Fastify pela simplicidade, performance e menor cerimonia.
- Prisma ORM.
- PostgreSQL.
- Redis para cache, rate limiting e filas.
- BullMQ para jobs assincronos.
- Zod para validacao de contratos.

### IA

- OpenAI API para geracao e refinamento de roteiros em formato estruturado.
- Prompts versionados no backend.
- Validacao forte da resposta da IA antes de persistir.

### Infraestrutura

- Docker Compose para desenvolvimento local.
- Vercel para frontend.
- Render, Railway, Fly.io ou AWS ECS para API.
- Neon, Supabase ou RDS para PostgreSQL gerenciado.
- Upstash Redis ou Redis gerenciado equivalente.

## 4. APIs Externas

- OpenAI API: geracao de itinerarios, resumo de destinos, ajuste de roteiro e explicacoes personalizadas.
- Google Places API ou Foursquare Places: busca e enriquecimento de pontos de interesse.
- Google Maps API ou Mapbox: mapas, geocoding, rotas e visualizacao.
- OpenWeather API: previsao climatica e medias historicas quando aplicavel.
- ExchangeRate API ou Open Exchange Rates: conversao de moedas.
- Booking/Affiliate APIs, Amadeus ou Skyscanner, em fase posterior: sugestoes de hospedagem e voos.
- Auth provider opcional: Clerk, Auth.js ou Supabase Auth.

Decisao inicial recomendada: comecar com OpenAI, Maps/Places e Weather. Hospedagem e voos entram depois, pois aumentam complexidade operacional e exigem contratos ou afiliacao.

## 5. Funcionalidades por Modulos

### Modulo de Autenticacao

- Cadastro e login.
- Sessao segura.
- Recuperacao de senha.
- Perfil basico do usuario.

### Modulo de Preferencias

- Estilo de viagem: economico, confortavel, premium.
- Ritmo: leve, moderado, intenso.
- Interesses: gastronomia, cultura, natureza, compras, vida noturna, familia, aventura.
- Restricoes: mobilidade, alimentacao, criancas, pets, acessibilidade.
- Moeda e idioma preferidos.

### Modulo de Criacao de Viagem

- Formulario de destino, datas, numero de viajantes e orcamento.
- Escolha de interesses e ritmo.
- Validacao de entrada.
- Estimativa preliminar de viabilidade.

### Modulo de Geracao com IA

- Geracao de roteiro dia a dia.
- Saida estruturada com horarios, locais, justificativas, custos e duracao.
- Regras de consistencia: nao sobrecarregar dias, evitar deslocamentos impossiveis, respeitar horarios.
- Regeracao parcial por dia, atividade ou preferencia.
- Historico de versoes do roteiro.

### Modulo de Itinerario

- Visualizacao por dia.
- Edicao manual de atividades.
- Reordenacao de atividades.
- Marcacao de favoritos.
- Notas pessoais.
- Exportacao para PDF em fase posterior.

### Modulo de Mapas e Locais

- Geocoding de destinos e atividades.
- Mapa com pontos do roteiro.
- Calculo aproximado de deslocamentos.
- Agrupamento por regiao para reduzir trajetos ruins.

### Modulo de Custos

- Orcamento por categoria: hospedagem, alimentacao, transporte, passeios e extras.
- Conversao de moeda.
- Estimativa por dia e total.
- Alertas quando o roteiro ultrapassar o orcamento.

### Modulo de Compartilhamento

- Link publico ou privado de roteiro.
- Permissao somente leitura inicialmente.
- Colaboracao em tempo real em fase posterior.

### Modulo Administrativo

- Monitoramento de geracoes.
- Logs de erro de IA e integracoes.
- Controle de custos de API.
- Feature flags simples.

## 6. Ordem de Implementacao em Sprints

### Sprint 0 - Fundacao do Projeto

- Criar monorepo.
- Configurar TypeScript, lint, formatter e testes.
- Criar Docker Compose com PostgreSQL e Redis.
- Definir variaveis de ambiente.
- Criar pipeline basico de CI.

### Sprint 1 - Base Web e API

- Criar app Next.js.
- Criar API Fastify.
- Configurar Prisma e schema inicial.
- Implementar health check.
- Implementar layout base e navegacao inicial.

### Sprint 2 - Autenticacao e Usuario

- Implementar cadastro, login e logout.
- Criar modelo de usuario.
- Proteger rotas privadas.
- Criar dashboard vazio de viagens.

### Sprint 3 - Criacao de Viagem

- Criar formulario completo de nova viagem.
- Persistir viagem como rascunho.
- Criar modelos de preferencias.
- Criar tela de detalhe da viagem.

### Sprint 4 - Geracao de Roteiro com IA

- Integrar OpenAI API.
- Criar contrato estruturado para resposta do roteiro.
- Implementar prompt inicial versionado.
- Persistir itinerario gerado.
- Exibir roteiro dia a dia.

### Sprint 5 - Edicao do Itinerario

- Permitir editar, remover e reordenar atividades.
- Regerar um dia especifico.
- Adicionar notas.
- Salvar versoes do roteiro.

### Sprint 6 - Mapas e Enriquecimento

- Integrar geocoding e places.
- Mostrar mapa do roteiro.
- Salvar coordenadas dos locais.
- Calcular deslocamentos aproximados.

### Sprint 7 - Custos e Clima

- Adicionar estimativa de custos por categoria.
- Integrar cambio.
- Integrar clima.
- Exibir alertas de orcamento e clima.

### Sprint 8 - Compartilhamento e Exportacao

- Criar links compartilhaveis.
- Implementar visualizacao publica.
- Gerar PDF simples.
- Melhorar SEO das paginas publicas.

### Sprint 9 - Observabilidade e Beta

- Adicionar logs estruturados.
- Adicionar metricas basicas.
- Monitorar custo de IA por usuario/viagem.
- Preparar ambiente de staging.
- Rodar beta fechado.

## 7. Decisoes Arquiteturais

- Usar TypeScript ponta a ponta para reduzir divergencia entre frontend e backend.
- Compartilhar schemas Zod entre web e API sempre que possivel.
- Persistir respostas da IA somente apos validacao estrutural.
- Versionar prompts para permitir auditoria e melhoria incremental.
- Separar geracao de roteiro em servico proprio, evitando acoplamento direto com controllers.
- Comecar com API REST; avaliar GraphQL apenas se a complexidade de leitura crescer muito.
- Usar jobs assincronos para chamadas externas lentas ou com retry.
- Manter integracoes externas atras de interfaces internas para facilitar troca de provedores.
- Evitar dependencia inicial de APIs de voos e hoteis ate validar o fluxo principal de planejamento.

## 8. Padroes de Codigo

- TypeScript em modo strict.
- ESLint e Prettier obrigatorios.
- Nomes de arquivos em kebab-case.
- Componentes React em PascalCase.
- Funcoes pequenas, com responsabilidade unica.
- Validacao de entrada em todos os endpoints.
- Controllers finos e services com regra de negocio.
- Erros padronizados com codigo, mensagem e detalhes opcionais.
- DTOs e schemas documentados por modulo.
- Variaveis de ambiente validadas no boot da aplicacao.
- Testes junto ao modulo quando fizer sentido.

## 9. Estrategia de Testes

### Testes Unitarios

- Services de negocio.
- Validadores Zod.
- Transformadores de resposta da IA.
- Calculos de custos, datas e duracoes.

### Testes de Integracao

- Endpoints principais da API.
- Fluxo de criacao de viagem.
- Persistencia do itinerario.
- Jobs assincronos com Redis em ambiente de teste.

### Testes E2E

- Criar conta.
- Criar viagem.
- Gerar roteiro.
- Editar atividade.
- Compartilhar roteiro.

### Testes de IA

- Fixtures com entradas representativas.
- Validacao de schema da resposta.
- Testes de regressao para prompts.
- Avaliacao manual em roteiros de cidades populares antes de releases importantes.

### Ferramentas

- Vitest para unitarios.
- Supertest ou equivalente para API.
- Playwright para E2E.
- Testcontainers ou Docker Compose para integracao local.

## 10. Estrategia de Deploy

### Ambientes

- Local: Docker Compose com API, banco e Redis.
- Staging: ambiente isolado com dados de teste e chaves separadas.
- Producao: infraestrutura gerenciada com backups e monitoramento.

### Pipeline

- Pull request executa lint, typecheck e testes.
- Merge na branch principal publica frontend e API em staging.
- Release manual ou tag promove para producao.
- Migrations executadas de forma controlada antes da subida da API.

### Observabilidade

- Logs estruturados em JSON.
- Rastreamento de erros com Sentry.
- Metricas de latencia, taxa de erro e custo por geracao.
- Alertas para falhas em integracoes externas.

### Seguranca

- Chaves apenas em variaveis de ambiente.
- Rate limiting por usuario e IP.
- Sanitizacao de entradas livres.
- Controle de acesso por dono da viagem.
- Backups automaticos do banco.

## 11. Riscos e Mitigacoes

- Custo alto de IA: usar cache, limitar regeneracoes e monitorar tokens por usuario.
- Respostas inconsistentes da IA: usar schemas, retries, validacao e prompts versionados.
- Dependencia de APIs externas: isolar provedores e degradar graciosamente quando falharem.
- Roteiros pouco realistas: enriquecer com mapas, distancias, horarios e revisao incremental.
- Escopo excessivo: validar primeiro o fluxo central de criar, gerar, editar e salvar roteiro.

## 12. Marco de MVP

O MVP estara pronto quando um usuario conseguir:

1. Criar uma conta.
2. Informar destino, datas, orcamento e preferencias.
3. Gerar um roteiro estruturado com IA.
4. Visualizar o roteiro por dia.
5. Editar atividades manualmente.
6. Salvar a viagem.
7. Compartilhar um link de visualizacao.

Tudo que nao contribui diretamente para esse fluxo deve ser considerado pos-MVP.

## 13. Status de Implementacao Local

Implementado neste workspace:

- Aplicacao React/Vite em TypeScript.
- Autenticacao local simulada sem banco de dados.
- Dashboard de viagens.
- Criacao de viagem com destino, datas, viajantes, orcamento, moeda, estilo, ritmo, interesses e restricoes.
- Geracao local de roteiro simulando a camada de IA.
- Persistencia no navegador via localStorage.
- Visualizacao e edicao de roteiro por dia.
- Checklist, previsao do tempo simulada, estimativa de gastos e mapa placeholder.
- Exportacao premium em PDF com `exportTripToPdf`.
- Botao de salvar/baixar roteiro em PDF.
- Compartilhamento por link e compartilhamento do PDF quando suportado pelo navegador.
- Painel administrativo local com metricas simples e feature flags.

Ainda pendente para producao real:

- API backend Fastify.
- Banco PostgreSQL e Prisma.
- Redis e jobs assincronos.
- Autenticacao real.
- Integracao OpenAI.
- Integracoes reais de Places, Maps, Weather e cambio.
- CI/CD, staging e deploy gerenciado.
- Testes automatizados E2E e integracao.
