---
name: team-finish
description: "Esta feature está a medias — completar end-to-end pragmáticamente". Coordina integration-engineer (cablea piezas desconectadas) + polish-engineer (estados, errores, copy) + debug-engineer (bugs encontrados). Bar = demo-ready, no perfect.
---

# /team-finish — Llevar a medias → demo-ready

El usuario invocó `/team-finish`. Tiene una feature que "más o menos funciona" pero está a medias. **Objetivo: demo-ready en una sesión.** No pipeline de 8 fases.

## Pre-flight

1. Lee `.claude/memory/INDEX.md`. Si hay un dossier/plan/audit sobre esta feature, **úsalo como contexto** (no preguntes lo que ya está en memoria).
2. Crea un TodoWrite con: Inventory gaps, Wire missing pieces, Polish states, Fix bugs found, Verify end-to-end.

## Paso 1 — Una pregunta si `$ARGUMENTS` está vacío

```
🚀 **Finish mode** — vamos a sacar esto adelante. Bar: demo-ready, no perfect.

¿Qué feature está a medias? Dime una de:
  • El nombre / ruta / componente (ej: "el flow de procesar facturas")
  • Lo que no funciona ("clic en Procesar no hace nada y los datos extraídos siempre están vacíos")
  • "Toda esta vista" + un path
```

Si `$ARGUMENTS` tiene contenido, salta al Paso 2.

## Paso 2 — Inventory en una sola pasada

Lee el código de la feature objetivo. **No leas el repo entero.** Solo la feature.

Lista en formato compacto, todo a la vez:

```
📋 **Inventario** — <feature>

### 🔌 Piezas desconectadas (integration-engineer)
- Botón Procesar (Inbox.tsx:45) → handler vacío
- ApiClient (api.ts) → falta método `processDocuments`
- Backend `/api/documents/process` → existe pero handler es stub

### 🎨 Estados faltantes (polish-engineer)
- Loading: spinner infinito sin progreso
- Empty: "No hay campos extraídos" sin guía
- Error: muestra "Error 500" raw

### 🐛 Bugs (debug-engineer)
- "Document has no raw_text" — ExtractFields se llama antes que OCR
- Pydantic "valid integer" — campo `periodo` llega como string del select

### Plan en 1 párrafo:
Cablear handler → endpoint → use case → DB.
Después, llenar estados visibles + arreglar el orden OCR.
**Estimación: una sesión.** Demo-ready, no prod.

¿Procedo? (sí / cambia X / cancela)
```

**Espera "sí".** No empieces hasta confirmación.

## Paso 3 — Ejecución en paralelo cuando posible

Tras aprobación, lanza en **un solo turno** con múltiples Agent calls:

- `integration-engineer` para cablear las piezas desconectadas (handlers, endpoints, client methods)
- `debug-engineer` para los bugs específicos identificados

Espera a que ambos terminen. Después:

- `polish-engineer` para los estados (después del wiring, porque depende de que los flows funcionen)

Reporta progreso al cerrar cada uno:

```
✓ integration-engineer: 3 piezas cableadas (handler, client method, cache invalidation)
✓ debug-engineer: 2 bugs arreglados (ordering OCR, type coercion periodo)
→ polish-engineer corriendo (loading + empty + error states)
```

## Paso 4 — Verificación end-to-end

Después de los 3 agentes, **camina tú la feature** como usuario:

1. Abre el flow desde el punto de entrada.
2. Acción primaria → resultado esperado.
3. Una edge case (error de red, input vacío, valor extremo).
4. Estado final.

Si todo verde:

```
✅ **Demo-ready: <feature>**

Cambios totales:
  • <N> archivos modificados
  • <N> tests añadidos
  • <N> bugs arreglados

End-to-end verificado:
  ✓ Acción primaria funciona
  ✓ Loading state visible
  ✓ Empty state con guía
  ✓ Error state recoverable
  ✓ Success → next step

**Demo-ready ≠ prod-ready:**
  • <trade-off documentado>
  • <trade-off documentado>

**Follow-ups (no bloquean demo):**
  • <list>

Commit sugerido:
`feat(<scope>): wire and polish <feature> to demo-ready`
```

Si algo falla en la verificación: bucle de vuelta al agente correspondiente con el problema específico. **No declares done con flows rotos.**

## Paso 5 — Persistencia en memory

Guarda en `.claude/memory/decisions/<fecha>-finish-<feature-slug>.md`:
- Gaps inventariados
- Cambios aplicados
- Trade-offs "demo-ready ≠ prod-ready"
- Follow-ups deferidos

Línea en INDEX. Útil para auditoría futura — "qué quedó por hacer antes de prod".

## Reglas duras

- **Inventory antes de tocar nada.** No empieces a editar sin haber listado los gaps + mostrado al usuario.
- **Demo-ready, no perfeccionista.** Si algo no afecta la demo, va a follow-ups.
- **Trade-offs explícitos.** Cada "good for now" debe tener un "before prod we should X".
- **No descomposición exhaustiva como /team-feature.** Esto es ejecución, no planificación.
- **Una sesión, un objetivo.** Si la feature está tan rota que no se completa en una sesión, escala a `/team-feature` con `tech-lead`.

## Cuando NO usar /team-finish

- Feature aún no existe → `/team-feature` (pipeline completo)
- Solo un bug puntual → `/team-fix`
- Solo problemas de UI → `/team-ux-audit`
- Solo falta data para probar → `/team-seed`
- Reescritura estructural → `/team-refactor`
