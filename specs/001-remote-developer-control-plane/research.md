# Research Decisions

## MCP protocol

Use MCP 2026-07-28 as the native protocol: stateless core, explicit request metadata, no hidden transport session, cacheable list/resource results, and headers suitable for gateway policy. Use the official SDK's legacy stateless fallback for current clients that still negotiate a 2025 revision.

## Spec lifecycle

Adopt a spec-anchored persistence model. A completed feature keeps its specification as a durable historical contract. Later discoveries are recorded as decisions, findings, or follow-up specs rather than silently rewriting history.

## Agent neutrality

MCP resources, prompts, and JSON-schema tools replace vendor-specific slash commands and agent files. The server does not rely on Claude subagents, OpenCode modes, Codex skills, or a client filesystem root.

## Quality model

Do not use a universal coverage percentage. Risk tiers define required evidence kinds. Gates consume actual evidence and unresolved findings. This maps better to NIST SSDF outcomes and prevents an AI runtime from self-certifying completion.

## Security model

Use a shared bearer key for the single-owner first deployment, constant-time comparison, strict origin/host checks, secure dashboard sessions, PostgreSQL constraints, container hardening, and Tailscale TLS. OIDC with per-client scopes is the required next step before multi-user exposure.
