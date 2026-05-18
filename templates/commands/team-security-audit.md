---
name: team-security-audit
description: Auditoría de seguridad de alto nivel de un proyecto COMPLETO + corrección de lo crítico. Recon → red de seguridad git → audit profundo en paralelo (security-engineer STRIDE/OWASP/CWE + bug-hunter) → consolidación priorizada → fixes → verificación → commit → informe con acciones de operador. Reutilizable proyecto a proyecto.
---

# /team-security-audit — Ultra auditor-fixer de seguridad

El usuario invocó `/team-security-audit`. Esto audita un proyecto **entero** a nivel de seguridad y **corrige lo crítico**. No es un review de diff (`/team-review`) ni un threat-model de una feature (`/team-threat-model`) — es el barrido completo.

**NO leas código ni invoques agentes hasta confirmar alcance.**

## Pre-flight: memoria + todo

1. Lee `.claude/memory/INDEX.md`. Si hay un `artifacts/*security-audit*` previo del mismo proyecto, **menciónaselo** — puede ser re-auditoría (compara, detecta regresiones).
2. **Crea un TodoWrite** con: Recon, Red de seguridad git, Audit (paralelo), Consolidar, Fixes, Verificar, Commit, Informe.

## Paso 1 — Saludo + alcance (PRIMER mensaje)

Si `$ARGUMENTS` está vacío, envía:

```
🛡️ **Security audit + fix** — auditoría de seguridad de alto nivel de un proyecto completo.

  **1. ¿Qué proyecto?**  (path; "este" si es el cwd)

  **2. ¿Modo?**
     (a) **Audit + fix** — audito, y corrijo los findings Critical (los que no
         necesiten decisión tuya). Te entrego los fixes en commits revisables.
     (b) **Solo audit** — informe priorizado, sin tocar código.

  **3. ¿Hay algo en producción AHORA?**  (sí/no — si sí, soy más cuidadoso con
     cambios que rompan; el código se arregla pero desplegar es decisión tuya)
```

**Espera respuestas.**

## Paso 2 — Recon (tú, directo — no agentes aún)

Mapea el proyecto:
- Stack: `ls`, `package.json` / `pyproject.toml` / `requirements.txt` / `go.mod` / `Cargo.toml`, `docker-compose*.yml`, `Dockerfile*`.
- ¿Es repo git? `git rev-parse --is-inside-work-tree`. Estado: `git status`, `git log --oneline -3`.
- Ficheros sensibles: `find` por `.env*`, `*.pem`, `*.key`, `*.bak`, dumps. ¿`.gitignore` los cubre?
- Tamaño: cuántos archivos de código.
- Si hay contenedores corriendo de este proyecto, anótalo.

Reporta el recon en 4-5 líneas. Si ves un finding obvio ya (ej. `.env.bak` sin gitignore), menciónalo.

## Paso 3 — Red de seguridad git (BLOQUEANTE si modo = fix)

Si el modo es **audit + fix** y vas a modificar código:

- **Si NO es repo git:** primero arregla el `.gitignore` para que ningún secreto entre (`.env`, `.env.*`, `!.env.example`, `*.pem`, `*.key`), luego `git init`, verifica con `git check-ignore` que ningún secreto se trackea, y haz un commit baseline (`chore: baseline antes de fixes de seguridad`).
- **Si es repo git con cambios sin commitear:** avisa al usuario. Ofrece commitear su WIP como baseline (su autoría) o trabajar encima. NO clobberes su trabajo.
- El objetivo: que cada fix sea revisable con `git diff` y revertible.

## Paso 4 — Audit profundo en PARALELO

**Un solo turno, 2 Agent calls paralelas:**

- `security-engineer` — review completo + threat model + análisis de privacidad. Pásale el recon (stack, ficheros sensibles, qué hay en prod). Pídele explícitamente:
  - Auth / authz / IDOR en cada endpoint
  - Inyección: SQL, NoSQL, Cypher, comando, path traversal/LFI
  - Validación de input en toda frontera de confianza
  - Secretos: en código, logs, errores, git history, ficheros sin gitignore
  - Cripto: algoritmos, modos, IVs, gestión de claves
  - CORS, CSP, security headers, cookies
  - Prompt injection si hay LLM
  - SSRF si hay fetches server-side con URL controlable
  - Dependencias: CVEs conocidas (WebSearch si ayuda)
  - Privacidad/GDPR: catálogo de PII, retención, cifrado at-rest, derecho al olvido
  - Findings por severidad (Critical/High/Medium/Low) con file:line, CWE, exploit, fix concreto, verificación
  - Lista explícita de **Critical a corregir ya**

