# peachvlc 启动器（Windows）

让 Peach 网页端（Docker 部署）一键用本机 VLC 播放：详情页「外部播放器」选择
「VLC 桌面版（需启动器）」后点击「打开」，浏览器唤起 `peachvlc://` 协议，
本启动器解析出签名播放地址与续播位置，调用 VLC 打开。

## 安装

1. 确认本机已安装 [VLC media player](https://www.videolan.org/vlc/)。
2. 把本目录（`tools/peachvlc-launcher/`）整体拷到一个固定位置（安装后不要再移动，
   注册表里记录的是 `peachvlc.ps1` 的绝对路径；移动后重新运行安装即可）。
3. 双击 `install.cmd`。协议注册到当前用户（HKCU），不需要管理员权限。

## 卸载

双击 `uninstall.cmd` 注销协议，再删除本目录即可。

## 工作方式与边界

- 协议地址形如 `peachvlc://play?url=<6 小时签名地址>&t=<续播秒数>`；
  `peachvlc.ps1` 从注册表与常见安装目录定位 `vlc.exe`，以
  `vlc <地址> --start-time=<秒数>` 启动（`t` 为 0 时不带续播参数）。
- 续播位置来自当前浏览器本地保存的网页播放进度；换浏览器或换设备打开时没有该记录，
  从头播放。VLC 内的播放进度不会回写 Peach（与官方所有外部播放方式一致）。
- 签名地址有效期 6 小时、与 Peach 实例绑定；不要把链接转发给他人。
