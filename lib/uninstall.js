'use strict';

const fs = require('fs');
const path = require('path');

const { AGENT_NAMES, COMMAND_NAMES, TEAM_SOFTWARE_MARKER } = require('./scope');
const { ensureMarker, CLAUDE_MD_TEMPLATE } = require('./install');

/**
 * Remove team-software agents + slash commands from the given scope. Optionally
 * remove CLAUDE.md — but only if it is the pristine team-software file
 * (byte-for-byte equal to the shipped template). If the user customized their
 * CLAUDE.md (even while keeping the marker), it is preserved, not deleted.
 *
 * **Memory is never removed.** The `.claude/memory/` directory contains user
 * data (dossiers, plans, decisions, threat models) and is preserved across
 * uninstalls.
 *
 * @param {object} opts
 * @param {{ name: 'user'|'project', agentsDir: string, commandsDir: string, memoryDir: string, claudeMdPath: string }} opts.scope
 * @param {boolean} opts.removeClaudeMd
 * @returns {{
 *   agentsRemoved: string[],
 *   commandsRemoved: string[],
 *   claudeMdRemoved: boolean,
 *   claudeMdPreserved: boolean,
 *   memoryPreservedAt: string|null,
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

  return { agentsRemoved, commandsRemoved, claudeMdRemoved, claudeMdPreserved, memoryPreservedAt };
}

module.exports = { uninstall };
