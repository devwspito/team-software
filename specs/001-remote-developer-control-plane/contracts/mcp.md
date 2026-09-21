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

Tools return both human-readable JSON text and structured content. Mutation tools are idempotent where a natural key exists; immutable evidence, decisions, and runs always create explicit records.
