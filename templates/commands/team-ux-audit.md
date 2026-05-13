---
name: team-ux-audit
description: Audit interactivo de UI/UX — diagnostica problemas (ux-researcher), prescribe arreglos de flujo (interaction-designer), visuales (visual-designer), accesibilidad (accessibility-specialist) y microcopy (content-designer). Orquesta en paralelo.
---

# /team-ux-audit — UI/UX audit interactivo

El usuario invocó `/team-ux-audit`. **NO leas código de UI todavía. NO invoques agentes.** Probablemente está probando una demo y algo "no tiene sentido". Tu trabajo es entender qué y orquestar el equipo UX adecuado.

## Pre-flight: memoria + todo

1. Lee `.claude/memory/INDEX.md`. Si hay audits previos sobre la misma feature/screen, **menciónaselo** — quizás esto es follow-up.
2. **Crea un TodoWrite** con: Identify target, Confirm scope, Get UX concerns, Run audit team (parallel), Consolidate findings, Decide fix path.

## Paso 1 — Saludo + primera pregunta (PRIMER mensaje)

Si `$ARGUMENTS` está vacío, envía:

```
🎨 **UX audit** — voy a coordinar el sub-team de UI/UX:
  • ux-researcher        (heurísticas Nielsen, journey)
  • interaction-designer (flows, estados, recovery)
  • visual-designer      (hierarchy, typography, color, spacing)
  • accessibility-specialist (WCAG, keyboard, screen reader)
  • content-designer     (microcopy, error messages)

¿Qué quieres auditar?

  1. **Una pantalla / vista** — dime la ruta o nombre
  2. **Un flujo end-to-end** — dime el goal del usuario (ej: "signup", "checkout", "crear proyecto")
  3. **Un componente concreto** — dime cuál
  4. **La app entera** — heurística rápida sobre todo (deep dive después si encuentro algo)
  5. **Algo específico que noté raro** — descríbemelo, lo investigo
```

**Espera respuesta. NO leas código aún.**

## Paso 2 — Confirma alcance + lectura focalizada

Una vez tengas el target:

1. Verifica que la ruta/componente existe (`Grep`, `Glob`, `ls`).
2. Lista los archivos relevantes que vas a pasar al equipo:
   ```
   Vale, voy a auditar:
     • Target: <ruta/flujo/componente>
     • Archivos relevantes encontrados:
       - src/pages/Signup.tsx
       - src/components/SignupForm.tsx
       - src/components/auth/MagicLinkInput.tsx
     • Estilos / design tokens: src/styles/tokens.css

   ¿Falta algo importante o procedo? (ok / añade X / quita Y)
   ```
3. Si el usuario reportó algo específico en Paso 1 opción 5, **muéstrale que lo entendiste**:
   ```
   Resumen del problema que reportaste:
     "<lo que dijo el usuario, parafraseado>"
   ¿Es correcto?
   ```

## Paso 3 — Pregunta de profundidad + persona

```
Última pregunta antes de lanzar el equipo:

  **a. ¿Qué profundidad?**
     (1) **Triage rápido** — solo ux-researcher en modo heurístico. 5 min, hallazgos top
     (2) **Audit completo** — los 5 agentes en paralelo. Findings + prescripciones
     (3) **Targeted** — yo elijo agentes específicos. Dime cuáles

  **b. ¿Persona objetivo?**
     (opcional — si no lo dices, asumo "usuario primerizo, tech-literacy media")
```

## Paso 4 — Lanza el equipo

Según la profundidad elegida:

### Triage (opción 1)

**Una sola Agent call**: `ux-researcher` con el target. Espera findings en formato:
- Catastrophic / Major / Minor / Cosmetic
- Cada uno con heurística violada, location, impacto

Salta directo al Paso 5.

### Audit completo (opción 2)

**Una sola llamada con 5 Agent calls paralelas**:

