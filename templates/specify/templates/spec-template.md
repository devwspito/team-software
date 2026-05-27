# Feature Specification: [FEATURE NAME]

**Feature Directory**: `specs/[NNN-feature-name]/`

**Created**: [DATE]

**Status**: Draft | Clarifying | Ready for Planning | Planned | Implementing | Shipped

**Input**: Descripción del usuario: "[ARGUMENTS]"

> Esta spec describe **QUÉ** se construye y **POR QUÉ**. No describe el **CÓMO** (sin lenguaje, framework, schema o endpoints).
> Generada por `/team-specify` (delega en `requirements-analyst`). Refinada por `/team-clarify` si quedan ambigüedades.
> Es la **fuente de verdad** del feature. Si la implementación se desvía, se actualiza esta spec primero.

---

## User Scenarios & Testing *(obligatorio)*

> **REGLA**: cada user story es una rebanada INDEPENDIENTEMENTE TESTEABLE — implementando sólo una, tienes un MVP viable que entrega valor.
> Prioridades P1/P2/P3 ordenan el roadmap. P1 = el MVP. Las P>1 se construyen encima sin romper las anteriores.

### User Story 1 — [Título breve] (Priority: P1)

[Describe el journey del usuario en lenguaje natural — actor, contexto, qué quiere lograr, qué hace, qué pasa.]

**Por qué esta prioridad**: [Valor entregado. Por qué bloquea / habilita las P2+.]

**Test independiente**: [Cómo se verifica esta story SOLA, sin las demás. Ej: "Probando X con [acción], se llega a [resultado] sin tocar Y ni Z."]

**Acceptance Scenarios**:

1. **Given** [estado inicial], **When** [acción del actor], **Then** [resultado observable]
2. **Given** [estado inicial], **When** [acción], **Then** [resultado]

---

### User Story 2 — [Título breve] (Priority: P2)

[Descripción del journey]

**Por qué esta prioridad**: [Valor + razón de no-bloqueo del MVP]

**Test independiente**: [Cómo se verifica sola]

**Acceptance Scenarios**:

1. **Given** [estado], **When** [acción], **Then** [resultado]

---

### User Story 3 — [Título breve] (Priority: P3)

[Descripción del journey]

**Por qué esta prioridad**: [Valor]

**Test independiente**: [Cómo se verifica sola]

**Acceptance Scenarios**:

1. **Given** [estado], **When** [acción], **Then** [resultado]

---

[Añadir más user stories si aplica, cada una con prioridad asignada.]

### Edge Cases

<!-- Cada user story tiene casos límite. Listarlos aquí o por story. NO inventar — derivar del dominio. -->

- ¿Qué pasa cuando [condición límite, ej: input vacío, máximo permitido, concurrencia, red caída]?
- ¿Cómo reacciona el sistema ante [escenario de error, ej: dependencia externa 5xx, permisos faltantes, datos corruptos]?

---

## Functional Requirements *(obligatorio)*

> Cada requirement debe ser **testeable** y sin ambigüedad. Si necesitas la palabra "y" para describirlo, divídelo.

- **FR-001**: El sistema DEBE [capacidad concreta — ej: "permitir al usuario crear una cuenta con email + password"]
- **FR-002**: El sistema DEBE [capacidad — ej: "validar el formato del email antes de aceptar el alta"]
- **FR-003**: El usuario DEBE poder [interacción clave — ej: "resetear su password vía email"]
- **FR-004**: El sistema DEBE [requisito de datos — ej: "persistir las preferencias del usuario entre sesiones"]
- **FR-005**: El sistema DEBE [comportamiento — ej: "registrar todos los eventos de seguridad en audit log"]

*Cómo marcar requisitos incompletos:*

- **FR-006**: El sistema DEBE autenticar al usuario via [NEEDS CLARIFICATION: método sin especificar — email/password, SSO, OAuth, magic link?]
- **FR-007**: El sistema DEBE retener datos durante [NEEDS CLARIFICATION: periodo sin especificar — 30 días, 1 año, indefinido?]

> **LÍMITE**: máximo 3 `[NEEDS CLARIFICATION]`. Si quedan más, `/team-clarify` los resuelve antes de planificar.

### Non-Functional Requirements *(si aplica)*

- **NFR-001**: [ej: tiempo de respuesta p95 < 500ms en operaciones síncronas]
- **NFR-002**: [ej: soportar 1000 usuarios concurrentes sin degradación]
- **NFR-003**: [ej: cumple GDPR — derecho a borrado en 30 días]

### Key Entities *(si la feature involucra datos)*

> Conceptos del dominio en **lenguaje ubicuo**. SIN tipos primitivos, SIN tablas SQL. Sólo el significado de negocio.

- **[Entidad 1]**: [Qué representa, atributos relevantes sin tipos]
- **[Entidad 2]**: [Qué representa, relación con otras entidades]

---

## Success Criteria *(obligatorio)*

> Criterios **medibles** y **agnósticos a la tecnología**. Se validan sin saber cómo está implementado.

### Outcomes medibles

- **SC-001**: [Ej: "El usuario completa el alta en menos de 2 minutos en el percentil 95"]
- **SC-002**: [Ej: "El sistema sirve 1000 búsquedas/seg sin degradación visible"]
- **SC-003**: [Ej: "El 90% de los usuarios completan la tarea principal al primer intento"]
- **SC-004**: [Ej: "Reducir las incidencias de soporte sobre X en un 50%"]

---

## Out of Scope

> Lo que **NO** se construye en esta feature. Cierra el contrato explícitamente.

- [Ej: "Integración con SSO corporativo — diferida a feature posterior"]
- [Ej: "Soporte mobile nativo — fuera de v1"]

---

## Assumptions

> Decisiones por defecto tomadas cuando la descripción no las especifica. Si una cambia, la spec se re-revisa.

- [Ej: "Los usuarios tienen conexión estable a internet"]
- [Ej: "El sistema de auth existente se reutiliza, no se reescribe"]
- [Ej: "Se accede a la feature desde web; el mobile usa el mismo backend"]

---

## Dependencies & Risks

> Servicios, librerías, equipos o decisiones de los que depende esta feature. Riesgos identificados.

- **Dependencia**: [Ej: "API de pagos del proveedor X — sandbox disponible, prod requiere onboarding"]
- **Riesgo**: [Ej: "Cumplimiento PCI si almacenamos PAN — mitigar usando tokenización del proveedor"]

---

## Security / Privacy / Compliance Notes

> Si la feature toca auth, PII, dinero, datos sensibles, o exposición a internet, declarar aquí qué requiere atención. `/team-plan` invocará `security-engineer` para threat-model.

- **Datos sensibles**: [Ej: "Email del usuario (PII), hash de password"]
- **Compliance**: [Ej: "GDPR — borrado en 30 días", "PCI scope reducido vía tokenización"]
- **Threat surface**: [Ej: "Endpoint público de login — rate-limit + lock-out tras N intentos"]

---

> **Siguiente paso**: si la spec está completa → `/team-plan`. Si quedan `[NEEDS CLARIFICATION]` o ambigüedades → `/team-clarify`.
