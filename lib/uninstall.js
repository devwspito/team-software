'use strict';

const fs = require('fs');
const path = require('path');

const { AGENT_NAMES, COMMAND_NAMES, TEAM_SOFTWARE_MARKER } = require('./scope');

/**
 * Remove team-software agents + slash commands from the given scope. Optionally
 * remove CLAUDE.md only if it was installed by team-software (carries the marker).
 *
 * **Memory is never removed.** The `.claude/memory/` directory contains user
 * data (dossiers, plans, decisions, threat models) and is preserved across
 * uninstalls.
 *
 * @param {object} opts
 * @param {{ name: 'user'|'project', agentsDir: string, commandsDir: string, memoryDir: string, claudeMdPath: string }} opts.scope
 * @param {boolean} opts.removeClaudeMd
 * @returns {{ agentsRemoved: string[], commandsRemoved: string[], claudeMdRemoved: boolean, memoryPreservedAt: string|null }}
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
  if (removeClaudeMd && fs.existsSync(scope.claudeMdPath)) {
    try {
      const content = fs.readFileSync(scope.claudeMdPath, 'utf8');
      if (content.includes(TEAM_SOFTWARE_MARKER)) {
        fs.unlinkSync(scope.claudeMdPath);
        claudeMdRemoved = true;
      }
    } catch {
      // ignore
    }
  }

  const memoryPreservedAt = fs.existsSync(scope.memoryDir) ? scope.memoryDir : null;

  return { agentsRemoved, commandsRemoved, claudeMdRemoved, memoryPreservedAt };
}

module.exports = { uninstall };
