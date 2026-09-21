import { useEffect, useState, type FormEvent } from 'react';

type Gate = {
  decision: 'pass' | 'fail' | 'insufficient-evidence';
  requiredEvidence: string[];
  satisfiedEvidence: string[];
  missingEvidence: string[];
  failedEvidence: string[];
  blockingFindings: Array<{ id: string; severity: string; title: string }>;
  nextActions: Array<{ priority: number; action: string; tool: string | null }>;
  llmInstruction: string;
};

type Project = {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: string;
  riskTier: string;
  runtimes: string[];
  tags: string[];
  updatedAt: string;
};

type Spec = { id: string; slug: string; title: string; state: string; updatedAt: string };
type Run = {
  id: string;
  workflow: string;
  runtime: string;
  model: string;
  status: string;
  summary: string;
  startedAt: string;
};
type Finding = { id: string; severity: string; category: string; title: string; status: string; updatedAt: string };
type Evidence = { id: string; kind: string; status: string; summary: string; recordedAt: string };
type Snapshot = { project: Project; specs: Spec[]; runs: Run[]; findings: Finding[]; evidence: Evidence[]; gate: Gate };
type DashboardResponse = { generatedAt: string; snapshots: Snapshot[] };

export function App() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard(): Promise<void> {
    try {
      const response = await fetch('api/dashboard', { credentials: 'same-origin' });
      if (response.status === 401) {
        setAuthRequired(true);
        return;
      }
      if (!response.ok) throw new Error(`Dashboard request failed (${response.status})`);
      const data = (await response.json()) as DashboardResponse;
      setDashboard(data);
      setSelectedSlug((current) => current ?? data.snapshots[0]?.project.slug ?? null);
      setAuthRequired(false);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo cargar el dashboard');
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  if (authRequired) return <Login onAuthenticated={loadDashboard} />;
  if (error) return <StatePanel title="Control plane no disponible" detail={error} action={loadDashboard} />;
  if (!dashboard) return <Loading />;

  const selected = dashboard.snapshots.find((item) => item.project.slug === selectedSlug) ?? dashboard.snapshots[0];
  return (
    <div className="shell">
      <Sidebar snapshots={dashboard.snapshots} selected={selected?.project.slug ?? null} onSelect={setSelectedSlug} />
      <main className="main">
        <Header generatedAt={dashboard.generatedAt} onRefresh={loadDashboard} />
        {selected ? <ProjectView snapshot={selected} /> : <EmptyDashboard />}
      </main>
    </div>
  );
}

function Login({ onAuthenticated }: { onAuthenticated: () => Promise<void> }) {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const response = await fetch('auth/login', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });
    setSubmitting(false);
    if (!response.ok) {
      setError('La clave no es válida.');
      return;
    }
    await onAuthenticated();
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <Logo />
        <p className="eyebrow">Engineering system of record</p>
        <h1>Developer Control Plane</h1>
        <p className="muted">Specs, evidencia y riesgo de todos tus runtimes, en un solo lugar.</p>
        <form onSubmit={(event) => void submit(event)}>
          <label htmlFor="api-key">API key</label>
          <input
            id="api-key"
            type="password"
            autoComplete="current-password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            required
          />
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button className="primary" type="submit" disabled={submitting}>
            {submitting ? 'Verificando…' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  );
}

