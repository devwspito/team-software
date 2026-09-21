import { evaluateGate } from '../domain/gates.js';
import { assertSpecTransition } from '../domain/transitions.js';
import type {
  Evidence,
  EvidenceKind,
  EvidenceStatus,
  Finding,
  FindingSeverity,
  Project,
  ProjectSnapshot,
  ProjectStatus,
  RiskTier,
  Run,
  RunStatus,
  Spec,
  SpecState,
} from '../domain/types.js';
import type { Database } from './client.js';

type JsonValue = null | string | number | boolean | readonly JsonValue[] | { readonly [key: string]: JsonValue | undefined };

type ProjectInput = {
  slug: string;
  name: string;
  description: string;
  repositoryUrl?: string | null | undefined;
  status: ProjectStatus;
  riskTier: RiskTier;
  runtimes: string[];
  tags: string[];
};

type SpecInput = {
  projectSlug: string;
  slug: string;
  title: string;
  intent: string;
  acceptanceCriteria: string[];
  constraints: string[];
  outOfScope: string[];
  artifacts: Record<string, JsonValue>;
};

type RunInput = {
  projectSlug: string;
  specSlug?: string | undefined;
  workflow: string;
  runtime: string;
  model: string;
};

type EvidenceInput = {
  projectSlug: string;
  specSlug?: string | undefined;
  runId?: string | undefined;
  kind: EvidenceKind;
  status: EvidenceStatus;
  command?: string | undefined;
  summary: string;
  artifactUri?: string | undefined;
  metrics: Record<string, number | string | boolean>;
};

type FindingInput = {
  projectSlug: string;
  specSlug?: string | undefined;
  runId?: string | undefined;
  fingerprint: string;
  severity: FindingSeverity;
  category: string;
  title: string;
  detail: string;
  status: Finding['status'];
};

export class Repository {
  constructor(private readonly database: Database) {}

  async upsertProject(input: ProjectInput, actor: string): Promise<Project> {
    const [project] = await this.database<Project[]>`
      INSERT INTO projects (slug, name, description, repository_url, status, risk_tier, runtimes, tags)
      VALUES (
        ${input.slug}, ${input.name}, ${input.description}, ${input.repositoryUrl ?? null},
        ${input.status}, ${input.riskTier}, ${this.database.json(input.runtimes)}, ${this.database.json(input.tags)}
      )
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        repository_url = EXCLUDED.repository_url,
        status = EXCLUDED.status,
        risk_tier = EXCLUDED.risk_tier,
        runtimes = EXCLUDED.runtimes,
        tags = EXCLUDED.tags,
        updated_at = now()
      RETURNING id, slug, name, description, repository_url AS "repositoryUrl", status,
        risk_tier AS "riskTier", runtimes, tags,
        created_at::text AS "createdAt", updated_at::text AS "updatedAt"
    `;
    if (!project) throw new Error('Project upsert returned no row');
    await this.audit(project.id, actor, 'project.upsert', 'project', project.id, { slug: project.slug });
    return project;
  }

  async listProjects(): Promise<Project[]> {
    return this.database<Project[]>`
      SELECT id, slug, name, description, repository_url AS "repositoryUrl", status,
        risk_tier AS "riskTier", runtimes, tags,
        created_at::text AS "createdAt", updated_at::text AS "updatedAt"
      FROM projects
      ORDER BY CASE status WHEN 'active' THEN 0 WHEN 'blocked' THEN 1 ELSE 2 END, updated_at DESC
    `;
  }

  async getProject(slug: string): Promise<Project> {
    const [project] = await this.database<Project[]>`
      SELECT id, slug, name, description, repository_url AS "repositoryUrl", status,
        risk_tier AS "riskTier", runtimes, tags,
        created_at::text AS "createdAt", updated_at::text AS "updatedAt"
      FROM projects WHERE slug = ${slug}
    `;
    if (!project) throw new Error(`Unknown project: ${slug}`);
    return project;
  }

  async upsertSpec(input: SpecInput, actor: string): Promise<Spec> {
    const project = await this.getProject(input.projectSlug);
    const [spec] = await this.database<Spec[]>`
      INSERT INTO specs (
        project_id, slug, title, intent, acceptance_criteria, constraints, out_of_scope, artifacts
      ) VALUES (
        ${project.id}, ${input.slug}, ${input.title}, ${input.intent},
        ${this.database.json(input.acceptanceCriteria)}, ${this.database.json(input.constraints)},
        ${this.database.json(input.outOfScope)}, ${this.database.json(input.artifacts)}
      )
      ON CONFLICT (project_id, slug) DO UPDATE SET
        title = EXCLUDED.title,
        intent = EXCLUDED.intent,
        acceptance_criteria = EXCLUDED.acceptance_criteria,
        constraints = EXCLUDED.constraints,
        out_of_scope = EXCLUDED.out_of_scope,
        artifacts = specs.artifacts || EXCLUDED.artifacts,
        updated_at = now()
      RETURNING id, project_id AS "projectId", slug, title, state, intent,
        acceptance_criteria AS "acceptanceCriteria", constraints,
        out_of_scope AS "outOfScope", artifacts,
        created_at::text AS "createdAt", updated_at::text AS "updatedAt"
    `;
    if (!spec) throw new Error('Spec upsert returned no row');
    await this.audit(project.id, actor, 'spec.upsert', 'spec', spec.id, { slug: spec.slug });
    return spec;
  }

