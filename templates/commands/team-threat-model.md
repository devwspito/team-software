---
name: team-threat-model
description: Threat modeling completo (STRIDE) sobre una feature o componente con security-engineer.
---

# /team-threat-model — Threat modeling

El usuario quiere una evaluación de seguridad proactiva antes de implementar o desplegar.

## Argumentos
$ARGUMENTS (descripción de la feature / componente / endpoint)

## Pasos

1. **Asegúrate de tener contexto suficiente** — Si `$ARGUMENTS` es vago:
   - Pídele a `requirements-analyst` que extraiga assets, trust boundaries, datos sensibles, actores.
   - Solo procede al threat model con un input concreto (qué se construye, qué entra, qué se almacena, quién accede).

2. **Invoca `security-engineer` en modo threat-modeling** con todo el contexto. Espera el reporte STRIDE estructurado:
   - Assets
   - Trust boundaries
   - Amenazas por categoría (Spoofing / Tampering / Repudiation / Information disclosure / DoS / Elevation of privilege)
   - Para cada amenaza: vector, impacto, likelihood, mitigation, residual risk
   - Required controls (concretos, testeables)
   - Out of scope / accepted risks

3. **Consolida controles en tareas accionables**:
   - Cada control listado se traduce en un item para el blueprint de `tech-lead` si la feature aún está en planificación.
   - Si la feature ya está implementada, los controles se traducen en tareas para `backend-engineer` / `frontend-engineer` / `devops-engineer`.

4. **Define un trigger de re-evaluación**:
   - Cualquier cambio en trust boundaries, autenticación, autorización, datos sensibles, o dependencias externas → re-correr este threat model.

## Reglas

- No publiques un threat model sin assets y trust boundaries explícitos.
- Severidad disciplinada — Critical = business-existential. No infles.
- Cada mitigation debe ser testeable (PASS/FAIL), no aspiracional.
