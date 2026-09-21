# Data Model

## Project

Stable engineering boundary. Owns risk tier, lifecycle, runtime list, tags, repository metadata, and every subordinate record.

## Spec

Change contract unique by `(project, slug)`. State follows:

`draft → clarified → planned → implementing → verifying → accepted → shipped`

Any active state may move to `blocked`; cancelled and shipped are terminal. Returning to an earlier state is explicit and audited.

## Run

One execution of a named workflow by a runtime/model. It may attach to a spec. A run begins as `running` and ends exactly once as passed, failed, blocked, or cancelled.

## Evidence

Immutable observation of a verification activity. The latest record per evidence kind is authoritative for the current gate. A warning or skipped record does not satisfy a requirement.

## Finding

Idempotent issue keyed by `(project, fingerprint)`. Severity and resolution state determine whether it blocks the gate for a project's risk tier.

## Decision

Immutable ADR-like record containing context, decision, consequences, and status. Accepted risk must be represented as a decision as well as a finding state.

## Audit event

Append-only record of every mutation, with actor, action, entity, payload summary, and timestamp. It is not used as mutable application state.
