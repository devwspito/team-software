---
name: team-inspect
description: Caza bugs activamente sin que el usuario los reporte. Lanza bug-hunter (static + tooling) + exploratory-tester (user-journey) en paralelo, consolida en lista priorizada con file:line, y ofrece encadenar a /team-fix para los top N.
---

# /team-inspect — Inspección proactiva de bugs

El usuario invocó `/team-inspect`. **Objetivo:** encontrar bugs sin que el usuario los señale. Sin pipeline, sin pedir specs. Solo: ¿qué está roto aquí?

## Pre-flight

1. Lee `.claude/memory/INDEX.md`. Si hay un `artifacts/*bug-hunt*` reciente (<7 días), menciónaselo al usuario y pregunta si ampliar o empezar fresh.
2. Crea TodoWrite con: Detect stack, Define scope, Run inspectors (parallel), Consolidate, Recommend.

## Paso 1 — Una pregunta para acotar scope (si `$ARGUMENTS` vacío)

```
🔍 **Inspect mode** — bug-hunter + exploratory-tester van a cazar bugs sin que tú los señales.

¿Qué scope?

  1. **Toda la app** — barrido completo (puede tardar 5-10 min)
  2. **Una feature / módulo** — dime cuál (ej: "el flow de facturas")
  3. **Cambios recientes** — solo el diff vs main / último commit
  4. **Solo errores actuales** — corro tooling (tests, lint, typecheck, build) y te paso lo que falla

Si dudas, "1" cubre todo. "4" es el más rápido si quieres triage inmediato.
```

Si `$ARGUMENTS` tiene contenido, salta al Paso 2.

## Paso 2 — Detecta stack + acota scope concreto

```bash
# Identifica stack
cat package.json | head -30
ls -la
pwd
git status
git log --oneline -5
```

Reporta brevemente:

```
🛠 **Stack detectado:** <Node/TS, Python/FastAPI, etc.>
**Scope inspecting:** <whole app / module / diff>
**Tooling disponible:** <tests, lint, typecheck, build — los que están en scripts>
```

## Paso 3 — Lanza ambos inspectores en paralelo

**Un solo turno, 2 Agent calls paralelas:**

- `bug-hunter` con el scope — corre tooling, hace static analysis, cross-reference.
- `exploratory-tester` con el scope — simula viajes de usuario por el código.

Mensaje breve al usuario:

```
🚀 Lanzados en paralelo: bug-hunter (static + tooling) + exploratory-tester (user journeys).
Volviendo con inventario consolidado en breve...
```

## Paso 4 — Consolida en UN solo reporte priorizado

No pegues los 2 reportes copy-paste. **Sintetiza** y dedupliques (a veces los dos detectan el mismo bug desde ángulos distintos — fusiona).

```
## 🐛 Bugs encontrados — <scope>

**Tooling status:**
  Tests:     ❌ 3 fail / ✅ 47 pass
  Typecheck: ❌ 12 errors
  Lint:      ⚠ 8 warnings / ❌ 2 errors
  Build:     ❌ FAIL (puerto 3000 ocupado en test? — leer detalle)

### 🔥 Catastrophic (N)
- **Procesar button no dispara nada** — Inbox.tsx:45
  - Evidencia: `onClick={() => {}}` (handler vacío)
  - Fix-owner sugerido: integration-engineer
  - Tipo: dead-end (de exploratory-tester)

- **POST /api/documents/process retorna 500 al instante** — api/documents.ts:23
  - Evidencia: handler arroja `NotImplementedError` sin try/catch
  - Fix-owner: debug-engineer + backend-engineer

### ⚠️ Major (N)
- **Modelo 111 no es editable** — TaxModels.tsx:120
  - Evidencia: campos renderizados como `<span>` no `<input>`; no hay onChange
  - Fix-owner: integration-engineer + interaction-designer

- **OCR llamado después de ExtractFields (orden invertido)** — DocumentProcessor.ts:67
  - Evidencia: `await extractFields()` antes de `await runOcr()`
  - Tipo: ordering bug (archetype clásico de debug-engineer)
  - Fix-owner: debug-engineer

[... resto ordenado por severidad ...]

### 💡 Minor (N)
[...]

### 🧹 Hygiene (N) — deferred
- 14 `console.log` en producción (lista de archivos)
- 8 TODOs viejos (>30 días) en src/
- 3 tests marcados `.skip` sin issue tracker

### Patrones identificados (root causes)
- **8 mutations no invalidan cache** → todas las listas se quedan stale después de cambios
- **Empty states sin guía** → 12 vistas muestran "Sin datos" sin ayudar al usuario
- **Auth tokens en localStorage** → debería ser cookies httpOnly (security)

### Top 5 que arreglar primero (impact × effort)
1. Procesar button vacío (catastrophic, 5 min fix) → /team-fix
2. POST /process retorna 500 (catastrophic, 30 min) → /team-fix
3. OCR orden invertido (major, 10 min) → /team-fix
4. Modelo 111 read-only (major, 1 hora) → /team-finish
5. 8 mutations no invalidan (pattern, 2 horas) → /team-refactor

---

**¿Cómo procedemos?**
  (a) **Arreglar los top 5** — los encadeno a /team-fix uno a uno
  (b) **Arreglar todos los catastrophic + major** — más extensivo, te muestro plan antes
  (c) **Solo guardar inventory** — lo persisto en memory y trabajas tú
  (d) **Deep dive en uno** — dime cuál
```

**📝 Persiste el inventory en memory (siempre — es valioso para tracking):**
- `.claude/memory/artifacts/<fecha>-bug-hunt-<scope>.md` con findings + recommendations
- Línea en INDEX: `- [artifact] <fecha> bug-hunt-<scope> — N bugs found, M fixed, K open — active`

## Paso 5 — Fix loop (si elige a/b)

Si el usuario elige opción (a) o (b):

1. Para cada bug en orden de prioridad:
   - Anuncia: `→ Fixing N/M: <bug title>`
   - Encadena a `/team-fix` con la info del bug (síntoma + file:line + evidencia)
   - Espera resultado
2. Después de cada fix, recorre el inventory y **marca como resuelto** en el artifact de memory.
3. Si un fix falla o requiere decisión grande, pausa, reporta, espera input del usuario.

## Reglas duras

- **NUNCA modifiques código en /team-inspect.** Solo encuentras. Los fixes vienen por /team-fix.
- **Severidad disciplinada.** Catastrophic = data loss / security / app crash / primary flow broken. No infles.
- **No duplicar findings** entre bug-hunter y exploratory-tester. Si los dos detectan el mismo bug desde ángulos distintos, fusiona en una sola entrada con ambas evidencias.
- **Cite file:line siempre.** Sin ubicación no es bug, es opinión.
- **Persiste el inventory siempre** — es la baseline para detectar regresiones futuras.

## Cuando NO usar /team-inspect

- Ya sabes qué bug arreglar → `/team-fix` directo
- Quieres añadir feature → `/team-feature`
- Solo UI/UX problems → `/team-ux-audit`
- Pre-merge review de cambios específicos → `/team-review`
