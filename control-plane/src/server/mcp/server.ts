import { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import type { Repository } from '../db/repository.js';
import {
  evidenceKinds,
  evidenceStatuses,
  findingSeverities,
  projectStatuses,
  riskTiers,
  runStatuses,
  specStates,
} from '../domain/types.js';
import { policyPack } from '../policy/core.js';

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80);
const nonEmpty = z.string().trim().min(1).max(20_000);
const shortText = z.string().trim().min(1).max(300);
const actorPattern = /^[a-zA-Z0-9_.:/-]{1,120}$/;
const readOnlyAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;
const idempotentWriteAnnotations = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;
const appendWriteAnnotations = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: false,
} as const;

export function createDeveloperMcpServer(repository: Repository, request?: Request): McpServer {
  const actorHeader = request?.headers.get('x-developer-runtime') ?? 'mcp-client';
  const actor = actorPattern.test(actorHeader) ? actorHeader : 'mcp-client';
  const server = new McpServer(
    { name: 'developer-control-plane', version: '0.1.0' },
    {
      instructions:
        'MANDATORY ENGINEERING CONTROL: Before editing, read the project snapshot and work from an explicit spec/run. Execute real verification commands and record their actual results. Before claiming complete, tested, accepted, shippable, or deployed, call developer_compliance_explain and follow every nextAction until its decision is pass. A missing, skipped, warning, failed, stale, or fabricated check never counts as success. Never infer compliance from prose or model confidence.',
      cacheHints: {
        'tools/list': { ttlMs: 300_000, cacheScope: 'public' },
        'prompts/list': { ttlMs: 300_000, cacheScope: 'public' },
        'resources/list': { ttlMs: 300_000, cacheScope: 'public' },
      },
    },
  );

  registerResources(server);
  registerPrompts(server);
  registerTools(server, repository, actor);
  return server;
}

function registerResources(server: McpServer): void {
  server.registerResource(
    'developer-engineering-constitution',
    'developer://policy/core',
    {
      title: policyPack.title,
      description: 'Versioned non-negotiable engineering policy and evidence model.',
      mimeType: 'application/json',
      cacheHint: { ttlMs: 300_000, cacheScope: 'public' },
    },
    (uri) => ({
      contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(policyPack, null, 2) }],
    }),
  );

  server.registerResource(
    'developer-sdd-workflow',
    'developer://workflow/spec-driven-development',
    {
      title: 'Spec-driven delivery workflow',
      description: 'Lifecycle and state model used by every project and runtime.',
      mimeType: 'application/json',
      cacheHint: { ttlMs: 300_000, cacheScope: 'public' },
    },
    (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              states: specStates,
              lifecycle: policyPack.workflow,
              invariant:
                'Intent precedes plan; contracts and threat model precede sensitive implementation; evidence precedes acceptance; acceptance precedes ship.',
              correctionLoop: 'implement -> verify -> review -> converge -> implement until the gate passes',
            },
            null,
            2,
          ),
        },
      ],
    }),
  );
}

function registerPrompts(server: McpServer): void {
  server.registerPrompt(
    'developer-feature',
    {
      title: 'Deliver a feature with spec-driven evidence',
      description: 'Starts a bounded feature workflow against a registered project.',
      argsSchema: z.object({ project: slug, outcome: nonEmpty }),
    },
    ({ project, outcome }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Project: ${project}\nDesired outcome: ${outcome}\n\nRead developer://policy/core, then call developer_project_snapshot. Create or update a spec before implementation. Keep acceptance criteria independently testable. Record a run, evidence from real commands, findings, decisions, and evaluate the gate before claiming completion.`,
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    'developer-fix',
    {
      title: 'Diagnose and fix a defect',
      description: 'Reproduce, isolate, repair, and prove a defect without unnecessary ceremony.',
      argsSchema: z.object({ project: slug, symptom: nonEmpty }),
    },
    ({ project, symptom }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Project: ${project}\nObserved symptom: ${symptom}\n\nRead the project snapshot. Reproduce before editing. Record root cause as a finding, make the smallest coherent fix, add a regression test, record evidence from actual commands, resolve the finding only after verification, then evaluate the gate.`,
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    'developer-review',
    {
      title: 'Evidence-backed engineering review',
      description: 'Reviews a bounded change against its spec, policy, threats, and evidence.',
      argsSchema: z.object({ project: slug, spec: slug, changeSummary: nonEmpty }),
    },
    ({ project, spec, changeSummary }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Review ${project}/${spec}. Change summary: ${changeSummary}\n\nFetch the project snapshot. Check spec traceability, contract compatibility, architecture boundaries, security, test quality, accessibility, operations, and evidence freshness. Record each actionable issue with a stable fingerprint. Do not approve while the gate is failed or evidence is missing.`,
          },
        },
      ],
    }),
  );
}

