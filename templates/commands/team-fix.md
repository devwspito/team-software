---
name: team-fix
description: Bug fix pragmático. Pegas el error / síntoma / screenshot, debug-engineer reproduce + arregla + añade regression test. Sin pipeline de 8 fases, sin tandas de preguntas. Una pregunta máximo si no puede reproducir.
---

# /team-fix — Bug fix sin ceremonia

El usuario invocó `/team-fix`. **No hagas pipeline ni discovery.** Esto es modo "venga, vamos": una pregunta máximo si no puede reproducirse, después se arregla.

## Pre-flight (silencioso)

1. Lee `.claude/memory/INDEX.md` rápido. Si hay un `decisions/*fix*` reciente sobre lo mismo, menciónalo brevemente al final ("ya arreglamos algo parecido el X").
2. NO leas memoria entera. NO crees TodoWrite — esto es 1-3 pasos, no un pipeline.

## Paso 1 — Una pregunta si y solo si `$ARGUMENTS` está vacío

Si `$ARGUMENTS` está vacío:

```
🔧 **Fix mode** — debug-engineer al rescate.

¿Qué está roto? Pégame uno de:
  • El error (stack trace, mensaje)
  • El síntoma ("este botón no hace nada")
  • Pasos para reproducir
  • Screenshot del problema

Adelante.
```

**Espera la respuesta.** Una pregunta, no tres.

Si `$ARGUMENTS` ya tiene contenido, salta directo al Paso 2.

## Paso 2 — Invoca `debug-engineer` directamente

Pasa al `debug-engineer`:
- El síntoma / error completo
- El cwd y stack del proyecto (lo descubres con `pwd`, `ls`, package.json/Cargo.toml/pyproject)
- Cualquier contexto adicional que el usuario haya dado

**No hagas tú el debug.** Delega.

## Paso 3 — Reporta el fix al usuario

Cuando `debug-engineer` vuelva:

```
🔧 **Fix completado**: <síntoma original en 1 línea>

**Root cause:** <una frase>
**Archetype:** <si aplica — "wrong ordering", "missing await", etc>

**Cambios:**
  • <file:line> — <qué cambió>

**Regression test:** ✓ añadido en `<path>` — falla antes, pasa después

**Bugs adicionales detectados** (NO arreglados aquí, follow-up):
  • <list si los hay>

**Commit sugerido:**
`fix(<scope>): <one-liner>`

¿Lo aplico? (sí / muéstrame el diff primero / espera)
```

## Paso 4 — Si el fix toca >5 archivos o cruza módulos

Para automáticamente y avisa:

```
⚠ Este fix toca <N> archivos en <módulo A> y <módulo B>. Eso es más reescritura que bug fix.

Opciones:
  (a) Lo aplico igual — confío en debug-engineer
  (b) Llamo a tech-lead para que lo descomponga
  (c) Solo dame el diagnóstico, lo arreglo yo

¿Cuál?
```

## Paso 5 — Si después del fix, el usuario reporta otro bug

Loop: vuelve al Paso 1 con el nuevo error. Cada bug es un commit separado.

**📝 Si el fix es no-trivial** (>1 archivo, root cause interesante, archetype recurrente): persiste en `.claude/memory/decisions/<fecha>-fix-<slug>.md` con el formato del debug-engineer. Línea en INDEX. Útil para detectar regresiones futuras y patrones.

## Reglas duras

- **NUNCA hagas 3 tandas de preguntas.** Una pregunta máximo si no hay info para reproducir.
- **NUNCA empieces "let me first understand the architecture".** Eso es tech-lead. Aquí solo arreglas.
- **No mezcles bugs.** Un bug, un commit. Si descubres otro, lo listas pero no lo tocas.
- **Siempre añade un regression test** salvo que sea físicamente imposible (config env-específico, UI manual).
- **No refactorices al pasar.** "Mientras estoy aquí" → no. Anota como follow-up.

## Cuando NO usar /team-fix

- "Quiero añadir una feature" → `/team-feature`
- "Quiero rediseñar el módulo X" → `/team-refactor`
- "Quiero limpiar el código alrededor de Y" → `/team-refactor`
- "Esta funcionalidad está a medias" → `/team-finish`
- "No tengo datos para probar" → `/team-seed`
