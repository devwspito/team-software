# team-software

Equipo de ingeniería de software de élite para [Claude Code](https://docs.claude.com/en/docs/agents/claude-code/overview). Instalable en un comando.

**11 agentes especializados · 6 slash commands interactivos · CLAUDE.md global de principios · memoria persistente.**

> **No negociables:** Security first · SOLID · DDD · SRP · Clean Code · Modularidad · Orquestación.

**v0.4.0:** Autonomía documentada por agente · TodoWrite disciplinado por pipeline · memoria de proyecto en `.claude/memory/` para handoff entre agentes y continuidad entre sesiones.

---

## TL;DR

```bash
# Equipo global (disponible en todos tus proyectos)
npx github:devwspito/team-software install

# Luego en Claude Code:
/team-feature "Quiero añadir login con magic link"
```

Eso es todo. El equipo orquesta automáticamente:
`requirements-analyst` extrae el contrato → `tech-lead` planifica → `software-architect` diseña → `security-engineer` threat-modela → `backend-engineer` / `frontend-engineer` implementan → `qa-engineer` valida → `code-reviewer` revisa → `devops-engineer` despliega.

---

## Instalación

### Opción A: npx (recomendado)

```bash
npx github:devwspito/team-software install                  # scope=user (global, ~/.claude/)
npx github:devwspito/team-software install --scope project  # solo este proyecto (./.claude/)
npx github:devwspito/team-software install --force          # sobrescribe lo existente
```

Si lo vas a usar mucho, alias en tu shell:

```bash
# ~/.zshrc o ~/.bashrc
alias team-software="npx github:devwspito/team-software"
```

### Opción B: Plugin nativo de Claude Code

Si tu Claude Code soporta plugins (>=2.0), también podés instalarlo como plugin clonando el repo y apuntando `.claude-plugin/plugin.json` desde tu plugin config.

---

## El equipo (11 agentes)

| Agente | Propósito |
|---|---|
| **requirements-analyst** | **PRIMERO.** Extrae goal, scope, acceptance criteria, constraints, edge cases, lenguaje ubicuo. Convierte ideas vagas en contratos testeables. |
| **tech-lead** | Descompone trabajo en plan de delegación contra el dossier. Identifica qué especialista hace qué. |
| **software-architect** | DDD, SOLID, contratos de módulos, capas hexagonales. Diseña — no implementa. |
| **security-engineer** | Threat modeling (STRIDE) + security review (OWASP/CWE). Proactivo en auth, input, secretos, cripto, I/O, PII. |
| **backend-engineer** | Implementación servidor con DDD/SOLID. APIs, casos de uso, integraciones, workers. |
| **frontend-engineer** | UI, accesibilidad (WCAG AA), performance (LCP/INP/CLS), seguridad cliente. |
| **database-engineer** | Esquema, migraciones (expand/contract), índices, integridad, query performance. |
| **qa-engineer** | Estrategia de test, coverage por comportamiento, TDD, regresión. |
| **devops-engineer** | CI/CD, contenedores, IaC, observabilidad (RED/USE), deploys progresivos. |
| **code-reviewer** | Review pre-merge enforcing SOLID, clean code, modularidad, smoke security. |
| **refactoring-specialist** | Refactor a comportamiento preservado bajo red de tests. Catálogo Fowler/Beck. |

Ver detalle:
```bash
npx github:devwspito/team-software list
```

---

## Slash commands (los activan en Claude Code)

| Command | Qué hace |
|---|---|
| `/team-create <visión>` | **Proyecto nuevo desde cero.** Discovery profundo (visión, personas, NFRs, restricciones) → elección de stack justificada → arquitectura inicial → MVP slice → scaffolding del repo con CI desde commit 1. Pregunta antes de generar código. |
| `/team-feature <descripción>` | Pipeline completo de feature sobre un proyecto existente: requirements → plan → design → impl → review → ship. Orquesta todos los especialistas en secuencia. |
| `/team-review [archivos]` | Review pre-merge — `code-reviewer` + `security-engineer` + `qa-engineer` en paralelo. Verdict consolidado. |
| `/team-refactor <target>` | Refactor seguro coordinado con red de tests verificada por `qa-engineer`. Two-phase change (Tidy First). |
| `/team-threat-model <feature>` | STRIDE threat modeling con `security-engineer`. Controles concretos y testeables. |
| `/team-ship <servicio>` | Production readiness check con `devops-engineer` + `security-engineer` antes de deploy. |

---

## Autonomía, TodoWrite y memoria (v0.4.0)

Tres mecanismos que hacen que el equipo trabaje sin ping-pong constante:

### Autonomía documentada

Cada agente tiene una sección "Autonomy rules" que define **cuándo decide solo y documenta** vs **cuándo escala**. Regla simple:

- **Decide y documenta** (sin preguntar): decisiones reversibles, internas, con default claro en el código.
- **Pregunta al usuario**: cambios irreversibles, contratos externos, postura de seguridad, dinero.
- **Escala a `tech-lead`** (no al usuario): el blueprint no cubre este caso, surgió trabajo nuevo, hay que re-secuenciar.

Resultado: menos preguntas triviales, movimiento productivo, control en lo que importa.

### TodoWrite disciplinado por pipeline

Los slash commands (`/team-feature`, `/team-create`, etc.) crean un `TodoWrite` con todas las fases al inicio y van marcando `completed` conforme avanzan. Beneficios:

- Ves el progreso real en cada momento sin tener que preguntar.
- Si interrumpes una sesión, al volver el thread principal tiene la lista y puede continuar.
- Los specialists tienen sus propios TodoWrites internos; el master vive en el thread principal.

### Memoria persistente — `.claude/memory/`

Estructura instalada en `.claude/memory/` (project) o `~/.claude/memory/` (user):

```
memory/
├── INDEX.md             # 1 línea por artefacto, newest first
├── PROTOCOL.md          # contrato detallado de uso
├── dossiers/            # output de requirements-analyst
├── plans/               # output de tech-lead
├── decisions/           # ADRs ligeros (arquitectura, refactor, ship)
├── threat-models/       # output de /team-threat-model (siempre se guarda)
└── artifacts/           # cualquier output reutilizable
```

**Cómo funciona:**

1. **Pre-flight de cada slash command:** el thread principal lee `INDEX.md`. Si hay artefactos relacionados (mismo slug/feature/tema), te avisa antes de la primera pregunta — puedes elegir reusar o empezar limpio.
2. **Handoff entre agentes:** el thread principal pasa al siguiente agente el output del anterior como input. Los agentes son **stateless** — no leen ni escriben memoria. Es el thread quien orquesta.
3. **Persistencia continua:** cada fase importante (dossier, plan, decisión, threat-model, refactor, review con findings) se guarda automáticamente con frontmatter trackeable.
4. **Continuidad entre sesiones:** si vuelves al día siguiente y corres `/team-feature` sobre lo mismo, detecta el trabajo previo y pregunta `¿continuamos donde lo dejamos?`.

**Lo que NO se guarda:** scratch work, intentos fallidos, secretos. Memory es para entregas, no para historial.

**Memory es commiteable al repo** (scope project). El equipo entero ve las decisiones tomadas. El uninstall **nunca** borra memoria — es trabajo del usuario.

---

## Workflow estándar (lo que hace `/team-feature` automáticamente)

```
1. requirements-analyst  →  dossier (goal, scope, AC, constraints, edge cases, open questions)
2. tech-lead             →  blueprint (tasks, especialistas, dependencias, secuencia)
3. software-architect    →  diseño de módulos (+ database-engineer si hay datos)
4. security-engineer     →  threat modeling si toca superficie sensible
5. backend / frontend    →  implementación (paralelizando lo independiente)
6. qa-engineer           →  estrategia y verificación de tests
7. code-reviewer         →  review pre-merge (+ security-engineer si aplica)
8. devops-engineer       →  deploy + observabilidad
```

Para tareas triviales (typo, una línea), salta el equipo — los principios se siguen aplicando vía el `CLAUDE.md`.

---

## Comandos CLI

```bash
npx github:devwspito/team-software install [--scope user|project] [--force] [--no-claude-md]
npx github:devwspito/team-software update  [--scope user|project] [--keep-claude-md]
npx github:devwspito/team-software status  [--scope user|project]
npx github:devwspito/team-software list
npx github:devwspito/team-software uninstall [--scope user|project] [--keep-claude-md] --yes
npx github:devwspito/team-software --version
npx github:devwspito/team-software help
```

> Con el alias `alias team-software="npx github:devwspito/team-software"` configurado, todos los comandos se simplifican a `team-software <subcomando>`.

### Scopes

| Scope | Dónde instala | Cuándo usarlo |
|---|---|---|
| `user` (default) | `~/.claude/agents/`<br>`~/.claude/commands/`<br>`~/.claude/CLAUDE.md` | Quieres el equipo en **todos** tus proyectos. |
| `project` | `./.claude/agents/`<br>`./.claude/commands/`<br>`./CLAUDE.md` | Solo para este proyecto. Commiteable al repo. |

### Update

Cuando salga una nueva versión del paquete (nuevos agentes, mejores prompts, fixes), corre:

```bash
npx github:devwspito/team-software update
```

- **Autodetecta el scope** en el que tienes la instalación (mira si `~/.claude/` o `./.claude/` tienen archivos del paquete).
- Si tienes instalado en **ambos** scopes (user y project), pide `--scope` explícito para evitar tocar el equivocado.
- `--keep-claude-md` actualiza solo agentes y commands, preservando tu `CLAUDE.md` si lo has customizado.
- Idempotente. Lo puedes correr cuantas veces quieras.

`npx` siempre clona/cachea la última versión del repo, así que `update` siempre te trae lo más reciente sin que tengas que recordar versiones.

### Opciones de install

- `--force` — Sobrescribe agentes, commands o CLAUDE.md existentes. (Para refresh manual; en lugar de `--force` usa `update`.)
- `--no-claude-md` (alias `--agents-only`) — Solo instala agentes y commands.
- En `uninstall`: `--keep-claude-md` para no tocar el CLAUDE.md. El uninstall solo elimina CLAUDE.md si lleva el marcador `team-software:managed`.

---

## Principios (qué codifica el `CLAUDE.md`)

1. **Security first** — threat-modelar fronteras de confianza, validar input, nunca confiar en datos del cliente, jamás secretos en código/logs/URLs.
2. **SOLID** — aplicado a módulo, clase y función.
3. **DDD** — modelo de dominio primero, lenguaje ubicuo, capas (Domain → Application → Infrastructure → Presentation), aggregates con invariantes.
4. **SRP** — una razón para cambiar; si hace "X *y* Y", se parte.
5. **Clean Code** — nombres revelan intención, funciones cortas (<20 líneas objetivo), sin magic numbers, sin código muerto.
6. **Modularidad** — alta cohesión, bajo acoplamiento, dependencias acíclicas.
7. **Orquestación** — coordinación explícita, observable, retryable, idempotente.

Reglas duras (no `--no-verify`, no ciclos, no PII en logs, etc.) en el `CLAUDE.md` instalado.

---

## Diseño técnico

- **Sin dependencias.** Solo stdlib de Node ≥18.
- **Idempotente.** `install` sin `--force` no toca lo que ya existe.
- **Reversible.** `uninstall` elimina solo los archivos managed.
- **Plantillas estáticas.** No hay templating en runtime — los agentes se copian tal cual.
- **Scope strict.** `user` ≠ `project`: nunca tocamos archivos del otro scope.

### Optimización de tokens

Los prompts de los agentes están comprimidos para reducir consumo en cada invocación, **manteniendo intactos** los checklists técnicos (CWE, OWASP, refactoring catalog, RED/USE metrics, patrones de migración expand/contract, WCAG, etc.) — que son el contenido de alto valor por token. Lo que se eliminó es la repetición ceremonial: los 7 principios se referencian en cada agente como cabecera tight en vez de restatement completo, y el framing verbose ("at FAANG quality with deep expertise in…") se redujo a la mínima identidad útil.

### Estructura del repo

```
team-software/
├── bin/team-software.js          # CLI
├── lib/
│   ├── index.js                  # re-exports
│   ├── scope.js                  # scope resolution + listas de agents/commands/memory-subdirs
│   ├── install.js                # copia plantillas + scaffolding memory
│   ├── update.js                 # actualiza managed sin tocar memory
│   ├── status.js                 # qué hay instalado + memory ready/count
│   ├── uninstall.js              # elimina managed, preserva memory
│   └── agent-meta.js             # metadata para `list`
├── templates/
│   ├── CLAUDE.md                 # principios + autonomy + memory protocol
│   ├── agents/                   # 11 prompts especializados (con autonomy rules)
│   ├── commands/                 # 6 slash commands interactivos (con todo + memory I/O)
│   └── memory/
│       ├── INDEX.md              # plantilla inicial
│       └── PROTOCOL.md           # contrato de uso de memoria
├── .claude-plugin/
│   └── plugin.json               # manifest para plugin nativo
└── package.json
```

---

## Inspiración

Diseño inspirado en:
- [libroforge](https://github.com/devwspito/libroforge) — patrón npx scaffolding + scope user/project
- [ruflo / claude-flow](https://github.com/ruvnet/ruflo) — plugin manifest + slash commands para orquestación

team-software toma de ambos lo esencial y se queda en flat structure + 5 comandos. Sin MCP, sin neural training, sin swarm consensus. Un equipo de software profesional, no una constelación.

---

## Licencia

MIT
