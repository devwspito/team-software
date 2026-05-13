---
name: team-refactor
description: Refactor interactivo coordinado por refactoring-specialist con red de tests verificada por qa-engineer. Pregunta primero qué refactorizar.
---

# /team-refactor — Refactor interactivo

El usuario invocó `/team-refactor`. **NO leas archivos ni invoques agentes todavía.** No asumas qué refactorizar.

## Paso 1 — Saludo + primera pregunta (PRIMER mensaje)

Si `$ARGUMENTS` está vacío, envía:

```
🔧 **Refactor seguro** — voy a coordinar refactoring-specialist con red de tests garantizada por qa-engineer.

Para empezar:

  **1. ¿Qué quieres refactorizar?**
       (archivo, módulo, clase, función — el path o un identificador claro)

  **2. ¿Qué te molesta de ese código?** *(opcional — si dudas, "diagnostica tú")*
       Ejemplos:
         • "Es demasiado largo, hace muchas cosas"
         • "Tengo if/else gigantes sobre tipos"
         • "Está acoplado a la BD, no puedo testear"
         • "Diagnostica tú" → identifico smells por ti
```

**Espera respuesta. No leas nada aún.**

## Paso 2 — Verificación de existencia + contexto

Una vez tengas el target:

1. Verifica que el path existe (`ls`, `Glob` o `Read`)
2. Si no existe o es ambiguo, lista opciones cercanas y pregunta:
   ```
   No encontré "src/auth/login.ts". ¿Quizás te refieres a uno de estos?
     • src/auth/Login.ts
     • src/api/auth/login-handler.ts
     • src/features/login.ts
   ```
3. Si existe, lee solo el header (primeras 30 líneas) y muestra:
   ```
   Vale, encontrado: <path> (<N> líneas)

   ¿Confirmas que es este el target o quieres acotar más?
     • todo el archivo
     • una clase/función específica dentro (dime cuál)
     • un rango de líneas (ej: 45-180)
   ```

## Paso 3 — Pregunta CRÍTICA sobre tests

```
Antes de tocar nada, necesito saber sobre tests:

  **¿Hay tests que cubran este código?**
    (a) **Sí, sé que están y pasan** — perfecto, voy directo
    (b) **Sí pero no los he corrido recientemente** — los corro yo para confirmar
    (c) **No, o no sé** — qa-engineer escribirá characterization tests primero
    (d) **No, y no quiero tests** — entonces RECHAZO el refactor (no hago refactor a ciegas)
```

**Espera respuesta. La opción (d) significa STOP.**

## Paso 4 — Asegurar red de tests

- Si (a): corre los tests, valida que están en verde. Si rojos, STOP y pide al usuario que primero arregle.
- Si (b): corre los tests. Si rojos, STOP.
- Si (c): invoca `qa-engineer` para que escriba characterization tests que pinen el comportamiento actual. Cuando los tenga, córrelos en verde antes de continuar.
- Si (d): responde:
  ```
  No refactorizo sin tests — es la regla más importante. El riesgo de romper comportamiento sin red de seguridad es demasiado alto.

  Opciones:
    1. Escribo yo characterization tests primero (qa-engineer) → luego refactor
    2. Tú escribes los tests primero → me llamas otra vez
    3. Aceptas el riesgo: cambia tu respuesta a (a) ó (c) — pero entonces sé explícito.
  ```
  Espera nueva respuesta.

## Paso 5 — Diagnóstico con `refactoring-specialist`

Con tests en verde, invoca `refactoring-specialist`. Pasa:
- Target (path + scope)
- Smell observado por el usuario (Paso 1.2) o "diagnose"

Espera el plan de refactor (lista ordenada de refactorings nombrados — Extract Function, Move Method, Replace Conditional with Polymorphism, etc.).

## Paso 6 — Muestra plan al usuario

```
🗺️ **Plan de refactor**

Smell detectado: <descripción>

Pasos (en orden, cada uno con tests verdes al final):
  1. Extract Function: líneas 45-67 → validateLines()
  2. Move Method: orderTotal() de OrderService a Order (Feature Envy)
  3. Replace Conditional with Polymorphism: switch sobre orderType (línea 120) → OrderStrategy
  4. Inline Variable: tempPrice innecesario (línea 89)

Después del refactor, tu código:
  • <beneficio 1>
  • <beneficio 2>

¿Sigo paso a paso? (sí / cambia X / cancela)
```

**Espera "sí". No empieces a editar.**

## Paso 7 — Ejecución paso a paso

Para cada paso del plan:

1. Aplica la transformación nombrada (sin combinar con otras).
2. Corre tests.
3. Si verde: ✓, continúa al siguiente paso. Reporta breve:
   ```
   ✓ Paso 1/4: Extract Function `validateLines` — tests verdes
   ```
4. Si rojo: REVIERTE ese paso inmediatamente, diagnostica, intenta un step más pequeño. Reporta al usuario:
   ```
   ✗ Paso 2/4 falló — test `Order.totalCalc.handlesZero` rojo después del Move.
   Revertido. Intentando con un step intermedio (Extract Method primero, luego Move).
   ```

**Nunca dejes el código en estado rojo entre pasos.**

## Paso 8 — Review final con `code-reviewer`

Cuando el plan termine, invoca `code-reviewer` para confirmar:
- No cambio de comportamiento (lo verifican los tests, pero validación cruzada).
- Mejora real en SOLID/SRP/modularidad/clean code.
- Smells iniciales resueltos.

## Paso 9 — Entrega

```
🧹 **Refactor completado**

  • Pasos aplicados:       <N>
  • Pasos revertidos:      <N>
  • Tests:                 <N> (todos verdes)
  • Smells resueltos:      <lista>
  • Smells remanentes:     <lista — sugeridos para siguiente pasada>
  • Verdict code-reviewer: APPROVE

Recomendación: dos commits separados (Tidy First)
  1. structural — el refactor
  2. behavioral — cualquier feature/fix que venía después
```

## Si $ARGUMENTS llega no vacío

Trata el contenido como respuesta a la pregunta 1 (target). Continúa con Paso 2.

## Reglas duras

- **NUNCA refactorices sin tests verdes confirmados.** Es la regla #1.
- **NUNCA combines múltiples refactorings en un solo paso.** Uno a uno, tests verdes entre cada uno.
- **NUNCA mezcles refactor con cambio de comportamiento.** Tidy First — commits separados.
- **NO cambies APIs públicas** salvo que sea el objetivo explícito (y entonces es behavior change, no refactor).
- **Si un paso falla 2 veces, escalá al usuario** antes de seguir intentando.
