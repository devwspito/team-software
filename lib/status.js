'use strict';

const fs = require('fs');
const path = require('path');

const { AGENT_NAMES, COMMAND_NAMES, MEMORY_SUBDIRS, TEAM_SOFTWARE_MARKER } = require('./scope');

/**
 * Report which team-software pieces are installed in the given scope.
 *
 * @param {object} opts
 * @param {{ name: 'user'|'project', agentsDir: string, commandsDir: string, memoryDir: string, claudeMdPath: string }} opts.scope
 * @returns {{
 *   agentsInstalled: string[],
 *   agentsMissing: string[],
 *   commandsInstalled: string[],
 *   commandsMissing: string[],
 *   memoryReady: boolean,
 *   memoryArtifactCount: number,
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

  const indexPath = path.join(scope.memoryDir, 'INDEX.md');
  const protocolPath = path.join(scope.memoryDir, 'PROTOCOL.md');
  const memoryReady = fs.existsSync(indexPath) && fs.existsSync(protocolPath);
  let memoryArtifactCount = 0;
  if (fs.existsSync(scope.memoryDir)) {
    for (const sub of MEMORY_SUBDIRS) {
      const subDir = path.join(scope.memoryDir, sub);
      if (fs.existsSync(subDir)) {
        try {
          const entries = fs.readdirSync(subDir);
          memoryArtifactCount += entries.filter((e) => e.endsWith('.md')).length;
        } catch {
          // ignore
        }
      }
    }
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
    memoryReady,
    memoryArtifactCount,
    claudeMdInstalled,
    claudeMdExists,
  };
}

module.exports = { status };