  async transitionSpec(projectSlug: string, specSlug: string, to: SpecState, actor: string): Promise<Spec> {
    const project = await this.getProject(projectSlug);
    const current = await this.getSpec(project.id, specSlug);
    assertSpecTransition(current.state, to);
    const [spec] = await this.database<Spec[]>`
      UPDATE specs SET state = ${to}, updated_at = now()
      WHERE id = ${current.id}
      RETURNING id, project_id AS "projectId", slug, title, state, intent,
        acceptance_criteria AS "acceptanceCriteria", constraints,
        out_of_scope AS "outOfScope", artifacts,
        created_at::text AS "createdAt", updated_at::text AS "updatedAt"
    `;
    if (!spec) throw new Error('Spec transition returned no row');
    await this.audit(project.id, actor, 'spec.transition', 'spec', spec.id, { from: current.state, to });
    return spec;
  }

  async startRun(input: RunInput, actor: string): Promise<Run> {
    const project = await this.getProject(input.projectSlug);
    const spec = input.specSlug ? await this.getSpec(project.id, input.specSlug) : null;
    const [run] = await this.database<Run[]>`
      INSERT INTO runs (project_id, spec_id, workflow, runtime, model)
      VALUES (${project.id}, ${spec?.id ?? null}, ${input.workflow}, ${input.runtime}, ${input.model})
      RETURNING id, project_id AS "projectId", spec_id AS "specId", workflow, runtime, model,
        status, summary, started_at::text AS "startedAt", finished_at::text AS "finishedAt"
    `;
    if (!run) throw new Error('Run start returned no row');
    await this.audit(project.id, actor, 'run.start', 'run', run.id, { workflow: run.workflow });
    return run;
  }

  async finishRun(runId: string, status: Exclude<RunStatus, 'running'>, summary: string, actor: string): Promise<Run> {
    const [run] = await this.database<Run[]>`
      UPDATE runs SET status = ${status}, summary = ${summary}, finished_at = now()
      WHERE id = ${runId} AND status = 'running'
      RETURNING id, project_id AS "projectId", spec_id AS "specId", workflow, runtime, model,
        status, summary, started_at::text AS "startedAt", finished_at::text AS "finishedAt"
    `;
    if (!run) throw new Error(`Unknown or already-finished run: ${runId}`);
    await this.audit(run.projectId, actor, 'run.finish', 'run', run.id, { status });
    return run;
  }

  async recordEvidence(input: EvidenceInput, actor: string): Promise<Evidence> {
    const project = await this.getProject(input.projectSlug);
    const spec = input.specSlug ? await this.getSpec(project.id, input.specSlug) : null;
    const [evidence] = await this.database<Evidence[]>`
      INSERT INTO evidence (
        project_id, spec_id, run_id, kind, status, command, summary, artifact_uri, metrics
      ) VALUES (
        ${project.id}, ${spec?.id ?? null}, ${input.runId ?? null}, ${input.kind}, ${input.status},
        ${input.command ?? null}, ${input.summary}, ${input.artifactUri ?? null}, ${this.database.json(input.metrics)}
      )
      RETURNING id, project_id AS "projectId", spec_id AS "specId", run_id AS "runId",
        kind, status, command, summary, artifact_uri AS "artifactUri", metrics,
        recorded_at::text AS "recordedAt"
    `;
    if (!evidence) throw new Error('Evidence insert returned no row');
    await this.audit(project.id, actor, 'evidence.record', 'evidence', evidence.id, {
      kind: evidence.kind,
      status: evidence.status,
    });
    return evidence;
  }

