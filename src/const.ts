// __MZCS_DEV__ is injected by Vite (`npm run build:dev` / `vite build --mode dev`).
// The dev build registers a parallel `-dev` element so a development copy can
// coexist on the same HA instance as the HACS-installed release without the
// two fighting over the custom-element name (first-registration wins).
declare const __MZCS_DEV__: boolean | undefined;
const DEV = typeof __MZCS_DEV__ !== 'undefined' && __MZCS_DEV__;

export const CARD_VERSION = '0.1.0';
export const CARD_TYPE = DEV ? 'multizone-climate-scheduler-card-dev' : 'multizone-climate-scheduler-card';
export const CARD_NAME = DEV ? 'Multi-Zone Climate Scheduler Card (DEV)' : 'Multi-Zone Climate Scheduler Card';
export const EDITOR_TYPE = `${CARD_TYPE}-editor`;
export const MZCS_LABEL = 'mzcs';
