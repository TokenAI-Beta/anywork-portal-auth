# anywork-portal-auth

Anywork 门户登录 / `desk_session` / 角色闸 · 门户后页 ·「进入工作台」· 日历。DSH Web 插件。

安装进 **开发用** web profile 并重启后，登录门户盖住壳，宿主拉起管理员 `admin001`（初始密码 `qwer123`）和他的实例。座位端口仍是 mock，不跳真实座位。**不要装进现网 DSH / dsh-official；不要热补丁卷内 desk-panel；不要动港机 / lnk。**

Portal login · desk_session · role gate · post-login pages · enter-workbench · calendar. After a dev-profile install and restart, the login portal is shown and admin001 is provisioned. Seat ports stay mock. **Do not** install into live DSH.

## 打开演示 / Open demo

双击 **`打开演示.bat`**（或 `open-demo.bat`），或浏览器打开：

```
demo/index.html
```

`file://` 即可，无需构建、无需 Node。根目录 `index.html` ≡ `demo/index.html`（桌面同步用）。

## Mock 账号

| 用户 | 密码 | 角色 | 结果 |
|------|------|------|------|
| `admin001` | `qwer123` | admin | 重启后由宿主拉取；可进 Admin-only + Member 区 |
| `member` | `member` | member | 仅 Member 区；Admin-only **拒绝** |
| 错密 / 未知用户 | — | — | 登录拒绝 |

本地双击演示时，会话在 `localStorage`。装进 DSH 后，登录写入 cookie `desk_session`，成员和公告写在 `$DSH_HOME/anywork-portal-auth/state.json`（没有 `DSH_HOME` 时用 `~/.dsh`）。

## 装进 DSH

在插件目录：

```sh
npm pack
dsh plugin --profile web add ./anywork-portal-auth-0.2.23.tgz
```

`--profile` 写在子命令前面。装上或卸下之后重启实例。重启后门户出现在 `/plugins/anywork-portal-auth/`，并拉起 `admin001` 的实例（mock 端口 `3301`）。

卸下：

```sh
dsh plugin --profile web remove anywork-portal-auth
```

**禁热补丁：** 不要改卷内 desk-panel / 门户源码顶替本包。装卸走 `dsh plugin`。本仓库没有对现网 profile 执行过安装。

## Demo 能力清单

- 登录 / 登出 / `desk_session` / 角色闸
- 门户后页：总览 / 成员 / 用量 / 公告（admin 有内容；member 闸住）
- 「进入工作台」mock（不跳座位端口）+ 返回门户
- 日历：月历（农历/节气）· 点日下方 07–22 日轴写入 · 紧急色/完成删/本地|团队 · 点月标题跳选年月 · 时区可选（默认跟随本机）。不带示例事件
- 用量：空表，不带示例 token / 费用

## 包骨架

- `package.json` — name **`anywork-portal-auth`**, `type: module`, `engines.node >=20`, `engines.dsh >=0.2.1-rc.3 <0.3.0`
- `cordis.patch.yml` — 行 id `portal-auth`
- `lib/index.js` / `lib/state.js` — 宿主：重启时拉起 `admin001`，并提供登录 / `desk_session` / 状态路由
- `lib/client.js` — 重启后把登录门户盖在 Web 壳上
- `demo/index.html` — 同一套门户页面。本地打开走 `localStorage`；由宿主送出时走上面的路由
- `refs/` — 参考截图（非运行时依赖）

## Out list

- 港 / lnk / 现网 dsh-official 容器内安装
- 卷内 desk-panel 热补丁
- 真实座位 provision / 跳座位端口（实例端口仍是 mock）
- members / usage / sessions / announce **独立族包**
