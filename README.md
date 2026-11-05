# anywork-portal-auth

Anywork 门户登录 / `desk_session` / 角色闸 · 门户后页 mock ·「进入工作台」· 日历（系统月历 + 日轴 + 年月跳选）。DSH Web 插件骨架（壳 **v0**）。

**本刀：正式包上 GitHub。不要装进现网 DSH / dsh-official 容器；不要热补丁卷内 desk-panel；不要动港机 / lnk。**

Portal login · desk_session · role gate · post-login mock · enter-workbench mock · calendar (month + day axis + year/month jump). Connector-style npm skeleton (shell **v0**). Ship to GitHub first — **do not** install into live DSH.

## 打开演示 / Open demo

双击 **`打开演示.bat`**（或 `open-demo.bat`），或浏览器打开：

```
demo/index.html
```

`file://` 即可，无需构建、无需 Node。根目录 `index.html` ≡ `demo/index.html`（桌面同步用）。

## Mock 账号

| 用户 | 密码 | 角色 | 结果 |
|------|------|------|------|
| `admin` | `admin` | admin | 可进 Admin-only + Member 区 |
| `member` | `member` | member | 仅 Member 区；Admin-only **拒绝** |
| 错密 / 未知用户 | — | — | 登录拒绝 |

登录后面板展示伪造 `desk_session`（`id` / `user` / `role` / `issuedAt`）。登出清空 localStorage 并回到登录页。

## Demo 能力清单（壳 v0）

- 登录 / 登出 / `desk_session` / 角色闸
- 门户后页：总览 / 成员 / 用量 / 公告（admin 有内容；member 闸住）
- 「进入工作台」mock（不跳座位端口）+ 返回门户
- 日历：紫黑系统月历（农历/节气）· 点日下方 07–22 日轴 · 紧急色/完成删/本地|团队双轨 · 点月标题 → 月盘 → 年盘（年月跳选）

## 包骨架

- `package.json` — name **`anywork-portal-auth`**, private, `type: module`, `engines.node >=20`, `engines.dsh >=0.2.1-rc.3 <0.3.0`
- `cordis.patch.yml` — 槽位 id `portal-auth`（与 `ziliaoku` / desk-hub 分开）
- `lib/index.js` / `lib/client.js` — 宿主/客户端 stub（日后接门户 cookie）
- `demo/index.html` — 自包含演示页
- `refs/` — 参考截图（非运行时依赖）

## 安装说明（以后 · 本刀不要执行）

```sh
npm pack
dsh plugin --profile web add ./anywork-portal-auth-0.1.0.tgz
```

`--profile` 写在子命令前面。装上或卸下之后重启实例。

卸下：

```sh
dsh plugin --profile web remove anywork-portal-auth
```

**禁热补丁：** 不要改卷内 desk-panel / 门户源码顶替本包。装卸走 `dsh plugin`。

## Out list（本刀）

- 港 / lnk / 现网 dsh-official 容器内安装
- 卷内 desk-panel 热补丁
- 座位 provision / 真跳座位端口
- members / usage / sessions / announce **独立族包**（门户内 mock 可留在本包）
- npm public publish（默认 private GH 仓即可；当前对齐 library-plugin 可 public）
