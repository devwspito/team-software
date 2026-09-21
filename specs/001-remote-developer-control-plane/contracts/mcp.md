# MCP Contract

Endpoint: `POST /mcp`  
Authentication: `Authorization: Bearer <key>`  
Runtime identity hint: `X-Developer-Runtime: <client/model>`

## Resources

- `developer://policy/core` — versioned engineering constitution and references.
- `developer://workflow/spec-driven-development` — lifecycle, states, and correction loop.

## Prompts

- `developer-feature(project, outcome)`
- `developer-fix(project, symptom)`
- `developer-review(project, spec, changeSummary)`

## Tools

- `developer_project_upsert`
- `developer_project_list`
- `developer_project_snapshot`
- `developer_spec_upsert`
- `developer_spec_transition`
- `developer_run_start`
- `developer_run_finish`
- `developer_evidence_record`
- `developer_finding_upsert`
- `developer_decision_record`
- `developer_gate_evaluate`
- `developer_compliance_explain`

Tools return both human-readable JSON text and structured content. Mutation tools are idempotent where a natural key exists; immutable evidence, decisions, and runs always create explicit records.

## Compliance response

`developer_compliance_explain(projectSlug)` returns:

- the deterministic gate decision;
- satisfied, failed, skipped/warning, and missing requirements;
- why every required evidence kind exists;
- repository-agnostic commands or actions the runtime should adapt to the project;
- ordered `nextActions` naming the MCP tool to call after executing real verification;
- an explicit `llmInstruction` forbidding completion claims until the decision is `pass`.

Warnings and skipped checks are unmet requirements, never successful evidence.
