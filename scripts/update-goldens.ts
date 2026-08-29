/**
 * Regenerate the committed engine golden files (backlog item 6).
 *
 *   npm run goldens
 *
 * This is a DELIBERATE act, never automatic and never part of `npm test`. Every
 * generated automation carries its own content signature, so a changed golden
 * means every existing install will plan an Update for that automation on its
 * next dry-run. The script prints exactly which signatures moved, and how many
 * installs-worth of Updates that implies, before it writes anything.
 *
 * If you did not intend a signature to move, do not commit the regenerated file
 * - fix the generator so the default path stays byte-identical.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  canonicalInput,
  allPayloads,
  signaturesFor,
  inventoryFor,
  VARIANTS,
} from '../tests/fixtures/canonical-config';

const HERE = dirname(fileURLToPath(import.meta.url));
const DIR = join(HERE, '..', 'tests', 'engine-golden');

function write(name: string, value: unknown): void {
  writeFileSync(join(DIR, name), JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function readIfPresent(name: string): unknown {
  const p = join(DIR, name);
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null;
}

mkdirSync(DIR, { recursive: true });

/**
 * Compute every golden this run would write, keyed by filename.
 *
 * QA finding H2: this script used to diff `signatures.default.json` ONLY, then
 * write all 23 files. A generator change reachable only from a non-default
 * config - a string emitted only when `fan_guard` is set, say - regenerated its
 * goldens silently and the script printed "Existing installs plan 0 Updates."
 * while every install with a fan guard would plan 3. The all-clear was worse
 * than no message, because it was believed. Every file is diffed now.
 */
const pending = new Map<string, unknown>();
const base = canonicalInput();
pending.set('signatures.default.json', signaturesFor(base));
pending.set('automations.default.json', allPayloads(base));
pending.set('inventory.default.json', inventoryFor(base));
for (const v of VARIANTS) {
  const input = canonicalInput(v.overrides);
  pending.set(`automations.${v.name}.json`, allPayloads(input));
  pending.set(`inventory.${v.name}.json`, inventoryFor(input));
}

/** Signatures across the default AND every variant, keyed `variant/uid`. */
function allSignatures(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [uid, sig] of Object.entries(signaturesFor(base))) out[`default/${uid}`] = sig;
  for (const v of VARIANTS) {
    for (const [uid, sig] of Object.entries(signaturesFor(canonicalInput(v.overrides)))) {
      out[`${v.name}/${uid}`] = sig;
    }
  }
  return out;
}

// Report BEFORE writing: the whole point is that a surprise is visible.
const changedFiles = [...pending.entries()].filter(([name, value]) => {
  const prev = readIfPresent(name);
  return prev !== null && JSON.stringify(prev) !== JSON.stringify(value);
});
const newFiles = [...pending.keys()].filter((name) => readIfPresent(name) === null);

const prevSigs = readIfPresent('signatures.default.json') as Record<string, string> | null;
if (prevSigs === null) {
  console.log('goldens: no previous set, writing the first one.');
} else if (!changedFiles.length && !newFiles.length) {
  console.log('goldens: unchanged across the default AND all ' + VARIANTS.length + ' variants.');
  console.log('Installs matching those shapes plan 0 Updates. (A change reachable only from a');
  console.log('config OUTSIDE the matrix is invisible here - this line is not an all-clear.)');
} else {
  // Which SIGNATURES moved, per config - the thing that costs users Updates.
  const before = new Map<string, string>();
  for (const [name, value] of pending) {
    if (!name.startsWith('inventory.')) continue;
    const prev = readIfPresent(name) as Array<{ id: string; spec?: { sig?: string } }> | null;
    const variant = name.slice('inventory.'.length, -'.json'.length);
    for (const o of prev ?? []) {
      if (o.spec?.sig) before.set(`${variant}/${o.id.replace(/^automation:/, '')}`, o.spec.sig);
    }
    void value;
  }
  const now = allSignatures();
  const movedSigs = Object.keys(now).filter((k) => before.has(k) && before.get(k) !== now[k]);

  console.log('');
  console.log('  !!  GOLDENS MOVED  !!');
  console.log('');
  for (const [name] of changedFiles) console.log(`  changed  ${name}`);
  for (const name of newFiles) console.log(`  new      ${name}`);
  if (movedSigs.length) {
    console.log('');
    console.log('  Signatures that moved (config/automation):');
    for (const k of movedSigs) console.log(`    ${k}  ${before.get(k)} -> ${now[k]}`);
    const configs = new Set(movedSigs.map((k) => k.split('/')[0]));
    console.log('');
    console.log(`  Installs matching ${[...configs].join(', ')} will plan Updates on their next dry-run.`);
    console.log('  A config you did not intend to touch appearing here is the warning sign.');
  }
  console.log('');
  console.log('  If any of this was unintended, DO NOT COMMIT - branch the generator so the');
  console.log('  affected path emits the previous strings, and run this again.');
  console.log('  Remember to update the PINNED literals in tests/engine-golden.test.ts by hand.');
  console.log('');
}

for (const [name, value] of pending) write(name, value);

console.log(`goldens written: ${pending.size} files in tests/engine-golden/`);
