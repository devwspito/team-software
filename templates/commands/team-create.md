---
name: team-create
description: Crea un proyecto nuevo desde cero — visión → stack → estructura inicial → MVP slice. Interactivo: pregunta primero, no asume nada.
---

# /team-create — Proyecto nuevo desde cero (Spec-Driven)

El usuario invocó `/team-create`. **NO escribas archivos, no leas filesystem, no invoques agentes todavía.** Hay un proyecto vacío por crear y necesitas entender qué.

Este flow es **Spec-Driven desde commit 1**: el proyecto nace con `.specify/memory/constitution.md` + `specs/001-mvp/{spec,plan,tasks}.md`. La constitución y el primer spec son entregables del scaffolding, no documentación opcional.

## Pre-flight: memoria + todo

1. Verifica si ya hay un proyecto en cwd (`ls`, `git status`). Si hay archivos existentes, **avisa al usuario** — `/team-create` es para greenfield:
   ```
   ⚠ Detecto que ya hay archivos en este directorio. /team-create asume proyecto vacío.
   ¿Quieres: (a) crearlo en un subdir, (b) crearlo aquí sobrescribiendo, (c) usar /team-feature en su lugar?
   ```
2. Si hay memoria global (`~/.claude/memory/INDEX.md`), revísala por si hay un dossier o decisiones que el usuario pueda querer reusar (ej: el usuario ya creó algo similar antes).
3. **Crea un TodoWrite** con las 10 fases. Mark `in_progress` la primera.

## Paso 1 — Saludo + primera tanda de preguntas (PRIMER mensaje)

Envía exactamente:

```
🚀 **Proyecto nuevo** — voy a orquestar al equipo para crearlo correctamente desde el primer commit.

Para no perder el tiempo, necesito 3 cosas para empezar. Responde en cualquier formato:

  **1. ¿Qué problema resuelve el producto, en una frase?**
       Ej: "Un SaaS para que equipos pequeños hagan retros sin Miro"

  **2. ¿Quiénes son los usuarios?**
       Ej: "Tech leads de equipos de 3-10 personas, agile"

  **3. ¿Tienes preferencia de stack o estamos abiertos?**
       Ej: "TypeScript todo si se puede" / "Node backend, Next frontend" / "abierto, recomiéndame"
```

**Espera respuesta. NO continúes hasta tener las 3.**

## Paso 2 — Segunda tanda (NFRs y constraints)

Una vez tengas problema + usuarios + stack-pref:

```
Vale, entendido. 4 preguntas más para afinar el stack y la infra:

  **4. ¿Dónde se va a hostear?**
       (a) cloud público (Vercel/Render/Fly/Cloudflare/AWS — yo elijo según el stack)
       (b) self-hosted / on-prem
       (c) prefiero <X>

  **5. ¿Multi-tenant, single-tenant, o uso personal?**

  **6. ¿Hay compliance que respetar desde día uno?**
       (GDPR / HIPAA / PCI / SOC2 / sector regulado / ninguno)

  **7. ¿Deadline aproximado para v1?**
       (semana / mes / "cuando esté")
```

**Espera respuesta. NO asumas defaults si el usuario no responde.**

## Paso 3 — Tercera tanda solo si hay ambigüedad clave

Si tras las 7 preguntas hay aún algo crítico sin resolver, pregúntalo en **una sola tanda más** (máx 3 preguntas):

- ¿Hay datos sensibles / PII?
- ¿Necesita real-time? offline-first? mobile-first?
- ¿Presupuesto operacional? (gratis hasta X usuarios / sin límite)

**Nunca pases de 3 tandas de preguntas.** Si después de eso aún hay huecos, los listas como "asunciones que voy a hacer" en el plan.

**📝 Persiste el contexto inicial en memory:** crea `~/.claude/memory/dossiers/<YYYY-MM-DD>-<slug>.md` con las respuestas del usuario. Slug = kebab del nombre del proyecto propuesto. Línea en INDEX global. Esta es la entrada de pre-discovery, irá enriquecida en el siguiente paso.

## Paso 4 — Discovery profundo → primer `spec.md` con `requirements-analyst`

