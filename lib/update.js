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
 * Update an existing team-software installation to the version shipped with this
 * package. Equivalent to `install --force` but with scope autodetection and
 * update-aware output.
 *
 * @param {object} opts
 * @param {string} [opts.scope]              Optional explicit scope ("user"|"project").
 *                                           If omitted, autodetect.
 * @param {boolean} [opts.keepClaudeMd]      If true, do not touch CLAUDE.md
 *                                           (useful if the user has customized it).
 * @returns {{
 *   scope: { name: 'user'|'project' },
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

  if (requested) {
    if (requested !== 'user' && requested !== 'project') {
      throw new Error(`scope inválido: "${requested}". Usa "user" o "project".`);
    }
    if (!detected[requested]) {
      throw new Error(
        `update: scope "${requested}" no tiene una instalación previa. ` +
          `Usa "install" en lugar de "update", o pásalo sin --scope para autodetectar.`
      );
    }
    scopeName = requested;
  } else {
    if (!detected.user && !detected.project) {
      throw new Error(
        'update: no se encontró ninguna instalación previa de team-software. ' +
          'Corre "install" primero (npx github:devwspito/team-software install).'
      );
    }
    if (detected.user && detected.project) {
      throw new Error(
        'update: hay instalaciones en ambos scopes (user y project). ' +
          'Especifica cuál actualizar con --scope user | --scope project.'
      );
    }
    scopeName = detected.user ? 'user' : 'project';
  }

  const scope = resolveScope(scopeName);
  const installClaudeMd = !opts.keepClaudeMd;
  const result = install({ scope, installClaudeMd, force: true });

  return {
    scope: { name: scopeName },
    agentsRefreshed: result.agentsCreated.length,
    commandsRefreshed: result.commandsCreated.length,
    claudeMdRefreshed: result.claudeMdCreated,
    detected,
  };
}

module.exports = { update, detectInstalledScopes };
