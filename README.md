# TripPlanner AI

TripPlanner AI e uma aplicacao web para criar roteiros de viagem personalizados com apoio de inteligencia artificial.

O objetivo do site e ajudar uma pessoa a transformar informacoes soltas de uma viagem, como destino, datas, orcamento, quantidade de viajantes, interesses e ritmo desejado, em um roteiro organizado, bonito e facil de usar.

## Para que Serve

O TripPlanner AI serve para planejar viagens de forma mais rapida e estruturada.

Com ele, o usuario pode:

- Criar uma viagem informando destino, datas, orcamento e preferencias.
- Gerar um roteiro dividido por dias.
- Visualizar atividades com horario, local, descricao e custo estimado.
- Editar o roteiro manualmente.
- Consultar checklist da viagem.
- Ver previsao do tempo simulada.
- Acompanhar uma estimativa de gastos.
- Exportar o roteiro em PDF com visual profissional.
- Compartilhar o roteiro por link ou PDF.

## Funcionalidades Atuais

- Login local simulado.
- Dashboard de viagens.
- Criacao de viagem personalizada.
- Geracao local de roteiro simulando IA.
- Persistencia no navegador usando `localStorage`.
- Pagina de detalhes da viagem.
- Roteiro editavel por dia.
- Exportacao premium em PDF.
- Compartilhamento por link.
- Painel administrativo local com metricas simples.

Nesta versao, o projeto nao usa banco de dados. Os dados ficam salvos apenas no navegador do usuario.

## Tecnologias

- React
- TypeScript
- Vite
- jsPDF
- CSS responsivo
- LocalStorage

## Como Rodar Localmente

Instale as dependencias:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse no navegador:

```text
http://127.0.0.1:5173/
```

## Build de Producao

Para gerar a versao de producao:

```bash
npm run build
```

Para visualizar o build:

```bash
npm run preview
```

## Status do Projeto

Este projeto esta em fase MVP.

Ja existe uma experiencia funcional local, mas ainda estao planejadas integracoes reais com:

- OpenAI API para geracao real de roteiros.
- APIs de mapas e locais.
- API de clima.
- Conversao de moedas em tempo real.
- Backend proprio.
- Banco de dados.
- Autenticacao real.
- Deploy em producao.

## Objetivo do MVP

O MVP busca validar o fluxo principal:

1. Criar uma viagem.
2. Gerar um roteiro.
3. Editar atividades.
4. Salvar localmente.
5. Exportar em PDF.
6. Compartilhar o roteiro.

## Rodape

Gerado por TripPlanner AI.
