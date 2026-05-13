'use strict';

const fs = require('fs');
const path = require('path');

const { resolveScope, AGENT_NAMES, COMMAND_NAMES, TEAM_SOFTWARE_MARKER } = require('./scope');
const { install } = require('./install');

/**
 * Detect which scope(s) currently have team-software installed.
 *
 * A scope is considered "installed" if it has at least one agent file matching
 * a known agent name, OR a CLAUDE.md carrying the team-software:managed marker.
 *
 * @returns {{ user: boolean, project: boolean }}
 */
function detectInstalledScopes() {
  return {
    user: isScopeInstalled(resolveScope('user')),
    project: isScopeInstalled(resolveScope('project')),
  };
}

function isScopeInstalled(scope) {
  for (const name of AGENT_NAMES) {
    if (fs.existsSync(path.join(scope.agentsDir, `${name}.md`))) return true;
  }
  for (const name of COMMAND_NAMES) {
    if (fs.existsSync(path.join(scope.commandsDir, `${name}.md`))) return true;
  }
  if (fs.existsSync(scope.claudeMdPath)) {
    try {
      const content = fs.readFileSync(scope.claudeMdPath, 'utf8');
      if (content.includes(TEAM_SOFTWARE_MARKER)) return true;
    } catch {
      // ignore
    }
  }
  return false;
}

/**
 * Ensure team-software is installed and up to date in the chosen (or detected)
 * scope. Idempotent and resilient:
 *
 *   - If installed in detected scope    → refresh files (install --force).
 *   - If NOT installed anywhere         → install fresh in `opts.scope` or 'user'.
 *   - If installed in BOTH scopes and no `opts.scope` → throws (needs disambiguation).
 *   - If `opts.scope` explicit + no install there → install fresh there.
 *
 * @param {object} opts
 * @param {string} [opts.scope]              Optional explicit scope ("user"|"project").
 * @param {boolean} [opts.keepClaudeMd]      If true, do not touch CLAUDE.md.
 * @returns {{
 *   scope: { name: 'user'|'project' },
 *   isFreshInstall: boolean,
 *   agentsRefreshed: number,
 *   commandsRefreshed: number,
 *   claudeMdRefreshed: boolean,
 *   detected: { user: boolean, project: boolean },
 * }}
 */
function update(opts = {}) {
  const detected = detectInstalledScopes();
  const requested = opts.scope;
  let scopeName;
  let isFreshInstall = false;

  if (requested) {
    if (requested !== 'user' && requested !== 'project') {
      throw new Error(`scope inválido: "${requested}". Usa "user" o "project".`);
    }
    if (!detected[requested]) {
      // Explicit scope, no prior install → install fresh there
      isFreshInstall = true;
    }
    scopeName = requested;
  } else {
    if (!detected.user && !detected.project) {
      // Nothing installed anywhere → install fresh in user (most common case)
      isFreshInstall = true;
      scopeName = 'user';
    } else if (detected.user && detected.project) {
      throw new Error(
        'update: hay instalaciones en ambos scopes (user y project). ' +
          'Especifica cuál actualizar con --scope user | --scope project.'
      );
    } else {
      scopeName = detected.user ? 'user' : 'project';
    }
  }

  const scope = resolveScope(scopeName);
  const installClaudeMd = !opts.keepClaudeMd;
  const result = install({ scope, installClaudeMd, force: true });

  return {
    scope: { name: scopeName },
    isFreshInstall,
    agentsRefreshed: result.agentsCreated.length,
    commandsRefreshed: result.commandsCreated.length,
    claudeMdRefreshed: result.claudeMdCreated,
    detected,
  };
}

module.exports = { update, detectInstalledScopes };
