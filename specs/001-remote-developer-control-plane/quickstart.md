# Quickstart

1. Copy `control-plane/.env.example` to `.env` and generate three independent secrets.
2. Run `docker compose up --build -d` from `control-plane/`.
3. Confirm `GET /health/ready` returns `{"status":"ready"}`.
4. Configure a remote MCP client with URL `https://<host>/mcp`, OAuth disabled, and an authorization bearer header.
5. Call `developer_project_upsert`, then `developer_project_snapshot`.
6. Open the dashboard, authenticate, and verify the project appears.
7. Create a spec, start a run, record evidence, finish the run, and evaluate the gate.

Never place production secrets in repository configuration. Use runtime environment or the client's secret store.
