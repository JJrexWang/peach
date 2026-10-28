/* 配置页「播放快捷键」分区：详情播放器的键位定制。
 *
 * 键位只存浏览器本地（`player/hotkeys.ts` 的 `peach.hotkeys.v1`）：快捷键是
 * 「这台设备、这个键盘」的手感，不跟账本走。改完下次打开播放器生效——
 * 播放器每次按键都现读存储，不必为了改键重启或刷新。 */
import { useEffect, useState } from 'react';

import { SettingsRow } from '@/components/application/settings/settings-rows';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';

import {
  DEFAULT_HOTKEYS, loadHotkeys, resetHotkeys, saveHotkeys,
  type HotkeyAction, type HotkeyMap,
} from '../../player/hotkeys';
import { Help, Rows, Section, Stack } from './section';

const ACTION_LABELS: [HotkeyAction, string][] = [
  ['playPause', '播放 / 暂停'],
  ['seekBack', '后退 10 秒'],
  ['seekForward', '前进 10 秒'],
  ['volumeUp', '音量 +'],
  ['volumeDown', '音量 −'],
  ['mute', '静音'],
  ['fullscreen', '全屏'],
];

/** 键名给人看的样子：方向键用箭头，空格写明，单字母大写。 */
export function hotkeyLabel(key: string): string {
  const arrows: Record<string, string> = {
    ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓',
  };
  if (key === ' ') return '空格';
  return arrows[key] ?? (key.length === 1 ? key.toUpperCase() : key);
}

export function HotkeySettings({ receipt }: { receipt(message: string): void }) {
  const [keys, setKeys] = useState<HotkeyMap>(() => loadHotkeys());
  const [recording, setRecording] = useState<HotkeyAction | null>(null);

  /* 录入中：下一个按下的键就是新键位。修饰键单独按不算（那是组合键的前半段），
   * Escape 取消。捕获阶段收，免得这个键先被页面上其他快捷键吃掉。 */
  useEffect(() => {
    if (!recording) return;
    const onKey = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.key === 'Escape') {
        setRecording(null);
        return;
      }
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(event.key)) return;
      const next = { ...keys, [recording]: event.key };
      setKeys(next);
      saveHotkeys(next);
      setRecording(null);
      receipt('已保存播放快捷键，下次打开播放器生效');
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [recording, keys, receipt]);

  const restoreDefaults = () => {
    resetHotkeys();
    setKeys({ ...DEFAULT_HOTKEYS });
    setRecording(null);
    receipt('已恢复默认快捷键，下次打开播放器生效');
  };

  return (
    <Section title="播放快捷键">
      <Rows>
        {ACTION_LABELS.map(([action, label]) => (
          <SettingsRow key={action} label={label}>
            <div className="flex items-center gap-2">
              <Input aria-label={`${label}的键`} value={recording === action ? '按下任意键…' : hotkeyLabel(keys[action])}
                isReadOnly className="w-28" />
              <Button variant="secondary" size="small" aria-label={`修改${label}的键`}
                onClick={() => setRecording(recording === action ? null : action)}>
                {recording === action ? '取消' : '修改'}
              </Button>
            </div>
          </SettingsRow>
        ))}
      </Rows>
      <Stack divided>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Help>空格始终可播放 / 暂停。键位只保存在这台设备的浏览器里。</Help>
          <Button variant="secondary" size="small" onClick={restoreDefaults}>恢复默认</Button>
        </div>
      </Stack>
    </Section>
  );
}
