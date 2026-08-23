// Naming contract (CONTRACT.md §5): pure functions, no Lit/hass imports.
// Scaffold stub - the full generator/parser with round-trip tests lands in S1.

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function fanTimerId(prefix: string, zone: string): string {
  return `timer.${prefix}_${zone}_fan`;
}

export function runningSensorId(prefix: string, zone: string): string {
  return `binary_sensor.${prefix}_${zone}_running`;
}