Con todas las respuestas, invoca `requirements-analyst` pasándole **el resumen estructurado** + el template canónico `spec-template.md`. Le pides el contenido completo de `specs/001-mvp/spec.md` siguiendo SDD:

- User stories priorizadas P1 (MVP), P2, P3 — cada una independientemente testeable
- Functional Requirements (FR-N) y Non-Functional (NFR-N — latencia, escalabilidad, disponibilidad, seguridad)
- Success Criteria medibles y agnósticos a tecnología (SC-N)
- Key Entities en lenguaje ubicuo
- Edge cases, Assumptions, Out of Scope, Dependencies & Risks, Security/Privacy/Compliance Notes

**📝 No escribas el archivo aún — el proyecto todavía no existe.** Mantén el contenido en contexto para el Paso 7 (post-aprobación).

## Paso 5 — Constitución del proyecto + design + threat model (paralelo)

**Un solo turno, 5 Agent calls paralelas (en contexto, sin escribir archivos aún):**

- **Constitución** (tú mismo, no agente) — derivá 4-6 principios no-negociables del proyecto a partir del tipo + compliance + NFRs declarados. Ejemplos: "Test-First para lógica de dominio", "Toda PII vive sólo en bounded context X", "p95 < 200ms en endpoints públicos", "Sin librerías nuevas sin contrato escrito". Estos van a `.specify/memory/constitution.md` (que escribirás en Paso 8).
- `software-architect` — propone stack justificado + estructura de carpetas + bounded contexts + contenido inicial de `data-model.md` y `contracts/` (signatures only). Aplica DDD/SOLID.
- `database-engineer` — store primario + esquema inicial + estrategia de migraciones (refina el `data-model.md`).
- `security-engineer` — threat model día cero (STRIDE) + modelo auth + datos sensibles + audit log. Contenido para `threat-model.md` del primer spec.
- `devops-engineer` — hosting + CI desde commit 1 + observabilidad mínima + secrets strategy.

Mantén todos los outputs en contexto. Aún NO escribas filesystem.

## Paso 6 — Plan + tasks del MVP con `tech-lead`

Con todo lo anterior, `tech-lead` produce:

- `plan.md` completo (Technical Context, **Constitution Check** contra los principios del Paso 5, Project Structure, Phase 0/1, Re-check post-design, Complexity Tracking si aplica).
- `tasks.md` del primer spec (Phase 1 Setup + Phase 2 Foundational + Phase 3 US1=MVP + opcional US2/US3 si entran en el MVP).

`qa-engineer` produce en paralelo `quickstart.md` (smoke E2E del MVP).

Mantén todos los outputs en contexto.

## Paso 7 — **Confirmación BLOQUEANTE** antes de escribir nada

Presenta TODO en un solo mensaje al usuario:

```
## Propuesta de proyecto (Spec-Driven)

**Nombre sugerido:** <kebab-case>
**Stack:** <lenguaje + framework + storage + hosting>
**Estructura:** <bounded contexts identificados>

### Constitución del proyecto (.specify/memory/constitution.md)
  I.   <Principio 1>
  II.  <Principio 2>
  III. <Principio 3>
  IV.  <Principio 4>
  (heredan los globales de team-software encima)

### Primer spec — specs/001-mvp/
  spec.md:     <N> user stories (P1=MVP, P2, P3) · <N> FRs · <N> SCs
  plan.md:     Constitution Check PASS · stack <X> · estructura DDD
  data-model:  <N> aggregates, <N> entities
  contracts/:  <archivos>
  tasks.md:    Setup (<N>) + Foundational (<N>) + US1 (<N>) tareas
  threat-model: <N> amenazas, <N> controles

### Scaffolding del repo:
  • Estructura DDD (domain/application/infrastructure/presentation)
  • Manifiestos con deps mínimas justificadas
  • CI verde desde commit 1
  • .gitignore + .env.example (sin secretos reales)
  • README con stack y cómo arrancar
  • Migraciones iniciales del esquema
  • Health endpoint + structured logging
  • Auth scaffolding (shape, no implementación)
  • Implementación del MVP (US1) end-to-end

### Decisiones que estoy haciendo (cámbiame si quieres):
  • <decisión 1> — razón
  • <decisión 2> — razón

### Aplazado a follow-ups (NO va al MVP):
  • <feature 1>  (será spec posterior)
  • <feature 2>  (será spec posterior)

### Asunciones:
  • <asunción 1>
  • <asunción 2>

¿Procedo a crear el proyecto? (sí / cámbiame X / cancela)
```

