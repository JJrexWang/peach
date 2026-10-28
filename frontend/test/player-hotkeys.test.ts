import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createHotkeyHandler, DEFAULT_HOTKEYS, HOTKEYS_STORAGE_KEY, loadHotkeys, matchHotkeyAction,
  parseHotkeys, resetHotkeys, saveHotkeys,
} from '../src/player/hotkeys';
import type { VjsPlayer } from '../src/player/types';

beforeEach(() => { localStorage.clear() });

describe('播放器快捷键存取', () => {
  it('没存过时用默认键位', () => {
    expect(loadHotkeys()).toEqual(DEFAULT_HOTKEYS);
  });

  it('保存后读回来是保存的那份，恢复默认后又是默认键位', () => {
    const custom = { ...DEFAULT_HOTKEYS, playPause: 'p', mute: 'n' };
    saveHotkeys(custom);
    expect(loadHotkeys()).toEqual(custom);
    resetHotkeys();
    expect(loadHotkeys()).toEqual(DEFAULT_HOTKEYS);
    expect(localStorage.getItem(HOTKEYS_STORAGE_KEY)).toBeNull();
  });

  it('坏值与缺字段回落到默认键，其余定制保留', () => {
    expect(parseHotkeys(null)).toEqual(DEFAULT_HOTKEYS);
    expect(parseHotkeys('broken')).toEqual(DEFAULT_HOTKEYS);
    expect(parseHotkeys({ playPause: 'x', seekBack: 42, mute: '' }))
      .toEqual({ ...DEFAULT_HOTKEYS, playPause: 'x' });
    localStorage.setItem(HOTKEYS_STORAGE_KEY, '{not json');
    expect(loadHotkeys()).toEqual(DEFAULT_HOTKEYS);
  });
});

describe('播放器快捷键匹配', () => {
  it('字母不分大小写，方向键原样匹配', () => {
    expect(matchHotkeyAction(DEFAULT_HOTKEYS, 'K')).toBe('playPause');
    expect(matchHotkeyAction(DEFAULT_HOTKEYS, 'm')).toBe('mute');
    expect(matchHotkeyAction(DEFAULT_HOTKEYS, 'ArrowLeft')).toBe('seekBack');
    expect(matchHotkeyAction(DEFAULT_HOTKEYS, 'q')).toBeNull();
  });

  it('空格恒为播放/暂停，哪怕播放键改成了别的', () => {
    const custom = { ...DEFAULT_HOTKEYS, playPause: 'p' };
    expect(matchHotkeyAction(custom, ' ')).toBe('playPause');
    expect(matchHotkeyAction(custom, 'p')).toBe('playPause');
  });

  it('定制键位按定制匹配', () => {
    const custom = { ...DEFAULT_HOTKEYS, seekForward: 'l' };
    expect(matchHotkeyAction(custom, 'L')).toBe('seekForward');
    expect(matchHotkeyAction(custom, 'ArrowRight')).toBeNull();
  });
});

function fakePlayer() {
  const state = { paused: true, time: 100, duration: 300, volume: 0.5, muted: false, fullscreen: false };
  const root = document.createElement('div');
  const tech = document.createElement('video');
  Object.defineProperty(tech, 'volume', { get: () => state.volume, set: (value: number) => { state.volume = value } });
  Object.defineProperty(tech, 'muted', { get: () => state.muted, set: (value: boolean) => { state.muted = value } });
  root.append(tech);
  const player = {
    el: () => root,
    paused: () => state.paused,
    play: () => { state.paused = false; return Promise.resolve() },
    pause: () => { state.paused = true },
    currentTime: (value?: number) => { if (value !== undefined) state.time = value; return state.time },
    duration: () => state.duration,
    volume: () => state.volume,
    muted: () => state.muted,
    isFullscreen: () => state.fullscreen,
  } as unknown as VjsPlayer;
  return { player, state, root };
}

const keyEvent = (key: string) => new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });

describe('播放器快捷键处理', () => {
  it('通过 this 拿播放器：播放暂停、快进快退、静音', () => {
    const { player, state } = fakePlayer();
    const handler = createHotkeyHandler();
    handler.call(player, keyEvent('k'));
    expect(state.paused).toBe(false);
    handler.call(player, keyEvent('k'));
    expect(state.paused).toBe(true);
    handler.call(player, keyEvent('ArrowRight'));
    expect(state.time).toBe(110);
    handler.call(player, keyEvent('ArrowLeft'));
    expect(state.time).toBe(100);
    handler.call(player, keyEvent('m'));
    expect(state.muted).toBe(true);
  });

  it('音量增减夹在 0 与 1 之间，命中后 preventDefault', () => {
    const { player, state } = fakePlayer();
    const handler = createHotkeyHandler(player);
    const event = keyEvent('ArrowUp');
    handler(event);
    expect(state.volume).toBeCloseTo(0.6);
    expect(event.defaultPrevented).toBe(true);
    state.volume = 0.95;
    handler(keyEvent('ArrowUp'));
    expect(state.volume).toBe(1);
    handler(keyEvent('ArrowDown'));
    expect(state.volume).toBeCloseTo(0.9);
  });

  it('输入框里的按键不触发，未命中的键不拦', () => {
    const { player, state } = fakePlayer();
    const handler = createHotkeyHandler(player);
    const input = document.createElement('input');
    const typed = new KeyboardEvent('keydown', { key: 'm', bubbles: true, cancelable: true });
    Object.defineProperty(typed, 'target', { value: input });
    handler(typed);
    expect(state.muted).toBe(false);
    const missed = keyEvent('q');
    handler(missed);
    expect(missed.defaultPrevented).toBe(false);
  });

  it('设置页保存的新键位下一次按键就生效', () => {
    const { player, state } = fakePlayer();
    saveHotkeys({ ...DEFAULT_HOTKEYS, playPause: 'p' });
    const handler = createHotkeyHandler(player);
    handler(keyEvent('k'));
    expect(state.paused).toBe(true);
    handler(keyEvent('p'));
    expect(state.paused).toBe(false);
  });
});
