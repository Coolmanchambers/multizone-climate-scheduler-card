#!/usr/bin/env node
// Fails if anything git-tracked looks like it leaks the maintainer's home.
//
// This repo is public and its working copy sits next to a real Home Assistant
// install, so private detail has reached tracked files before (a LAN address, an
// email, family names against room names). This is the mechanical guard.
//
// The checks here are deliberately GENERIC - private IPs, emails, HA URLs,
// local filesystem paths - because this script is itself public. A list of
// literal personal terms would leak exactly what it exists to protect.
// Personal terms therefore live in `.privacy-terms`, which is gitignored: it is
// loaded when present (locally, via `npm run privacy`) and simply absent in CI.
//
// Structural control, worth more than either: HANDOFF.md - the only file that
// ever carried names - is not tracked.

import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

const SKIP_EXT = /\.(png|jpe?g|gif|ico|woff2?|ttf)$/i;
const SKIP_FILE = new Set(['package-lock.json', 'scripts/privacy-scan.mjs']);

// Legitimately public and expected to appear in tracked text.
const ALLOW = [/^noreply@anthropic\.com$/i, /^[\w.+-]+@example\.(com|org)$/i];

const CHECKS = [
  // 192.168.x.x, 10.x.x.x, 172.16-31.x.x
  { id: 'private-ip', re: /\b(?:192\.168|10)\.\d{1,3}\.\d{1,3}(?:\.\d{1,3})?\b|\b172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}\b/g,
    why: 'a private LAN address' },
  { id: 'email', re: /\b[\w.+-]+@(?!example\.(?:com|org)\b)[\w-]+\.[\w.-]+\b/g,
    why: 'an email address' },
  { id: 'ha-url', re: /https?:\/\/[^\s`'"]*:8123\b/g,
    why: 'a Home Assistant URL with its port' },
  { id: 'local-path', re: /\b[A-Za-z]:\Users\[^\\s'"`]+/g,
    why: 'a local user profile path' },
  { id: 'nabu-casa', re: /\b[\w-]+\.ui\.nabu\.casa\b/g,
    why: 'a Nabu Casa remote URL' },
];

function extraChecks() {
  if (!existsSync('.privacy-terms')) return [];
  return readFileSync('.privacy-terms', 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((src, i) => ({ id: `local-term-${i + 1}`, re: new RegExp(src, 'g'), why: 'a term from .privacy-terms' }));
}

const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
  .split('\n')
  .filter((f) => f && !SKIP_EXT.test(f) && !SKIP_FILE.has(f));

// Files that must never be tracked again, whatever they happen to contain
// today. HANDOFF.md is session state: it accumulated family names against room
// names, a LAN address and an email, and its history had to be rewritten to get
// them out. A content scan would not catch it being re-added on a quiet day.
const NEVER_TRACK = ['HANDOFF.md', '.privacy-terms'];
const tracked = new Set(files);
const structural = NEVER_TRACK.filter((f) => tracked.has(f));

const checks = [...CHECKS, ...extraChecks()];
const local = checks.length - CHECKS.length;
const findings = [];

for (const file of files) {
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    continue; // unreadable or binary; nothing to leak that we can read
  }
  const lines = text.split('\n');
  for (const check of checks) {
    lines.forEach((line, i) => {
      check.re.lastIndex = 0;
      const m = check.re.exec(line);
      if (m && !ALLOW.some((a) => a.test(m[0]))) {
        findings.push({ file, line: i + 1, id: check.id, why: check.why, hit: m[0] });
      }
    });
  }
}

const scope = `${files.length} tracked files, ${CHECKS.length} generic checks` +
  (local ? ` + ${local} local terms` : ', no .privacy-terms present (expected in CI)');

if (structural.length) {
  console.error('privacy scan: files that must never be tracked are tracked:');
  for (const f of structural) console.error(`  ${f}`);
  console.error(
    '\nRun `git rm --cached <file>` and leave it gitignored. It stays on disk;' +
      '\nit just never enters a public repository again.',
  );
  process.exit(1);
}

if (findings.length === 0) {
  console.log(`privacy scan: clean (${scope}, ${NEVER_TRACK.length} never-track rules)`);
  process.exit(0);
}

console.error(`privacy scan: ${findings.length} finding(s) (${scope})\n`);
for (const f of findings) {
  console.error(`  ${f.file}:${f.line}  ${f.id}  ${f.why}: ${f.hit}`);
}
console.error(`
This repository is public. Remove the detail, or - if it is genuinely a false
positive - narrow the pattern in scripts/privacy-scan.mjs rather than deleting
the check.`);
process.exit(1);
