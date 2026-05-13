---
name: team-create
description: Crea un proyecto nuevo desde cero — visión → stack → estructura inicial → MVP slice. Orquesta requirements-analyst, software-architect, database-engineer, security-engineer, devops-engineer, tech-lead, y luego backend/frontend para el primer slice viable.
---

# /team-create — Proyecto nuevo desde cero

El usuario quiere crear un proyecto **nuevo**, no añadir a uno existente. No hay codebase para leer. Las decisiones son más amplias: lenguaje, framework, storage, infra, deploy target, presupuesto, deadline.

## Argumentos
$ARGUMENTS (descripción del proyecto / problema a resolver / visión)

## Pasos

### 1. Discovery profundo — `requirements-analyst` (BLOQUEANTE)

Invócalo con `$ARGUMENTS` y pídele que extraiga **además del intake estándar**:

- **Visión y propuesta de valor:** una frase. ¿Por qué este producto existe?
- **Usuarios objetivo (personas):** quiénes son, contexto, qué intentan hacer.
- **Casos de uso primarios** (priorizados): ¿cuáles son los 3-5 flows core?
- **NFRs reales:** ¿hosted o on-prem? ¿offline-first? ¿real-time? ¿multi-tenant? ¿volumen esperado?
- **Restricciones de stack:** ¿preferencia o requerimiento de lenguaje/framework/hosting? ¿el usuario tiene experiencia previa con algo?
- **Presupuesto operacional:** ¿servicio gratuito? ¿coste por usuario aceptable?
- **Deadline / timeline:** ¿cuándo necesitan v1, v2?
- **Cumplimiento desde día cero:** ¿GDPR, HIPAA, PCI, SOC2, sector regulado?
- **Datos:** ¿qué se almacena? ¿PII? ¿retención? ¿right-to-delete?

Si quedan **open questions críticas**, páralo, pásalas al usuario y NO avances hasta resolverlas. No diseñes un stack contra una visión vaga.

### 2. Stack + arquitectura — `software-architect`

Pasa el dossier completo. Pídele:

- **Recomendación de stack** justificada por los NFRs:
  - Lenguaje + framework backend (con 2-3 alternativas y trade-offs)
  - Frontend (si aplica): SPA / SSR / SSG / mobile
  - Storage primario (coordina con `database-engineer`)
  - Infra / hosting recomendado (coordina con `devops-engineer`)
- **Estructura de carpetas** del repo (DDD layering: domain / application / infrastructure / presentation)
- **Bounded contexts** iniciales identificados desde los casos de uso
- **Contratos de los módulos** principales (interfaces / ports)

### 3. Decisión de datos — `database-engineer`

En **paralelo** con el architect (mismo turno, dos Agent calls):

- Elige store primario (relacional vs document vs KV vs híbrido) justificado por access patterns
- Esquema inicial de las entidades core (con PK, FKs, índices base)
- Estrategia de migraciones desde día uno

### 4. Threat model de día cero — `security-engineer`

En paralelo con los anteriores. Pídele:

- Trust boundaries iniciales (qué es público, qué requiere auth, qué requiere admin)
- Modelo de autenticación recomendado (email+password / OAuth / passwordless / magic link)
- Modelo de autorización (RBAC / ABAC / per-resource)
- Datos sensibles y dónde se almacenan / encriptan
- Audit log desde el comienzo si la app lo requiere

### 5. Infra mínima — `devops-engineer`

En paralelo. Pídele:

- Hosting target (Vercel / Fly / Render / AWS / GCP / Cloudflare / self-hosted)
- CI desde **commit 1** (lint, typecheck, test, build, security scan)
- Containerización si el stack lo justifica
- Observabilidad mínima viable (structured logs + un dashboard)
- Estrategia de secrets desde día uno (env, secret manager)
- Deploy strategy (preview branches, canary, blue/green)

### 6. Plan del MVP slice — `tech-lead`

Con las 4 entradas anteriores, pídele:

- Identifica el **slice mínimo viable** (la cosa más pequeña que entrega valor end-to-end al usuario)
- Descompón ese slice en tareas atómicas con especialista asignado
- Identifica el orden / paralelismo
- Define **definition of done para el MVP**

### 7. Confirmación al usuario antes de generar

Presenta el plan al usuario en un solo mensaje:

```
## Proyecto: <nombre propuesto>
## Stack elegido: <lenguaje + framework + storage + hosting>
## Bounded contexts: <lista>
## MVP slice (lo que voy a generar): <lista>
## Decisiones aplazadas: <lista>

¿Procedo a crear la estructura inicial del repo + el código del MVP slice?
```

**NO escribas código aún.** Espera confirmación explícita del usuario.

### 8. Scaffolding inicial (post-aprobación)

Una vez aprobado:

1. **Crea la estructura de carpetas** del repo según el diseño del architect.
2. **Inicializa el proyecto**: `package.json` / `pyproject.toml` / `Cargo.toml` / lo que aplique, con deps mínimas justificadas.
3. **Setea CI desde commit 1**: archivo de pipeline (.github/workflows/, etc.) con lint/typecheck/test obligatorios.
4. **`.gitignore` y `README.md`** con el stack documentado y comandos para arrancar.
5. **`.env.example`** con todas las variables, ningún secreto real.
6. **Migraciones iniciales** según `database-engineer`.
7. **Health endpoint** + structured logging desde el primer commit.
8. **Auth scaffolding** según `security-engineer` (no implementación de OAuth, solo el shape).

### 9. Implementación del MVP slice

Delega tareas según el blueprint de `tech-lead`:
- `backend-engineer` para use cases + domain + infra adapters
- `frontend-engineer` para UI del flow primario
- `qa-engineer` para tests críticos del slice

### 10. Verificación final

Antes de declarar "done":
- `code-reviewer` review completo (es el primer código del repo — el listón es alto, sienta las bases)
- `security-engineer` review focalizado en el shape de auth/datos sensibles
- `devops-engineer` verifica que el CI corra verde

## Reglas

- **No saltes el dossier.** Crear un proyecto sin entender el problema produce stacks que se tiran a los 2 meses.
- **No elijas stack por moda.** Justifica cada elección contra los NFRs del dossier.
- **El primer commit importa.** No metas hello-world placeholder — mete el slice viable mínimo.
- **CI desde commit 1.** Si la pipeline no es verde al primer commit, el proyecto ya nace con deuda.
- **No prometas features para "después".** Lo que está fuera del MVP slice se documenta como follow-up explícito.
- **Pregunta antes de escribir código.** Tras la fase 6, espera confirmación.

## Output por fase al usuario

```
[FASE X/10] <nombre> — <especialistas invocados (en paralelo si aplica)>
  Entrega: <resumen 1-2 líneas del output>
  Decisiones clave: <bullets>
  Próximo: <fase siguiente o GAP>
```
