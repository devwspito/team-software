---
name: team-refactor
description: Refactor seguro coordinado por refactoring-specialist con red de tests verificada por qa-engineer.
---

# /team-refactor — Refactor seguro

El usuario quiere mejorar estructura sin cambiar comportamiento.

## Argumentos
$ARGUMENTS (archivo / módulo / smell descrito)

## Pasos

1. **Verifica la red de tests primero** — Invoca `qa-engineer` con:
   - Target: `$ARGUMENTS`
   - Pregunta: ¿hay coverage suficiente para detectar cambios de comportamiento? ¿Tests pasan en verde?
   - Si NO hay coverage suficiente: pide a `qa-engineer` characterization tests que pinnen el comportamiento actual. Espera a que el usuario apruebe + estén en verde.

2. **Diagnóstico** — Invoca `refactoring-specialist` con:
   - Target y el smell observado (o pídele que lo identifique).
   - Entrega esperada: plan de refactor (lista ordenada de refactorings nombrados — Extract Function, Move Method, etc.).

3. **Ejecución paso a paso** — Para cada paso del plan:
   - Aplica la transformación.
   - Corre tests. Si verde: continúa. Si rojo: revierte ESE paso, diagnostica, retry más pequeño.
   - **Nunca** bundles múltiples refactorings en un solo paso.
   - **Nunca** mezcles refactor con cambio de comportamiento (Tidy First — commits separados).

4. **Review final** — Cuando termine el plan, invoca `code-reviewer` para confirmar:
   - No cambio de comportamiento (tests verifican).
   - Mejora real en SOLID/SRP/modularidad/clean code.
   - Smells iniciales resueltos.

## Reglas

- Si no hay tests y no se pueden escribir characterization tests → **rechaza el refactor**. No refactorices a ciegas.
- Cada commit = un refactor nombrado. Diff revisable.
- Tests verdes antes, entre pasos, y al final. Innegociable.
