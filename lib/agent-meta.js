'use strict';

/**
 * Metadata for the agent team. Used by `team-software list` and the README.
 * Source of truth for agent names is `lib/scope.js`.
 */
module.exports = [
  {
    name: 'requirements-analyst',
    tagline: 'Discovery — extrae todo el contexto antes de diseñar',
    when: 'PRIMERO en cualquier feature nueva, idea vaga o cambio sin contrato claro. Entrega un dossier con objetivos, alcance, criterios de aceptación, restricciones, edge cases y preguntas abiertas.',
  },
  {
    name: 'tech-lead',
    tagline: 'Orquestador — descompone trabajo en plan de delegación',
    when: 'Úsalo al inicio de cualquier feature no trivial. Produce un blueprint con tareas, especialistas y secuencia.',
  },
  {
    name: 'software-architect',
    tagline: 'DDD · SOLID · contratos de módulos · capas hexagonales',
    when: 'Diseño de nuevos módulos, límites de bounded contexts, modelado de dominio, decisiones arquitectónicas.',
  },
  {
    name: 'security-engineer',
    tagline: 'Threat modeling + security review (STRIDE / OWASP / CWE)',
    when: 'PROACTIVO: cualquier cambio en auth, input, secretos, cripto, I/O, deserialización, PII.',
  },
  {
    name: 'backend-engineer',
    tagline: 'Implementación servidor siguiendo DDD/SOLID',
    when: 'APIs, casos de uso, lógica de negocio, integraciones, workers.',
  },
  {
    name: 'frontend-engineer',
    tagline: 'UI · accesibilidad · performance · seguridad cliente',
    when: 'Componentes, estado cliente, rutas, formularios, A11y, rendimiento.',
  },
  {
    name: 'database-engineer',
    tagline: 'Esquema · migraciones · índices · integridad',
    when: 'Cualquier cambio de schema, migración, query nuevo, decisiones de modelo de datos.',
  },
  {
    name: 'qa-engineer',
    tagline: 'Estrategia de test · coverage por comportamiento',
    when: 'Pre-implementación (TDD) y pre-merge (verificación de coverage).',
  },
  {
    name: 'devops-engineer',
    tagline: 'CI/CD · contenedores · IaC · observabilidad',
    when: 'Antes de production-readiness, deploys, infra, pipelines.',
  },
  {
    name: 'code-reviewer',
    tagline: 'Review pre-merge enforcing SOLID/clean/modularity',
    when: 'PROACTIVO antes de cualquier commit/PR.',
  },
  {
    name: 'refactoring-specialist',
    tagline: 'Refactor a comportamiento preservado bajo red de tests',
    when: 'Reducir complejidad, smells, mejorar modularidad sin cambiar comportamiento.',
  },
];
