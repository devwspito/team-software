---
name: team-feature
description: Pipeline interactivo para añadir una feature a un proyecto existente. Pregunta primero qué feature, luego orquesta el equipo.
---

# /team-feature — Feature interactiva (Spec-Driven Development)

El usuario invocó `/team-feature`. **NO leas código todavía. NO invoques agentes.** Empieza preguntando qué feature quiere añadir.

Este flow es **Spec-Driven**: produce y consume artefactos canónicos en `specs/NNN-feature-name/` (spec.md → plan.md → tasks.md → implement). No es opcional — los artefactos SON el trabajo.

## Pre-flight: artefactos previos + constitución + todo (antes de hablar)

1. **Escanea `specs/`** en el proyecto (`ls specs/` si existe). Si hay specs activas relacionadas con lo que el usuario podría pedir, **léelas brevemente** (al menos el `Status` y `Summary` del spec.md).
2. **Lee `INDEX.md`** en `.claude/memory/INDEX.md` (cross-cutting context: ADRs, threat models, audits relevantes).
3. **Verifica la constitución del proyecto** en `.specify/memory/constitution.md`. Si NO existe, anótalo — pedirás al usuario si quiere ratificar una al terminar el discovery (no bloqueante; si dice no, se usan los principios globales de team-software como fallback).
4. Si encuentras specs/artefactos relacionados, inclúyelo como nota antes de la primera pregunta:
   ```
   📚 Trabajos previos que pueden ser relevantes:
     • specs/003-stripe-connect/ — Status: Implementing, tasks 6/8 [x]
     • [decision] 2026-05-13 postgres-vs-mongo — Postgres por transacciones

   Si tu feature es una de esas, dime el slug y retomamos.
   ```
5. **Crea un TodoWrite** con las fases SDD: Discovery (spec.md), Clarify si quedan dudas, Plan (plan.md + research + data-model + contracts + quickstart) con Constitution Check, Threat-model si aplica, Tasks (tasks.md), Implement, Review, Ship. Marca `in_progress` la siguiente conforme avanzas.

## Paso 1 — Saludo + primera tanda (PRIMER mensaje)

Si `$ARGUMENTS` está vacío, envía exactamente:

```
✨ **Feature nueva** — voy a orquestar al equipo: requirements → plan → design → impl → review → ship.

Para empezar, necesito 3 cosas:

  **1. ¿Qué feature quieres añadir?**
       (1-2 frases — no hace falta especificación completa, ya la sacaremos)

  **2. ¿En qué proyecto o módulo?**
       (path, nombre del repo, "este proyecto si solo hay uno")

  **3. ¿Hay restricciones obvias desde ya?**
       (deadline, deps que no se pueden tocar, compatibilidad, "ninguna que sepa")
```

**Espera respuestas. No hagas nada más.**

## Paso 2 — Confirma alcance antes de invocar al equipo

Una vez tengas las 3 respuestas:

1. Si el "dónde" es el proyecto actual, ejecuta `git status` + `pwd` y muéstrale qué proyecto entiendes.
2. Resume tu interpretación en 3 líneas:

```
Entendido. Voy a trabajar sobre:

  • Proyecto:     <path>
  • Feature:      <descripción del usuario>
  • Restricciones: <lo que dijo o "ninguna por ahora">

¿Lo he entendido bien? (sí / corrige X)
```

**Espera confirmación. No avances con malentendidos.**

## Paso 3 — Discovery → `spec.md` con `requirements-analyst` (BLOQUEANTE)

