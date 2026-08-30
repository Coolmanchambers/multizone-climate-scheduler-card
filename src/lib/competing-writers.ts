// Competing-writer detection (backlog item 33): find anything OTHER than this
// card that writes to a managed zone's thermostat.
//
// Two schedulers fighting over one thermostat is the failure mode this project
// documents most loudly and, until now, could only warn about in prose. The
// symptom is setpoints that appear to "change themselves" at odd times, and it
// is close to undiagnosable from the card alone.
//
// Pure by design: no Lit, no hass, no imports. The fetching lives in
// ha-adapter.ts; everything here is a function of plain JSON, so the whole
// matcher is testable in a node environment.

/** A setpoint/mode writer fights the engine. A preset/fan writer changes how it behaves. */
export type Severity = 'conflict' | 'note';

/**
 * `certain` = the target resolved to a managed zone. `possible` = a template
 * stood between us and the answer. Possible findings are still reported: the
 * only unacceptable outcome for this feature is a false all-clear.
 */
export type Confidence = 'certain' | 'possible';

/** How the call reached the zone. Shown to the user, because "via area" changes the fix. */
export type Via = 'entity' | 'area' | 'device' | 'label' | 'all' | 'template' | 'floor' | 'group' | 'blueprint';

/**
 * Services that overwrite what the schedule engine wrote.
 *
 * `climate.turn_off` / `turn_on` / `toggle` and the `homeassistant.*` trio are
 * NOT scope creep beyond "set_temperature and set_hvac_mode": they ARE
 * set_hvac_mode under a different service name. Scanning only the two obvious
 * ones would hand a clean bill of health to an automation doing
 * `climate.turn_off` on a managed zone, which is a false all-clear on the exact
 * failure mode this scan exists to catch. Round 3 of this project's own QA
 * caught `homeassistant.turn_off` with a legacy target slipping past two
 * guards; this is that shape.
 */
const CONFLICT_SERVICES = new Set([
  'climate.set_temperature',
  'climate.set_hvac_mode',
  'climate.turn_on',
  'climate.turn_off',
  'climate.toggle',
  'homeassistant.turn_on',
  'homeassistant.turn_off',
  'homeassistant.toggle',
]);

/**
 * Services that do not fight the setpoint but change what the engine does.
 * A preset writer produces a DIFFERENT symptom from a setpoint writer: the
 * schedule quietly stops applying, because the engine stands down while the
 * standby preset is on. Same root cause, different user report, so it is
 * reported separately rather than mixed into the conflict list.
 */
const NOTE_SERVICES = new Set(['climate.set_preset_mode', 'climate.set_fan_mode']);

export interface ExtractedTarget {
  entityIds: string[];
  areaIds: string[];
  deviceIds: string[];
  labelIds: string[];
  floorIds: string[];
  /** the `all` keyword - reaches every entity the service applies to */
  all: boolean;
  /** at least one selector was a template, so its real value is unknowable here */
  templated: boolean;
}

export interface RawServiceCall {
  /** normalized `domain.service`, or null when the service itself was templated */
  service: string | null;
  serviceTemplated: boolean;
  /**
   * For a templated service: the static domain prefix before the template
   * (`climate.set_{{x}}` -> 'climate'), or null when the template starts before
   * the domain is complete. Lets the matcher drop calls that provably cannot be
   * a watched service (QA S7) without dropping the indeterminate ones.
   */
  serviceDomain?: string | null;
  target: ExtractedTarget;
}

export interface ZoneRef {
  entityId: string;
  name: string;
  areaId?: string | null;
  deviceId?: string | null;
  /**
   * The entity's registry uuid. Modern UI-built device actions store the target
   * as this uuid rather than the entity id (QA S1), so matching without it
   * silently misses them.
   */
  registryId?: string | null;
  labels?: string[];
}

export interface WriterSource {
  /** the automation/script ENTITY id, e.g. `automation.evening_cooldown` */
  id: string;
  name: string;
  kind: 'automation' | 'script';
  /** entity state at scan time; false = currently off. Off automations are
   * still reported - they can be re-enabled - but the row says so (QA P3). */
  enabled?: boolean;
  config: unknown;
}

