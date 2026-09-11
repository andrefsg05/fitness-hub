# FitnessBro — Contexto do Projeto

Estou a desenvolver uma aplicação mobile pessoal focada em **fitness, treino, nutrição e acompanhamento de progresso**. O objetivo inicial é criar uma aplicação simples, funcional e bem estruturada para registar os meus treinos e evolução, mas com uma arquitetura que permita posteriormente transformá-la numa plataforma mais inteligente, recorrendo a IA, automações e análise de dados.

## Objetivo

A aplicação pretende funcionar como um **diário pessoal de fitness**, permitindo ao utilizador centralizar informação relacionada com treino, peso, medidas, nutrição e hábitos.

A filosofia do projeto é começar com um **MVP simples**, evitando complexidade desnecessária, e evoluir progressivamente para uma aplicação inteligente baseada nos dados recolhidos.

## Tech Stack

### Mobile

* **React Native**
* **Expo**
* **TypeScript**

O Expo será utilizado para simplificar o desenvolvimento, testes diretamente em dispositivos físicos, acesso a funcionalidades nativas e posteriormente o processo de build/distribuição da aplicação.

### Arquitetura inicial

A aplicação deverá seguir uma arquitetura modular e escalável, separando responsabilidades entre:

* UI / componentes
* navegação
* lógica de negócio
* gestão de estado
* persistência de dados
* serviços/APIs

A aplicação deverá ser **offline-first**, permitindo ao utilizador consultar e registar os seus dados sem depender permanentemente de uma ligação à Internet.

### Persistência local

Inicialmente, os dados serão armazenados localmente no dispositivo, utilizando uma solução baseada em **SQLite** adequada ao ecossistema React Native/Expo.

No futuro poderá existir sincronização com um backend.

### Backend futuro

Quando houver necessidade de funcionalidades cloud:

* **Python**
* **FastAPI**
* **PostgreSQL**
* API REST
* autenticação
* sincronização entre dispositivos

### IA futura

A IA será adicionada progressivamente como uma camada sobre os dados estruturados da aplicação, e não como o núcleo da aplicação desde o início.

Possíveis tecnologias:

* LLM APIs
* agentes de IA
* workflows/automação
* análise de dados
* processamento de imagens

## Funcionalidades iniciais — MVP

A primeira versão deverá ser relativamente simples.

### Treinos

Permitir:

* criar/registar treinos
* definir exercícios
* registar séries
* registar repetições
* registar peso utilizado
* adicionar notas
* consultar histórico de exercícios

Exemplo:

```text
Bench Press
Set 1 → 80 kg × 8
Set 2 → 80 kg × 8
Set 3 → 82.5 kg × 6
```

### Evolução

Permitir visualizar a evolução através de gráficos e métricas, por exemplo:

* peso corporal ao longo do tempo
* carga utilizada num exercício
* número de repetições
* volume de treino
* frequência de treino
* recordes pessoais (PRs)

O objetivo é transformar os dados registados em informação útil e visualmente fácil de interpretar.

### Peso e medidas

Permitir registar:

* peso corporal
* eventualmente percentagem de gordura
* medidas corporais
* fotografias de progresso (numa fase posterior)

### Hábitos e lembretes

Permitir criar hábitos/lembretes relacionados com fitness e nutrição.

Exemplos:

* tomar creatina
* beber água
* pesar-me
* fazer determinada refeição
* treinar
* dormir

Inicialmente estes lembretes podem ser simples notificações locais.

## Evolução esperada

A aplicação deverá evoluir por fases.

### Fase 1 — Diário de treino

Construir uma aplicação simples e sólida para:

* registar treinos
* acompanhar exercícios
* registar peso
* visualizar progresso
* criar lembretes

O foco nesta fase é aprender React Native/Expo e construir uma base de código de qualidade.

### Fase 2 — Analytics

Adicionar análise dos dados recolhidos:

* gráficos mais avançados
* volume semanal/mensal
* evolução de exercícios
* PRs
* consistência
* tendências
* métricas de progresso

A aplicação deverá começar a responder não apenas a "o que registei?", mas também a "como estou a evoluir?".

### Fase 3 — Nutrição

Adicionar funcionalidades relacionadas com alimentação:

* refeições
* calorias
* macronutrientes
* alimentos
* objetivos calóricos
* histórico alimentar
* receitas
* planeamento de refeições

O objetivo será ligar treino + nutrição + evolução corporal.

### Fase 4 — Inteligência

Introduzir IA para interpretar os dados existentes.

Exemplos:

* analisar a evolução do treino
* identificar progressos ou estagnações
* sugerir alterações ao treino
* analisar hábitos
* responder a perguntas sobre os meus próprios dados
* gerar resumos semanais
* identificar padrões

Por exemplo:

> "Nas últimas 6 semanas aumentaste 7,5 kg no Bench Press, mas o teu volume de treino de peito diminuiu 12%. Queres que analise possíveis razões?"

A IA deverá ter acesso aos **dados estruturados da aplicação**, em vez de funcionar simplesmente como um chatbot genérico.

### Fase 5 — Automação e agentes

No futuro, poderão existir workflows e agentes capazes de executar tarefas automaticamente.

Exemplos:

* gerar um resumo semanal
* analisar progresso
* sugerir objetivos para a semana seguinte
* adaptar recomendações com base nos resultados
* enviar notificações personalizadas
* analisar refeições através de fotografias
* criar sugestões de refeições com base nos objetivos nutricionais
* integrar dados de wearables/health platforms

## Princípios importantes

O projeto deverá seguir alguns princípios:

1. **Começar simples.** Não implementar funcionalidades futuras antes de serem necessárias.
2. **Código limpo e modular.** A arquitetura deve permitir evolução sem reescrever a aplicação.
3. **Offline-first.** O registo e consulta de dados básicos devem funcionar sem Internet.
4. **Dados estruturados.** Treinos, exercícios, peso, refeições e hábitos devem ser representados de forma estruturada para permitir análises futuras.
5. **IA como camada de inteligência.** A IA deve interpretar e trabalhar sobre os dados da aplicação, não substituir a lógica determinística.
6. **Boa UX.** Registar uma série ou um peso deve ser extremamente rápido e simples.
7. **Evolução incremental.** Cada fase deve produzir uma aplicação funcional por si só.
8. **Portfolio project.** O projeto deve demonstrar competências relevantes de engenharia de software, mobile development, backend, bases de dados, APIs, IA e automação à medida que evolui.

## Visão final

A visão a longo prazo é criar um **personal fitness intelligence platform**: uma aplicação que começa como um simples diário de treino, mas que progressivamente passa a compreender os dados do utilizador e a ajudá-lo a tomar melhores decisões relacionadas com treino, nutrição e hábitos.

A aplicação deverá combinar:

**Mobile App → Dados → Analytics → Backend → IA → Automação**

A prioridade neste momento é **construir bem a primeira versão**, utilizando React Native + Expo + TypeScript, sem tentar implementar toda esta visão de uma vez.
