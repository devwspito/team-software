---
name: team-feature
description: Inicia el workflow completo del equipo para una feature nueva — requirements-analyst → tech-lead → diseño → implementación.
---

# /team-feature — Feature pipeline

El usuario quiere comenzar una feature nueva. Ejecuta el workflow estándar del equipo en secuencia, sin saltarte fases.

## Argumentos
$ARGUMENTS

## Pasos

1. **Discovery (BLOQUEANTE)** — Invoca `requirements-analyst` con la descripción de la feature en `$ARGUMENTS`. Espera el dossier completo (goal, scope, AC, constraints, edge cases, ubiquitous language, open questions).
   - Si hay open questions críticas SIN respuesta, pásalas al usuario y NO avances a la siguiente fase hasta resolverlas.

2. **Planificación** — Una vez el dossier esté completo y aprobado, invoca `tech-lead` pasándole el dossier. Espera el blueprint (work breakdown con especialista por tarea, dependencias, secuencia, definition of done).

3. **Diseño** — Por cada tarea del blueprint que requiera diseño, invoca `software-architect`. Si hay datos, invoca también `database-engineer` en paralelo. Si toca superficie sensible (auth/input/secretos/PII/cripto), invoca `security-engineer` en modo threat-modeling.

4. **Implementación** — Para cada tarea de implementación, invoca `backend-engineer` o `frontend-engineer` según corresponda. Las tareas sin dependencias se delegan en paralelo.

5. **Verificación** — Antes de declarar "done":
   - `qa-engineer` revisa coverage por comportamiento.
   - `code-reviewer` hace review pre-merge.
   - `security-engineer` revisa si se tocó superficie sensible.
   - **Bloqueante:** no marques como completo si hay findings BLOCK.

6. **Operacional** — Si la feature va a producción, invoca `devops-engineer` para readiness (CI/CD, observability, deploy strategy).

## Reglas

- No saltes fases. Si el usuario quiere acelerar, ofrece comprimir, no eliminar.
- No diseñes contra un requisito vago — para el dossier primero.
- No implementes contra un diseño ambiguo — escala al architect.
- Reporta progreso al usuario al cerrar cada fase con un resumen 1-2 líneas.

## Output al usuario por fase

```
[FASE X/6] <nombre> — <especialista invocado>
  Entrada: <qué le pasaste>
  Salida:  <resumen del entregable>
  Próximo: <siguiente fase o GAP a resolver>
```
