/* 详情播放器快捷键定制：键位存浏览器本地（`peach.hotkeys.v1`），设置页改，
 * 播放器挂载时读。Video.js 的 `userActions.hotkeys` 在本项目的 V10 适配层里
 * 由适配层转成播放器根元素上的 keydown 监听，处理函数以播放器为 `this` 调用，
 * 所以这里既能绑 `this`，也能在创建时直接把播放器闭包进来。
 *
 * 空格始终是播放/暂停的附加键：它是播放器最顺手的键，改掉的人多半也会下意识按它。
 * 录入框、文本域里按键不触发：那些地方的字母是输入，不是命令。 */
import type { VjsPlayer } from './types';

export const HOTKEYS_STORAGE_KEY = 'peach.hotkeys.v1';

export type HotkeyAction =
  | 'playPause' | 'seekBack' | 'seekForward' | 'volumeUp' | 'volumeDown' | 'mute' | 'fullscreen';

export type HotkeyMap = Record<HotkeyAction, string>;

export const HOTKEY_ACTIONS: readonly HotkeyAction[] = [
  'playPause', 'seekBack', 'seekForward', 'volumeUp', 'volumeDown', 'mute', 'fullscreen',
];

export const DEFAULT_HOTKEYS: HotkeyMap = {
  playPause: 'k',
  seekBack: 'ArrowLeft',
  seekForward: 'ArrowRight',
  volumeUp: 'ArrowUp',
  volumeDown: 'ArrowDown',
  mute: 'm',
  fullscreen: 'f',
};

/** 任意输入收敛成一份完整键位：缺的、坏的、不是字符串的都回落到默认键。 */
export function parseHotkeys(raw: unknown): HotkeyMap {
  const source = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const result = { ...DEFAULT_HOTKEYS };
  for (const action of HOTKEY_ACTIONS) {
    const value = source[action];
    if (typeof value === 'string' && value.trim()) result[action] = value;
  }
  return result;
}

export function loadHotkeys(): HotkeyMap {
  try {
    const raw = localStorage.getItem(HOTKEYS_STORAGE_KEY);
    return parseHotkeys(raw ? JSON.parse(raw) : null);
  } catch {
    return { ...DEFAULT_HOTKEYS };
  }
}

export function saveHotkeys(map: HotkeyMap): void {
  try {
    localStorage.setItem(HOTKEYS_STORAGE_KEY, JSON.stringify(parseHotkeys(map)));
  } catch { /* 浏览器未允许保存：这一台设备上改完不留，下次打开还是旧键位。 */ }
}

export function resetHotkeys(): void {
  try {
    localStorage.removeItem(HOTKEYS_STORAGE_KEY);
  } catch { /* 同上。 */ }
}

/** 键名比较的规范形：单字符字母不分大小写，其余（方向键、功能键）原样。 */
const normaliseKey = (key: string): string => (key.length === 1 ? key.toLowerCase() : key);

/** 按下的键对应哪个动作；空格恒为播放/暂停。不命中返回 null。 */
export function matchHotkeyAction(map: HotkeyMap, key: string): HotkeyAction | null {
  if (key === ' ' || key === 'Spacebar') return 'playPause';
  const wanted = normaliseKey(key);
  for (const action of HOTKEY_ACTIONS) {
    if (normaliseKey(map[action]) === wanted) return action;
  }
  return null;
}

/** 播放器上原生的媒体元素：V10 适配层的 `muted()`/`volume()` 只有读没有写，
 *  改音量与静音要落到这枚元素上；真正的 Video.js 则优先用它自己的方法。 */
function techElement(player: VjsPlayer): HTMLVideoElement | null {
  try {
    return player.el()?.querySelector('video') ?? null;
  } catch {
    return null;
  }
}

function setVolume(player: VjsPlayer, next: number): void {
  const clamped = Math.min(1, Math.max(0, next));
  const tech = techElement(player);
  if (tech) {
    tech.volume = clamped;
    if (clamped > 0) tech.muted = false;
    return;
  }
  (player as unknown as { volume(value: number): void }).volume(clamped);
}

function toggleMute(player: VjsPlayer): void {
  const tech = techElement(player);
  if (tech) {
    tech.muted = !tech.muted;
    return;
  }
  const loose = player as unknown as { muted(value: boolean): void };
  loose.muted(!player.muted());
}

function toggleFullscreen(player: VjsPlayer): void {
  const loose = player as unknown as {
    requestFullscreen?: () => void;
    exitFullscreen?: () => void;
  };
  if (player.isFullscreen()) {
    if (typeof loose.exitFullscreen === 'function') loose.exitFullscreen();
    else void document.exitFullscreen().catch(() => {});
    return;
  }
  if (typeof loose.requestFullscreen === 'function') {
    loose.requestFullscreen();
    return;
  }
  void player.el()?.requestFullscreen?.().catch(() => {});
}

/** 执行一个动作。返回是否真的执行了（调用方据此决定要不要 preventDefault）。 */
export function runHotkeyAction(player: VjsPlayer, action: HotkeyAction): void {
  switch (action) {
    case 'playPause':
      if (player.paused()) void player.play()?.catch(() => {});
      else player.pause();
      break;
    case 'seekBack':
      player.currentTime(Math.max(0, (player.currentTime() || 0) - 10));
      break;
    case 'seekForward': {
      const at = (player.currentTime() || 0) + 10;
      const duration = Number(player.duration()) || 0;
      player.currentTime(duration > 0 ? Math.min(at, duration) : at);
      break;
    }
    case 'volumeUp':
      setVolume(player, (techElement(player)?.volume ?? player.volume() ?? 0) + 0.1);
      break;
    case 'volumeDown':
      setVolume(player, (techElement(player)?.volume ?? player.volume() ?? 0) - 0.1);
      break;
    case 'mute':
      toggleMute(player);
      break;
    case 'fullscreen':
      toggleFullscreen(player);
      break;
  }
}

const isFormTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
    || target instanceof HTMLSelectElement || target.isContentEditable;
};

/** 生成 `userActions.hotkeys` 处理函数。播放器可以创建时闭包传入，
 *  也可以靠调用时的 `this`（V10 适配层与 Video.js 都是以播放器为 `this` 调用）。 */
export function createHotkeyHandler(bound?: VjsPlayer | null) {
  return function hotkeys(this: unknown, event: KeyboardEvent): void {
    const candidate = (this && typeof (this as VjsPlayer).currentTime === 'function'
      ? this as VjsPlayer : bound) ?? null;
    if (!candidate || event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
    if (isFormTarget(event.target)) return;
    /* 焦点在按钮上时空格是按钮自己的激活键：播放键按空格会自己切换播放，
     * 这里再切换一次就等于没按。字母键没有这个问题，照常处理。 */
    if (event.key === ' ' && event.target instanceof HTMLElement
      && (event.target instanceof HTMLButtonElement || event.target.closest('button'))) return;
    const action = matchHotkeyAction(loadHotkeys(), event.key);
    if (!action) return;
    event.preventDefault();
    runHotkeyAction(candidate, action);
  };
}
