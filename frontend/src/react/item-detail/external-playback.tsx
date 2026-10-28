import { useEffect, useState } from 'react';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { apiGet, apiSend } from '../../api';
import { SelectField } from '../settings-panel/legacy-controls';
import { ErrorText, Help } from '../settings/section';
import { busyProps, useAction } from '../settings/use-action';

const TARGET_KEY = 'peach.playback-target.v1';
const NETWORK_TARGETS = [
  ['m3u', 'M3U 播放列表'],
  ['url', '网络播放地址 / VR'],
  ['vlc-ios', 'VLC（iPhone / iPad）'],
  ['vlc-android', 'VLC（Android）'],
  ['peachvlc', 'VLC 桌面版（需启动器）'],
] as const;

/** 续播位置与网页播放器共用同一份浏览器本地记录（player/progress.ts 的键格式）；
 *  只在同一浏览器里存在，跨设备打开时自然回退为从头播放。 */
function resumeSeconds(id: number): number {
  try {
    const raw = localStorage.getItem(`peach.playback-position.v1:item:${id}`);
    const time = raw === null ? NaN : Number(raw);
    return Number.isFinite(time) && time > 5 ? Math.floor(time) : 0;
  } catch { return 0 }
}

function vlcAndroidLink(url: string): string {
  const parsed = new URL(url);
  return `intent://${parsed.host}${parsed.pathname}${parsed.search}#Intent;scheme=${parsed.protocol.replace(':', '')};package=org.videolan.vlc;end`;
}

function targetLink(player: string, links: { url: string; playlist: string }, id: number): string {
  if (player === 'vlc-ios') return `vlc-x-callback://x-callback-url/stream?url=${encodeURIComponent(links.url)}`;
  if (player === 'vlc-android') return vlcAndroidLink(links.url);
  if (player === 'peachvlc') return `peachvlc://play?url=${encodeURIComponent(links.url)}&t=${resumeSeconds(id)}`;
  return links.playlist;
}

function savedTarget() {
  try { return localStorage.getItem(TARGET_KEY) || `local:${localStorage.getItem('peach.local-player.v1') || 'default'}` }
  catch { return 'local:default' }
}

export function ExternalPlayback({ id, onOpened }: { id: number; onOpened?(): void }) {
  const [players, setPlayers] = useState<{ id: string; label: string }[] | null>(null);
  const [player, setPlayer] = useState(savedTarget);
  const [links, setLinks] = useState<{ url: string; playlist: string } | null>(null);
  const [loadError, setLoadError] = useState('');
  const [epoch, setEpoch] = useState(0);
  const action = useAction();
  useEffect(() => {
    const controller = new AbortController();
    apiGet<{ players: { id: string; label: string }[] }>('/api/local-players', controller.signal).then(result => {
      if (controller.signal.aborted) return;
      setPlayers(result.players);
      setPlayer(current => {
        if (result.players.some(item => `local:${item.id}` === current) || NETWORK_TARGETS.some(([key]) => key === current)) return current;
        if (result.players.length) return `local:${result.players[0]!.id}`;
        return 'm3u';
      });
    }).catch(cause => {
      if (controller.signal.aborted) return;
      setPlayers([]);
      setPlayer(current => NETWORK_TARGETS.some(([key]) => key === current) ? current : 'm3u');
      setLoadError(String(cause.message || cause));
    });
    return () => controller.abort();
  }, [epoch]);
  const open = () => void action.run('open', async signal => {
    if (player.startsWith('local:')) {
      await apiSend(`/api/local-playback?id=${id}&player=${encodeURIComponent(player.slice(6))}`, {}, 'POST', signal);
      return null;
    }
    const result = await apiSend<{ url: string; playlist: string }>(`/api/external-playback?id=${id}`, {}, 'POST', signal);
    return { url: new URL(result.url, location.origin).href, playlist: new URL(result.playlist, location.origin).href };
  }, result => {
    if (!result) {
      document.querySelector<HTMLVideoElement>('#stage video')?.pause();
      onOpened?.();
      return;
    }
    setLinks(result);
    if (player === 'url') return;
    const link = document.createElement('a');
    link.href = targetLink(player, result, id);
    link.rel = 'noreferrer';
    document.body.append(link);
    link.click();
    link.remove();
  });
  return <div data-local-playback="">
    <div data-local-playback-row="">
      <SelectField id={`external-player-${id}`} label="外部播放器"
        options={[...(players || []).map(item => [`local:${item.id}`, item.label] as const), ...NETWORK_TARGETS]}
        value={player} disabled={players === null || !!action.busy} epoch={epoch * 2 + Number(players !== null)} onPick={value => {
          setPlayer(value);
          setLinks(null);
          action.setError('');
          try { localStorage.setItem(TARGET_KEY, value) } catch { /* 浏览器未允许保存偏好。 */ }
        }} />
      <Button variant="secondary" aria-label="使用外部播放器打开" disabled={players === null}
        {...busyProps(action.busy === 'open')} onClick={open}>打开</Button>
    </div>
    {action.error || loadError ? <ErrorText>{action.error || loadError}</ErrorText> : null}
    {loadError ? <Button variant="secondary" disabled={!!action.busy}
      onClick={() => { setLoadError(''); setPlayers(null); setEpoch(value => value + 1) }}>重新检测播放器</Button> : null}
    {player === 'peachvlc' ? <Help>VLC 桌面版需先安装 peachvlc 启动器（见 fork 仓库 tools/peachvlc-launcher）；点击「打开」会带上本浏览器的续播位置。</Help> : null}
    {links ? <>
      <Input label="网络播放地址" value={links.url} isReadOnly />
      <Help>链接有效期为 6 小时。VR 播放器可使用网络播放地址；另一台设备需要能访问当前 Peach 地址。</Help>
    </> : null}
  </div>;
}