1. **Asigna `NNN`**: escanea `specs/` y toma el siguiente número de 3 dígitos. Slug = kebab de la feature. Crea `specs/NNN-feature-slug/`.
2. Invoca `requirements-analyst` pasándole: la feature, contexto del proyecto, la constitución (si existe), y el template canónico (`.specify/templates/spec-template.md` o el global `~/.claude/specify/templates/spec-template.md`).
3. **El agente devuelve el contenido completo de `spec.md`** (user stories P1/P2/P3, FR-N, NFR-N, SC-N, edge cases, key entities, assumptions, out-of-scope, security notes).
4. Si el agente devuelve `[NEEDS CLARIFICATION]` markers (máximo 3), **pásalos al usuario textualmente** y NO avances hasta que los responda. Después actualiza el `spec.md`.
5. **Escribe el archivo**: `specs/NNN-feature-slug/spec.md` con el contenido devuelto.
6. Confirma al usuario:
   ```
   📝 Spec creada: specs/NNN-feature-slug/spec.md
     • <N> user stories (P1/P2/P3)
     • <N> functional requirements
     • <N> success criteria
     • <N> open assumptions
   ```
7. **Si no hay constitución del proyecto**, pregunta UNA vez:
   ```
   ⚠ No hay constitución del proyecto en .specify/memory/constitution.md.

   ¿Quieres ratificar una rápida (3-5 principios duros que aplicarán de aquí en adelante)?
     (a) Sí — propóneme 3-5 a partir del tipo de proyecto
     (b) No — usaré los principios globales de team-software como fallback
   ```
   Si (a): proponle 3-5 principios derivados del contexto, confírmalo, y escribe `.specify/memory/constitution.md` desde el template `.specify/templates/constitution-template.md` (o global). Versión 1.0.0.
   Si (b): documenta en el spec que la constitución es la global de team-software.
8. Marca el todo "Discovery" como completed.

## Paso 4 — Plan → `plan.md` (+ research + data-model + contracts + quickstart)

Con `spec.md` aprobado, invoca **en paralelo (mismo turno, Agent calls múltiples)**:

- `software-architect` — produce `research.md` (resolviendo `NEEDS CLARIFICATION` técnicos), `data-model.md` (entidades + invariantes en lenguaje ubicuo), `contracts/<name>.<ext>` (OpenAPI/AsyncAPI/proto/types).
- `tech-lead` — produce el `plan.md` (Summary, Technical Context, **Constitution Check gate**, Project Structure, Phase 0/1, Re-check post-design, Complexity Tracking si aplica). Le pasas la constitución para que pueda evaluar el gate.
- `database-engineer` (si la spec tiene Key Entities con persistencia) — refina `data-model.md` con migration plan (expand/contract).
- `qa-engineer` — produce `quickstart.md` (end-to-end smoke que verifica los Acceptance Scenarios del spec).

**Constitution Check** debe pasar antes de continuar. Si FAIL:
- Si `Complexity Tracking` justifica las violaciones → continúa.
- Si no se justifica → vuelve al usuario y pregunta cómo proceder (ajustar plan, ajustar constitución, aceptar violación).

**Escribe los archivos** en `specs/NNN-feature-slug/`: `plan.md`, `research.md`, `data-model.md`, `contracts/*`, `quickstart.md`.

Muestra al usuario el resumen del plan en formato compacto:

```
📋 **Plan (specs/NNN-feature-slug/plan.md)**

Constitution Check: PASS / FAIL+justified
Stack: <de Technical Context>
Bounded contexts: <de data-model>
Contratos: <archivos en contracts/>

Próxima fase: tasks.md (descomposición ordenada).

¿Sigo a tasks.md o quieres ajustar el plan? (sigue / ajusta X)
```

## Paso 5 — Threat model (si superficie sensible)

Si la spec menciona auth, PII, dinero, secretos, o exposición pública: invoca `security-engineer` en modo threat-model con `spec.md` + `plan.md` + `data-model.md` como input.

Persiste el resultado como `specs/NNN-feature-slug/threat-model.md`. Si encuentra controles bloqueantes, añádelos como tareas en `tasks.md` cuando se genere.

## Paso 6 — `tasks.md` con `tech-lead` + `qa-engineer`

