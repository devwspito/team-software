# Tasks: [FEATURE NAME]

**Input**: `specs/[NNN-feature-name]/` (spec.md, plan.md, research.md, data-model.md, contracts/, quickstart.md)

**Producido por**: `/team-tasks` (delega en `tech-lead` con apoyo de `qa-engineer`).

**Prerequisitos**: `plan.md` (obligatorio), `spec.md` (obligatorio — user stories priorizadas).

---

## Formato

`[ID] [P?] [Story] Descripción`

- **[P]**: Paralelizable (archivos distintos, sin dependencias entre sí).
- **[Story]**: User story a la que pertenece (US1, US2, US3, FOUND para foundational, SETUP, POLISH).
- Incluir **rutas exactas de archivos** en cada descripción.
- Cada tarea debe ser **accionable** por un solo agente en una sola sesión — si es más grande, dividirla.

---

## Phase 1 — Setup (infraestructura compartida)

**Objetivo**: bootstrap del proyecto. Sin esto nada compila.

- [ ] T001 [SETUP] Crear estructura de directorios según `plan.md` → Project Structure
- [ ] T002 [SETUP] Inicializar proyecto con [lenguaje] + [framework] (deps según plan.md → Technical Context)
- [ ] T003 [P] [SETUP] Configurar linter + formatter + pre-commit hooks
- [ ] T004 [P] [SETUP] Configurar CI base (lint + typecheck + test en cada PR)

---

## Phase 2 — Foundational (BLOQUEA todas las user stories)

**Objetivo**: piezas core que toda user story necesita. Sin esto NINGUNA story puede empezar.

> Ejemplos: schema base + framework de migraciones, framework de auth, routing, error handling global, logging estructurado, config env, secret-store, base de tests E2E.

- [ ] T005 [FOUND] [database-engineer] Diseñar y aplicar migración inicial de schema (`data-model.md` → entidades base)
- [ ] T006 [P] [FOUND] [backend-engineer] Implementar framework de error handling + logging estructurado
- [ ] T007 [P] [FOUND] [backend-engineer] Implementar middleware de auth/authz (si aplica)
- [ ] T008 [FOUND] [devops-engineer] Configurar gestión de secretos (env validation, no hardcoded)
- [ ] T009 [FOUND] [qa-engineer] Setup de framework de tests (unit + integration + E2E base)
- [ ] T010 [FOUND] [security-engineer] Review del foundational antes de empezar stories — confirma threat-model cubierto

**Checkpoint**: foundation lista — las user stories pueden empezar (en paralelo si hay capacidad).

---

## Phase 3 — User Story 1 — [Título] (Priority: P1) 🎯 MVP

**Goal**: [Lo que entrega esta story — copiado de spec.md]

**Independent Test**: [Cómo se verifica esta story sola — copiado de spec.md]

### Tests primero ⚠️

> Si la constitución exige Test-First, estos van ANTES de la implementación y deben FALLAR antes de empezar.

- [ ] T011 [P] [US1] [qa-engineer] Contract test del endpoint/operación en `tests/contract/[name].spec.ts`
- [ ] T012 [P] [US1] [qa-engineer] Integration test del Acceptance Scenario 1 en `tests/integration/[name].spec.ts`
- [ ] T013 [P] [US1] [qa-engineer] Integration test del Acceptance Scenario 2 en `tests/integration/[name].spec.ts`

### Implementación

- [ ] T014 [P] [US1] [backend-engineer] Crear entidad `[Entity1]` del dominio en `src/domain/[entity1].ts`
- [ ] T015 [P] [US1] [backend-engineer] Crear entidad `[Entity2]` del dominio en `src/domain/[entity2].ts`
- [ ] T016 [US1] [backend-engineer] Implementar caso de uso `[UseCaseName]` en `src/application/[useCase].ts` (depende T014, T015)
- [ ] T017 [US1] [backend-engineer] Implementar adapter de persistencia en `src/infrastructure/repositories/[name].ts`
- [ ] T018 [US1] [backend-engineer] Exponer endpoint/handler en `src/presentation/[file].ts`
- [ ] T019 [US1] [backend-engineer] Validar input + manejar errores en el boundary
- [ ] T020 [US1] [frontend-engineer] Implementar UI de [pantalla] en `src/pages/[name].tsx` (loading/empty/error/success)
- [ ] T021 [US1] [security-engineer] Smoke security review del flujo (input validation, authz, secretos)

