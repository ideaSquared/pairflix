# Scripts

## test-performance.js

A standalone Node script that checks a fixed list of files for the presence of specific
performance-optimization patterns (`React.memo`, `useCallback`, `useMemo`, debounced search, lazy
image loading, virtualization hooks, etc.), plus a couple of docs/PRD markers. It prints a pass/fail
line per check and a summary, and exits `1` if anything failed.

It reads files directly off disk (no build step, no dependencies beyond Node's `fs`) and is not wired
into any workspace's `test` script or `pnpm test` — run it directly from the repo root, since its file
paths are relative to the current working directory:

```bash
node scripts/test-performance.js
```
