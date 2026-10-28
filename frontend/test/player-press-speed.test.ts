import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  mountPressSpeed, PRESS_SPEED_HOLD_MS, PRESS_SPEED_RATE, PressSpeedMachine,
} from '../src/player/press-speed';
import type { VjsPlayer } from '../src/player/types';

describe('长按倍速状态机', () => {
  it('进入记住原倍速并给临时 2 倍，退出交还原倍速', () => {
    const machine = new PressSpeedMachine();
    expect(machine.active).toBe(false);
    expect(machine.enter(1.5)).toBe(PRESS_SPEED_RATE);
    expect(machine.active).toBe(true);
    expect(machine.exit()).toBe(1.5);
    expect(machine.active).toBe(false);
  });

  it('重复进入不覆盖最初记住的倍速', () => {
    const machine = new PressSpeedMachine();
    machine.enter(0.75);
    expect(machine.enter(PRESS_SPEED_RATE)).toBe(PRESS_SPEED_RATE);
    expect(machine.exit()).toBe(0.75);
  });

  it('没进入就退出交还 null（不用动倍速）', () => {
    const machine = new PressSpeedMachine();
    expect(machine.exit()).toBeNull();
  });
});

function fakePlayer() {
  const state = { rate: 1.25, paused: false, disposed: false };
  const handlers = new Map<string, ((...args: unknown[]) => void)[]>();
  const root = document.createElement('div');
  const video = document.createElement('video');
  root.append(video);
  const player = {
    el: () => root,
    paused: () => state.paused,
    playbackRate: (value?: number) => { if (value !== undefined) state.rate = value; return state.rate },
    isDisposed: () => state.disposed,
    on: (events: string | string[], handler: (...args: unknown[]) => void) => {
      for (const name of Array.isArray(events) ? events : [events]) {
        handlers.set(name, [...(handlers.get(name) || []), handler]);
      }
    },
  } as unknown as VjsPlayer;
  const fire = (name: string) => { for (const handler of handlers.get(name) || []) handler() };
  return { player, video, root, state, fire };
}

const pointer = (type: string, init: PointerEventInit = {}) =>
  new PointerEvent(type, { bubbles: true, cancelable: true, button: 0, isPrimary: true, ...init });

describe('长按临时倍速挂载', () => {
  beforeEach(() => { vi.useFakeTimers() });
  afterEach(() => { vi.useRealTimers() });

  it('按住满时长升到 2 倍并亮角标，松开恢复原倍速且不叠加', () => {
    const { player, video, root, state } = fakePlayer();
    mountPressSpeed(player, video);
    root.dispatchEvent(pointer('pointerdown', { clientX: 10, clientY: 10 }));
    vi.advanceTimersByTime(PRESS_SPEED_HOLD_MS - 1);
    expect(state.rate).toBe(1.25);
    vi.advanceTimersByTime(1);
    expect(state.rate).toBe(PRESS_SPEED_RATE);
    const badge = root.querySelector<HTMLElement>('[data-player-press-speed]')!;
    expect(badge.hidden).toBe(false);
    expect(badge.textContent).toBe('2×');
    window.dispatchEvent(pointer('pointerup'));
    expect(state.rate).toBe(1.25);
    expect(badge.hidden).toBe(true);
  });

  it('短按不触发，移动超过容差取消，暂停时不进入', () => {
    const { player, video, root, state } = fakePlayer();
    mountPressSpeed(player, video);
    root.dispatchEvent(pointer('pointerdown', { clientX: 0, clientY: 0 }));
    vi.advanceTimersByTime(100);
    window.dispatchEvent(pointer('pointerup'));
    vi.advanceTimersByTime(PRESS_SPEED_HOLD_MS);
    expect(state.rate).toBe(1.25);
    root.dispatchEvent(pointer('pointerdown', { clientX: 0, clientY: 0 }));
    root.dispatchEvent(pointer('pointermove', { clientX: 40, clientY: 0 }));
    vi.advanceTimersByTime(PRESS_SPEED_HOLD_MS);
    expect(state.rate).toBe(1.25);
    state.paused = true;
    root.dispatchEvent(pointer('pointerdown', { clientX: 0, clientY: 0 }));
    vi.advanceTimersByTime(PRESS_SPEED_HOLD_MS);
    expect(state.rate).toBe(1.25);
  });

  it('从控制栏按钮上按下不触发，dispose 后监听解绑', () => {
    const { player, video, root, state, fire } = fakePlayer();
    const bar = document.createElement('div');
    bar.className = 'vjs-control-bar';
    const button = document.createElement('button');
    bar.append(button);
    root.append(bar);
    mountPressSpeed(player, video);
    button.dispatchEvent(pointer('pointerdown', { clientX: 0, clientY: 0 }));
    vi.advanceTimersByTime(PRESS_SPEED_HOLD_MS);
    expect(state.rate).toBe(1.25);
    fire('dispose');
    root.dispatchEvent(pointer('pointerdown', { clientX: 0, clientY: 0 }));
    vi.advanceTimersByTime(PRESS_SPEED_HOLD_MS);
    expect(state.rate).toBe(1.25);
    expect(root.querySelector('[data-player-press-speed]')).toBeNull();
  });
});
