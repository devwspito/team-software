# Implementation Plan: [FEATURE NAME]

**Feature Directory**: `specs/[NNN-feature-name]/` | **Date**: [DATE] | **Spec**: [spec.md](./spec.md) | **Constitution**: [.specify/memory/constitution.md](../../.specify/memory/constitution.md)

> Este plan describe el **CÓMO**. Lo produce `/team-plan` (delega en `software-architect` + `tech-lead` + `database-engineer` + `security-engineer` cuando aplica).
> **Gate**: el `Constitution Check` DEBE pasar antes de Phase 0. Se re-chequea tras Phase 1 (post-diseño).

---

## Summary

[En 3-5 líneas: qué se construye (extraído de spec.md → Summary), enfoque técnico principal, decisiones macro tomadas durante research.]

---

## Technical Context

> Si algo no se decide en planning, marcar `NEEDS CLARIFICATION` y resolver en Phase 0 (research).

- **Lenguaje / versión**: [ej: TypeScript 5.3, Python 3.12, Go 1.22]
- **Dependencias principales**: [ej: Next.js 14, FastAPI, gRPC, PostgreSQL]
- **Storage**: [ej: PostgreSQL 16, Redis 7, S3, in-memory — N/A si no aplica]
- **Testing**: [ej: Vitest + Playwright, pytest + httpx, go test]
- **Target platform**: [ej: Linux x86_64 server, browser evergreen, iOS 16+]
- **Project type**: [library / CLI / web-service / web-app / mobile-app / SDK / infra]
- **Performance goals**: [ej: p95 < 200ms en lecturas, 100 writes/s sostenido]
- **Constraints**: [ej: < 100MB memory por instancia, offline-capable, GDPR-compliant]
- **Scale / scope**: [ej: 10k usuarios MVP, 50 endpoints, 12 entidades]
- **Deployment surface**: [ej: container en ECS, CDN+Lambda, mobile app store]

---

## Constitution Check *(GATE)*

> Lee `.specify/memory/constitution.md` y verifica cada principio contra este plan.
> **Si alguno se viola sin justificación → ERROR**. Documenta en *Complexity Tracking* y propone la alternativa simple que descartas y por qué.

| Principio (de la constitución) | Cumple | Notas |
|---|---|---|
| [I. Nombre del Principio] | ✅ / ⚠️ / ❌ | [Cómo se respeta — o por qué se viola y se justifica] |
| [II. Nombre del Principio] | ✅ / ⚠️ / ❌ | [...] |
| [III. Nombre del Principio] | ✅ / ⚠️ / ❌ | [...] |
| [IV. Nombre del Principio] | ✅ / ⚠️ / ❌ | [...] |
| [V. Nombre del Principio] | ✅ / ⚠️ / ❌ | [...] |
| Security first (global) | ✅ / ⚠️ / ❌ | [Si hay PII/auth/dinero, debe haber threat-model — `/team-threat-model` o sección dedicada abajo] |
| SOLID / DDD / SRP / Clean Code / Modularidad (global) | ✅ / ⚠️ / ❌ | [Confirmar boundary entre dominio/aplicación/infra] |

**Resultado**: PASS / FAIL (si FAIL → completar *Complexity Tracking* abajo).

---

## Project Structure

### Artefactos de la feature

```text
specs/[NNN-feature-name]/
├── spec.md              # WHAT/WHY — fuente de verdad
├── plan.md              # Este archivo — HOW + decisiones
├── research.md          # Phase 0 — investigación y decisiones de tecnología
├── data-model.md        # Phase 1 — entidades, relaciones, invariantes
├── contracts/           # Phase 1 — contratos API/eventos/SDK (OpenAPI/AsyncAPI/protobuf/types)
├── quickstart.md        # Phase 1 — cómo correr/probar la feature de punta a punta
├── checklists/          # Generados por /team-analyze y checklists ad-hoc
└── tasks.md             # Phase 2 — generado por /team-tasks (no por /team-plan)
```

### Source code (repo)

> Reemplaza el placeholder por la estructura real elegida. Borra las opciones no usadas.

