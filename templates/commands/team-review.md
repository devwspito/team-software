---
name: team-review
description: Review pre-merge interactivo. Pregunta primero qué revisar, luego lanza code-reviewer + security-engineer + qa-engineer en paralelo.
---

# /team-review — Review interactivo

El usuario acaba de invocar `/team-review`. **NO leas código ni archivos todavía.** No asumas que sabes qué revisar. Empieza preguntando.

## Pre-flight: memoria + todo

1. Lee `.claude/memory/INDEX.md` (si existe). Si hay un threat-model o plan reciente que toca los archivos del review, **menciónaselo** al usuario:
   ```
   📚 Memory tiene context relevante:
     • [threat-model] 2026-05-10 admin-users-endpoint — controles requeridos
   Voy a tenerlo en cuenta cuando lance security-engineer.
   ```
2. **Crea un TodoWrite** con 5 fases: Identify scope, Confirm scope, Get context, Run reviewers, Consolidate verdict.

## Paso 1 — Saludo + primera pregunta (PRIMER mensaje que envías)

Si `$ARGUMENTS` está vacío, envía exactamente este formato:

```
👀 **Review pre-merge** — voy a coordinar code-reviewer + security-engineer + qa-engineer.

¿Qué quieres que revise?

  1. **Diff actual** (staged + unstaged en git)
  2. **Un commit específico** — dime el SHA
  3. **Una rama vs main** — dime el nombre de la rama
  4. **Un PR de GitHub** — dime el número o URL
  5. **Archivos concretos** — dime los paths

Responde con el número o la descripción. Si dudas, "1" cubre el 90% de los casos.
```

**Espera la respuesta. NO ejecutes nada aún.**

## Paso 2 — Confirma el scope detectado

Una vez tengas la elección del usuario:

- **Opción 1 (diff actual):** ejecuta `git status` y `git diff --stat`. Muestra exactamente qué archivos van a entrar:
  ```
  Voy a revisar estos cambios:

    M  src/auth/login.ts          (+45 -12)
    M  src/api/users.ts           (+8 -3)
    A  src/utils/sanitize.ts      (+67 -0)

  Total: 3 archivos, +120 -15.

  ¿Procedo o quieres acotar más? (responde "ok" para continuar o dime qué excluir)
  ```
- **Opción 2 (commit):** si no dio SHA, pídelo. Si lo dio, valida con `git show --stat <sha>` y confirma.
- **Opción 3 (rama):** si no dio nombre, pídelo. Si lo dio, muestra `git diff main...<branch> --stat` y confirma.
- **Opción 4 (PR):** si no dio número, pídelo. Si lo dio, usa `gh pr view <n> --json files,additions,deletions` y confirma.
- **Opción 5 (archivos):** lista los que existen, marca los que no, pide aclaración si hay paths inválidos.

**NO avances sin "ok" o equivalente.**

## Paso 3 — Pregunta de contexto sensible (una sola pregunta)

```
Antes de lanzar el equipo, una pregunta de contexto:

¿Estos cambios tocan alguna superficie sensible?
  • auth / login / sesiones
  • input del usuario / parsing
  • secretos / cripto / tokens
  • PII / datos personales
  • SQL / queries dinámicas
  • dependencias nuevas o upgrades

Responde "sí — <qué>" o "no" para que security-engineer afile el foco.
```

Esto le da contexto a `security-engineer` sin obligarte a leer todo primero.

## Paso 4 — Detecta spec/constitución de contexto (SDD)

Antes de invocar revisores, detecta si los cambios pertenecen a una feature con spec:

1. Mira los archivos del diff. Si alguno pertenece a una `specs/NNN-…/` activa (por path, por feature slug, por mención en commits), considera ese spec **el contrato del review**.
2. Si el diff es sobre `specs/NNN-…/spec.md|plan.md|tasks.md` directamente: el review evalúa esos artefactos en sí.
3. Verifica si existe `.specify/memory/constitution.md` — si sí, será input para el review (alineamiento con principios).
4. Si encuentras spec relevante, dilo al usuario:
   ```
   📐 Detecté que los cambios tocan: specs/NNN-feature/ — revisaré el diff contra:
     • spec.md (User Stories + Acceptance Scenarios + FR/NFR/SC)
     • plan.md (Constitution Check, Phase 0/1 decisions)
     • tasks.md (tareas marcadas [x] coherentes con el diff)
     • .specify/memory/constitution.md (si existe)
   ```