**No escribas un solo archivo hasta tener "sí" o equivalente.**

## Paso 8 — Scaffolding SDD-first (post-aprobación)

**Crea primero los artefactos SDD** (son el contrato del proyecto):

1. `.specify/memory/constitution.md` (versión 1.0.0, ratificada hoy)
2. `.specify/templates/` (copia de los 5 templates: constitution, spec, plan, tasks, checklist — para que el repo sea autocontenido)
3. `specs/001-mvp/spec.md` (del Paso 4)
4. `specs/001-mvp/plan.md` (del Paso 6)
5. `specs/001-mvp/research.md` (del software-architect)
6. `specs/001-mvp/data-model.md` (de software-architect + database-engineer)
7. `specs/001-mvp/contracts/` (del software-architect)
8. `specs/001-mvp/quickstart.md` (del qa-engineer)
9. `specs/001-mvp/tasks.md` (del tech-lead)
10. `specs/001-mvp/threat-model.md` (del security-engineer)
11. `CLAUDE.md` del proyecto con un bloque "Constitución del proyecto" referenciando `.specify/memory/constitution.md`
12. `.claude/memory/` scaffold (INDEX.md, PROTOCOL.md, subdirs)

**Después crea el código** siguiendo `tasks.md`:

13. Estructura de carpetas según el architect (DDD layering)
14. Manifiestos (package.json / pyproject.toml / Cargo.toml / etc) con deps mínimas
15. CI pipeline (.github/workflows/ci.yml o equivalente) verde desde commit 1
16. .gitignore, .env.example, README.md con instrucciones de arranque
17. Migraciones iniciales (database-engineer ejecuta sus tareas del tasks.md)
18. Health endpoint + structured logging (devops-engineer)
19. Auth scaffolding (shape) según security-engineer

Después delega las tareas restantes del `tasks.md`:
- `backend-engineer` → use cases + domain + adapters de US1
- `frontend-engineer` → UI del flow primario si aplica
- `qa-engineer` → tests críticos del slice

Marca tareas `[x]` en `tasks.md` conforme se completan.

## Paso 9 — Review final

Antes de declarar "proyecto creado":
- `code-reviewer` review completo (el listón es alto — es el primer commit)
- `security-engineer` review del shape auth + datos sensibles
- `devops-engineer` verifica CI verde

## Paso 10 — Entrega

Resumen final:

```
✅ Proyecto creado en <path>

  Constitución:  .specify/memory/constitution.md (v1.0.0, <N> principios)
  Primer spec:   specs/001-mvp/ (Status: Implementing → Shipped tras Paso 9)
  Tasks:         <N>/<N> [x]
  CI status:     <verde/pending>
  Total archivos: <N>

Próximos pasos:
  • `cd <dir> && <run command>` — arrancar local
  • `git add . && git commit -m "feat: bootstrap with team-software SDD"` — primer commit
  • `/team-feature "<segunda feature>"` cuando el MVP esté validado

La constitución y specs/001-mvp viven en el repo. Toda nueva feature pasará por /team-feature, que escribirá `specs/002-…/`, `specs/003-…/`.
```

## Si $ARGUMENTS llega no vacío

Trata el contenido como respuesta a la pregunta 1 del Paso 1 ("qué problema resuelve"). Después haz las preguntas restantes del Paso 1 y continúa.

## Reglas duras

- **NUNCA crees archivos sin la aprobación del Paso 7.** El usuario debe ver el plan completo antes.
- **NUNCA elijas stack por moda.** Cada elección se justifica contra los NFRs.
- **NO prometas features para "después" sin marcarlas como follow-ups explícitos.**
- **CI desde commit 1.** Si el pipeline no es verde al primer push, el proyecto ya nace con deuda.
- **Una tanda de preguntas a la vez.** No agobies al usuario con 12 preguntas al mismo tiempo.
- **Máximo 3 tandas de preguntas.** Si necesitas más, anota como asunciones y avanza.
