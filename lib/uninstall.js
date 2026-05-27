'use strict';

const fs = require('fs');
const path = require('path');

const { AGENT_NAMES, COMMAND_NAMES, SPECIFY_TEMPLATE_NAMES, TEAM_SOFTWARE_MARKER } = require('./scope');
const { ensureMarker, CLAUDE_MD_TEMPLATE } = require('./install');

/**
 * Remove team-software agents + slash commands from the given scope. Optionally
 * remove CLAUDE.md — but only if it is the pristine team-software file
 * (byte-for-byte equal to the shipped template). If the user customized their
 * CLAUDE.md (even while keeping the marker), it is preserved, not deleted.
 *
 * Memory and SDD user data are never removed: `.claude/memory/` (cross-cutting
 * artifacts), `.specify/memory/constitution.md`, and `specs/NNN-...` directories
 * (per-project SDD output) are user data and preserved across uninstalls. Only
 * the SDD templates shipped at `.specify/templates/...` are removed
 * (they are reinstallable).
 *
 * @param {object} opts
 * @param {{ name: 'user'|'project', agentsDir: string, commandsDir: string, memoryDir: string, specifyDir: string, claudeMdPath: string }} opts.scope
 * @param {boolean} opts.removeClaudeMd
 * @returns {{
 *   agentsRemoved: string[],
 *   commandsRemoved: string[],
 *   specifyTemplatesRemoved: string[],
 *   claudeMdRemoved: boolean,
 *   claudeMdPreserved: boolean,
 *   memoryPreservedAt: string|null,
 *   specifyPreservedAt: string|null,
 * }}
 */
function uninstall(opts) {
  const { scope, removeClaudeMd } = opts;
  const agentsRemoved = [];
  for (const name of AGENT_NAMES) {
    const p = path.join(scope.agentsDir, `${name}.md`);
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
      agentsRemoved.push(p);
    }
  }

  const commandsRemoved = [];
  for (const name of COMMAND_NAMES) {
    const p = path.join(scope.commandsDir, `${name}.md`);
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
      commandsRemoved.push(p);
    }
  }

  // SDD templates removed — but the user's constitution.md (project) and any
  // generated specs/ are USER DATA and must be preserved.
  const specifyTemplatesRemoved = [];
  const specifyTemplatesDir = path.join(scope.specifyDir, 'templates');
  if (fs.existsSync(specifyTemplatesDir)) {
    for (const name of SPECIFY_TEMPLATE_NAMES) {
      const p = path.join(specifyTemplatesDir, `${name}.md`);
      if (fs.existsSync(p)) {
        fs.unlinkSync(p);
        specifyTemplatesRemoved.push(p);
      }
    }
    // Remove templates/ dir only if empty
    try {
      const remaining = fs.readdirSync(specifyTemplatesDir);
      if (remaining.length === 0) fs.rmdirSync(specifyTemplatesDir);
    } catch { /* ignore */ }
  }

  let claudeMdRemoved = false;
  let claudeMdPreserved = false;
  if (removeClaudeMd && fs.existsSync(scope.claudeMdPath)) {
    try {
      const content = fs.readFileSync(scope.claudeMdPath, 'utf8');
      if (content.includes(TEAM_SOFTWARE_MARKER)) {
        // Delete only if it is the unmodified team-software file. A customized
        // CLAUDE.md that still carries the marker is the user's — preserve it.
        const pristine = ensureMarker(fs.readFileSync(CLAUDE_MD_TEMPLATE, 'utf8'));
        if (content === pristine) {
          fs.unlinkSync(scope.claudeMdPath);
          claudeMdRemoved = true;
        } else {
          claudeMdPreserved = true;
        }
      }
    } catch {
      // ignore
    }
  }

  const memoryPreservedAt = fs.existsSync(scope.memoryDir) ? scope.memoryDir : null;
  // Project constitution + generated specs/ are user data — never touched by uninstall.
  const specifyPreservedAt = fs.existsSync(scope.specifyDir) ? scope.specifyDir : null;

  return { agentsRemoved, commandsRemoved, specifyTemplatesRemoved, claudeMdRemoved, claudeMdPreserved, memoryPreservedAt, specifyPreservedAt };
}

module.exports = { uninstall };
