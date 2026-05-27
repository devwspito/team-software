# [PROJECT_NAME] — Constitución del Proyecto

> Principios no-negociables que gobiernan TODO trabajo en este repo. Se chequean en cada `/team-plan` (gate) y se re-chequean al final del diseño. Cualquier violación debe justificarse explícitamente en `plan.md → Complexity Tracking`.

> **Heredamos los principios globales de team-software** (Security first · SOLID · DDD · SRP · Clean Code · Modularidad · Orquestación). Esta constitución los **especializa** y los **endurece** para este proyecto concreto. No los repite — los extiende.

## Principios del Proyecto

### I. [PRINCIPLE_1_NAME]

[PRINCIPLE_1_DESCRIPTION]
<!-- Ej: "Domain-First — el dominio se modela ANTES del schema o del endpoint. Aggregates dueños de invariantes. Cero dependencias de framework en el dominio." -->

### II. [PRINCIPLE_2_NAME]

[PRINCIPLE_2_DESCRIPTION]
<!-- Ej: "Test-First (innegociable) — toda lógica de negocio se acompaña de un test que la ejerce. Las regresiones llevan test antes del fix." -->

### III. [PRINCIPLE_3_NAME]

[PRINCIPLE_3_DESCRIPTION]
<!-- Ej: "Security at the boundary — toda entrada de usuario, integración externa, o lectura de FS/DB pasa por validación explícita. Default-deny." -->

### IV. [PRINCIPLE_4_NAME]

[PRINCIPLE_4_DESCRIPTION]
<!-- Ej: "Observabilidad obligatoria — todo endpoint o workflow expone logs estructurados, métricas RED y, si aplica, trazas. Sin telemetría no se mergea." -->

### V. [PRINCIPLE_5_NAME]

[PRINCIPLE_5_DESCRIPTION]
<!-- Ej: "Simplicidad antes de framework — YAGNI. Prefiere 3 líneas similares a una abstracción prematura. No introducir librerías nuevas sin escribir el contrato primero." -->

## Restricciones Técnicas Adicionales

<!-- Stack obligatorio, compliance (GDPR/PCI/HIPAA), targets de performance, plataformas soportadas, dependencias prohibidas. -->

[SECTION_TECHNICAL_CONSTRAINTS]

## Flujo de Desarrollo y Gates de Calidad

<!-- Ejemplos: code review obligatorio antes de merge; threat-model si la feature toca auth/PII/dinero; suite E2E verde antes de deploy; CI gate de cobertura ≥X; deploy progresivo (canary→staged→full); rollback testeado. -->

[SECTION_WORKFLOW_GATES]

## Governance

- Esta constitución **prevalece sobre cualquier otra práctica** del repo.
- Toda excepción se justifica en `plan.md → Complexity Tracking` con (a) por qué la necesita y (b) por qué la alternativa más simple no sirve.
- Las enmiendas requieren: PR dedicado, documentación del cambio, y plan de migración para código existente que dependa del principio modificado.
- `code-reviewer` y `security-engineer` verifican cumplimiento antes de cada merge.
- El `CLAUDE.md` del repo y los slash commands de team-software heredan estos principios automáticamente.

**Version**: [CONSTITUTION_VERSION] | **Ratificada**: [RATIFICATION_DATE] | **Última enmienda**: [LAST_AMENDED_DATE]