function Sidebar({ snapshots, selected, onSelect }: {
  snapshots: Snapshot[];
  selected: string | null;
  onSelect: (slug: string) => void;
}) {
  return (
    <aside className="sidebar">
      <div className="brand"><Logo /><span>Developer</span></div>
      <div className="nav-title">Projects <span>{snapshots.length}</span></div>
      <nav aria-label="Proyectos">
        {snapshots.map(({ project, gate }) => (
          <button
            key={project.id}
            className={`project-nav ${selected === project.slug ? 'selected' : ''}`}
            onClick={() => onSelect(project.slug)}
          >
            <span className={`status-dot ${gate.decision}`} aria-hidden="true" />
            <span><strong>{project.name}</strong><small>{project.status} · {project.riskTier}</small></span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <span className="pulse" /> MCP online
        <small>Policy 2026.09</small>
      </div>
    </aside>
  );
}

function Header({ generatedAt, onRefresh }: { generatedAt: string; onRefresh: () => Promise<void> }) {
  return (
    <header className="topbar">
      <div><span className="eyebrow">System status</span><strong>Engineering overview</strong></div>
      <div className="topbar-actions">
        <span className="muted">Actualizado {relativeTime(generatedAt)}</span>
        <button className="secondary" onClick={() => void onRefresh()}>Actualizar</button>
      </div>
    </header>
  );
}

function ProjectView({ snapshot }: { snapshot: Snapshot }) {
  const openFindings = snapshot.findings.filter((finding) => finding.status === 'open');
  const activeSpecs = snapshot.specs.filter((spec) => !['shipped', 'cancelled'].includes(spec.state));
  const gatePercent = snapshot.gate.requiredEvidence.length === 0
    ? 100
    : Math.round((snapshot.gate.satisfiedEvidence.length / snapshot.gate.requiredEvidence.length) * 100);
  return (
    <div className="content">
      <section className="project-hero">
        <div>
          <div className="hero-meta"><Badge value={snapshot.project.status} /><span>{snapshot.project.slug}</span></div>
          <h1>{snapshot.project.name}</h1>
          <p>{snapshot.project.description || 'Sin descripción todavía.'}</p>
          <div className="tags">
            {snapshot.project.runtimes.map((runtime) => <span key={runtime}>{runtime}</span>)}
            {snapshot.project.tags.map((tag) => <span key={tag}>#{tag}</span>)}
          </div>
        </div>
        <GateDial decision={snapshot.gate.decision} percent={gatePercent} />
      </section>

      <section className="metric-grid" aria-label="Resumen del proyecto">
        <Metric label="Specs activas" value={activeSpecs.length} detail={`${snapshot.specs.length} totales`} />
        <Metric label="Findings abiertos" value={openFindings.length} detail={severitySummary(openFindings)} tone={openFindings.length ? 'warning' : 'good'} />
        <Metric label="Evidencias válidas" value={`${snapshot.gate.satisfiedEvidence.length}/${snapshot.gate.requiredEvidence.length}`} detail={`${gatePercent}% del gate`} tone={snapshot.gate.decision === 'pass' ? 'good' : 'neutral'} />
        <Metric label="Último run" value={snapshot.runs[0]?.status ?? '—'} detail={snapshot.runs[0]?.workflow ?? 'sin actividad'} tone={toneFor(snapshot.runs[0]?.status)} />
      </section>

      <div className="dashboard-grid">
        <Panel title="Specs" count={snapshot.specs.length} wide>
          {snapshot.specs.length ? (
            <div className="spec-list">
              {snapshot.specs.slice(0, 8).map((spec) => (
                <article className="spec-row" key={spec.id}>
                  <div className="spec-icon">S</div>
                  <div><strong>{spec.title}</strong><small>{spec.slug} · {relativeTime(spec.updatedAt)}</small></div>
                  <Badge value={spec.state} />
                </article>
              ))}
            </div>
          ) : <Empty label="Aún no hay specs" />}
        </Panel>

        <Panel title="Quality gate" count={snapshot.gate.missingEvidence.length + snapshot.gate.failedEvidence.length}>
          <div className="gate-summary">
            <Badge value={snapshot.gate.decision} />
            <p>{gateCopy(snapshot.gate)}</p>
          </div>
          <div className="evidence-grid">
            {snapshot.gate.requiredEvidence.map((kind) => {
              const status = snapshot.gate.failedEvidence.includes(kind)
                ? 'failed'
                : snapshot.gate.satisfiedEvidence.includes(kind) ? 'passed' : 'missing';
              return <span className={`evidence-chip ${status}`} key={kind}>{kind}</span>;
            })}
          </div>
          {snapshot.gate.decision !== 'pass' && (
            <ol className="compliance-actions">
              {snapshot.gate.nextActions.slice(0, 4).map((action, index) => (
                <li key={`${action.priority}-${index}`}>
                  <strong>P{action.priority}</strong>
                  <span>{action.action}</span>
                </li>
              ))}
            </ol>
          )}
        </Panel>

        <Panel title="Findings" count={openFindings.length}>
          {openFindings.length ? (
            <div className="finding-list">
              {openFindings.slice(0, 6).map((finding) => (
                <article key={finding.id}>
                  <span className={`severity ${finding.severity}`}>{finding.severity}</span>
                  <div><strong>{finding.title}</strong><small>{finding.category} · {relativeTime(finding.updatedAt)}</small></div>
                </article>
              ))}
            </div>
          ) : <Empty label="Sin findings abiertos" positive />}
        </Panel>

        <Panel title="Runs recientes" count={snapshot.runs.length} wide>
          {snapshot.runs.length ? (
            <div className="run-table" role="table">
              {snapshot.runs.slice(0, 8).map((run) => (
                <div className="run-row" role="row" key={run.id}>
                  <span className={`run-status ${run.status}`} />
                  <strong>{run.workflow}</strong>
                  <span>{run.runtime}</span>
                  <span className="model-name">{run.model}</span>
                  <Badge value={run.status} />
                  <time>{relativeTime(run.startedAt)}</time>
                </div>
              ))}
            </div>
          ) : <Empty label="Aún no hay ejecuciones" />}
        </Panel>

        <Panel title="Evidencia reciente" count={snapshot.evidence.length}>
          {snapshot.evidence.length ? (
            <div className="evidence-list">
              {snapshot.evidence.slice(0, 6).map((item) => (
                <article key={item.id}>
                  <span className={`check ${item.status}`}>{item.status === 'passed' ? '✓' : '!'}</span>
                  <div><strong>{item.kind}</strong><small>{item.summary} · {relativeTime(item.recordedAt)}</small></div>
                </article>
              ))}
            </div>
          ) : <Empty label="Sin evidencia registrada" />}
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, count, wide = false, children }: { title: string; count: number; wide?: boolean; children: React.ReactNode }) {
  return <section className={`panel ${wide ? 'wide' : ''}`}><header><h2>{title}</h2><span>{count}</span></header>{children}</section>;
}

function Metric({ label, value, detail, tone = 'neutral' }: { label: string; value: string | number; detail: string; tone?: string }) {
  return <article className={`metric ${tone}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>;
}

function GateDial({ decision, percent }: { decision: Gate['decision']; percent: number }) {
  return <div className={`gate-dial ${decision}`} style={{ '--score': `${percent * 3.6}deg` } as React.CSSProperties}><div><strong>{percent}%</strong><span>{decision === 'pass' ? 'ready' : 'gate'}</span></div></div>;
}

function Badge({ value }: { value: string }) { return <span className={`badge ${value}`}>{value.replace('-', ' ')}</span>; }
function Logo() { return <span className="logo" aria-hidden="true">D</span>; }
function Empty({ label, positive = false }: { label: string; positive?: boolean }) { return <div className={`empty ${positive ? 'positive' : ''}`}><span>{positive ? '✓' : '·'}</span>{label}</div>; }
function Loading() { return <main className="loading"><Logo /><span>Cargando control plane…</span></main>; }
function EmptyDashboard() { return <StatePanel title="Sin proyectos" detail="Registra el primero mediante developer_project_upsert." />; }
function StatePanel({ title, detail, action }: { title: string; detail: string; action?: () => Promise<void> }) {
  return <main className="state-panel"><Logo /><h1>{title}</h1><p>{detail}</p>{action ? <button className="primary" onClick={() => void action()}>Reintentar</button> : null}</main>;
}

function relativeTime(value: string): string {
  const seconds = Math.round((Date.parse(value) - Date.now()) / 1_000);
  const formatter = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
  const ranges: Array<[Intl.RelativeTimeFormatUnit, number]> = [['day', 86_400], ['hour', 3_600], ['minute', 60]];
  for (const [unit, divisor] of ranges) if (Math.abs(seconds) >= divisor) return formatter.format(Math.round(seconds / divisor), unit);
  return formatter.format(seconds, 'second');
}

function severitySummary(findings: Finding[]): string {
  const critical = findings.filter((item) => ['critical', 'high'].includes(item.severity)).length;
  return critical ? `${critical} bloqueantes` : 'sin bloqueantes';
}

function toneFor(status: string | undefined): string {
  if (status === 'passed') return 'good';
  if (status === 'failed' || status === 'blocked') return 'warning';
  return 'neutral';
}

function gateCopy(gate: Gate): string {
  if (gate.decision === 'pass') return 'Toda la evidencia requerida está presente y no hay findings bloqueantes.';
  if (gate.decision === 'fail') return `${gate.failedEvidence.length} checks fallidos y ${gate.blockingFindings.length} findings bloqueantes.`;
  return `Faltan ${gate.missingEvidence.length} evidencias para poder decidir.`;
}