Con `plan.md` aprobado, invoca `tech-lead` (apoyado por `qa-engineer` para los tests). Le pasas todos los artefactos: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/*`, `quickstart.md`, `threat-model.md` (si aplica).

Devuelve el contenido completo de `tasks.md` siguiendo el template canónico:
- Phase 1 Setup, Phase 2 Foundational (bloqueante para stories), Phase 3+ por user story (P1=MVP, luego P2, P3), Phase final Polish.
- Cada tarea con `[ID]`, `[P?]`, `[StoryID]`, `[specialist]`, ruta exacta.
- Dependencies & Order section.

**Escribe** `specs/NNN-feature-slug/tasks.md`. Muestra resumen al usuario:

```
📋 **Tasks (specs/NNN-feature-slug/tasks.md)**

  • Phase 1 Setup:        <N> tareas
  • Phase 2 Foundational: <N> tareas (BLOQUEA stories)
  • Phase 3 US1 (MVP):    <N> tareas
  • Phase 4 US2 (P2):     <N> tareas
  • Phase 5 US3 (P3):     <N> tareas
  • Phase N Polish:       <N> tareas

¿Procedo a implementar siguiendo este orden? (sí / muéstrame US1 primero / ajusta X)
```

## Paso 7 — Implementación

Tras "sí", ejecuta `tasks.md` en orden. Para cada tarea:
1. Marca el todo correspondiente como `in_progress`.
2. Invoca al `[specialist]` indicado en la tarea, pasándole: la tarea concreta, los artefactos relevantes (spec.md sección, plan.md sección, data-model, contracts, threat-model si toca surface sensible).
3. Cuando termine, marca la tarea en `tasks.md` como `[x]` y el todo como `completed`.
4. Tareas con `[P]` en el mismo phase y sin dependencias → invoca en paralelo (varias Agent calls en el mismo turno).
5. Tareas con dependencias → secuencial.

**Reporta progreso al cerrar cada user story** (no cada tarea):

```
✓ [US1/P1] Completada — <N> tareas [x] · <N> tests verdes · feature demoable. Siguiente: US2.
```

## Paso 8 — Review final

Antes de declarar la feature "completa", invoca **en paralelo**:
- `code-reviewer` — review contra `spec.md`, `plan.md`, `tasks.md`, constitución. Verdict referencia secciones.
- `security-engineer` — review final del threat-model + controles implementados.
- `qa-engineer` — coverage gap analysis vs los Acceptance Scenarios del spec.

Si BLOCK: páralo, pasa los findings al usuario, espera fix.

Actualiza `spec.md → Status` a `Shipped` cuando todo verde.

## Paso 9 — Entrega

```
🎉 **Feature completada**: <descripción>

  Spec:  specs/NNN-feature-slug/ (Status: Shipped)
  Tasks: <N>/<N> [x]
  Tests añadidos: <N>
  Verdict revisores: APPROVE / APPROVE WITH NITS

Siguiente paso recomendado:
  • Commit: `git add specs/NNN-feature-slug/ <archivos_código> && git commit -m "feat(<scope>): <one-liner>"`
  • Ship: `/team-ship <servicio>` cuando estés listo para deploy.
```

## Si $ARGUMENTS llega no vacío

Trata el contenido como respuesta a la pregunta 1 del Paso 1 ("qué feature"). Continúa con las preguntas 2 y 3.

## Reglas duras

- **NUNCA empieces a leer código sin haber confirmado proyecto + feature + restricciones.**
- **NUNCA ejecutes implementación sin tasks.md aprobado y plan.md con Constitution Check PASS.**
- **NUNCA saltes la escritura de los artefactos** (spec.md → plan.md → tasks.md). Son la fuente de verdad; el código sin spec es código sin contrato.
- **Una tanda de preguntas a la vez.** No agobies.
- **No saltes fases.** Si el usuario quiere acelerar, comprime las preguntas, no elimines las fases.
- **Constitution Check no es opcional.** Si FAIL sin justificar en Complexity Tracking → vuelve al usuario.