```text
# Opción 1 — Single project (default)
src/
├── domain/
├── application/
├── infrastructure/
└── presentation/

tests/
├── unit/
├── integration/
└── e2e/

# Opción 2 — Web app (frontend + backend separados)
backend/
└── src/{domain,application,infrastructure,api}/
frontend/
└── src/{components,pages,services,state}/

# Opción 3 — Monorepo / mobile / library — ajusta según corresponda
```

**Structure Decision**: [Qué opción y por qué — referenciar los directorios reales]

---

## Phase 0 — Research

> Resuelve cada `NEEDS CLARIFICATION` técnico. Cada decisión queda registrada en `research.md` con (a) qué se decide, (b) por qué, (c) alternativas descartadas.

Para cada incógnita:
1. **Investigar**: documentación oficial, benchmarks reales, comparativas conocidas. No reinventar.
2. **Decidir**: una opción ganadora con racional.
3. **Documentar** en `research.md` siguiendo el patrón:
   ```
   ## Decisión: [tema]
   - **Elegido**: [opción + versión]
   - **Por qué**: [razones concretas, ligadas al contexto]
   - **Descartadas**: [opción A — por qué no; opción B — por qué no]
   - **Riesgos**: [mitigaciones]
   ```

---

## Phase 1 — Design

### Data model → `data-model.md`

- Entidades del dominio (extraídas de spec.md → Key Entities) modeladas con: invariantes, relaciones, ciclo de vida, eventos relevantes.
- DDD: aggregates, entities, value objects, domain events.
- Sin tipos primitivos en el dominio (`Money` no `number`, `Email` no `string`).

### Contracts → `contracts/`

- API REST → OpenAPI YAML.
- Eventos → AsyncAPI o esquema de la cola.
- gRPC → `.proto`.
- SDK / library → `.d.ts` o tipos del lenguaje.

Cada contrato es la **fuente de verdad** del shape — los handlers/clientes se generan o validan contra él.

### Quickstart → `quickstart.md`

Cómo correr la feature end-to-end localmente: setup, comando, smoke test. Debe permitir verificar Acceptance Scenarios de spec.md.

---

## Security & Threat Model

> Si la feature toca auth, PII, dinero, secretos, FS/network/DB sensibles → `security-engineer` produce un threat-model STRIDE.

- **Surface analizado**: [endpoints, jobs, integraciones]
- **Amenazas top**: [Spoofing / Tampering / Repudiation / Info disclosure / DoS / EoP — lista priorizada]
- **Mitigaciones**: [por cada amenaza alta/crítica — qué se hace en este plan]
- **Threat model completo**: `specs/[NNN]/threat-model.md` o `.claude/memory/threat-models/[date]-[slug].md`

---

## Observability & Operations

- **Logs estructurados**: [qué se loguea, con qué campos clave, sin PII]
- **Métricas**: [RED por endpoint, USE por recurso, métricas de negocio]
- **Trazas**: [si aplica — propagación de trace-id]
- **Alertas**: [SLO/SLI relevantes — qué dispara on-call]
- **Runbook**: [acciones operativas comunes — rotar credencial, replay event, etc.]

---

## Re-check Constitution post-design

> Tras Phase 1, vuelve a la tabla de *Constitution Check* y confirma que el diseño concreto sigue cumpliendo. Si un principio se rompió en el diseño, decide: ajustar diseño o justificar en *Complexity Tracking*.

**Re-check resultado**: PASS / FAIL

---

## Complexity Tracking

> Rellenar SOLO si hay violaciones de la constitución que se justifican.

| Violación | Por qué necesaria | Alternativa simple descartada porque |
|---|---|---|
| [ej: introducir CQRS] | [escala de lecturas vs escrituras 100:1, latencia crítica] | [single-model: degradación de p95 medida en spike] |
| [ej: repository pattern] | [necesidad de stubbing en tests + cambio futuro de storage] | [acceso directo: acoplaba dominio a SQL] |

---

## Handoffs

- **Siguiente**: `/team-tasks` para generar `tasks.md` ordenado por dependencia y por user story.
- **Threat model**: si toca auth/PII/dinero → `/team-threat-model` antes de implementar.
- **Database review**: si introduce/cambia schema → `database-engineer` debe firmar el `data-model.md` antes de implementar.
