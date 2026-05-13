#!/usr/bin/env node
'use strict';

const path = require('path');

const { install } = require('../lib/install');
const { update } = require('../lib/update');
const { status } = require('../lib/status');
const { uninstall } = require('../lib/uninstall');
const { resolveScope, AGENT_NAMES, COMMAND_NAMES } = require('../lib/scope');
const { checkRemoteVersion, compareVersions } = require('../lib/version-check');

const PKG = require('../package.json');

async function main(argv) {
  const args = argv.slice(2);
  const cmd = args[0];

  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') return cmdHelp();
  if (cmd === '--version' || cmd === '-v') return cmdVersion();

  switch (cmd) {
    case 'install':
      return cmdInstall(args.slice(1));
    case 'update':
    case 'upgrade':
      return cmdUpdate(args.slice(1));
    case 'status':
      return cmdStatus(args.slice(1));
    case 'list':
      return cmdList(args.slice(1));
    case 'uninstall':
      return cmdUninstall(args.slice(1));
    default:
      console.error(`team-software: comando desconocido "${cmd}". Ejecuta "team-software help".`);
      process.exit(2);
  }
}

function cmdHelp() {
  console.log(`team-software ${PKG.version}

Equipo de ingeniería de software de élite (${AGENT_NAMES.length} agentes + ${COMMAND_NAMES.length} slash commands) para Claude Code.
Principios: Security first · SOLID · DDD · SRP · Clean Code · Modularidad · Orquestación.

USO
  npx github:devwspito/team-software <comando> [opciones]

COMANDOS
  install                   Instala equipo + slash commands + CLAUDE.md global.
    --scope <user|project>    user (default): ~/.claude/  |  project: ./.claude/
    --force                   Sobrescribir archivos existentes
    --no-claude-md            No instalar CLAUDE.md (solo agentes + commands)
    --agents-only             Alias de --no-claude-md

  update                    Asegura la última versión. Si ya hay instalación,
                            la refresca. Si no, instala fresh (scope=user por
                            defecto, o el indicado con --scope). Avisa si tu
                            npx tiene una versión cacheada vieja.
    --scope <user|project>    fuerza el scope (default: detectar / user)
    --keep-claude-md          no tocar CLAUDE.md (preserva customizaciones)

  status                    Muestra qué partes están instaladas.
    --scope <user|project>    (default: user)

  list                      Lista los agentes y slash commands del equipo.

  uninstall                 Elimina lo instalado por team-software.
    --scope <user|project>    (default: user)
    --keep-claude-md          No tocar CLAUDE.md
    --yes                     Confirmación obligatoria

  --version | -v            Muestra versión
  help                      Esta ayuda

SLASH COMMANDS (después de install, dentro de Claude Code)
  /team-create <visión>           Proyecto nuevo desde cero: visión → stack → scaffolding → MVP slice
  /team-feature <descripción>     Pipeline completo: discovery → plan → design → impl → review → ship
  /team-review [archivos]         Pre-merge: code-reviewer + security-engineer + qa-engineer (paralelo)
  /team-refactor <target>         Refactor seguro con red de tests
  /team-threat-model <feature>    STRIDE threat modeling
  /team-ship <servicio>           Production readiness check
  /team-ux-audit <target>         Audit UI/UX — ux-researcher + interaction + visual + a11y + content

EJEMPLOS
  npx github:devwspito/team-software install                       # equipo global (~/.claude/)
  npx github:devwspito/team-software install --scope project       # solo este proyecto (./.claude/)
  npx github:devwspito/team-software update                        # actualiza a la última versión del paquete
  npx github:devwspito/team-software update --keep-claude-md       # actualiza agentes y commands, conserva CLAUDE.md
  npx github:devwspito/team-software status
  npx github:devwspito/team-software list
  npx github:devwspito/team-software uninstall --scope project --yes

DOCUMENTACIÓN
  https://github.com/devwspito/team-software
`);
}

function cmdVersion() {
  console.log(PKG.version);
}

