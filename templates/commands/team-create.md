---
name: team-create
description: Crea un proyecto nuevo desde cero — visión → stack → estructura inicial → MVP slice. Interactivo: pregunta primero, no asume nada.
---

# /team-create — Proyecto nuevo desde cero (interactivo)

El usuario invocó `/team-create`. **NO escribas archivos, no leas filesystem, no invoques agentes todavía.** Hay un proyecto vacío por crear y necesitas entender qué.

## Paso 1 — Saludo + primera tanda de preguntas (PRIMER mensaje)

Envía exactamente:

```
🚀 **Proyecto nuevo** — voy a orquestar al equipo para crearlo correctamente desde el primer commit.

Para no perder el tiempo, necesito 3 cosas para empezar. Responde en cualquier formato:

  **1. ¿Qué problema resuelve el producto, en una frase?**
       Ej: "Un SaaS para que equipos pequeños hagan retros sin Miro"

  **2. ¿Quiénes son los usuarios?**
       Ej: "Tech leads de equipos de 3-10 personas, agile"

  **3. ¿Tienes preferencia de stack o estamos abiertos?**
       Ej: "TypeScript todo si se puede" / "Node backend, Next frontend" / "abierto, recomiéndame"
```

**Espera respuesta. NO continúes hasta tener las 3.**

## Paso 2 — Segunda tanda (NFRs y constraints)

Una vez tengas problema + usuarios + stack-pref:

```
Vale, entendido. 4 preguntas más para afinar el stack y la infra:

  **4. ¿Dónde se va a hostear?**
       (a) cloud público (Vercel/Render/Fly/Cloudflare/AWS — yo elijo según el stack)
       (b) self-hosted / on-prem
       (c) prefiero <X>

  **5. ¿Multi-tenant, single-tenant, o uso personal?**

  **6. ¿Hay compliance que respetar desde día uno?**
       (GDPR / HIPAA / PCI / SOC2 / sector regulado / ninguno)

  **7. ¿Deadline aproximado para v1?**
       (semana / mes / "cuando esté")
```

**Espera respuesta. NO asumas defaults si el usuario no responde.**

## Paso 3 — Tercera tanda solo si hay ambigüedad clave

Si tras las 7 preguntas hay aún algo crítico sin resolver, pregúntalo en **una sola tanda más** (máx 3 preguntas):

- ¿Hay datos sensibles / PII?
- ¿Necesita real-time? offline-first? mobile-first?
- ¿Presupuesto operacional? (gratis hasta X usuarios / sin límite)

**Nunca pases de 3 tandas de preguntas.** Si después de eso aún hay huecos, los listas como "asunciones que voy a hacer" en el plan.

## Paso 4 — Discovery profundo con `requirements-analyst`

Con todas las respuestas, invoca `requirements-analyst` pasándole **el resumen estructurado** de lo respondido. Pídele que produzca:

- Casos de uso primarios priorizados
- NFRs concretos (latencia, escalabilidad, disponibilidad, seguridad)
- Modelo de dominio inicial (entidades, value objects)
- Ubiquitous language
- Open questions remanentes

## Paso 5 — Stack + arquitectura + datos + seguridad + infra (paralelo)

**Un solo turno, 4 Agent calls paralelas:**

- `software-architect` — propone stack justificado + estructura de carpetas + bounded contexts + contratos
- `database-engineer` — store primario + esquema inicial + estrategia de migraciones
- `security-engineer` — threat model día cero + modelo auth + datos sensibles + audit
- `devops-engineer` — hosting + CI desde commit 1 + observabilidad mínima + secrets strategy

## Paso 6 — MVP slice con `tech-lead`

Con todo lo anterior, `tech-lead` produce:

- El slice mínimo viable (la cosa más pequeña que entrega valor end-to-end)
- Work breakdown con especialista asignado
- Orden / paralelismo
- Definition of done del MVP

## Paso 7 — **Confirmación BLOQUEANTE** antes de escribir nada

Presenta TODO en un solo mensaje al usuario:

```
## Propuesta de proyecto

**Nombre sugerido:** <kebab-case>
**Stack:** <lenguaje + framework + storage + hosting>
**Estructura:** <bounded contexts identificados>

### MVP slice — esto es lo que voy a generar:
  • Estructura del repo con DDD layering
  • package.json/pyproject/etc con deps justificadas
  • CI desde commit 1 (.github/workflows/...)
  • .gitignore + .env.example (sin secretos reales)
  • README con el stack y cómo arrancar
  • Migraciones iniciales del esquema
  • Health endpoint + structured logging
  • Auth scaffolding (shape, no implementación)
  • Implementación del flow primario: <descripción>

### Decisiones que estoy haciendo (cámbiame si quieres):
  • <decisión 1> — razón
  • <decisión 2> — razón

### Aplazado a follow-ups (NO va al MVP):
  • <feature 1>
  • <feature 2>

### Asunciones:
  • <asunción 1>
  • <asunción 2>

¿Procedo a crear el proyecto? (sí / cámbiame X / cancela)
```

**No escribas un solo archivo hasta tener "sí" o equivalente.**

## Paso 8 — Scaffolding (post-aprobación)

Crea:

1. Estructura de carpetas según el architect
2. Manifiestos (package.json / pyproject.toml / Cargo.toml / etc) con deps mínimas
3. CI pipeline (.github/workflows/ci.yml o equivalente) verde desde commit 1
4. .gitignore, .env.example, README.md con instrucciones de arranque
5. Migraciones iniciales (database-engineer)
6. Health endpoint + structured logging (devops-engineer)
7. Auth scaffolding (shape) según security-engineer

Después delega:
- `backend-engineer` → use cases + domain + adapters
- `frontend-engineer` → UI del flow primario (si aplica)
- `qa-engineer` → tests críticos del slice

## Paso 9 — Review final

Antes de declarar "proyecto creado":
- `code-reviewer` review completo (el listón es alto — es el primer commit)
- `security-engineer` review del shape auth + datos sensibles
- `devops-engineer` verifica CI verde

## Paso 10 — Entrega

Resumen final:

```
✅ Proyecto creado en <path>

  • <N> archivos generados
  • CI status: <verde/pending>
  • Próximo paso recomendado: <qué hacer>
  • Comandos: `cd <dir> && <run command>`
```

## Si $ARGUMENTS llega no vacío

Trata el contenido como respuesta a la pregunta 1 del Paso 1 ("qué problema resuelve"). Después haz las preguntas restantes del Paso 1 y continúa.

## Reglas duras

- **NUNCA crees archivos sin la aprobación del Paso 7.** El usuario debe ver el plan completo antes.
- **NUNCA elijas stack por moda.** Cada elección se justifica contra los NFRs.
- **NO prometas features para "después" sin marcarlas como follow-ups explícitos.**
- **CI desde commit 1.** Si el pipeline no es verde al primer push, el proyecto ya nace con deuda.
- **Una tanda de preguntas a la vez.** No agobies al usuario con 12 preguntas al mismo tiempo.
- **Máximo 3 tandas de preguntas.** Si necesitas más, anota como asunciones y avanza.
