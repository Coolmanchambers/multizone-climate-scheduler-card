// Minimal hass surface the card depends on. Anything richer goes through
// src/ha-adapter.ts (the single choke point for HA internals - see CONTRACT).

export interface HassEntity {
  state: string;
  attributes: Record<string, unknown>;
}

export interface HassLike {
  states: Record<string, HassEntity | undefined>;
  callService(
    domain: string,
    service: string,
    data?: Record<string, unknown>,
  ): Promise<unknown>;
  callWS?(msg: Record<string, unknown>): Promise<unknown>;
}
