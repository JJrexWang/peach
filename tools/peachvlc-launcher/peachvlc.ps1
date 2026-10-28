# peachvlc 协议处理器：接收 peachvlc://play?url=<签名播放地址>&t=<续播秒数>，用本机 VLC 打开。
# 由 install.cmd 注册到当前用户（HKCU），卸载运行 uninstall.cmd。
param([Parameter(Mandatory = $true)][string]$Uri)

$query = ($Uri -split '\?', 2)[1]
if (-not $query) { exit 1 }
$params = @{}
foreach ($pair in ($query -split '&')) {
    $k, $v = $pair -split '=', 2
    if ($k) { $params[[uri]::UnescapeDataString($k)] = [uri]::UnescapeDataString($v) }
}
$url = $params['url']
if (-not $url) { exit 1 }
$startAt = 0
if ($params['t']) { [int]::TryParse($params['t'], [ref]$startAt) | Out-Null }

$candidates = @()
foreach ($root in 'HKLM:\SOFTWARE\VideoLAN\VLC', 'HKLM:\SOFTWARE\WOW6432Node\VideoLAN\VLC') {
    $reg = Get-ItemProperty $root -ErrorAction SilentlyContinue
    if ($reg -and $reg.InstallDir) { $candidates += (Join-Path $reg.InstallDir 'vlc.exe') }
}
$candidates += 'C:\Program Files\VideoLAN\VLC\vlc.exe'
$candidates += 'C:\Program Files (x86)\VideoLAN\VLC\vlc.exe'
$candidates += (Join-Path $env:LOCALAPPDATA 'Programs\VideoLAN\VLC\vlc.exe')
$vlc = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $vlc) {
    Add-Type -AssemblyName PresentationFramework
    [System.Windows.MessageBox]::Show('未找到 VLC media player，请先安装 VLC 后再试。', 'Peach VLC 启动器') | Out-Null
    exit 1
}

$arguments = @($url)
if ($startAt -gt 0) { $arguments += "--start-time=$startAt" }
Start-Process -FilePath $vlc -ArgumentList $arguments
