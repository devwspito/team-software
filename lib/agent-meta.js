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
  // UI/UX sub-team
  {
    name: 'ux-researcher',
    tagline: 'Diagnóstico UX — heurísticas Nielsen, journey, mental models',
    when: 'Cuando algo en la UI "no tiene sentido" y necesitas saber qué y por qué falla.',
  },
  {
    name: 'interaction-designer',
    tagline: 'Flows, estados (loading/empty/error/success), affordances, recovery',
    when: 'Cuando hay que prescribir CÓMO la UI debe comportarse — micro-interactions, recovery paths.',
  },
  {
    name: 'visual-designer',
    tagline: 'Hierarchy, typography, color, spacing, consistency',
    when: 'Cuando hay problemas de jerarquía visual, contrast, consistencia o spacing roto.',
  },
  {
    name: 'accessibility-specialist',
    tagline: 'WCAG deep audit — screen reader, keyboard, focus, contrast, motion',
    when: 'Cuando necesitas audit a11y serio (más allá del smoke check del frontend-engineer).',
  },
  {
    name: 'content-designer',
    tagline: 'Microcopy, error messages, labels, voice & tone, i18n-friendly',
    when: 'Cuando los textos del UI son "Click here", "Error 500", "Submit" — necesitan reescribirse.',
  },
  // Delivery sub-team (hands-dirty)
  {
    name: 'debug-engineer',
    tagline: 'Bug hunter pragmático — reproduce, isola, arregla, regression test',
    when: 'Algo está roto. Pegas el error/síntoma, arregla con mínimas preguntas. Sin pipeline.',
  },
  {
    name: 'integration-engineer',
    tagline: 'Conecta piezas desconectadas — button → API → DB → UI feedback',
    when: 'La UI no dispara nada, el endpoint existe pero no se llama, el state no se refresca.',
  },
  {
    name: 'polish-engineer',
    tagline: 'Half-built → demo-ready — estados, errors, microcopy, edge cases',
    when: 'La feature funciona pero está cruda: empty/error states vacíos, "Error 500" raw, etc.',
  },
  {
    name: 'seed-data-engineer',
    tagline: 'Seed data realista (NIF válido, IVA correcto, IBAN real) idempotente',
    when: 'Testing bloqueado por falta de datos. Genera fixtures coherentes que pasen validación.',
  },
];
