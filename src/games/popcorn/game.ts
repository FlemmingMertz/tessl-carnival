import { canvasFont, recordScore, theme, type CarnivalGame } from '../../carnival';

const { width: WIDTH, height: HEIGHT } = theme.canvas;

/** Seconds until every kernel has popped and the stand says "Happy eating!". */
export const POP_SECONDS = 5;
/** Space between kernels, in pixels. Small enough that popped kernels cover the canvas. */
export const SPACING = 40;
/** Seconds a kernel takes to puff up to full size once it pops. */
export const PUFF_SECONDS = 0.25;
export const MESSAGE = 'Happy eating!';

export interface Kernel {
  x: number;
  y: number;
  /** Seconds after the start when this kernel pops. */
  popAt: number;
  /** Turns the puff so the kernels don't all look the same. */
  angle: number;
}

export interface PopcornState {
  kernels: Kernel[];
  elapsed: number;
  phase: 'popping' | 'done';
}

/** Lays kernels over the whole canvas, each popping at a random moment in the first five seconds. */
export function createState(random: () => number = Math.random): PopcornState {
  const kernels: Kernel[] = [];
  for (let y = SPACING / 2; y < HEIGHT + SPACING / 2; y += SPACING) {
    for (let x = SPACING / 2; x < WIDTH + SPACING / 2; x += SPACING) {
      kernels.push({
        x: x + (random() - 0.5) * SPACING * 0.5,
        y: y + (random() - 0.5) * SPACING * 0.5,
        popAt: random() * POP_SECONDS,
        angle: random() * Math.PI * 2,
      });
    }
  }
  return { kernels, elapsed: 0, phase: 'popping' };
}

export function isPopped(state: PopcornState, kernel: Kernel): boolean {
  return state.elapsed >= kernel.popAt;
}

export function poppedCount(state: PopcornState): number {
  return state.kernels.filter((k) => isPopped(state, k)).length;
}

/** Advances the stand by `dt` seconds. After five seconds every kernel has popped. */
export function step(state: PopcornState, dt: number) {
  if (state.phase === 'done') return;
  state.elapsed = Math.min(state.elapsed + dt, POP_SECONDS);
  if (state.elapsed >= POP_SECONDS) state.phase = 'done';
}

function drawPuff(ctx: CanvasRenderingContext2D, kernel: Kernel, size: number) {
  const { colors } = theme;
  ctx.fillStyle = colors.stripeB;
  for (let i = 0; i < 5; i++) {
    const a = kernel.angle + (i * Math.PI * 2) / 5;
    ctx.beginPath();
    ctx.arc(
      kernel.x + Math.cos(a) * size * 0.5,
      kernel.y + Math.sin(a) * size * 0.5,
      size * 0.6,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.arc(kernel.x, kernel.y, size * 0.35, 0, Math.PI * 2);
  ctx.fill();
}

function draw(ctx: CanvasRenderingContext2D, state: PopcornState) {
  const { colors } = theme;

  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  for (const kernel of state.kernels) {
    if (isPopped(state, kernel)) {
      const puff = Math.min((state.elapsed - kernel.popAt) / PUFF_SECONDS, 1);
      drawPuff(ctx, kernel, SPACING * 0.45 * (0.4 + 0.6 * puff));
    } else {
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.arc(kernel.x, kernel.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (state.phase === 'done') {
    ctx.fillStyle = colors.background;
    ctx.globalAlpha = 0.8;
    ctx.fillRect(0, HEIGHT / 2 - 60, WIDTH, 110);
    ctx.globalAlpha = 1;
    ctx.textAlign = 'center';
    ctx.fillStyle = colors.accent;
    ctx.font = canvasFont('title', 'bold');
    ctx.fillText(MESSAGE, WIDTH / 2, HEIGHT / 2);
    ctx.fillStyle = colors.text;
    ctx.font = canvasFont('body');
    ctx.fillText('Click to pop another batch', WIDTH / 2, HEIGHT / 2 + 36);
  }
}

export const popcorn: CarnivalGame = {
  id: 'popcorn',
  name: 'Popcorn Stand',
  description: 'Watch a batch of popcorn pop until it fills the stand.',
  start(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D is not available');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    let state = createState();
    let scoreRecorded = false;

    const onDown = () => {
      if (state.phase === 'done') {
        state = createState();
        scoreRecorded = false;
      }
    };
    canvas.addEventListener('pointerdown', onDown);

    let frame = 0;
    let last = performance.now();
    const loop = (time: number) => {
      // Cap the step so a background tab doesn't pop the whole batch at once.
      const dt = Math.min((time - last) / 1000, 0.05);
      last = time;
      step(state, dt);
      if (state.phase === 'done' && !scoreRecorded) {
        recordScore(popcorn.id, poppedCount(state));
        scoreRecorded = true;
      }
      draw(ctx, state);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      canvas.removeEventListener('pointerdown', onDown);
    };
  },
};

export default popcorn;
