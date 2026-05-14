'use strict';

const os = require('os');
const path = require('path');

const AGENT_NAMES = [
  'requirements-analyst',
  'tech-lead',
  'software-architect',
  'security-engineer',
  'backend-engineer',
  'frontend-engineer',
  'database-engineer',
  'qa-engineer',
  'devops-engineer',
  'code-reviewer',
  'refactoring-specialist',
  // UI/UX sub-team
  'ux-researcher',
  'interaction-designer',
  'visual-designer',
  'accessibility-specialist',
  'content-designer',
  // Delivery sub-team (hands-dirty)
  'debug-engineer',
  'integration-engineer',
  'polish-engineer',
  'seed-data-engineer',
  // Inspection sub-team (proactive bug discovery)
  'bug-hunter',
  'exploratory-tester',
];

const COMMAND_NAMES = [
  'team-create',
  'team-feature',
  'team-review',
  'team-refactor',
  'team-threat-model',
  'team-ship',
  'team-ux-audit',
  'team-fix',
  'team-finish',
  'team-seed',
  'team-inspect',
];

const TEAM_SOFTWARE_MARKER = '<!-- team-software:managed -->';

/**
 * Resolve install scope.
 *
 * @param {string} [scope]   "user" (default) | "project"
 * @returns {{ name: 'user'|'project', root: string, agentsDir: string, commandsDir: string, claudeMdPath: string }}
 */
function resolveScope(scope) {
  const s = (scope || 'user').toLowerCase();
  if (s !== 'user' && s !== 'project') {
    throw new Error(`scope inválido: "${scope}". Usa "user" o "project".`);
  }
  if (s === 'user') {
    const root = path.join(os.homedir(), '.claude');
    return {
      name: 'user',
      root,
      agentsDir: path.join(root, 'agents'),
      commandsDir: path.join(root, 'commands'),
      memoryDir: path.join(root, 'memory'),
      claudeMdPath: path.join(root, 'CLAUDE.md'),
    };
  }
  const root = path.join(process.cwd(), '.claude');
  return {
    name: 'project',
    root,
    agentsDir: path.join(root, 'agents'),
    commandsDir: path.join(root, 'commands'),
    memoryDir: path.join(root, 'memory'),
    claudeMdPath: path.join(process.cwd(), 'CLAUDE.md'),
  };
}

const MEMORY_SUBDIRS = ['dossiers', 'plans', 'decisions', 'threat-models', 'artifacts'];

module.exports = { resolveScope, AGENT_NAMES, COMMAND_NAMES, MEMORY_SUBDIRS, TEAM_SOFTWARE_MARKER };