export interface Finding {
  sourceId: string;
  sourceName: string;
  sourceKind: 'automation' | 'script';
  /** the service called, or the `(templated)` placeholder */
  service: string;
  zoneEntityId: string | null;
  zoneName: string | null;
  severity: Severity;
  confidence: Confidence;
  via: Via;
  /** false = the automation was off at scan time (still a finding - one toggle re-arms it) */
  sourceEnabled?: boolean;
}

const TEMPLATED_SERVICE = '(templated service)';

function isTemplate(s: string): boolean {
  return s.includes('{{') || s.includes('{%');
}

/**
 * Read a node's service name from every spelling Home Assistant has used.
 *
 * `service:` is the pre-2024.10 name for `action:` and is still accepted by
 * core, so reading only one of them is a blind spot - this project's own
 * harness had exactly that hole (H1), and a `service:`-spelled write to the
 * kill switch went past 364 green tests.
 *
 * `action` is only a service name when it is a STRING: at automation top level
 * `action:` is the list of steps. The recursion walks that list anyway.
 */
function serviceOf(
  node: Record<string, unknown>,
): { service: string | null; templated: boolean; domain: string | null } | null {
  const raw =
    typeof node.action === 'string'
      ? node.action
      : typeof node.service === 'string'
        ? node.service
        : typeof node.service_template === 'string'
          ? node.service_template
          : null;
  if (raw == null) return null;
  if ('service_template' in node || isTemplate(raw)) {
    // The static prefix before the template decides relevance (QA S7): a
    // completed foreign domain (`notify.mobile_{{x}}`) provably cannot be a
    // watched call and is droppable; `climate.set_{{x}}` or `{{svc}}` cannot be
    // ruled out and must survive to the matcher.
    const stat = raw.slice(0, raw.search(/\{[{%]/) >= 0 ? raw.search(/\{[{%]/) : raw.length);
    const domain = stat.includes('.') ? stat.slice(0, stat.indexOf('.')).trim().toLowerCase() : null;
    return { service: null, templated: true, domain: domain || null };
  }
  const s = raw.trim().toLowerCase();
  return s ? { service: s, templated: false, domain: s.split('.')[0] ?? null } : null;
}

/**
 * A UI-built DEVICE ACTION carries no service key at all - just
 * `{device_id, domain, type}` plus the parameters (QA S1, the sweep's worst
 * finding: 3 reviewers confirmed these scan invisibly, and they are the shape
 * the HA automation editor produced by default for years). Synthesized here
 * into the equivalent `domain.type` service so the same severity sets apply.
 * Device TRIGGERS (`platform:`/`trigger:` string) and CONDITIONS
 * (`condition:` string) share the key shape and are excluded; their types
 * (`hvac_mode_changed`, `is_hvac_mode`) would not map to watched services
 * anyway, so the guard is belt and braces.
 */
function deviceActionOf(node: Record<string, unknown>): string | null {
  if (
    typeof node.device_id !== 'string' ||
    typeof node.domain !== 'string' ||
    typeof node.type !== 'string'
  )
    return null;
  if (typeof node.platform === 'string' || typeof node.condition === 'string' || typeof node.trigger === 'string')
    return null;
  return `${node.domain}.${node.type}`.trim().toLowerCase();
}

function pushIds(value: unknown, into: string[], flags: { all: boolean; templated: boolean }): void {
  if (typeof value === 'string') {
    if (isTemplate(value)) {
      flags.templated = true;
      return;
    }
    // Legacy comma-separated form: `entity_id: climate.a, climate.b` is one
    // string. Compared whole it matches nothing (QA S4) - exactly the aged
    // configs most likely to hide a forgotten writer.
    if (value.includes(',')) {
      for (const part of value.split(',')) pushIds(part, into, flags);
      return;
    }
    const v = value.trim();
    if (!v || v === 'none') return;
    if (v === 'all') {
      flags.all = true;
      return;
    }
    into.push(v);
    return;
  }
  if (Array.isArray(value)) for (const v of value) pushIds(v, into, flags);
}

/**
 * Collect a call's targets from `target:`, the legacy `data:` form, and the
 * even older bare `entity_id:`. All three are live in real configs, and a
 * `homeassistant.turn_off` carrying a legacy target is precisely what slipped
 * past two of this project's guards in round 3 (finding NEW-2).
 */
function targetOf(node: Record<string, unknown>): ExtractedTarget {
  const flags = { all: false, templated: false };
  const entityIds: string[] = [];
  const areaIds: string[] = [];
  const deviceIds: string[] = [];
  const labelIds: string[] = [];
  const floorIds: string[] = [];
  // data_template is the historical pairing for service_template and still
  // accepted by core; omitting it was the same NEW-2 hole one key over (QA S3).
  const holders: unknown[] = [node.target, node.data, node.data_template, node];
  for (const h of holders) {
    // `target: "{{ ... }}"` - the whole holder as one template string (QA S6).
    if (typeof h === 'string' && isTemplate(h)) {
      flags.templated = true;
      continue;
    }
    if (!h || typeof h !== 'object' || Array.isArray(h)) continue;
    const o = h as Record<string, unknown>;
    pushIds(o.entity_id, entityIds, flags);
    pushIds(o.area_id, areaIds, flags);
    pushIds(o.device_id, deviceIds, flags);
    pushIds(o.label_id, labelIds, flags);
    // floor targets shipped in HA 2024.4 (QA S5); ZoneRef carries no floor, so
    // these surface as a possible finding rather than resolving - dropping them
    // was a false all-clear.
    pushIds(o.floor_id, floorIds, flags);
  }
  return {
    entityIds: [...new Set(entityIds)],
    areaIds: [...new Set(areaIds)],
    deviceIds: [...new Set(deviceIds)],
    labelIds: [...new Set(labelIds)],
    floorIds: [...new Set(floorIds)],
    all: flags.all,
    templated: flags.templated,
  };
}

/** Deep enough for any real config; a cap only so a pathological input cannot hang the browser. */
const MAX_DEPTH = 100;

/**
 * Every service call anywhere in an automation or script config.
 *
 * The walk is blind recursion rather than an enumeration of known action
 * containers (`choose`, `if`, `repeat`, `parallel`, `sequence`, ...). That is
 * deliberate: an enumeration is a list that goes stale the moment Home
 * Assistant adds a container, and a stale list here means a silent blind spot
 * in a safety warning. The cost is that a data payload carrying a field
 * literally equal to a watched service name would false-positive - a false
 * alarm, never a false all-clear, which is the direction this feature must
 * fail in.
 */
export function collectServiceCalls(node: unknown, depth = 0, out: RawServiceCall[] = []): RawServiceCall[] {
  if (depth > MAX_DEPTH || node == null || typeof node !== 'object') return out;
  if (Array.isArray(node)) {
    for (const child of node) collectServiceCalls(child, depth + 1, out);
    return out;
  }
  const o = node as Record<string, unknown>;
  const svc = serviceOf(o);
  if (svc) {
    out.push({
      service: svc.service,
      serviceTemplated: svc.templated,
      serviceDomain: svc.domain,
      target: targetOf(o),
    });
  } else {
    const dev = deviceActionOf(o);
    // targetOf on the node itself picks up the action's own device_id and
    // entity_id keys - no special-casing needed for the target side.
    if (dev) out.push({ service: dev, serviceTemplated: false, serviceDomain: dev.split('.')[0] ?? null, target: targetOf(o) });
  }
  for (const key in o) collectServiceCalls(o[key], depth + 1, out);
  return out;
}

/**
 * Is this automation one of ours?
 *
 * Requires BOTH the generated id prefix AND the mzcs label. The id alone is not
 * enough, and the failure direction is why: excluding a foreign automation that
 * merely looks like ours would silently drop it from a safety scan. The label is
 * the registry's own answer, the same rule `fetchExisting` uses to decide what
 * is managed.
 */
export function isOwnAutomation(
  configId: unknown,
  labels: string[],
  prefix: string,
  ownLabel: string,
): boolean {
  return (
    typeof configId === 'string' &&
    configId.startsWith(`${prefix}_mzcs_`) &&
    labels.includes(ownLabel)
  );
}

/** Domains any watched service lives in. A templated service whose static
 * prefix completes a domain OUTSIDE this set provably cannot be a watched call. */
const WATCHED_DOMAINS = new Set(['climate', 'homeassistant']);

function severityOf(call: RawServiceCall): Severity | null {
  if (call.service == null) {
    // Templated service: droppable only when the static prefix PROVES it is a
    // foreign domain (`notify.mobile_{{x}}`). Indeterminate or watched-domain
    // prefixes survive as possible - dropping them was the false all-clear side
    // of QA S7; reporting the provably-foreign ones was its cry-wolf side.
    const d = call.serviceDomain;
    return d == null || WATCHED_DOMAINS.has(d) ? 'conflict' : null;
  }
  if (CONFLICT_SERVICES.has(call.service)) return 'conflict';
  if (NOTE_SERVICES.has(call.service)) return 'note';
  return null;
}

interface Match {
  zone: ZoneRef | null;
  via: Via;
  confidence: Confidence;
}

function matchesZone(target: ExtractedTarget, zone: ZoneRef): Via | null {
  if (target.entityIds.includes(zone.entityId)) return 'entity';
  // Modern device actions store the target entity as its registry uuid (QA S1).
  if (zone.registryId && target.entityIds.includes(zone.registryId)) return 'entity';
  if (target.all) return 'all';
  if (zone.areaId && target.areaIds.includes(zone.areaId)) return 'area';
  if (zone.deviceId && target.deviceIds.includes(zone.deviceId)) return 'device';
  if ((zone.labels ?? []).some((l) => target.labelIds.includes(l))) return 'label';
  return null;
}

/**
 * Matches for one call. When nothing resolves directly, the unresolvable
 * shapes each surface as ONE possible finding instead of vanishing - every row
 * here was a proven false all-clear in the tier-3a QA sweep:
 * templated selectors (original behaviour), floor targets (S5 - no floor data
 * on ZoneRef), group entities (S8 - members not expanded, tier-D deferral
 * stands), and a relevant templated service with no readable target (S7).
 */
function matchesFor(call: RawServiceCall, zones: ZoneRef[]): Match[] {
  const target = call.target;
  const out: Match[] = [];
  for (const zone of zones) {
    const via = matchesZone(target, zone);
    if (via) out.push({ zone, via, confidence: 'certain' });
  }
  if (out.length === 0) {
    if (target.templated) out.push({ zone: null, via: 'template', confidence: 'possible' });
    else if (target.floorIds.length > 0) out.push({ zone: null, via: 'floor', confidence: 'possible' });
    else if (target.entityIds.some((id) => id.startsWith('group.')))
      out.push({ zone: null, via: 'group', confidence: 'possible' });
    else if (call.serviceTemplated) out.push({ zone: null, via: 'template', confidence: 'possible' });
  }
  return out;
}

/** True when the stored config is a blueprint instance - the action list lives
 * in the blueprint FILE and is not in the config API payload at all (QA S2,
 * the sweep's most-confirmed false all-clear: 4 reviewers). */
export function isBlueprintConfig(config: unknown): boolean {
  return (
    config != null && typeof config === 'object' && !Array.isArray(config) && 'use_blueprint' in (config as object)
  );
}

/** Every string value anywhere under a blueprint's `use_blueprint` block. */
function blueprintInputStrings(node: unknown, out: string[] = [], depth = 0): string[] {
  if (depth > MAX_DEPTH || node == null) return out;
  if (typeof node === 'string') {
    out.push(node);
    return out;
  }
  if (Array.isArray(node)) {
    for (const v of node) blueprintInputStrings(v, out, depth + 1);
    return out;
  }
  if (typeof node === 'object') {
    const o = node as Record<string, unknown>;
    for (const key in o) blueprintInputStrings(o[key], out, depth + 1);
  }
  return out;
}

/** Every non-MZCS writer that reaches a managed zone. Deduplicated. */
export function findCompetingWriters(sources: WriterSource[], zones: ZoneRef[]): Finding[] {
  const out: Finding[] = [];
  const seen = new Set<string>();
  const push = (f: Finding) => {
    const key = f.sourceId + '|' + f.service + '|' + f.zoneEntityId + '|' + f.via;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(f);
  };
  for (const source of sources) {
    if (isBlueprintConfig(source.config)) {
      // The blueprint's inputs are all we can see: a zone entity handed to a
      // blueprint is very likely handed to it as the thing it controls, so it
      // is reported as a possible conflict naming the zone. A blueprint whose
      // inputs never mention a zone is left to the summary's disclosed count.
      const inputs = blueprintInputStrings((source.config as Record<string, unknown>).use_blueprint);
      for (const zone of zones) {
        if (inputs.includes(zone.entityId) || (zone.registryId != null && inputs.includes(zone.registryId))) {
          push({
            sourceId: source.id,
            sourceName: source.name,
            sourceKind: source.kind,
            service: '(blueprint)',
            zoneEntityId: zone.entityId,
            zoneName: zone.name,
            severity: 'conflict',
            confidence: 'possible',
            via: 'blueprint',
            sourceEnabled: source.enabled,
          });
        }
      }
      continue;
    }
    for (const call of collectServiceCalls(source.config)) {
      const severity = severityOf(call);
      if (!severity) continue;
      for (const m of matchesFor(call, zones)) {
        const confidence: Confidence =
          call.serviceTemplated || m.confidence === 'possible' ? 'possible' : 'certain';
        push({
          sourceId: source.id,
          sourceName: source.name,
          sourceKind: source.kind,
          service: call.service ?? TEMPLATED_SERVICE,
          zoneEntityId: m.zone?.entityId ?? null,
          zoneName: m.zone?.name ?? null,
          severity,
          confidence,
          via: m.via,
          sourceEnabled: source.enabled,
        });
      }
    }
  }
  return out;
}

export interface ScanCounts {
  /** configs fetched but unreadable - YAML automations AND scripts 404 on the config API */
  unreadable: number;
  /** this card's own automations, excluded by id AND label */
  skippedOwn: number;
  /** the candidate list hit the cap, so coverage is partial */
  capped: boolean;
  /** area/device matching was reduced (a registry read failed) - lost coverage
   * IS the false-all-clear direction, so it is disclosed, never silent (QA P5) */
  degraded: boolean;
}

export interface ScanResult extends ScanCounts {
  /** configs actually read and walked. `scanned: 0` is NOT the same as "nothing found" */
  scanned: number;
  /** blueprint-based automations - inspectable by their configured inputs ONLY (QA S2) */
  blueprints: number;
  conflicts: Finding[];
  notes: Finding[];
}

/**
 * Fold sources and counts into what the card renders.
 *
 * The counts travel WITH the findings on purpose. An empty findings list must
 * be readable as "scanned N, found none" and never as "could not look" - that
 * confusion is the same defect as the runtime drawer telling users to wait for
 * data that was never coming (backlog item 27).
 */
export function summarizeScan(
  sources: WriterSource[],
  zones: ZoneRef[],
  counts: ScanCounts,
): ScanResult {
  const findings = findCompetingWriters(sources, zones);
  const blueprints = sources.filter((src) => isBlueprintConfig(src.config)).length;
  return {
    ...counts,
    // Blueprint configs carry no action list, so they are inspectable by their
    // inputs only - counting them as plainly "scanned" inflated the all-clear
    // (QA S2). They get their own count and their own footer sentence.
    scanned: sources.length - blueprints,
    blueprints,
    conflicts: findings.filter((f) => f.severity === 'conflict'),
    notes: findings.filter((f) => f.severity === 'note'),
  };
}