  async upsertFinding(input: FindingInput, actor: string): Promise<Finding> {
    const project = await this.getProject(input.projectSlug);
    const spec = input.specSlug ? await this.getSpec(project.id, input.specSlug) : null;
    const [finding] = await this.database<Finding[]>`
      INSERT INTO findings (
        project_id, spec_id, run_id, fingerprint, severity, category, title, detail, status
      ) VALUES (
        ${project.id}, ${spec?.id ?? null}, ${input.runId ?? null}, ${input.fingerprint},
        ${input.severity}, ${input.category}, ${input.title}, ${input.detail}, ${input.status}
      )
      ON CONFLICT (project_id, fingerprint) DO UPDATE SET
        spec_id = EXCLUDED.spec_id,
        run_id = EXCLUDED.run_id,
        severity = EXCLUDED.severity,
        category = EXCLUDED.category,
        title = EXCLUDED.title,
        detail = EXCLUDED.detail,
        status = EXCLUDED.status,
        updated_at = now()
      RETURNING id, project_id AS "projectId", spec_id AS "specId", run_id AS "runId",
        fingerprint, severity, category, title, detail, status,
        created_at::text AS "createdAt", updated_at::text AS "updatedAt"
    `;
    if (!finding) throw new Error('Finding upsert returned no row');
    await this.audit(project.id, actor, 'finding.upsert', 'finding', finding.id, {
      severity: finding.severity,
      status: finding.status,
    });
    return finding;
  }

  async recordDecision(input: {
    projectSlug: string;
    specSlug?: string | undefined;
    title: string;
    context: string;
    decision: string;
    consequences: string;
    status: 'proposed' | 'accepted' | 'superseded' | 'rejected';
  }, actor: string): Promise<{ id: string }> {
    const project = await this.getProject(input.projectSlug);
    const spec = input.specSlug ? await this.getSpec(project.id, input.specSlug) : null;
    const [row] = await this.database<Array<{ id: string }>>`
      INSERT INTO decisions (project_id, spec_id, title, context, decision, consequences, status)
      VALUES (
        ${project.id}, ${spec?.id ?? null}, ${input.title}, ${input.context},
        ${input.decision}, ${input.consequences}, ${input.status}
      ) RETURNING id
    `;
    if (!row) throw new Error('Decision insert returned no row');
    await this.audit(project.id, actor, 'decision.record', 'decision', row.id, { status: input.status });
    return row;
  }

  async snapshot(projectSlug: string): Promise<ProjectSnapshot> {
    const project = await this.getProject(projectSlug);
    const [specs, runs, evidence, findings] = await Promise.all([
      this.database<Spec[]>`
        SELECT id, project_id AS "projectId", slug, title, state, intent,
          acceptance_criteria AS "acceptanceCriteria", constraints, out_of_scope AS "outOfScope", artifacts,
          created_at::text AS "createdAt", updated_at::text AS "updatedAt"
        FROM specs WHERE project_id = ${project.id} ORDER BY updated_at DESC
      `,
      this.database<Run[]>`
        SELECT id, project_id AS "projectId", spec_id AS "specId", workflow, runtime, model,
          status, summary, started_at::text AS "startedAt", finished_at::text AS "finishedAt"
        FROM runs WHERE project_id = ${project.id} ORDER BY started_at DESC LIMIT 50
      `,
      this.database<Evidence[]>`
        SELECT id, project_id AS "projectId", spec_id AS "specId", run_id AS "runId", kind,
          status, command, summary, artifact_uri AS "artifactUri", metrics,
          recorded_at::text AS "recordedAt"
        FROM evidence WHERE project_id = ${project.id} ORDER BY recorded_at DESC LIMIT 200
      `,
      this.database<Finding[]>`
        SELECT id, project_id AS "projectId", spec_id AS "specId", run_id AS "runId", fingerprint,
          severity, category, title, detail, status,
          created_at::text AS "createdAt", updated_at::text AS "updatedAt"
        FROM findings WHERE project_id = ${project.id} ORDER BY updated_at DESC
      `,
    ]);
    return { project, specs, runs, evidence, findings, gate: evaluateGate(project.riskTier, evidence, findings) };
  }

  private async getSpec(projectId: string, slug: string): Promise<Spec> {
    const [spec] = await this.database<Spec[]>`
      SELECT id, project_id AS "projectId", slug, title, state, intent,
        acceptance_criteria AS "acceptanceCriteria", constraints, out_of_scope AS "outOfScope", artifacts,
        created_at::text AS "createdAt", updated_at::text AS "updatedAt"
      FROM specs WHERE project_id = ${projectId} AND slug = ${slug}
    `;
    if (!spec) throw new Error(`Unknown spec: ${slug}`);
    return spec;
  }

  private async audit(
    projectId: string,
    actor: string,
    action: string,
    entityType: string,
    entityId: string,
    payload: Record<string, JsonValue>,
  ): Promise<void> {
    await this.database`
      INSERT INTO audit_events (project_id, actor, action, entity_type, entity_id, payload)
      VALUES (${projectId}, ${actor}, ${action}, ${entityType}, ${entityId}, ${this.database.json(payload)})
    `;
  }
}
