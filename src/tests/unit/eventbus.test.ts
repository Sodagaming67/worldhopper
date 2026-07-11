import { describe, it, expect, vi } from 'vitest';
import { EventBus } from '@/game/EventBus';

describe('EventBus', () => {
  it('delivers typed payloads to subscribers', () => {
    const cb = vi.fn();
    EventBus.on('landmark:near', cb);
    EventBus.emit('landmark:near', { id: 'turtleglassLagoon' });
    expect(cb).toHaveBeenCalledWith({ id: 'turtleglassLagoon' });
    EventBus.off('landmark:near', cb);
  });

  it('is a singleton across imports', async () => {
    const again = (await import('@/game/EventBus')).EventBus;
    expect(again).toBe(EventBus);
  });
});
