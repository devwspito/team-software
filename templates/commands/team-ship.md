---
name: team-ship
description: Production readiness check interactivo con devops-engineer + security-engineer antes de deploy. Pregunta primero qué desplegar.
---

# /team-ship — Production readiness interactivo

El usuario invocó `/team-ship`. **NO escanees archivos ni invoques agentes todavía.**

## Paso 1 — Saludo + primera pregunta (PRIMER mensaje)

Si `$ARGUMENTS` está vacío, envía:

```
🚢 **Production readiness check** — voy a coordinar devops-engineer + security-engineer antes del deploy.

Tres preguntas para empezar:

  **1. ¿Qué vas a desplegar?**
       (nombre del servicio / app / módulo — o "este repo si solo hay uno")

  **2. ¿Primer deploy o nueva versión?**
       (a) primer deploy (greenfield)
       (b) update sobre algo ya en producción
       (c) hotfix urgente
       (d) rollback / revert

  **3. ¿Hosting target ya decidido?**
       (a) sí — dime cuál (Vercel / Fly / Render / AWS / GCP / Cloudflare / self-hosted / ...)
       (b) no — devops-engineer recomienda según el stack
```

**Espera respuestas.**

## Paso 2 — Confirma + detecta el estado actual

Una vez tengas las 3 respuestas:

1. Verifica el repo: `git status` (debe estar limpio o con cambios staged claros), `git log --oneline -5` (qué commits van a deploy).
2. Si hay cambios sin commitear o el HEAD no está en una rama de release, avisa:
   ```
   ⚠ Estado del repo:
     • Rama actual:    <branch>
     • Working tree:   <clean / con cambios>
     • Último commit:  <sha> <message>

   ¿Procedo igual o quieres limpiar/mergear primero?
   ```
3. Si todo OK, confirma:
   ```
   Vale, voy a hacer el check para:
     • Servicio: <name>
     • Tipo: <primer deploy / update / hotfix / rollback>
     • Hosting: <target>
     • Versión: <commit sha + branch>

   ¿Confirmo y arranco el check? (sí / corrige X)
   ```

## Paso 3 — Lanza devops-engineer + security-engineer en paralelo

Tras "sí", **un solo turno, 2 Agent calls paralelas:**

- `devops-engineer` — checklist completo de production readiness:
  - CI pipeline verde (lint, typecheck, test, build, security scan)
  - Container builds reproducibly, scans clean, non-root
  - Health/readiness endpoints
  - Structured logs con trace correlation
  - Metrics (RED para handlers, USE para recursos)
  - Traces en critical paths
  - Alertas con runbooks
  - SLOs definidos
  - Backups + restore testeado (si stateful)
  - Deploy strategy (blue/green o canary)
  - Rollback es un botón
  - IAM least-privilege
  - Resource limits

- `security-engineer` — security gates pre-deploy:
  - Secretos NO leakean en logs/errors/URLs
  - TLS/HSTS configurado
  - Headers de seguridad (CSP, X-Frame-Options, etc.)
  - Rate limiting en endpoints sensibles
  - Dependencias sin Critical/High CVEs
  - Auth/authz en endpoints sensibles

Envía mensaje breve mientras corren:

```
🚀 Lanzados devops-engineer + security-engineer.
Volviendo con el verdict en breve...
```

## Paso 4 — Verdict consolidado

```
## Production readiness — <servicio>

**[READY | READY WITH CONDITIONS | NOT READY]**

### 🚫 Bloqueos (deben resolverse antes de deploy)
  • <item> — quién lo arregla
  • <item> — quién lo arregla

### ⚠ Avisos (recomendados, no bloqueantes)
  • <item>

### ✅ Checklist OK
  CI verde · health endpoints · structured logs · secretos en manager · rollback documentado · ...

### 🗺 Plan de deploy sugerido
  1. <paso 1>
  2. <paso 2>
  3. Smoke tests post-deploy: <qué validar>
  4. Rollback path: <comando exacto>

---

**¿Qué hago?**
  (a) Si READY: ¿procedo con el deploy? (necesito tu confirmación explícita)
  (b) Si READY WITH CONDITIONS: te paso los avisos y deploy con tu OK
  (c) Si NOT READY: te dejo el listado y tú decides cuándo volver con /team-ship
```

## Paso 5 — Deploy (solo con autorización explícita)

Si el usuario dice "sí, procede":

1. **Pregunta una vez más** si es viernes o fuera de horario laboral:
   ```
   📅 Es <día/hora>. ¿Seguro que quieres deploy ahora?
     • Si algo rompe, ¿hay on-call disponible?
     • Si es viernes/finde, ¿esperamos al lunes?
   ```
2. Ejecuta el deploy según la plataforma + rollback path conocido.
3. Lanza smoke tests post-deploy. Si fallan, ejecuta el rollback inmediatamente y avisa al usuario.

**NUNCA hagas deploy sin un "sí" inequívoco.** Y nunca skipees la pregunta de horario.

## Si $ARGUMENTS llega no vacío

Trata el contenido como respuesta a la pregunta 1 (qué desplegar). Continúa con las preguntas 2 y 3.

## Reglas duras

- **NUNCA declares READY si hay items críticos sin marcar.**
- **NUNCA deploys en viernes o fuera de horario sin razón fuerte explícita** (avisarlo + pedir confirmación adicional).
- **NUNCA hagas deploy sin autorización inequívoca del usuario.**
- **Si NOT READY: páralo.** No hay "deploy a la fuerza".
- **Si el usuario pide skip de gates específicos**: documenta en la sesión qué se skipa y por qué, y pide confirmación adicional antes de proceder.
