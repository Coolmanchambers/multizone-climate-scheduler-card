// Minimal hass surface the card depends on. Anything richer goes through
// src/ha-adapter.ts (the single choke point for HA internals - see CONTRACT).

export interface HassEntity {
  state: string;
  attributes: Record<string, unknown>;
  /**
   * HA 2024.8+: advances on EVERY report, including a re-report of an
   * identical value. This - not last_updated - is what "still talking to us"
   * means. Absent on older cores and in fixtures.
   */
  last_reported?: string;
  /** Advances only when state or attributes actually change. */
  last_updated?: string;
}

export interface HassLike {
  states: Record<string, HassEntity | undefined>;
  /** Core version, for the diagnostics blob. Absent in older fixtures. */
  config?: { version?: string };
  callService(
    domain: string,
    service: string,
    data?: Record<string, unknown>,
  ): Promise<unknown>;
  callWS?(msg: Record<string, unknown>): Promise<unknown>;
  /** REST via the frontend session - config flows + automation config API. */
  callApi?(method: string, path: string, data?: Record<string, unknown>): Promise<unknown>;
}
