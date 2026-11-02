# Popcorn Stand

Watch a batch of popcorn pop until it fills the whole stand.

## How to play

- Kernels cover the screen and pop one by one, at random moments, over five seconds.
- After five seconds every kernel has popped, the screen is full of popcorn and the
  stand says "Happy eating!".
- Click on the "Happy eating!" screen to pop another batch.

## Scoring

There is nothing to aim at: your score is the number of kernels that popped, which
is the whole batch every time. It is saved to the carnival's score board once, when
the batch is done.

## Files

- `game.ts`: the game logic (`createState`, `step`, `isPopped`, `poppedCount`) and the
  `popcorn` entry, the default export the midway finds.
- `game.test.ts`: tests for the game logic.
