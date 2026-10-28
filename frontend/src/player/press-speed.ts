/* 详情播放器长按临时 2 倍速：按住画面 ≥350ms 且几乎不移动、正在播放时，
 * 倍速临时升到 2× 并亮一枚角标；松开（或指针取消、离开、窗口失焦、播放暂停）
 * 立刻恢复按住前的倍速。
 *
 * 临时倍速直接写 `player.playbackRate()`，绝不经过 `memory.ts` 的
 * `mountPlaybackRate().set()`——那条路会把倍速写进播放记忆，下次打开同一部片
 * 就成了 2× 起播。设置菜单里的倍速面板读的是记忆里的值，不受临时倍速影响，
 * 恢复时也不用做任何同步。
 *
 * 短按（<350ms）什么都不发生：单击画面原有的播放/暂停、控制栏显隐都不受影响。
 * 这里只认指针事件，不做双击手势。 */
import type { VjsPlayer } from './types';

export const PRESS_SPEED_RATE = 2;
export const PRESS_SPEED_HOLD_MS = 350;
export const PRESS_SPEED_MOVE_TOLERANCE = 10;

/** 临时倍速状态机：进入时记住原倍速，重复进入不覆盖最初的那个值；
 *  退出时交还应恢复的倍速（没进过临时态就交还 null，表示不用动）。 */
export class PressSpeedMachine {
  private savedRate: number | null = null;

  get active(): boolean {
    return this.savedRate !== null;
  }

  /** 进入临时态，返回应设定的倍速。已经在临时态时只回临时倍速，不动存档。 */
  enter(currentRate: number): number {
    if (this.savedRate === null) this.savedRate = currentRate;
    return PRESS_SPEED_RATE;
  }

  /** 退出临时态，返回应恢复的倍速；不在临时态返回 null。 */
  exit(): number | null {
    const rate = this.savedRate;
    this.savedRate = null;
    return rate;
  }
}

/** 长按不该从这些地方起步：控制栏与菜单里的按钮有自己的活，
 *  在它们上面按住是点按钮，不是按画面。 */
const PRESS_EXCLUDED = '.vjs-control-bar, .vjs-menu, [role="menu"], button, a, input, select, textarea';

export function mountPressSpeed(player: VjsPlayer, video: HTMLVideoElement): void {
  const root = player.el();
  if (!root || root.querySelector('[data-player-press-speed]')) return;
  const machine = new PressSpeedMachine();
  const badge = document.createElement('div');
  badge.className = 'vjs-peach-press-speed';
  badge.dataset.playerPressSpeed = '';
  badge.textContent = '2×';
  badge.hidden = true;
  root.append(badge);

  let timer: ReturnType<typeof setTimeout> | null = null;
  let startX = 0;
  let startY = 0;
  let pressing = false;

  const clearTimer = () => {
    if (timer !== null) { clearTimeout(timer); timer = null }
  };

  const restore = () => {
    pressing = false;
    clearTimer();
    const rate = machine.exit();
    root.classList.remove('vjs-peach-pressing');
    badge.hidden = true;
    if (rate !== null && !player.isDisposed()) player.playbackRate(rate);
  };

  const onPointerDown = (event: PointerEvent) => {
    if (pressing || event.button !== 0 || !event.isPrimary) return;
    if ((event.target as Element | null)?.closest?.(PRESS_EXCLUDED)) return;
    pressing = true;
    startX = event.clientX;
    startY = event.clientY;
    clearTimer();
    timer = setTimeout(() => {
      timer = null;
      /* 按住期间被暂停（比如按了空格）就不进临时态：长按倍速只服务于正在播的画面。 */
      if (!pressing || player.isDisposed() || player.paused()) return;
      player.playbackRate(machine.enter(Number(player.playbackRate()) || 1));
      root.classList.add('vjs-peach-pressing');
      badge.hidden = false;
    }, PRESS_SPEED_HOLD_MS);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!pressing || machine.active) return;
    if (Math.hypot(event.clientX - startX, event.clientY - startY) > PRESS_SPEED_MOVE_TOLERANCE) {
      pressing = false;
      clearTimer();
    }
  };

  const onPause = () => { if (machine.active) restore() };

  root.addEventListener('pointerdown', onPointerDown);
  root.addEventListener('pointermove', onPointerMove);
  root.addEventListener('pointerleave', restore);
  window.addEventListener('pointerup', restore);
  window.addEventListener('pointercancel', restore);
  window.addEventListener('blur', restore);
  player.on('pause', onPause);
  player.on('ended', restore);
  player.on('dispose', () => {
    restore();
    root.removeEventListener('pointerdown', onPointerDown);
    root.removeEventListener('pointermove', onPointerMove);
    root.removeEventListener('pointerleave', restore);
    window.removeEventListener('pointerup', restore);
    window.removeEventListener('pointercancel', restore);
    window.removeEventListener('blur', restore);
    badge.remove();
  });
  /* video 参数与其它 mount* 函数签名保持一致（都收播放器与其媒体元素）；
   * 本模块的监听都挂在播放器根元素上，媒体元素只在暂停事件里间接用到。 */
  void video;
}