**Checkpoint**: User Story 1 funciona end-to-end y pasa su Independent Test.

---

## Phase 4 — User Story 2 — [Título] (Priority: P2)

**Goal**: [De spec.md]

**Independent Test**: [De spec.md]

### Tests primero ⚠️ (si aplica)

- [ ] T022 [P] [US2] [qa-engineer] Tests por cada Acceptance Scenario

### Implementación

- [ ] T023 [P] [US2] [backend-engineer] Entidad / use case / endpoint según data-model
- [ ] T024 [US2] [frontend-engineer] UI correspondiente
- [ ] T025 [US2] [security-engineer] Smoke security si toca surface sensible

**Checkpoint**: US1 + US2 funcionan, sin romper US1.

---

## Phase 5 — User Story 3 — [Título] (Priority: P3)

**Goal**: [De spec.md]

**Independent Test**: [De spec.md]

- [ ] T026 [P] [US3] [qa-engineer] Tests
- [ ] T027 [US3] [backend-engineer/frontend-engineer] Implementación
- [ ] T028 [US3] [security-engineer] Smoke security si aplica

**Checkpoint**: Las 3 stories funcionan independientemente.

---

[Añadir más fases para US4+ si las hay.]

---

## Phase N — Polish & Cross-cutting

**Objetivo**: cosas que afectan a varias stories. Sólo entra cuando las stories priorizadas están verdes.

- [ ] TXXX [P] [POLISH] [content-designer] Microcopy, error messages, empty states
- [ ] TXXX [P] [POLISH] [accessibility-specialist] WCAG AA audit + fixes
- [ ] TXXX [P] [POLISH] [visual-designer] Visual consistency review
- [ ] TXXX [POLISH] [devops-engineer] Observabilidad: dashboards + alertas SLO
- [ ] TXXX [POLISH] [refactoring-specialist] Limpieza de duplicación si emergió durante implementación
- [ ] TXXX [POLISH] [qa-engineer] Suite de regresión + smoke E2E
- [ ] TXXX [POLISH] [code-reviewer] Review final pre-merge
- [ ] TXXX [POLISH] [security-engineer] Security review final

---

## Dependencies & Order

### Phase dependencies

- **Setup (1)** → sin deps, arranca ya.
- **Foundational (2)** → depende de Setup. **BLOQUEA todas las user stories.**
- **User Stories (3..N)** → dependen de Foundational. En paralelo si hay capacidad; secuencial por prioridad si no (P1 → P2 → P3).
- **Polish (final)** → depende de las stories priorizadas estando verdes.

### Story dependencies

- **US1 (P1)**: arranca tras Foundational. Sin deps en otras stories.
- **US2 (P2)**: arranca tras Foundational. Puede integrar con US1 pero debe ser testeable sola.
- **US3 (P3)**: ídem.

### Dentro de cada story

- Tests (si la constitución exige Test-First) → ANTES de implementación, y deben FALLAR.
- Domain → Application → Infrastructure → Presentation.
- Validación + error handling van con el endpoint, no en una pasada aparte.

---

## Parallel Opportunities

- Setup `[P]` en paralelo.
- Foundational `[P]` en paralelo dentro de Phase 2.
- Una vez Foundational verde, **las user stories pueden ir en paralelo**.
- Dentro de una story: tests `[P]` en paralelo, entidades `[P]` en paralelo, luego sequential hacia presentation.

---

## Notas

- `[P]` = archivos distintos, sin deps.
- `[StoryID]` traza la tarea a su user story para auditoría.
- Toda story debe ser **independientemente entregable y testeable**.
- Verificar tests fallan antes de implementar (si Test-First está en la constitución).
- Commit por tarea o por grupo lógico de tareas.
- Parar en cada checkpoint y **validar la story sola** antes de avanzar.
- Evitar: tareas vagas, conflicts de archivo entre tareas marcadas `[P]`, dependencias cross-story que rompan independencia.
