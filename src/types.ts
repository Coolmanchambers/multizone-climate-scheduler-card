export type SeasonSwitchMode = 'manual' | 'semi' | 'full';
export type DayGranularity = 'all' | 'wdwe' | 'days';
export type BlockMode = 'cool' | 'heat' | 'heat_cool' | 'off';

export interface ZoneConfig {
  entity: string;
  name: string;
  room_sensors?: string[];
  auto_discover_area?: boolean;
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
  };
  notify_target?: string;
}
