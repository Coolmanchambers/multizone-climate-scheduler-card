export type SeasonSwitchMode = 'manual' | 'semi' | 'full';
export type DayGranularity = 'all' | 'wdwe' | 'days';
export type BlockMode = 'cool' | 'heat' | 'heat_cool' | 'off';

export interface ZoneConfig {
  entity: string;
  name: string;
  room_sensors?: string[];
}

export interface SeasonConfig {
  key: string;
  name: string;
  default_mode: BlockMode;
}

export interface MzcsCardConfig {
  type: string;
  prefix?: string;
  zones: ZoneConfig[];
  seasons?: SeasonConfig[];
  season_switch?: SeasonSwitchMode;
  weather_entity?: string;
  features?: {
    fan_timer?: number[];
    anomaly_alerts?: boolean;
    /** helper entity the fan-off automations must respect (skip while 'on') */
    fan_guard?: string;
  };
}
