#!/usr/bin/env node
/**
 * One-shot local verification pipeline for ShilpSaarthi.
 * Assumes the local Supabase stack is already running (`supabase start`).
 *
 * Runs, in order:
 *   supabase db reset · supabase test db · supabase db lint
 *   pnpm lint · pnpm typecheck · pnpm test · pnpm build
 *   Playwright E2E (against a freshly seeded DB + production server on :3100)
 *
 * Exits non-zero on the first failure. Prints a summary table at the end.
 */
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const PORT = process.env.E2E_PORT ?? '3100';
const results = [];

function run(label, cmd, args, opts = {}) {
  process.stdout.write(`\n\x1b[1m▶ ${label}\x1b[0m  (${cmd} ${args.join(' ')})\n`);
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: false, ...opts });
  const ok = r.status === 0;
  results.push({ label, ok });
  if (!ok) {
    summarize();
    process.exit(r.status ?? 1);
  }
}

function summarize() {
  process.stdout.write('\n\x1b[1m=== Verification summary ===\x1b[0m\n');
  for (const { label, ok } of results) {
    process.stdout.write(`  ${ok ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m'}  ${label}\n`);
  }
}

async function waitForServer(url, attempts = 60) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      /* not up yet */
    }
    await sleep(1000);
  }
  return false;
}

// --- Database -----------------------------------------------------------------
run('supabase db reset', 'supabase', ['db', 'reset']);
run('supabase test db (pgTAP)', 'supabase', ['test', 'db']);
run('supabase db lint', 'supabase', ['db', 'lint']);

// --- Static checks + unit tests + build --------------------------------------
run('pnpm lint', 'pnpm', ['lint']);
run('pnpm typecheck', 'pnpm', ['typecheck']);
run('pnpm test (vitest)', 'pnpm', ['test']);
run('pnpm build', 'pnpm', ['build']);

// --- E2E ----------------------------------------------------------------------
process.stdout.write('\n\x1b[1m▶ Starting production server for E2E\x1b[0m\n');
const server = spawn('pnpm', ['start', '-p', PORT], { stdio: 'ignore', detached: true });
try {
  const up = await waitForServer(`http://127.0.0.1:${PORT}/`);
  if (!up) {
    results.push({ label: 'start server', ok: false });
    summarize();
    process.exit(1);
  }
  results.push({ label: 'start server', ok: true });
  run('playwright e2e', 'pnpm', ['exec', 'playwright', 'test']);
} finally {
  try {
    process.kill(-server.pid);
  } catch {
    /* already gone */
  }
}

summarize();
process.stdout.write('\n\x1b[32mAll verification steps passed.\x1b[0m\n');
