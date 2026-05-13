---
name: team-ship
description: Production readiness check con devops-engineer antes de desplegar — CI/CD, observabilidad, secretos, rollback.
---

# /team-ship — Production readiness

El usuario va a desplegar algo. Antes valida operational readiness.

## Argumentos
$ARGUMENTS (servicio / componente)

## Pasos

1. **Invoca `devops-engineer`** con el target. Pide el checklist de production readiness completo:
   - CI pipeline verde (lint, typecheck, unit, integration, security scan)
   - Container builds reproducibly, scans clean, runs as non-root
   - Health/readiness endpoints
   - Structured logs con trace correlation
   - Metrics (RED para handlers, USE para recursos)
   - Traces en critical paths
   - Alertas con runbooks
   - SLOs definidos
   - Backups + restore testeado (si stateful)
   - Deploy strategy (blue/green o canary)
   - Rollback es un botón
   - Secretos en secret manager (zero en código/logs)
   - IAM least-privilege

2. **Invoca `security-engineer`** en paralelo para validar:
   - Secretos no leakean en logs/errors/URLs
   - TLS configurado correctamente
   - Headers de seguridad (HSTS, CSP, etc.)
   - Rate limiting en endpoints sensibles

3. **Output al usuario**:
   ```
   ## Production readiness verdict
   READY | READY WITH CONDITIONS | NOT READY
   
   ## Bloqueos
   <items que deben resolverse antes de deploy>
   
   ## Avisos
   <items recomendados pero no bloqueantes>
   
   ## Plan de deploy sugerido
   <orden de pasos, rollback path, smoke tests post-deploy>
   ```

## Reglas

- **No declares READY** si hay items críticos sin marcar.
- No deploys en viernes salvo razón fuerte explícita (se lo avisas al usuario).
- Si el usuario fuerza un deploy con bloqueos pendientes, documéntalo en la sesión y nunca lo hagas sin su autorización explícita escrita en el chat.