function cmdInstall(args) {
  const opts = parseFlags(args, {
    string: ['scope'],
    boolean: ['force', 'no-claude-md', 'agents-only'],
  });
  const scope = resolveScope(opts.scope);
  const installClaudeMd = !(opts['no-claude-md'] || opts['agents-only']);
  const force = !!opts.force;

  console.log(`> Instalando team-software en scope=${scope.name}`);
  console.log(`  agentes:  ${scope.agentsDir}`);
  console.log(`  commands: ${scope.commandsDir}`);
  console.log(`  memory:   ${scope.memoryDir}`);
  if (installClaudeMd) console.log(`  CLAUDE.md: ${scope.claudeMdPath}`);
  console.log('');

  const result = install({ scope, installClaudeMd, force });

  console.log(`✓ Agentes creados:  ${result.agentsCreated.length}/${AGENT_NAMES.length}`);
  if (result.agentsSkipped.length) {
    console.log(`  saltados: ${result.agentsSkipped.length} (ya existían — usa --force)`);
  }
  console.log(`✓ Commands creados: ${result.commandsCreated.length}/${COMMAND_NAMES.length}`);
  if (result.commandsSkipped.length) {
    console.log(`  saltados: ${result.commandsSkipped.length} (ya existían — usa --force)`);
  }
  if (result.memoryAlreadyExisted) {
    console.log(`· Memory preservado (artefactos existentes intactos)`);
  } else {
    console.log(`✓ Memory inicializado (INDEX.md + PROTOCOL.md + subdirs)`);
  }
  if (installClaudeMd) {
    if (result.claudeMdCreated) console.log(`✓ CLAUDE.md instalado`);
    else if (result.claudeMdSkipped) console.log(`· CLAUDE.md saltado (ya existía — usa --force)`);
  }
  console.log('');
  console.log('Siguientes pasos:');
  if (scope.name === 'project') {
    console.log('  Abre Claude Code en este proyecto.');
    console.log('  Agentes y slash commands están disponibles automáticamente.');
  } else {
    console.log('  Disponibles en cualquier proyecto que abras con Claude Code.');
  }
  console.log('  Prueba: /team-feature "describe tu feature aquí"');
}

async function cmdUpdate(args) {
  const opts = parseFlags(args, {
    string: ['scope'],
    boolean: ['keep-claude-md'],
  });

  // Best-effort: warn if running a stale npx cache before doing anything.
  const remoteVersion = await checkRemoteVersion();
  if (remoteVersion && compareVersions(PKG.version, remoteVersion) < 0) {
    console.error('');
    console.error(`⚠ Tu instalación de team-software está corriendo v${PKG.version}, pero GitHub main está en v${remoteVersion}.`);
    console.error('  Probablemente tu npx tiene una versión vieja en cache. Para forzar latest:');
    console.error('');
    console.error('    npx -y github:devwspito/team-software#main update');
    console.error('');
    console.error('  (el `#main` invalida el cache de npx)');
    console.error('  Continúo con la versión local, pero los nuevos features no van a aparecer.');
    console.error('');
  }

  let result;
  try {
    result = update({
      scope: opts.scope,
      keepClaudeMd: !!opts['keep-claude-md'],
    });
  } catch (e) {
    console.error(`team-software: ${e.message}`);
    process.exit(2);
  }

  const sc = resolveScope(result.scope.name);
  const action = result.isFreshInstall ? 'Instalando' : 'Actualizando';
  console.log(`> ${action} team-software (scope=${result.scope.name})`);
  if (result.isFreshInstall) {
    console.log(`  (sin instalación previa detectada — instalando fresh)`);
  }
  console.log(`  agentes:  ${sc.agentsDir}`);
  console.log(`  commands: ${sc.commandsDir}`);
  console.log(`  memory:   ${sc.memoryDir}`);
  if (!opts['keep-claude-md']) console.log(`  CLAUDE.md: ${sc.claudeMdPath}`);
  console.log('');
  const label = result.isFreshInstall ? 'creados' : 'actualizados';
  console.log(`✓ Agentes ${label}:  ${result.agentsRefreshed}/${AGENT_NAMES.length}`);
  console.log(`✓ Commands ${label}: ${result.commandsRefreshed}/${COMMAND_NAMES.length}`);
  if (opts['keep-claude-md']) {
    console.log(`· CLAUDE.md preservado (--keep-claude-md)`);
  } else if (result.claudeMdRefreshed) {
    console.log(`✓ CLAUDE.md ${label}`);
  }
  console.log('');
  console.log(`Versión del paquete: ${PKG.version}`);
  if (result.isFreshInstall) {
    if (result.scope.name === 'project') {
      console.log('Siguiente paso: abre Claude Code en este proyecto.');
    } else {
      console.log('Siguiente paso: disponible en cualquier proyecto. Prueba: /team-feature');
    }
  }
}

