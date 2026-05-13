'use strict';

const fs = require('fs');
const path = require('path');

const { AGENT_NAMES, COMMAND_NAMES, TEAM_SOFTWARE_MARKER } = require('./scope');

const PKG_ROOT = path.resolve(__dirname, '..');
const TEMPLATES = path.join(PKG_ROOT, 'templates');
const AGENTS_TEMPLATE_DIR = path.join(TEMPLATES, 'agents');
const COMMANDS_TEMPLATE_DIR = path.join(TEMPLATES, 'commands');
const CLAUDE_MD_TEMPLATE = path.join(TEMPLATES, 'CLAUDE.md');

/**
 * Install team-software (agents + slash commands + optional CLAUDE.md) into the given scope.
 *
 * @param {object} opts
 * @param {{ name: 'user'|'project', agentsDir: string, commandsDir: string, claudeMdPath: string }} opts.scope
 * @param {boolean} opts.installClaudeMd
 * @param {boolean} opts.force                Overwrite existing files
 * @returns {{
 *   agentsCreated: string[],
 *   agentsSkipped: string[],
 *   commandsCreated: string[],
 *   commandsSkipped: string[],
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
