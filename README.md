# team-software

Equipo de ingeniería de software de élite para [Claude Code](https://docs.claude.com/en/docs/agents/claude-code/overview). Instalable en un comando.

**11 agentes especializados + 5 slash commands + CLAUDE.md global de principios.**

> **No negociables:** Security first · SOLID · DDD · SRP · Clean Code · Modularidad · Orquestación.

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
| `/team-feature <descripción>` | Pipeline completo de feature: requirements → plan → design → impl → review → ship. Orquesta todos los especialistas en secuencia. |
| `/team-review [archivos]` | Review pre-merge — `code-reviewer` + `security-engineer` + `qa-engineer` en paralelo. Verdict consolidado. |
| `/team-refactor <target>` | Refactor seguro coordinado con red de tests verificada por `qa-engineer`. Two-phase change (Tidy First). |
| `/team-threat-model <feature>` | STRIDE threat modeling con `security-engineer`. Controles concretos y testeables. |
| `/team-ship <servicio>` | Production readiness check con `devops-engineer` + `security-engineer` antes de deploy. |

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

### Opciones de install

- `--force` — Sobrescribe agentes, commands o CLAUDE.md existentes.
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
│   ├── scope.js                  # scope resolution + agent/command lists
│   ├── install.js                # copia plantillas
│   ├── status.js                 # qué hay instalado
│   ├── uninstall.js              # elimina managed
│   └── agent-meta.js             # metadata para `list`
├── templates/
│   ├── CLAUDE.md                 # principios globales
│   ├── agents/                   # 11 prompts especializados
│   └── commands/                 # 5 slash commands
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