function cmdStatus(args) {
  const opts = parseFlags(args, { string: ['scope'] });
  const scope = resolveScope(opts.scope);
  const s = status({ scope });

  console.log(`team-software status (scope=${scope.name})\n`);
  console.log(`  ${s.claudeMdInstalled ? '✓' : '·'} CLAUDE.md  (${scope.claudeMdPath})`);
  console.log(`  ${s.memoryReady ? '✓' : '·'} memory     (${scope.memoryDir}) — ${s.memoryArtifactCount} artefactos`);
  console.log('');
  console.log(`  agentes (${s.agentsInstalled.length}/${AGENT_NAMES.length}):`);
  for (const name of AGENT_NAMES) {
    const ok = s.agentsInstalled.includes(name);
    console.log(`    ${ok ? '✓' : '·'} ${name}`);
  }
  console.log('');
  console.log(`  slash commands (${s.commandsInstalled.length}/${COMMAND_NAMES.length}):`);
  for (const name of COMMAND_NAMES) {
    const ok = s.commandsInstalled.includes(name);
    console.log(`    ${ok ? '✓' : '·'} /${name}`);
  }
  const missing = s.agentsMissing.length + s.commandsMissing.length;
  if (missing > 0 || !s.memoryReady) {
    console.log('');
    console.log(`  → corre: npx github:devwspito/team-software install --scope ${scope.name}`);
  }
  process.exit(missing === 0 && s.memoryReady ? 0 : 1);
}

function cmdList() {
  const META = require('../lib/agent-meta');
  console.log(`team-software v${PKG.version}\n`);
  console.log(`AGENTES (${META.length}):\n`);
  for (const a of META) {
    console.log(`  ${a.name.padEnd(24)} ${a.tagline}`);
    console.log(`    ${a.when}`);
    console.log('');
  }
  console.log(`SLASH COMMANDS (${COMMAND_NAMES.length}):\n`);
  const cmdDesc = {
    'team-create': 'Proyecto nuevo desde cero: visión → stack → scaffolding → MVP slice',
    'team-feature': 'Pipeline completo: discovery → plan → design → impl → review → ship',
    'team-review': 'Pre-merge: code-reviewer + security-engineer + qa-engineer (paralelo)',
    'team-refactor': 'Refactor seguro coordinado bajo red de tests',
    'team-threat-model': 'STRIDE threat modeling de una feature',
    'team-ship': 'Production readiness check antes de deploy',
    'team-ux-audit': 'Audit UI/UX — diagnostica, prescribe arreglos, implementa',
  };
  for (const c of COMMAND_NAMES) {
    console.log(`  /${c.padEnd(22)} ${cmdDesc[c] || ''}`);
  }
}

function cmdUninstall(args) {
  const opts = parseFlags(args, {
    string: ['scope'],
    boolean: ['keep-claude-md', 'yes'],
  });
  const scope = resolveScope(opts.scope);
  const removeClaudeMd = !opts['keep-claude-md'];

  console.log(`> Desinstalando team-software (scope=${scope.name})`);
  console.log(`  agentes:   ${scope.agentsDir}`);
  console.log(`  commands:  ${scope.commandsDir}`);
  if (removeClaudeMd) console.log(`  CLAUDE.md: ${scope.claudeMdPath} (solo si lleva marcador team-software)`);
  console.log(`  memory:    ${scope.memoryDir} (PRESERVADO — uninstall no toca artefactos)`);
  console.log('');

  if (!opts.yes) {
    console.error('Confirma con --yes para proceder. Cancelado.');
    process.exit(1);
  }

  const result = uninstall({ scope, removeClaudeMd });
  console.log(`✓ Agentes eliminados:  ${result.agentsRemoved.length}`);
  console.log(`✓ Commands eliminados: ${result.commandsRemoved.length}`);
  if (result.claudeMdRemoved) console.log(`✓ CLAUDE.md eliminado`);
  else if (removeClaudeMd) console.log(`· CLAUDE.md no se tocó (no presente o sin marcador team-software)`);
  if (result.memoryPreservedAt) {
    console.log(`· memory preservado: ${result.memoryPreservedAt}`);
    console.log(`  (si quieres eliminarla manualmente: rm -rf "${result.memoryPreservedAt}")`);
  }
}

function parseFlags(args, schema) {
  const out = { _: [] };
  const stringFlags = new Set(schema.string || []);
  const numberFlags = new Set(schema.number || []);
  const boolFlags = new Set(schema.boolean || []);
  let i = 0;
  while (i < args.length) {
    const a = args[i];
    if (a.startsWith('--')) {
      const name = a.slice(2);
      if (boolFlags.has(name)) {
        out[name] = true;
        i += 1;
        continue;
      }
      if (stringFlags.has(name) || numberFlags.has(name)) {
        const value = args[i + 1];
        if (value === undefined) die(`flag --${name} requiere un valor`);
        out[name] = numberFlags.has(name) ? Number(value) : value;
        i += 2;
        continue;
      }
      die(`flag desconocido: --${name}`);
    } else {
      out._.push(a);
      i += 1;
    }
  }
  return out;
}

function die(msg) {
  console.error(`team-software: ${msg}`);
  process.exit(2);
}

main(process.argv).catch((err) => {
  console.error(`team-software: ${err && err.message ? err.message : err}`);
  process.exit(2);
});
