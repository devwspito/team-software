'use strict';

const fs = require('fs');
const path = require('path');

const { AGENT_NAMES, COMMAND_NAMES, TEAM_SOFTWARE_MARKER } = require('./scope');

/**
 * Report which team-software pieces are installed in the given scope.
 *
 * @param {object} opts
 * @param {{ name: 'user'|'project', agentsDir: string, commandsDir: string, claudeMdPath: string }} opts.scope
 * @returns {{
 *   agentsInstalled: string[],
 *   agentsMissing: string[],
 *   commandsInstalled: string[],
 *   commandsMissing: string[],
 *   claudeMdInstalled: boolean,
 *   claudeMdExists: boolean,
 * }}
 */
function status(opts) {
  const { scope } = opts;
  const agentsInstalled = [];
  const agentsMissing = [];
  for (const name of AGENT_NAMES) {
    const p = path.join(scope.agentsDir, `${name}.md`);
    if (fs.existsSync(p)) agentsInstalled.push(name);
    else agentsMissing.push(name);
  }

  const commandsInstalled = [];
  const commandsMissing = [];
  for (const name of COMMAND_NAMES) {
    const p = path.join(scope.commandsDir, `${name}.md`);
    if (fs.existsSync(p)) commandsInstalled.push(name);
    else commandsMissing.push(name);
  }

  const claudeMdExists = fs.existsSync(scope.claudeMdPath);
  let claudeMdInstalled = false;
  if (claudeMdExists) {
    try {
      const content = fs.readFileSync(scope.claudeMdPath, 'utf8');
      claudeMdInstalled = content.includes(TEAM_SOFTWARE_MARKER);
    } catch {
      claudeMdInstalled = false;
    }
  }

  return {
    agentsInstalled,
    agentsMissing,
    commandsInstalled,
    commandsMissing,
    claudeMdInstalled,
    claudeMdExists,
  };
}

module.exports = { status };
