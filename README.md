# anywork-portal-auth

Anywork 团队门户 · DSH Web 插件 **0.2.1（真 client · 进站默认开门户）**。

侧栏注入 `sidebar.footer.action`，槽位 id **`portal-auth`**，标签「门户」。**进站默认开门户**（装载后自动 open 面板，等同点侧栏「门户」；仍可「进入工作台」/返回对话）。面板覆盖：登录 / `desk_session` / 角色闸 · 总览 · 成员（座位 mock）· 用量（图表+历史）· 公告 · 日历（月历 + 07–22 日轴 + 年月跳选）·「进入工作台」二次视图。数据为浏览器 localStorage mock，不接现网门户 cookie。

Host `lib/index.js` 的 `apply` 仍为空（无 host 路由，对齐 library-plugin 的 host-half stub）。Client `lib/client.js` 导出 `apply` 函数（Cordis/HARNESS 要求 function 或带 `apply` 的对象）。

**本刀只推 GitHub 包。不要声称已装进 Bai 本机 Docker / dsh-official；不要热补丁卷内 desk-panel；不要动港机 / lnk。Bai 稍后手装。**

Portal login · desk_session · role gate · overview / members / usage / announcements / calendar / enter-workbench. Formal npm package with a real React client panel. Ship to GitHub — **do not** claim it is installed on Bai's Docker.

## 打开离线演示 / Open demo

双击 **`打开演示.bat`**（或 `open-demo.bat`），或浏览器打开：

```
demo/index.html
```

`file://` 即可，无需构建、无需 Node、无需装进 DSH。根目录 `index.html` ≡ `demo/index.html`（桌面同步用）。离线 demo 与插件面板能力对齐，互不替代。

## Mock 账号（demo 与插件面板相同）

| 用户 | 密码 | 角色 | 结果 |
|------|------|------|------|
| `admin` | `admin` | admin | 可进 Admin-only + Member 区；可管成员/公告 |
| `member` | `member` | member | 仅 Member 区；成员页闸住；公告只读 |
| 错密 / 未知用户 | — | — | 登录拒绝 |

登录后面板展示伪造 `desk_session`（`id` / `user` / `role` / `issuedAt`）。登出清空 localStorage 并回到登录页。

## 能力清单（0.2.1 真 client）

插件侧栏「门户」面板（`ctx.slots.inject("sidebar.footer.action")` · `id: portal-auth`）：

- 登录 / 登出 / `desk_session` / admin vs member 角色闸
- 总览：座位计数与成员列表联动；admin 可 mock 调预算 / 停用 test001
- 成员（admin）：注册、开座位（~1.2s mock）、停实例、删账号、刷新探测、重置
- 用量：admin 看团队折线+柱状+明细+按日/按次历史；member 看个人图与历史
- 公告：全员可读；admin 可发布 / 置顶 / 删除（localStorage）
- 日历：月历（农历/节气 mock）· 点日下方 07–22 日轴 · 本地|团队双轨 · 完成/删除 · 点月标题年月跳选
- 「进入工作台」二次视图：三会话可切、composer 发 mock 回执；返回门户

离线 `demo/index.html` 仍可用（不依赖 DSH）。

## 包骨架

- `package.json` — name **`anywork-portal-auth`**, version **0.2.1**, private, `type: module`, `engines.node >=20`, `engines.dsh >=0.2.1-rc.3 <0.3.0`
- `cordis.patch.yml` — 槽位 id `portal-auth`（与 `ziliaoku` / desk-hub 分开）
- `lib/index.js` — 宿主空 `apply`（无 host 路由）
- `lib/client.js` — 真 client：ModuleLoader + `require("react")` + `exports.apply`
- `demo/index.html` — 自包含离线演示页
- `refs/` — 参考截图（非运行时依赖）

## 安装说明（以后 · 本刀不要执行）

本包**尚未**装进 Bai 本机 `dsh-official`。手装时：

```sh
npm pack
dsh plugin --profile web add ./anywork-portal-auth-0.2.1.tgz
```

`--profile` 写在子命令前面。装上或卸下之后重启实例。

卸下：

```sh
dsh plugin --profile web remove anywork-portal-auth
```

**禁热补丁：** 不要改卷内 desk-panel / 门户源码顶替本包。装卸走 `dsh plugin`。

## Out list（本刀）

- 港 / lnk / 现网 dsh-official 容器内安装或重装
- 卷内 desk-panel 热补丁
- 座位 provision / 真跳座位端口
- members / usage / sessions / announce **独立族包**（门户内 mock 留在本包）
- npm public publish（默认 private GH 仓即可）
