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

export const SEEK_STEPS_STORAGE_KEY = 'peach.seek-steps.v1';

/** 快进/快退的两档步长（秒）：普通键走小步长，Shift+键走大步长。 */
export interface SeekSteps { small: number; large: number }

export const DEFAULT_SEEK_STEPS: SeekSteps = { small: 10, large: 60 };

export const SEEK_STEP_LIMITS = {
  small: { min: 1, max: 120 },
  large: { min: 5, max: 600 },
} as const;

const clampStep = (value: unknown, fallback: number, limit: { min: number; max: number }): number => {
  /* null 与空串是「没填」，不是 0：Number(null) 与 Number('') 都会给出 0，
   * 不先挡掉就会被夹成最小步长，而不是回到默认值。 */
  if (value === null || value === undefined || (typeof value === 'string' && !value.trim())) return fallback;
  const parsed = Math.round(Number(value));
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(limit.max, Math.max(limit.min, parsed));
};

/** 任意输入收敛成合法步长：缺的、坏的、越界的都收敛到默认值或边界。 */
export function parseSeekSteps(raw: unknown): SeekSteps {
  const source = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  return {
    small: clampStep(source.small, DEFAULT_SEEK_STEPS.small, SEEK_STEP_LIMITS.small),
    large: clampStep(source.large, DEFAULT_SEEK_STEPS.large, SEEK_STEP_LIMITS.large),
  };
}

export function loadSeekSteps(): SeekSteps {
  try {
    const raw = localStorage.getItem(SEEK_STEPS_STORAGE_KEY);
    return parseSeekSteps(raw ? JSON.parse(raw) : null);
  } catch {
    return { ...DEFAULT_SEEK_STEPS };
  }
}

export function saveSeekSteps(steps: SeekSteps): void {
  try {
    localStorage.setItem(SEEK_STEPS_STORAGE_KEY, JSON.stringify(parseSeekSteps(steps)));
  } catch { /* 浏览器未允许保存：这台设备上改完不留。 */ }
}

export function resetSeekSteps(): void {
  try {
    localStorage.removeItem(SEEK_STEPS_STORAGE_KEY);
  } catch { /* 同上。 */ }
}

export interface SeekResolution {
  action: 'seekBack' | 'seekForward';
  /** 这一次实际跳的秒数：按住 Shift 时是大步长，否则小步长。 */
  seconds: number;
  large: boolean;
}

/** 按下的键是不是快进/快退、这一次跳多少：非 seek 动作返回 null。 */
export function resolveSeek(
  map: HotkeyMap, key: string, shiftKey: boolean, steps: SeekSteps,
): SeekResolution | null {
  const action = matchHotkeyAction(map, key);
  if (action !== 'seekBack' && action !== 'seekForward') return null;
  return { action, seconds: shiftKey ? steps.large : steps.small, large: shiftKey };
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

/** 相对跳转（秒，可为负）：两头夹住，快退不越过片头、快进不越过片尾。 */
export function seekPlayerBy(player: VjsPlayer, deltaSeconds: number): void {
  const at = (player.currentTime() || 0) + deltaSeconds;
  const duration = Number(player.duration()) || 0;
  const clamped = Math.max(0, duration > 0 ? Math.min(at, duration) : at);
  player.currentTime(clamped);
}

/** 执行一个动作。seek 动作的步长由调用方按当前配置传入（默认 10 秒）。 */
export function runHotkeyAction(player: VjsPlayer, action: HotkeyAction, seekSeconds = 10): void {
  switch (action) {
    case 'playPause':
      if (player.paused()) void player.play()?.catch(() => {});
      else player.pause();
      break;
    case 'seekBack':
      seekPlayerBy(player, -seekSeconds);
      break;
    case 'seekForward':
      seekPlayerBy(player, seekSeconds);
      break;
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
    const map = loadHotkeys();
    const action = matchHotkeyAction(map, event.key);
    if (!action) return;
    event.preventDefault();
    /* 快进/快退分两档：直接按是小步长，按住 Shift 再按是大步长。 */
    const seek = resolveSeek(map, event.key, event.shiftKey, loadSeekSteps());
    runHotkeyAction(candidate, action, seek?.seconds);
  };
}
