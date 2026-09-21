import type { Database } from './client.js';

const migration = `
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version integer PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  repository_url text,
  status text NOT NULL DEFAULT 'discovery' CHECK (status IN ('discovery','active','maintenance','blocked','archived')),
  risk_tier text NOT NULL DEFAULT 'standard' CHECK (risk_tier IN ('low','standard','high','critical')),
  runtimes jsonb NOT NULL DEFAULT '[]'::jsonb,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS specs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  state text NOT NULL DEFAULT 'draft' CHECK (state IN ('draft','clarified','planned','implementing','verifying','accepted','shipped','blocked','cancelled')),
  intent text NOT NULL,
  acceptance_criteria jsonb NOT NULL DEFAULT '[]'::jsonb,
  constraints jsonb NOT NULL DEFAULT '[]'::jsonb,
  out_of_scope jsonb NOT NULL DEFAULT '[]'::jsonb,
  artifacts jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, slug)
);

CREATE TABLE IF NOT EXISTS runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  spec_id uuid REFERENCES specs(id) ON DELETE SET NULL,
  workflow text NOT NULL,
  runtime text NOT NULL,
  model text NOT NULL,
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running','passed','failed','blocked','cancelled')),
  summary text NOT NULL DEFAULT '',
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);

CREATE TABLE IF NOT EXISTS evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  spec_id uuid REFERENCES specs(id) ON DELETE SET NULL,
  run_id uuid REFERENCES runs(id) ON DELETE SET NULL,
  kind text NOT NULL,
  status text NOT NULL CHECK (status IN ('passed','failed','warning','skipped')),
  command text,
  summary text NOT NULL,
  artifact_uri text,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  spec_id uuid REFERENCES specs(id) ON DELETE SET NULL,
  run_id uuid REFERENCES runs(id) ON DELETE SET NULL,
  fingerprint text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('critical','high','medium','low','info')),
  category text NOT NULL,
  title text NOT NULL,
  detail text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','accepted-risk','resolved','false-positive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, fingerprint)
);

CREATE TABLE IF NOT EXISTS decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  spec_id uuid REFERENCES specs(id) ON DELETE SET NULL,
  title text NOT NULL,
  context text NOT NULL,
  decision text NOT NULL,
  consequences text NOT NULL,
  status text NOT NULL DEFAULT 'accepted' CHECK (status IN ('proposed','accepted','superseded','rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  actor text NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS specs_project_state_idx ON specs(project_id, state);
CREATE INDEX IF NOT EXISTS runs_project_started_idx ON runs(project_id, started_at DESC);
CREATE INDEX IF NOT EXISTS evidence_project_recorded_idx ON evidence(project_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS findings_project_status_severity_idx ON findings(project_id, status, severity);
CREATE INDEX IF NOT EXISTS audit_project_created_idx ON audit_events(project_id, created_at DESC);
`;

export async function migrate(database: Database): Promise<void> {
  await database.begin(async (transaction) => {
    await transaction.unsafe(migration);
    await transaction`
      INSERT INTO schema_migrations (version)
      VALUES (1)
      ON CONFLICT (version) DO NOTHING
    `;
  });
}
