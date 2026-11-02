import { describe, expect, it } from 'vitest';
import { theme } from '../../carnival';
import { POP_SECONDS, SPACING, createState, isPopped, poppedCount, step } from './game';

const { width: WIDTH, height: HEIGHT } = theme.canvas;

describe('popcorn stand', () => {
  it('starts with no popped kernels', () => {
    const state = createState();
    expect(state.phase).toBe('popping');
    expect(state.elapsed).toBe(0);
    expect(state.kernels.length).toBeGreaterThan(0);
    expect(poppedCount(state)).toBe(0);
  });

  it('lays kernels over the whole canvas', () => {
    const state = createState(() => 0.5);
    const columns = new Set(state.kernels.map((k) => k.x)).size;
    const rows = new Set(state.kernels.map((k) => k.y)).size;
    expect(columns * SPACING).toBeGreaterThanOrEqual(WIDTH);
    expect(rows * SPACING).toBeGreaterThanOrEqual(HEIGHT);
  });

  it('pops every kernel within five seconds', () => {
    const state = createState();
    for (const kernel of state.kernels) {
      expect(kernel.popAt).toBeGreaterThanOrEqual(0);
      expect(kernel.popAt).toBeLessThan(POP_SECONDS);
    }
  });

  it('pops a kernel once its moment has passed', () => {
    const state = createState();
    const kernel = { ...state.kernels[0], popAt: 2 };
    state.kernels = [kernel];
    step(state, 1.9);
    expect(isPopped(state, kernel)).toBe(false);
    step(state, 0.2);
    expect(isPopped(state, kernel)).toBe(true);
  });

  it('keeps popping until five seconds have passed', () => {
    const state = createState();
    step(state, POP_SECONDS - 0.01);
    expect(state.phase).toBe('popping');
  });

  it('is done after five seconds, with every kernel popped', () => {
    const state = createState();
    step(state, POP_SECONDS);
    expect(state.phase).toBe('done');
    expect(poppedCount(state)).toBe(state.kernels.length);
  });

  it('stops the clock at five seconds', () => {
    const state = createState();
    step(state, POP_SECONDS);
    step(state, 3);
    expect(state.elapsed).toBe(POP_SECONDS);
  });
});
