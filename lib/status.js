'use strict';

const fs = require('fs');
const path = require('path');

const { AGENT_NAMES, COMMAND_NAMES, MEMORY_SUBDIRS, SPECIFY_TEMPLATE_NAMES, TEAM_SOFTWARE_MARKER } = require('./scope');

/**
 * Report which team-software pieces are installed in the given scope.
 *
 * @param {object} opts
 * @param {{ name: 'user'|'project', agentsDir: string, commandsDir: string, memoryDir: string, specifyDir: string, claudeMdPath: string }} opts.scope
 * @returns {{
 *   agentsInstalled: string[],
 *   agentsMissing: string[],
 *   commandsInstalled: string[],
 *   commandsMissing: string[],
 *   memoryReady: boolean,
 *   memoryArtifactCount: number,
 *   sddTemplatesInstalled: string[],
 *   sddTemplatesMissing: string[],
 *   constitutionExists: boolean,
 *   specsCount: number,
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

  // SDD scaffolding status
  const specifyTemplatesDir = path.join(scope.specifyDir, 'templates');
  const sddTemplatesInstalled = [];
  const sddTemplatesMissing = [];
  for (const name of SPECIFY_TEMPLATE_NAMES) {
    const p = path.join(specifyTemplatesDir, `${name}.md`);
    if (fs.existsSync(p)) sddTemplatesInstalled.push(name);
    else sddTemplatesMissing.push(name);
  }
  // Project constitution: only meaningful in project scope. Cross-cutting in user scope.
  const constitutionExists = fs.existsSync(path.join(scope.specifyDir, 'memory', 'constitution.md'));
  // Specs count: only project scope ships specs/ at the project root.
  let specsCount = 0;
  if (scope.name === 'project') {
    const specsDir = path.join(process.cwd(), 'specs');
    if (fs.existsSync(specsDir)) {
      try {
        specsCount = fs.readdirSync(specsDir).filter((e) => {
          try { return fs.statSync(path.join(specsDir, e)).isDirectory(); } catch { return false; }
        }).length;
      } catch { /* ignore */ }
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
    sddTemplatesInstalled,
    sddTemplatesMissing,
    constitutionExists,
    specsCount,
    claudeMdInstalled,
    claudeMdExists,
  };
}

module.exports = { status };
