# sandbox

[Alchemy](https://alchemy.run) stack: a GKE Autopilot cluster in `us-west1`.

```bash
bun install
bun check          # typecheck
bun lint           # lint (needs bun canary for now)
bun run deploy     # alchemy deploy --stage prod
bun run destroy
```

State lives locally in `.alchemy/` (gitignored).