- `ux-researcher` — heurística Nielsen, identifica problemas
- `interaction-designer` — propone fixes de flujo, estados, recovery (puede recibir los findings del researcher en su prompt si ya los tienes, pero como van en paralelo, va sin)
- `visual-designer` — hierarchy, contrast, typography, spacing, consistency
- `accessibility-specialist` — WCAG, keyboard, screen reader, contrast (deep)
- `content-designer` — microcopy, error messages, empty states, labels

Envía mensaje breve mientras corren:
```
🚀 Lanzados en paralelo: ux-researcher · interaction-designer · visual-designer · accessibility-specialist · content-designer.
Volviendo con findings consolidados en breve...
```

### Targeted (opción 3)

Pregunta qué agentes específicos. Lanza solo esos en paralelo.

## Paso 5 — Consolida findings prioritizados

Cuando vuelvan, presenta TODO consolidado (no pegar 5 reportes separados — sintetiza):

```
## 🎨 UX Audit — <target>

**Verdict:** <resumen 1 línea: cuán urgente es>

### 🔥 Catastrophic (bloquea el goal del usuario)
- **<title>** [ux-researcher · accessibility-specialist] — Nielsen #N / WCAG <X>
  - Where: <file:line>
  - User impact: <concreto>
  - Recommended fix: <quién + qué>

### ⚠️ Major (degradación severa)
<igual formato>

### 💡 Minor
<igual formato>

### 🎨 Cosmetic
<igual formato>

### 🌐 A11y blockers (WCAG fails — must fix)
<de accessibility-specialist, por separado para que se vean>

### ✏️ Microcopy issues
<de content-designer — "Cancel" mal usado, errores en system-speak, etc>

### Patrones identificados (root cause)
<cosas que aparecen repetidamente — sugieren cambios al design system / patrones>

---

**Total findings:** <N>
**Top 3 a arreglar primero** (impact × effort):
  1. <finding>
  2. <finding>
  3. <finding>

### ¿Cómo procedemos?
  (a) **Implementa los Top 3** — invoco frontend-engineer con specs concretos de interaction/visual/content/a11y. Después review con code-reviewer.
  (b) **Implementa TODO Major+Catastrophic** — más extenso, te muestro plan antes
  (c) **Solo guarda findings** — los persisto en memory y trabajas tú
  (d) **Profundiza en uno** — dime cuál y lanzo deep dive sobre ese
```

**📝 Persiste el audit completo en memory** (siempre — es trabajo reusable):
- `.claude/memory/artifacts/<fecha>-ux-audit-<slug>.md` con findings + recommendations
- Línea en INDEX: `- [artifact] <fecha> ux-audit-<slug> — UX audit de <target>, N findings — active`

## Paso 6 — Implementación (si opciones a/b)

Si el usuario eligió (a) o (b):

1. Invoca `tech-lead` con los findings seleccionados → blueprint de tareas para `frontend-engineer`.
2. Muestra blueprint al usuario, espera "sigue".
3. Delega a `frontend-engineer` con specs claros de cada designer.
4. Después de implementación: `code-reviewer` + (si tocó auth/sensible) `security-engineer`.
5. Después de merge: `accessibility-specialist` re-valida los WCAG fixes.

## Si $ARGUMENTS llega no vacío

Trata el contenido como respuesta al Paso 1 — interpreta el alcance (ruta, flujo, descripción libre) y salta al Paso 2.

## Reglas duras

- **NUNCA empieces a leer código sin saber qué auditar.**
- **NUNCA muestres 5 reportes copiados.** Consolida. Sintetiza patrones.
- **Severidad disciplinada:** Catastrophic = goal bloqueado. No infles.
- **No prometas "implementación inmediata"** sin pasar por tech-lead → frontend-engineer → review.
- **El audit completo siempre se persiste en memory** — es muy valioso para tracking de regresiones futuras.
- **Si encuentras una regresión vs un audit previo en memory**, márcalo prominentemente.
