'use strict';

const fs = require('fs');
const path = require('path');

const { AGENT_NAMES, COMMAND_NAMES, TEAM_SOFTWARE_MARKER } = require('./scope');

/**
 * Remove team-software agents + slash commands from the given scope. Optionally
 * remove CLAUDE.md only if it was installed by team-software (carries the marker).
 *
 * @param {object} opts
 * @param {{ name: 'user'|'project', agentsDir: string, commandsDir: string, claudeMdPath: string }} opts.scope
 * @param {boolean} opts.removeClaudeMd
 * @returns {{ agentsRemoved: string[], commandsRemoved: string[], claudeMdRemoved: boolean }}
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

  return { agentsRemoved, commandsRemoved, claudeMdRemoved };
}

module.exports = { uninstall };