- `bug-hunter` — pase de tooling + estático. Pídele: correr tests/lint/typecheck/build; escaneo de TODOs/stubs/mocks/secretos hardcodeados/tests deshabilitados; cross-reference (handlers vacíos, endpoints huérfanos). Flag de cualquier cosa security-adjacent que tropiece.

Mensaje breve mientras corren: `🚀 Lanzados security-engineer + bug-hunter. Consolido cuando vuelvan.`

## Paso 5 — Consolida en UN informe priorizado

No pegues los 2 reportes. Sintetiza y deduplica:

```
## 🛡️ Security audit — <proyecto> · estado: PASS | FAIL

### Tooling
Tests: <pass/fail> · Lint: <...> · Typecheck: <...> · Build: <...>

### 🔴 Critical (N)
- <título> — <file:line> — CWE-XXX
  - Riesgo: <una línea>
  - Fix: <qué> — ¿necesita decisión tuya? <no / sí: por qué>

### 🟠 High (N)   ### 🟡 Medium (N)   ### ⚪ Low (N)
<igual formato, condensado>

### Privacidad / GDPR
<catálogo PII + huecos>

### Patrones (root causes)
<lo que se repite — sugiere refactor de raíz>
```

## Paso 6 — Fixes (si modo = audit + fix)

Clasifica cada Critical:
- **Arreglable sin decisión** (fail-fast de secretos débiles, `.gitignore`, contención de path traversal, `hmac.compare_digest`, parametrizar SQL, añadir auth dependency a rutas que ya deberían tenerla, endurecer CORS) → arréglalo.
- **Necesita decisión del usuario** — NO lo hagas a ciegas, pregúntale:
  - Esquema de auth nuevo (no había auth → ¿qué modelo?)
  - Upgrades de dependencia con breaking changes (CVE en una major)
  - Cualquier cambio de contrato externo / comportamiento observable
  - Rotación de secretos — **NUNCA la hace el agente**: el audit los marca, el usuario rota.

Delega los fixes: `backend-engineer` / `frontend-engineer` para implementación, `debug-engineer` para bugs concretos. Paraleliza lo independiente. Cada agente trabaja sobre la red de seguridad git.

## Paso 7 — Verifica

Tras los fixes: corre la test suite del proyecto. La baseline pre-fix es el listón — **no introduzcas regresiones**. Si un fix rompe tests, el agente que lo hizo los arregla (sin debilitar el test). Reporta el conteo final.

## Paso 8 — Commit

- Commit baseline (si no existía) + commit(s) de fixes, mensajes claros (`fix(security): ...`).
- Cada fix revisable con `git diff <baseline> <fixes>`.
- **Nunca** commitees secretos. **Nunca** `--no-verify`. Si el repo tiene remote, NO pushees sin permiso explícito del usuario.

## Paso 9 — Informe final

```
## ✅ Security audit completado — <proyecto>

Estado: <FAIL→criticals cerrados / PASS>
Commits: <baseline> + <fixes>
Tests: <N passed, 0 regresiones>

### Arreglado
<lista de Criticals corregidos>

### ⚠️ Acciones que tienes que hacer TÚ (no puedo / requieren tu decisión)
<rotar secretos expuestos, correr migraciones, poner env vars, decisiones de
 auth/deps pendientes, scrub de git history — concreto, accionable>

### Follow-ups no críticos (backlog)
<Highs/Mediums no atacados, con file:line>
```

**📝 Persiste el audit completo en memory**: `.claude/memory/artifacts/<fecha>-security-audit-<proyecto>.md` (findings + qué se arregló + qué queda). Línea en INDEX. Sirve de baseline para detectar regresiones en futuras re-auditorías.

## Reglas duras

- **Red de seguridad git ANTES de tocar código.** Sin baseline no hay fixes.
- **Severidad disciplinada.** Critical = explotable y grave (RCE, auth bypass, exfiltración, pérdida de datos). No infles.
- **Rotación de secretos: jamás automática.** El audit los detecta y los marca como comprometidos; rotarlos es del usuario.
- **Cambios que rompen contrato/comportamiento: pregunta primero.** Auth nuevo, upgrades major, schema changes.
- **Verifica con tests.** Cero regresiones.
- **No pushees a remotes** sin permiso explícito.
- **Cita file:line + CWE** en cada finding. Sin ubicación no es finding.
- **El informe SIEMPRE separa** "lo arreglé" de "lo tienes que hacer tú".

## Para correr en varios proyectos

Invócalo una vez por proyecto. Cada ejecución es independiente y deja su artefacto en memory. Para un barrido de N proyectos: `/team-security-audit` en cada uno, en orden de exposición (lo público primero).

## Si $ARGUMENTS llega no vacío

Trátalo como respuesta al Paso 1 (el path del proyecto, y/o el modo). Continúa con lo que falte preguntar.
