---
name: team-feature
description: Pipeline interactivo para añadir una feature a un proyecto existente. Pregunta primero qué feature, luego orquesta el equipo.
---

# /team-feature — Feature interactiva

El usuario invocó `/team-feature`. **NO leas código todavía. NO invoques agentes.** Empieza preguntando qué feature quiere añadir.

## Pre-flight: memoria + todo (antes de cualquier output al usuario)

1. **Lee `INDEX.md`** en `.claude/memory/INDEX.md` (project) y `~/.claude/memory/INDEX.md` (user). Si no existe, asumes que no hay memoria previa.
2. Si encuentras artefactos relacionados con lo que el usuario pueda querer (por slug, fecha reciente, o status active), **inclúyelo en el Paso 1 como una nota antes de la primera pregunta**:
   ```
   📚 Trabajos previos en memory que pueden ser relevantes:
     • [dossier] 2026-05-13 stripe-connect — Feature de pagos a vendedores
     • [plan]    2026-05-13 stripe-connect — Blueprint 6/8 tareas completadas

   Si tu feature es una de esas, dime el slug y retomamos.
   ```
3. **Crea un TodoWrite** con las 7 fases del pipeline: Discovery, Plan, Design, Threat-model, Implement, Review, Ship. Marca `in_progress` la siguiente conforme avanzas.

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

## Paso 3 — Discovery con `requirements-analyst` (BLOQUEANTE)

Invoca `requirements-analyst` pasándole la feature + contexto del proyecto. Le pides el dossier completo (goal, scope, AC, constraints, edge cases, ubiquitous language, open questions).

**Importante:** `requirements-analyst` hará preguntas adicionales al usuario. Deja que las haga — no las inventes tú.

Cuando vuelva con open questions críticas, pásalas al usuario textualmente y NO avances hasta que las responda.

**📝 Persiste el dossier en memory:**
- Genera slug: `<YYYY-MM-DD>-<kebab-de-la-feature>`
- Crea `.claude/memory/dossiers/<slug>.md` con frontmatter (slug, category=dossier, feature=<slug>, agent=requirements-analyst, date, status=active) + contenido.
- Añade línea a `.claude/memory/INDEX.md` al principio: `- [dossier] <fecha> <slug> — <one-liner> — active`
- Confirma al usuario: `📝 Dossier guardado en memory: dossiers/<slug>.md`
- Marca el todo "Discovery" como completed.

## Paso 4 — Planificación con `tech-lead`

Cuando el dossier esté completo, invoca `tech-lead` con el dossier. Espera el blueprint.

Antes de ejecutar el blueprint, **muéstraselo al usuario** en formato compacto:

```
📋 **Plan**

Tareas (en orden):
  1. [software-architect] Diseñar módulo X — bloqueante
  2. [database-engineer] Migración Y (paralelo con 1)
  3. [security-engineer] Threat model auth
  4. [backend-engineer] Implementar endpoint Z (depende de 1, 2, 3)
  5. [frontend-engineer] UI W (depende de 4)
  6. [qa-engineer] Coverage verification
  7. [code-reviewer] Pre-merge review

Estimación de duración: <tech-lead's estimate>

¿Sigo o ajustamos algo? (sigue / ajusta X)
```

**📝 Persiste el plan en memory:** mismo slug que el dossier. `plans/<slug>.md` con frontmatter (links.dossier=<slug>). Línea en INDEX. Marca "Plan" como completed.

## Paso 5 — Ejecución

Tras "sigue" del usuario, delega tareas siguiendo el blueprint:
- Tareas sin dependencias entre sí → invoca en paralelo (varias Agent calls en el mismo turno)
- Tareas con dependencias → secuencial

**Reporta progreso al cerrar cada fase** con 2-3 líneas:

```
✓ [Fase 3/7] Threat model completo — security-engineer identificó 2 controls (rate limit, JWT exp validation). Siguiente: backend-engineer implementa el endpoint.
```

## Paso 6 — Verificación + review

Antes de declarar la feature "completa":
- `qa-engineer` confirma coverage por comportamiento
- `code-reviewer` + `security-engineer` review final en paralelo
- Si hay BLOCK: páralo, pasa los findings al usuario, espera fix

## Paso 7 — Entrega

```
🎉 **Feature completada**: <descripción>

  • Archivos modificados:  <N>
  • Tests añadidos:        <N>
  • Cobertura del flujo:   <%>
  • Verdict revisores:     APPROVE / APPROVE WITH NITS

Siguiente paso recomendado:
  • Commit: `git add . && git commit -m "<sugerencia>"`
  • Ship: `/team-ship <servicio>` cuando estés listo para deploy.
```

## Si $ARGUMENTS llega no vacío

Trata el contenido como respuesta a la pregunta 1 del Paso 1 ("qué feature"). Continúa con las preguntas 2 y 3.

## Reglas duras

- **NUNCA empieces a leer código sin haber confirmado proyecto + feature + restricciones.**
- **NUNCA ejecutes el blueprint sin mostrárselo al usuario en el Paso 4.**
- **Una tanda de preguntas a la vez.** No agobies.
- **No saltes fases.** Si el usuario quiere acelerar, ofrece comprimir, no eliminar.
- **No implementes contra un dossier incompleto.**