function registerTools(server: McpServer, repository: Repository, actor: string): void {
  server.registerTool(
    'developer_project_upsert',
    {
      title: 'Register or update a project',
      description: 'Creates or updates the durable project record. Idempotent by slug.',
      annotations: idempotentWriteAnnotations,
      inputSchema: z.object({
        slug,
        name: shortText,
        description: z.string().max(4_000).default(''),
        repositoryUrl: z.string().url().nullable().optional(),
        status: z.enum(projectStatuses).default('discovery'),
        riskTier: z.enum(riskTiers).default('standard'),
        runtimes: z.array(z.string().min(1).max(80)).max(20).default([]),
        tags: z.array(z.string().min(1).max(40)).max(30).default([]),
      }),
    },
    async (input) => result({ project: await repository.upsertProject(input, actor) }),
  );

  server.registerTool(
    'developer_project_list',
    {
      title: 'List projects',
      description: 'Lists the registered engineering projects in dashboard order.',
      annotations: readOnlyAnnotations,
      inputSchema: z.object({}),
    },
    async () => result({ projects: await repository.listProjects() }),
  );

  server.registerTool(
    'developer_project_snapshot',
    {
      title: 'Read complete project context',
      description: 'Returns bounded project state, active specs, recent runs, evidence, findings, and current gate.',
      annotations: readOnlyAnnotations,
      inputSchema: z.object({ projectSlug: slug }),
    },
    async ({ projectSlug }) => result({ snapshot: await repository.snapshot(projectSlug) }),
  );

  server.registerTool(
    'developer_spec_upsert',
    {
      title: 'Create or refine a specification',
      description: 'Creates or updates the spec contract. Idempotent by project and spec slug; does not advance lifecycle state.',
      annotations: idempotentWriteAnnotations,
      inputSchema: z.object({
        projectSlug: slug,
        slug,
        title: shortText,
        intent: nonEmpty,
        acceptanceCriteria: z.array(nonEmpty).min(1).max(50),
        constraints: z.array(nonEmpty).max(50).default([]),
        outOfScope: z.array(nonEmpty).max(50).default([]),
        artifacts: z.record(z.string(), z.json()).default({}),
      }),
    },
    async (input) => result({ spec: await repository.upsertSpec(input, actor) }),
  );

  server.registerTool(
    'developer_spec_transition',
    {
      title: 'Advance or return a specification',
      description: 'Applies the enforced spec state machine. Invalid lifecycle jumps are rejected.',
      annotations: appendWriteAnnotations,
      inputSchema: z.object({ projectSlug: slug, specSlug: slug, to: z.enum(specStates) }),
    },
    async ({ projectSlug, specSlug, to }) =>
      result({ spec: await repository.transitionSpec(projectSlug, specSlug, to, actor) }),
  );

  server.registerTool(
    'developer_run_start',
    {
      title: 'Start an engineering run',
      description: 'Starts an auditable workflow execution by a runtime/model.',
      annotations: appendWriteAnnotations,
      inputSchema: z.object({
        projectSlug: slug,
        specSlug: slug.optional(),
        workflow: z.enum(['assess', 'feature', 'fix', 'review', 'security-audit', 'refactor', 'ship', 'inspect']),
        runtime: shortText,
        model: shortText,
      }),
    },
    async (input) => result({ run: await repository.startRun(input, actor) }),
  );

  server.registerTool(
    'developer_run_finish',
    {
      title: 'Finish an engineering run',
      description: 'Closes a running workflow with an explicit outcome and summary.',
      annotations: appendWriteAnnotations,
      inputSchema: z.object({
        runId: z.string().uuid(),
        status: z.enum(runStatuses).exclude(['running']),
        summary: nonEmpty,
      }),
    },
    async ({ runId, status, summary }) => result({ run: await repository.finishRun(runId, status, summary, actor) }),
  );

  server.registerTool(
    'developer_evidence_record',
    {
      title: 'Record verification evidence',
      description: 'Records the actual result of a reproducible check. Never use this tool for planned or fabricated results.',
      annotations: appendWriteAnnotations,
      inputSchema: z.object({
        projectSlug: slug,
        specSlug: slug.optional(),
        runId: z.string().uuid().optional(),
        kind: z.enum(evidenceKinds),
        status: z.enum(evidenceStatuses),
        command: z.string().max(2_000).optional(),
        summary: nonEmpty,
        artifactUri: z.string().max(2_000).optional(),
        metrics: z.record(z.string(), z.union([z.number(), z.string(), z.boolean()])).default({}),
      }),
    },
    async (input) => result({ evidence: await repository.recordEvidence(input, actor) }),
  );

  server.registerTool(
    'developer_finding_upsert',
    {
      title: 'Record or update a finding',
      description: 'Upserts a defect, security issue, quality risk, or review finding by stable fingerprint.',
      annotations: idempotentWriteAnnotations,
      inputSchema: z.object({
        projectSlug: slug,
        specSlug: slug.optional(),
        runId: z.string().uuid().optional(),
        fingerprint: z.string().min(6).max(200),
        severity: z.enum(findingSeverities),
        category: z.string().min(1).max(80),
        title: shortText,
        detail: nonEmpty,
        status: z.enum(['open', 'accepted-risk', 'resolved', 'false-positive']).default('open'),
      }),
    },
    async (input) => result({ finding: await repository.upsertFinding(input, actor) }),
  );

  server.registerTool(
    'developer_decision_record',
    {
      title: 'Record an architecture or product decision',
      description: 'Creates an immutable decision record with context and consequences.',
      annotations: appendWriteAnnotations,
      inputSchema: z.object({
        projectSlug: slug,
        specSlug: slug.optional(),
        title: shortText,
        context: nonEmpty,
        decision: nonEmpty,
        consequences: nonEmpty,
        status: z.enum(['proposed', 'accepted', 'superseded', 'rejected']).default('accepted'),
      }),
    },
    async (input) => result({ decision: await repository.recordDecision(input, actor) }),
  );

  server.registerTool(
    'developer_gate_evaluate',
    {
      title: 'Evaluate the current quality gate',
      description: 'Computes a deterministic release decision from project risk, latest evidence, and unresolved findings.',
      annotations: readOnlyAnnotations,
      inputSchema: z.object({ projectSlug: slug }),
    },
    async ({ projectSlug }) => {
      const snapshot = await repository.snapshot(projectSlug);
      return result({ gate: snapshot.gate });
    },
  );

  server.registerTool(
    'developer_compliance_explain',
    {
      title: 'Explain exactly how to pass compliance',
      description:
        'Returns the current deterministic decision, every satisfied/failed/missing requirement, why each check exists, suggested commands, blocking findings, and ordered next actions. Models must call this before claiming completion and repeat until decision=pass.',
      annotations: readOnlyAnnotations,
      inputSchema: z.object({ projectSlug: slug }),
    },
    async ({ projectSlug }) => {
      const snapshot = await repository.snapshot(projectSlug);
      return result({
        project: {
          slug: snapshot.project.slug,
          name: snapshot.project.name,
          riskTier: snapshot.project.riskTier,
          status: snapshot.project.status,
        },
        activeSpecs: snapshot.specs
          .filter((spec) => !['shipped', 'cancelled'].includes(spec.state))
          .map(({ slug: specSlug, title, state }) => ({ slug: specSlug, title, state })),
        runningRuns: snapshot.runs
          .filter((run) => run.status === 'running')
          .map(({ id, specId, workflow, runtime, model, startedAt }) => ({ id, specId, workflow, runtime, model, startedAt })),
        compliance: snapshot.gate,
      });
    },
  );
}

function result(value: Record<string, unknown>) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }],
    structuredContent: value,
  };
}
