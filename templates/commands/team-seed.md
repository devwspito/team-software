---
name: team-seed
description: Genera seed data realista para destrabar testing. seed-data-engineer produce DB fixtures, archivos (PDFs, CSVs), mocks-replacement coherentes con el dominio (facturas españolas con NIF válido, IBAN real, IVA correcto, etc). Idempotente y prod-safe.
---

# /team-seed — Seed data realista

El usuario invocó `/team-seed`. **El problema:** no puede probar features porque la app tiene mocks vacíos o data no realista. **El objetivo:** sembrar datos creíbles que pasen validación y exfoliar todos los flows.

## Pre-flight

1. Lee `.claude/memory/INDEX.md`. Si hay un seed previo (artifacts/*seed*), menciona qué cubre y pregunta si reusar o ampliar.
2. Crea un TodoWrite con: Identify scope, Read schema, Plan data graph, Generate seed, Replace mocks, Verify, Document.

## Paso 1 — Una pregunta si `$ARGUMENTS` está vacío

```
🌱 **Seed mode** — vamos a destrabar testing con datos realistas.

¿Qué necesitas sembrar?

  1. **Un cliente completo end-to-end** — ej: "ACME Soluciones SL con facturas, banco, modelos AEAT, todo conectado"
  2. **Una entidad específica** — ej: "100 facturas emitidas variadas"
  3. **Archivos de prueba** — ej: "PDFs de facturas españolas reales", "extractos bancarios CSV"
  4. **Todo (preset demo)** — limpio, completo, listo para grabar una demo

Dime cuál o descríbeme el problema ("no puedo probar el modelo 303 porque no hay facturas con IVA").
```

Si `$ARGUMENTS` tiene contenido, salta al Paso 2.

## Paso 2 — Lee el schema antes de planificar

**No inventes datos.** Lee:

- DB models / ORM definitions (Prisma, TypeORM, Django models, Rails models, etc.)
- Validation rules (Zod schemas, Pydantic models, Joi, class-validator)
- File parsers existentes (qué columnas espera el CSV, qué shape el PDF)
- Mocks existentes — para entender qué shape el resto del código espera

Reporta brevemente:

```
🔍 **Schema mapeado:**
  • Tables: customers, invoices, bank_movements, accounting_entries, tax_models (5)
  • Validation: invoices.nif must match `^[A-Z]\d{8}$`, total = sum(lines) + iva - irpf
  • File parsers: BankImporter expects CSV con columnas [fecha, concepto, importe]
  • Mocks actuales: src/services/mockInvoiceService.ts (será reemplazado)

Stack: Postgres + Prisma + Node
```

## Paso 3 — Plan del data graph

Diseña el grafo coherente. Muestra al usuario antes de generar:

```
📋 **Plan de seed**

Cliente: ACME Soluciones SL
  • CIF: B12345674 (válido, control digit OK)
  • Domicilio: Madrid 28001, c/ Gran Vía 1
  • Régimen: AEAT común
  • IAE: 6209 (Otros servicios independientes informática)
  • Cuenta bancaria: ES9121000418450200051332 (IBAN test válido)

Facturas emitidas: 24
  • Numeración: F2026/001 .. F2026/024 correlativa
  • Distribución: 18 con IVA 21% (servicios), 4 con IVA 10% (mantenimiento sw), 2 con IVA 0% (intracomunitarias)
  • Importes: rango 500€ - 8.000€ base, distribución realista
  • Conceptos: "Desarrollo módulo X", "Mantenimiento mensual SaaS", "Consultoría arquitectura"
  • Clientes destinatarios: 8 distintos (algunos recurrentes)
  • IRPF 15% en 3 facturas (a personas físicas)
  • 1 factura > 3.005€ → aparecerá en Modelo 347

Facturas recibidas: 12 (gastos)
  • Proveedor de cloud (AWS) 4 × 200€ (mensual)
  • Coworking 6 × 350€
  • Licencias software 2 × 1.500€

Movimientos bancarios: 50
  • Cobros de facturas emitidas (24) con fecha 7-30 días después de emisión
  • Pagos a proveedores (12) sincronizados
  • 5 movimientos misceláneos (TPV, comisiones, intereses)
  • 9 nóminas (1 empleado, 9 meses)
  • Cada movimiento cuadra con su factura/asiento

Asientos contables: ~120
  • PGC 4 dígitos correcto
  • Cada factura → asiento 700/477, 572/430
  • Cada gasto → asiento 6xx/472, 410/572

Modelos AEAT:
  • 303 1T 2026: bases coherentes con facturas Q1
  • 111 1T 2026: 1 perceptor, base 9.000€, retención 1.350€ (nómina)
  • 115 1T 2026: alquiler coworking, retención
  • 130 1T 2026: pago fraccionado autónomos (si aplica al régimen)
  • 347 anual: 1 cliente > 3.005€

Edge cases incluidos:
  • 1 factura rectificativa
  • 1 factura con base €0 (anulada por nota crédito)
  • 1 cliente sin teléfono
  • 1 movimiento bancario sin factura asociada (gasto en efectivo)
  • Nombres reales-pero-ficticios (no "John Doe" ni reales de personas reales)

Total: ~200 rows en 6 tablas + 24 PDFs + 1 CSV bancario.

¿Procedo? (sí / ajusta X / dame solo los IDs primero / cancela)
```

**Espera "sí".** No siembres data sin aprobación — sembrar = persistente.

## Paso 4 — Invoca `seed-data-engineer`

Pasa al `seed-data-engineer`:
- El schema detectado
- El plan aprobado del Paso 3
- Mocks a reemplazar
- Stack + comando de ejecución del proyecto (npm script, rake, manage.py, etc.)

Espera el script + ejecución + verificación.

## Paso 5 — Reemplaza mocks

Después del seed exitoso, `seed-data-engineer` listó qué mocks reemplazó. Verifica:

```
🧹 **Mocks eliminados:**
  • src/services/mockInvoiceService.ts → DELETED
  • src/mocks/handlers.ts → cleaned (8 handlers removidos)
  • src/__fixtures__/* → DELETED (8 archivos)

¿Quieres también buscar referencias muertas a estos mocks? (sí / no)
```

Si "sí", corre `grep` por las exports eliminadas y reporta archivos que aún importan algo que ya no existe.

## Paso 6 — Verifica end-to-end

Walk-through:

1. Abre la app → ve los datos sembrados (no "0 facturas").
2. Acción típica → funciona contra data real.
3. Modelo AEAT → genera y muestra valores que no son 0.
4. Filtros, búsquedas, sorts → datan suficiente variedad para que sean útiles.

```
✅ **Seed completo y verificado**

  • Rows sembradas: <total por tabla>
  • Archivos generados: <count>
  • Mocks reemplazados: <count>
  • End-to-end verificado: <flow probado>

Comandos:
  • Re-seed:  `npm run seed`
  • Limpiar:  `npm run seed:clean`
  • Verificar: `npm run seed:verify`

Production-safety:
  ✓ Asserta NODE_ENV !== 'production'
  ✓ Records marcados con seed_origin='demo'
```

## Paso 7 — Persistencia en memory

Guarda en `.claude/memory/artifacts/<fecha>-seed-<slug>.md`:
- Plan completo aprobado
- Comandos de ejecución / limpieza
- Edge cases incluidos
- Trade-offs (qué no se sembró y por qué)

Línea en INDEX. Útil para que cualquier teammate pueda re-seedear sin re-pensar.

## Reglas duras

- **Lee schema antes de planificar.** No inventes shapes.
- **Plan al usuario antes de generar.** Sembrar es persistente.
- **Idempotente siempre.** Re-correr no duplica.
- **Production-safety.** Hard assertion `NODE_ENV !== 'production'`.
- **Reemplaza mocks, no los dupliques.** Mocks + seed conviviendo = confusión.
- **Real shapes, fake content.** Pasa validación.
- **Sin PII real.** Genera o usa Faker. Nunca nombres de personas reales.

## Cuando NO usar /team-seed

- Production necesita datos → eso es migración o backfill (`database-engineer`, no `seed-data-engineer`).
- Solo un fixture aislado para un test → escribe el fixture inline.
- App ya tiene mocks que funcionan y testing no está bloqueado → no toques nada.
