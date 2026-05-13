'use strict';

const fs = require('fs');
const path = require('path');

const { AGENT_NAMES, COMMAND_NAMES, MEMORY_SUBDIRS, TEAM_SOFTWARE_MARKER } = require('./scope');

const PKG_ROOT = path.resolve(__dirname, '..');
const TEMPLATES = path.join(PKG_ROOT, 'templates');
const AGENTS_TEMPLATE_DIR = path.join(TEMPLATES, 'agents');
const COMMANDS_TEMPLATE_DIR = path.join(TEMPLATES, 'commands');
const MEMORY_TEMPLATE_DIR = path.join(TEMPLATES, 'memory');
const CLAUDE_MD_TEMPLATE = path.join(TEMPLATES, 'CLAUDE.md');

/**
 * Install team-software (agents + slash commands + memory scaffold + optional CLAUDE.md).
 *
 * Memory scaffold: creates `memory/` with INDEX.md, PROTOCOL.md, and subdirectories
 * (dossiers, plans, decisions, threat-models, artifacts). INDEX.md is never
 * overwritten (it's user data); PROTOCOL.md is refreshed on --force.
 *
 * @param {object} opts
 * @param {{ name: 'user'|'project', agentsDir: string, commandsDir: string, memoryDir: string, claudeMdPath: string }} opts.scope
 * @param {boolean} opts.installClaudeMd
 * @param {boolean} opts.force                Overwrite existing managed files (NOT memory data)
 * @returns {{
 *   agentsCreated: string[],
 *   agentsSkipped: string[],
 *   commandsCreated: string[],
 *   commandsSkipped: string[],
 *   memoryScaffolded: boolean,
 *   memoryAlreadyExisted: boolean,
 *   claudeMdCreated: boolean,
 *   claudeMdSkipped: boolean,
 * }}
 */
function install(opts) {
  const { scope, installClaudeMd, force } = opts;

  fs.mkdirSync(scope.agentsDir, { recursive: true });
  fs.mkdirSync(scope.commandsDir, { recursive: true });

  const agentsCreated = [];
  const agentsSkipped = [];
  for (const name of AGENT_NAMES) {
    const srcFile = path.join(AGENTS_TEMPLATE_DIR, `${name}.md`);
    const dstFile = path.join(scope.agentsDir, `${name}.md`);
    if (!fs.existsSync(srcFile)) {
      throw new Error(`template agent missing: ${srcFile}`);
    }
    if (fs.existsSync(dstFile) && !force) {
      agentsSkipped.push(dstFile);
      continue;
    }
    fs.copyFileSync(srcFile, dstFile);
    agentsCreated.push(dstFile);
  }

  const commandsCreated = [];
  const commandsSkipped = [];
  for (const name of COMMAND_NAMES) {
    const srcFile = path.join(COMMANDS_TEMPLATE_DIR, `${name}.md`);
    const dstFile = path.join(scope.commandsDir, `${name}.md`);
    if (!fs.existsSync(srcFile)) {
      throw new Error(`template command missing: ${srcFile}`);
    }
    if (fs.existsSync(dstFile) && !force) {
      commandsSkipped.push(dstFile);
      continue;
    }
    fs.copyFileSync(srcFile, dstFile);
    commandsCreated.push(dstFile);
  }

  // Memory scaffold
  const memoryAlreadyExisted = fs.existsSync(scope.memoryDir);
  fs.mkdirSync(scope.memoryDir, { recursive: true });
  for (const sub of MEMORY_SUBDIRS) {
    fs.mkdirSync(path.join(scope.memoryDir, sub), { recursive: true });
  }
  // INDEX.md: never overwrite (user data)
  const indexDst = path.join(scope.memoryDir, 'INDEX.md');
  if (!fs.existsSync(indexDst)) {
    const indexSrc = path.join(MEMORY_TEMPLATE_DIR, 'INDEX.md');
    fs.copyFileSync(indexSrc, indexDst);
  }
  // PROTOCOL.md: refresh on force, otherwise leave alone
  const protocolDst = path.join(scope.memoryDir, 'PROTOCOL.md');
  const protocolSrc = path.join(MEMORY_TEMPLATE_DIR, 'PROTOCOL.md');
  if (!fs.existsSync(protocolDst) || force) {
    fs.copyFileSync(protocolSrc, protocolDst);
  }
  const memoryScaffolded = !memoryAlreadyExisted || !fs.existsSync(indexDst);

  let claudeMdCreated = false;
  let claudeMdSkipped = false;
  if (installClaudeMd) {
    if (!fs.existsSync(CLAUDE_MD_TEMPLATE)) {
      throw new Error(`template CLAUDE.md missing: ${CLAUDE_MD_TEMPLATE}`);
    }
    const exists = fs.existsSync(scope.claudeMdPath);
    if (exists && !force) {
      claudeMdSkipped = true;
    } else {
      const raw = fs.readFileSync(CLAUDE_MD_TEMPLATE, 'utf8');
      const tagged = ensureMarker(raw);
      fs.mkdirSync(path.dirname(scope.claudeMdPath), { recursive: true });
      fs.writeFileSync(scope.claudeMdPath, tagged, 'utf8');
      claudeMdCreated = true;
    }
  }

  return {
    agentsCreated,
    agentsSkipped,
    commandsCreated,
    commandsSkipped,
    memoryScaffolded,
    memoryAlreadyExisted,
    claudeMdCreated,
    claudeMdSkipped,
  };
}

function ensureMarker(content) {
  if (content.includes(TEAM_SOFTWARE_MARKER)) return content;
  const trimmed = content.endsWith('\n') ? content : content + '\n';
  return trimmed + '\n' + TEAM_SOFTWARE_MARKER + '\n';
}

module.exports = { install };