## Paso 5 — Lanza los 3 revisores en paralelo

Solo cuando tengas (a) qué revisar confirmado, (b) contexto sensible, y (c) spec/constitución detectada si aplica, invoca los 3 agentes **en un solo turno con 3 Agent calls paralelas**:

- `code-reviewer` — review estándar (SOLID, clean code, modularidad, SRP, DDD, smoke security) **+ alineamiento con la spec si existe** (¿el código entrega los Acceptance Scenarios? ¿respeta FR-N del spec? ¿el diff matchea las tareas `[x]` del tasks.md? ¿no se desvía del data-model/contracts del plan?).
- `security-engineer` — focalizado en lo que el usuario marcó como sensible + `specs/NNN/threat-model.md` si existe. Si dijo "no" y no hay threat-model, hace pass rápido sin profundizar.
- `qa-engineer` — coverage gap analysis vs los cambios + vs los Acceptance Scenarios de spec.md si existe + vs el quickstart.md.

Envía **un solo mensaje breve** al usuario antes de las invocaciones:

```
🚀 Lanzados en paralelo: code-reviewer, security-engineer, qa-engineer.
<si spec relevante:> Revisarán contra specs/NNN-feature/ y la constitución.
Te entrego el verdict consolidado en breve.
```

**📝 Si el verdict es BLOCK o REQUEST CHANGES con findings significativos**, guárdalos en:
- `specs/NNN-feature/checklists/review-<fecha>.md` si hay spec relacionado (queda con el feature).
- `.claude/memory/decisions/<fecha>-review-<slug>.md` si es cross-cutting / sin spec.

## Paso 6 — Consolida y entrega verdict

Cuando los 3 terminen, **un solo mensaje** con esta estructura:

```
## Verdict consolidado

**[APPROVE | APPROVE WITH NITS | REQUEST CHANGES | BLOCK]**

### 📐 Alignment with spec  *(solo si hay specs/NNN-feature/ relacionado)*
- Acceptance Scenarios entregados:  N/M  (lista de cuáles faltan)
- FRs satisfechas:  N/M
- Constitution Check del plan.md:  PASS / FAIL (justificada?)
- Tareas del tasks.md cubiertas por el diff:  N/M  [x]

### 🚫 Blocking issues (N)
<file:line> — <problema> — <fix sugerido>

### ⚠ Important issues (N)
<file:line> — ...

### 💡 Nits / suggestions (N)
<file:line> — ...

### 🧪 Coverage gaps
<de qa-engineer>

### ✅ Lo que se hizo bien
<lista corta — patrones a repetir>

### Siguiente paso
- Si BLOCK: arregla y vuelve a correr /team-review.
- Si APPROVE WITH NITS: los nits son opcionales.
- Si hay spec relacionado y review APPROVE: actualiza `specs/NNN-feature/spec.md → Status` a `Shipped` (o el siguiente que corresponda).
```

## Si $ARGUMENTS llega no vacío

Interprétalo como respuesta al Paso 1:
- `main` / `develop` / nombre de rama → revisar esa rama vs main
- número (`123`) → PR de GitHub
- SHA (`a1b2c3d`) → commit específico
- paths (`src/x.ts`) → esos archivos
- `diff` / `staged` / vacío equivalente → diff actual

Salta al Paso 2 (confirmación de scope).

## Reglas duras

- **NUNCA empieces leyendo código antes de saber qué revisar.** El usuario no debe ver actividad de Read/Grep antes de haber confirmado scope.
- **Paraleliza siempre los 3 revisores.** Es independiente y la latencia importa.
- **No interrumpas con preguntas durante el review.** Si los agentes necesitan algo, lo pides DESPUÉS del verdict como follow-up.
- **No declares "done" si hay BLOCK.** El usuario debe arreglar primero.
