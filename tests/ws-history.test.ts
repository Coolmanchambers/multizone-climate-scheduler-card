import { describe, it, expect } from 'vitest';
import { wsHistoryToPoints } from '../src/ha-adapter';

describe('wsHistoryToPoints', () => {
  it('maps minimal state rows (seconds → ms)', () => {
    expect(
      wsHistoryToPoints([
        { s: 'off', lu: 1000 },
        { s: 'on', lu: 2000 },
      ]),
    ).toEqual([
      { t: 1_000_000, state: 'off' },
      { t: 2_000_000, state: 'on' },
    ]);
  });

  it('extracts an attribute series and skips rows without it', () => {
    expect(
      wsHistoryToPoints(
        [
          { s: 'cool', lu: 1, a: { temperature: 76 } },
          { s: 'cool', lu: 2 },
          { s: 'cool', lu: 3, a: { temperature: 78 } },
        ],
        'temperature',
      ),
    ).toEqual([
      { t: 1000, state: '76' },
      { t: 3000, state: '78' },
    ]);
  });

  it('drops rows without timestamps', () => {
    expect(wsHistoryToPoints([{ s: 'on' }])).toEqual([]);
  });
});
