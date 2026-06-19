# Release Performance Scorecard

Use `pnpm run verify:release-perf-scorecard` after building renderer assets. The scorecard reads `out/renderer/assets` and optional benchmark reports under `perf-results/release/`, with fallback support for the current local `test-results/perf-audit-2026-06-19/` path.

## Current Baseline

Measured locally on 2026-06-19:

- Idle CPU short run: total mean 0.81%, renderer mean 0%.
- Terminal scale report: budget passed for 15 annotation rows, including 100-pane scale scenarios.
- PTY batching: bounded max callback 0.318ms; current ingress max 17.565ms.
- File explorer projection: indexed visible-window p95 0.002ms on a 115,280-path fixture.

## Highest Perf Risks

The current hot spot is startup and first-interaction weight, not idle CPU or terminal typing latency.

- Initial renderer chunk is multi-megabyte and should stay under the scorecard budget.
- `scroll-cache` should stay below 3 MiB; diagram, Monaco, and PDF vendors are split away from the editor/preview path.
- Monaco workers, Settings, TerminalPane, TaskPage, image/PDF viewers, diagram engines, and editor surfaces are large enough that accidental eager imports should be treated as release risk.
- Vite warnings show several modules are both statically and dynamically imported, which defeats intended lazy-loading.

On 2026-06-19, renderer manual chunks moved Mermaid/Cytoscape/Dagre into `vendor-diagrams`, Monaco into `vendor-monaco`, and PDF.js into `vendor-pdf`. That reduced the generated `scroll-cache` asset from about 9.86 MiB to about 1.90 MiB while keeping the diagram libraries together to avoid Rollup circular chunk warnings.

## Release Use

Recommended fast pre-release loop:

```bash
pnpm run build:electron-vite
pnpm run verify:release-perf-scorecard
pnpm run verify:janus-workflow-assurance
```

Recommended deeper perf loop before a public download:

```bash
mkdir -p perf-results/release
pnpm run bench:idle-cpu -- --warmup-ms 15000 --sample-ms 30000 --output perf-results/release/idle-cpu.json
pnpm run test:e2e:terminal-perf:scale:report -- --report perf-results/release/terminal-scale-report.json
pnpm run verify:release-perf-scorecard
```
