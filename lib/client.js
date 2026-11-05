/**
 * Client for anywork-portal-auth@0.2.0
 *
 * Real DSH inject: sidebar.footer.action panel id `portal-auth`.
 * Surfaces (localStorage mock, same capability list as the offline demo):
 *   login / desk_session / admin-vs-member gates
 *   overview · members (seat mock) · usage (charts + history)
 *   announcements · calendar (month grid + 07-22 day axis)
 *   enter-workbench secondary view
 *
 * Cordis/HARNESS requires the ModuleLoader factory to export a function
 * or an object with an `apply` method.
 */
window.__ModuleLoader__ &&
  window.__ModuleLoader__.load({
    id: "anywork-portal-auth",
    factory: (require) => {
      var module = { exports: {} };
      var exports = module.exports;
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      var React = require("react");

      var inject = ["slots"];
      var PA_SEQ = 0;

      var SESSION_KEY = "anywork_portal_auth_session";
      var MEMBERS_KEY = "anywork_portal_auth_members";
      var ANN_KEY = "anywork_portal_auth_announcements";

      var USERS = {
        admin: { secret: "admin", role: "admin", displayName: "Admin Demo" },
        member: { secret: "member", role: "member", displayName: "Member Demo" },
      };

      var DEFAULT_MEMBERS = [
        { id: "admin001", role: "admin", budget: "—", seat: "up", port: 3301 },
        { id: "cth", role: "member", budget: "80%", seat: "up", port: 3303 },
        { id: "test001", role: "member", budget: "45%", seat: "idle", port: 3302 },
        { id: "yk", role: "member", budget: "22%", seat: "up", port: 3304 },
        { id: "xc", role: "member", budget: "10%", seat: "off", port: null },
      ];

      var DEFAULT_ANNS = [
        { id: "a1", title: "周五演示窗口", body: "港机勿擅自改；本机 Docker-only。", author: "admin001", at: "2026-11-05", pinned: true },
        { id: "a2", title: "资料库共享说明", body: "drive/kb 为门户全员共享卷，非按座位隔离。", author: "admin001", at: "2026-11-02", pinned: false },
        { id: "a3", title: "xlsx 预览已知问题", body: "documentpreview 自 10-29 起禁用 Iterator 相关崩溃。", author: "admin001", at: "2026-11-02", pinned: false },
      ];

      var DEFAULT_EVENTS = [
        { id: "e1", date: "2026-11-05", start: "09:00", end: "09:30", title: "港机 guest-shutdown RO 回顾", urgency: "high", track: "team", done: false, note: "阿里云 powerdown · 非 OOM" },
        { id: "e2", date: "2026-11-05", start: "11:00", end: "12:00", title: "portal-auth 日历对齐系统月历", urgency: "critical", track: "local", done: false, note: "月格 + 日轴" },
        { id: "e3", date: "2026-11-05", start: "14:00", end: "15:00", title: "周五演示窗口", urgency: "critical", track: "team", done: false, note: "置顶公告 · admin001" },
        { id: "e4", date: "2026-11-05", start: "16:30", end: "17:00", title: "个人待办：硬刷验收", urgency: "normal", track: "local", done: false, note: "打开演示.bat" },
        { id: "e5", date: "2026-11-05", start: "19:00", end: "19:20", title: "用量周报草稿（可选）", urgency: "low", track: "local", done: false, note: "低优" },
        { id: "e6", date: "2026-11-04", start: "10:00", end: "10:45", title: "成员开座位 mock 验收", urgency: "normal", track: "local", done: true, note: "已完成示例" },
        { id: "e7", date: "2026-11-06", start: "09:30", end: "10:00", title: "合入人闸复查", urgency: "high", track: "team", done: false, note: "待 Bai" },
        { id: "e8", date: "2026-11-07", start: "08:00", end: "08:30", title: "立冬 · 团队简报", urgency: "normal", track: "team", done: false, note: "节气日" },
        { id: "e9", date: "2026-11-22", start: "15:00", end: "16:00", title: "小雪节点回顾", urgency: "low", track: "local", done: false, note: "节气假事件" },
      ];

      var LUNAR_MAP = {
        "2026-10-26": "十七", "2026-10-27": "十八", "2026-10-28": "十九", "2026-10-29": "二十",
        "2026-10-30": "廿一", "2026-10-31": "廿二",
        "2026-11-01": "廿三", "2026-11-02": "廿四", "2026-11-03": "廿五", "2026-11-04": "廿六",
        "2026-11-05": "廿七", "2026-11-06": "廿八", "2026-11-07": "立冬", "2026-11-08": "三十",
        "2026-11-09": "十月", "2026-11-10": "初二", "2026-11-11": "初三", "2026-11-12": "初四",
        "2026-11-13": "初五", "2026-11-14": "初六", "2026-11-15": "初七", "2026-11-16": "初八",
        "2026-11-17": "初九", "2026-11-18": "初十", "2026-11-19": "十一", "2026-11-20": "十二",
        "2026-11-21": "十三", "2026-11-22": "小雪", "2026-11-23": "十五", "2026-11-24": "十六",
        "2026-11-25": "十七", "2026-11-26": "十八", "2026-11-27": "十九", "2026-11-28": "二十",
        "2026-11-29": "廿一", "2026-11-30": "廿二",
        "2026-12-01": "廿三", "2026-12-02": "廿四", "2026-12-03": "廿五", "2026-12-04": "廿六",
      };
      var JIEQI = { "2026-11-07": 1, "2026-11-22": 1 };
      var MONTH_NAMES = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
      var WEEKDAYS_MON = ["一", "二", "三", "四", "五", "六", "日"];
      var WEEKDAYS_FULL = ["日", "一", "二", "三", "四", "五", "六"];
      var URGENCY_LABEL = { critical: "紧急·重要", high: "紧急·次要", normal: "普通", low: "低优" };

      var USAGE_LABELS = ["10-30", "10-31", "11-01", "11-02", "11-03", "11-04", "11-05"];
      var USAGE_TEAM = [18, 22, 28, 35, 31, 42, 48];
      var USAGE_ME = [0.8, 1.1, 1.4, 1.5, 1.3, 3.1, 1.8];
      var USAGE_MEMBERS = [
        { name: "cth", v: 45 }, { name: "admin", v: 32 }, { name: "yk", v: 28 },
        { name: "test", v: 14 }, { name: "xc", v: 9.4 },
      ];
      var USAGE_PURPOSE = [
        { name: "对话", v: 5.4 }, { name: "分析", v: 3.1 }, { name: "工具", v: 2.4 }, { name: "其他", v: 1.2 },
      ];
      var USAGE_TEAM_ROWS = [
        ["cth", "2026-11-05", "deepseek-v3 · 对话", "42,180", "¥12.60"],
        ["admin001", "2026-11-05", "deepseek-r1 · 代码", "28,940", "¥18.40"],
        ["yk", "2026-11-05", "deepseek-v3 · 对话", "19,220", "¥5.80"],
        ["test001", "2026-11-04", "deepseek-v3 · 工具", "11,050", "¥3.30"],
        ["cth", "2026-11-04", "deepseek-r1 · 分析", "55,610", "¥34.20"],
        ["admin001", "2026-11-04", "deepseek-v3 · 对话", "16,400", "¥4.90"],
        ["yk", "2026-11-03", "deepseek-v3 · 对话", "22,870", "¥6.90"],
        ["xc", "2026-11-03", "deepseek-v3 · 导入", "8,120", "¥2.40"],
      ];
      var USAGE_ME_ROWS = [
        ["2026-11-05", "deepseek-v3 · 对话", "8,420", "¥2.50"],
        ["2026-11-05", "deepseek-v3 · 对话", "10,000", "¥3.00"],
        ["2026-11-04", "deepseek-r1 · 分析", "21,080", "¥13.40"],
        ["2026-11-03", "deepseek-v3 · 工具", "12,640", "¥3.80"],
      ];
      var USAGE_TEAM_DAYS = [
        ["2026-11-05", "4", "86", "90,340", "¥36.80"],
        ["2026-11-04", "3", "72", "83,060", "¥42.40"],
        ["2026-11-03", "3", "61", "58,120", "¥18.20"],
        ["2026-11-02", "4", "79", "71,450", "¥38.90"],
        ["2026-11-01", "5", "94", "102,200", "¥48.10"],
        ["2026-10-31", "4", "68", "64,880", "¥24.60"],
        ["2026-10-30", "3", "55", "49,710", "¥19.40"],
      ];
      var USAGE_ME_DAYS = [
        ["2026-11-05", "12", "18,420", "¥5.50"],
        ["2026-11-04", "18", "41,080", "¥22.20"],
        ["2026-11-03", "9", "12,640", "¥3.80"],
        ["2026-11-02", "11", "15,110", "¥4.50"],
        ["2026-11-01", "14", "19,860", "¥6.00"],
        ["2026-10-31", "8", "9,420", "¥2.80"],
        ["2026-10-30", "7", "8,150", "¥2.40"],
      ];
      var USAGE_TEAM_CALLS = [
        ["11-05 14:52", "cth", "sess_a91c…", "deepseek-v3", "2,480", "¥0.74"],
        ["11-05 14:41", "admin001", "sess_7e02…", "deepseek-r1", "6,120", "¥3.90"],
        ["11-05 13:18", "yk", "sess_44b1…", "deepseek-v3", "1,960", "¥0.59"],
        ["11-05 11:05", "test001", "sess_c30e…", "deepseek-v3", "3,340", "¥1.00"],
        ["11-04 22:17", "cth", "sess_a91c…", "deepseek-r1", "8,750", "¥5.40"],
        ["11-04 19:44", "admin001", "sess_0fd9…", "deepseek-v3", "2,110", "¥0.63"],
      ];
      var USAGE_ME_CALLS = [
        ["11-05 14:08", "sess_m2c1…", "deepseek-v3 · 对话", "2,140", "¥0.64"],
        ["11-05 11:33", "sess_m2c1…", "deepseek-v3 · 对话", "3,680", "¥1.10"],
        ["11-04 21:55", "sess_m9aa…", "deepseek-r1 · 分析", "7,920", "¥4.90"],
        ["11-04 18:12", "sess_m9aa…", "deepseek-r1 · 分析", "5,410", "¥3.30"],
        ["11-03 15:27", "sess_m441…", "deepseek-v3 · 工具", "4,220", "¥1.27"],
      ];

      var WB_THREADS = {
        welcome: {
          title: "欢迎",
          sub: "座位桌面占位 · 不跳真实端口。可切换左侧会话或发送 mock 消息。",
          seed: [
            { who: "PA", av: "PA", txt: "你好，这里是假会话区。登录角色与 desk_session 逻辑未改。" },
            { who: "你", av: "你", txt: "（示例）帮我打开本周待办。" },
          ],
        },
        weekly: {
          title: "周报草稿",
          sub: "mock 会话 · 可续写假消息，不落现网。",
          seed: [
            { who: "PA", av: "PA", txt: "本周门户 auth：登录闸、成员开座位、用量图、日历日轴已齐。" },
            { who: "你", av: "你", txt: "把日历年月跳选也写进周报。" },
          ],
        },
        kb: {
          title: "资料库速查",
          sub: "mock · drive/kb 共享卷说明（非按座位隔离）。",
          seed: [
            { who: "PA", av: "PA", txt: "资料库路径 mock：/kb/shared · 全员可读。" },
            { who: "你", av: "你", txt: "xlsx 预览还禁着吗？" },
            { who: "PA", av: "PA", txt: "是，documentpreview Iterator 相关自 10-29 禁用。" },
          ],
        },
      };

      var nextPort = 3306;
      var bootTimers = {};

      function uid() {
        return "ds_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
      }
      function readJson(key, fallback) {
        try {
          var raw = localStorage.getItem(key);
          if (raw) return JSON.parse(raw);
        } catch (e) { /* ignore */ }
        return fallback;
      }
      function writeJson(key, value) {
        if (value == null) localStorage.removeItem(key);
        else localStorage.setItem(key, JSON.stringify(value));
      }
      function readSession() { return readJson(SESSION_KEY, null); }
      function writeSession(session) { writeJson(SESSION_KEY, session); }
      function loadMembers() {
        var list = readJson(MEMBERS_KEY, null);
        if (list && list.length) {
          list.forEach(function (m) {
            if (m.port && m.port >= nextPort) nextPort = m.port + 1;
          });
          return list;
        }
        return DEFAULT_MEMBERS.map(function (m) { return Object.assign({}, m); });
      }
      function saveMembers(list) { writeJson(MEMBERS_KEY, list); }
      function loadAnns() {
        var list = readJson(ANN_KEY, null);
        if (list) return list;
        return DEFAULT_ANNS.map(function (a) { return Object.assign({}, a); });
      }
      function saveAnns(list) { writeJson(ANN_KEY, list); }

      function pad2(n) { return n < 10 ? "0" + n : String(n); }
      function ymd(y, m0, d) { return y + "-" + pad2(m0 + 1) + "-" + pad2(d); }
      function ymdFromDate(dt) { return ymd(dt.getFullYear(), dt.getMonth(), dt.getDate()); }
      function parseYmd(s) {
        var p = String(s || "").split("-");
        return new Date(+p[0], +p[1] - 1, +p[2]);
      }
      function hourOf(hm) {
        var p = String(hm || "0:0").split(":");
        return Math.floor((+p[0]) || 0);
      }
      function lunarLabel(key) {
        if (LUNAR_MAP[key]) return LUNAR_MAP[key];
        var d = parseYmd(key).getDate();
        var cn = ["", "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
          "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
          "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"];
        return cn[d] || "";
      }
      function seatLabel(seat) {
        if (seat === "up") return "已开";
        if (seat === "booting") return "启动中…";
        if (seat === "idle") return "空闲";
        return "未开";
      }
      function seatClass(seat) {
        if (seat === "up") return "on";
        if (seat === "booting") return "boot";
        if (seat === "idle") return "wait";
        return "off";
      }

      var PA_CSS = [
        '.pa-nav{display:flex;align-items:center;gap:10px;width:100%;padding:7px 10px;border:0;border-radius:10px;background:transparent;color:inherit;cursor:pointer;font:400 14px/22px -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Noto Sans SC","Microsoft YaHei",sans-serif;text-align:left}',
        '.pa-nav:hover{background:rgba(127,127,127,.12)}',
        '.pa-nav.on{background:rgba(79,124,247,.13)}',
        '.pa-nav .ic{width:16px;height:16px;display:flex;align-items:center;justify-content:center;flex:0 0 auto}',
        '.pa-nav .lbl{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
        '.pa-fv{position:fixed;left:var(--pa-fv-left,0px);top:0;right:0;bottom:0;z-index:9999;display:flex;flex-direction:column;background:#e6e6e6;color:#1c1e21;overflow:auto;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Noto Sans SC","Microsoft YaHei",sans-serif}',
        '.pa-hd{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:12px;padding:16px 16px 14px;background:#fff}',
        '.pa-mark{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:#fff;border:1px solid #e4e4e4;color:#4b5563;flex:0 0 auto}',
        '.pa-hd-text{flex:1;min-width:0}',
        '.pa-t1{font-size:18px;font-weight:700;line-height:1.3}',
        '.pa-t2{margin-top:3px;font-size:12px;line-height:1.45;color:#8b919a}',
        '.pa-hd-actions{display:flex;gap:8px;flex:0 0 auto;flex-wrap:wrap;justify-content:flex-end}',
        '.pa-back,.pa-chip{height:34px;padding:0 14px;border:1px solid #d5d5d5;border-radius:999px;background:#fff;color:#3a3a3a;font:500 12.5px/1 inherit;cursor:pointer;white-space:nowrap}',
        '.pa-back:hover,.pa-chip:hover{background:#f6f6f6}',
        '.pa-pill{display:inline-flex;align-items:center;height:22px;padding:0 8px;border-radius:999px;font:600 11px/1 inherit}',
        '.pa-pill.admin{background:#e8eefc;color:#2b4db3}',
        '.pa-pill.member{background:#e7f6ee;color:#1b7a45}',
        '.pa-bd{padding:14px 16px 72px}',
        '.pa-tabs{display:flex;gap:4px;padding:4px;margin:0 0 14px;background:#fff;border-radius:12px;box-shadow:0 1px 2px rgba(16,24,40,.04);flex-wrap:wrap}',
        '.pa-tab{flex:1;min-width:72px;display:flex;align-items:center;justify-content:center;height:36px;border:0;border-radius:9px;background:transparent;color:#6b7280;font:500 13.5px/1 inherit;cursor:pointer}',
        '.pa-tab.on{background:#fff;color:#1c1e21;font-weight:650;box-shadow:0 1px 3px rgba(16,24,40,.14)}',
        '.pa-tab:disabled{opacity:.4;cursor:not-allowed}',
        '.pa-hint{margin:0 2px 12px;font-size:13px;line-height:1.65;color:#8b9098}',
        '.pa-row{display:flex;gap:8px;align-items:center;margin-top:12px;flex-wrap:wrap}',
        '.pa-inp,.pa-ta{width:100%;min-width:0;box-sizing:border-box;border:1px solid #e1e1e1;border-radius:10px;padding:0 12px;background:#fff;color:inherit;font:400 14px/1.4 inherit;outline:none}',
        '.pa-inp{height:40px}',
        '.pa-ta{min-height:72px;padding:10px 12px;resize:vertical}',
        '.pa-inp:focus,.pa-ta:focus{border-color:#4f7cf7;box-shadow:0 0 0 3px rgba(79,124,247,.15)}',
        '.pa-btn{height:36px;padding:0 16px;border:0;border-radius:10px;background:#3478f6;color:#fff;font:600 14px/1 inherit;cursor:pointer}',
        '.pa-btn:hover{background:#2d6ae0}',
        '.pa-btn:disabled{opacity:.55;cursor:not-allowed}',
        '.pa-btn.gh{background:#fff;border:1px solid #e1e1e1;color:#3a3a3a;font-weight:500}',
        '.pa-btn.gh:hover{background:#f7f7f7}',
        '.pa-btn.danger{background:#fff;border:1px solid #f0b4b4;color:#c0392b}',
        '.pa-btn.sm{height:30px;padding:0 10px;font-size:12.5px;border-radius:8px}',
        '.pa-card{background:#fff;border-radius:12px;padding:14px 16px;margin-bottom:12px;box-shadow:0 1px 2px rgba(16,24,40,.04)}',
        '.pa-card h3{margin:0 0 10px;font-size:14px}',
        '.pa-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-bottom:12px}',
        '.pa-stat{background:#fff;border-radius:12px;padding:12px 14px}',
        '.pa-stat .k{font-size:12px;color:#8b9098}',
        '.pa-stat .v{margin-top:4px;font-size:22px;font-weight:700}',
        '.pa-stat .s{margin-top:2px;font-size:12px;color:#8b9098}',
        '.pa-tag{display:inline-flex;align-items:center;height:22px;padding:0 8px;border-radius:999px;font:600 11px/1 inherit}',
        '.pa-tag.on{background:#e7f6ee;color:#1b7a45}',
        '.pa-tag.boot{background:#fff4d6;color:#9a6b00}',
        '.pa-tag.wait{background:#eef2f8;color:#4b5563}',
        '.pa-tag.off{background:#f3f3f3;color:#8b9098}',
        '.pa-tag.pin{background:#e8eefc;color:#2b4db3}',
        '.pa-table-wrap{overflow:auto}',
        '.pa-table{width:100%;border-collapse:collapse;font-size:13px}',
        '.pa-table th,.pa-table td{text-align:left;padding:8px 6px;border-bottom:1px solid #eee;white-space:nowrap}',
        '.pa-table th{color:#8b9098;font-weight:600}',
        '.pa-msg{margin-top:8px;font-size:12.5px;color:#8b9098}',
        '.pa-msg.ok{color:#248a3d}',
        '.pa-msg.err{color:#d64545}',
        '.pa-login{max-width:420px;margin:24px auto;background:#fff;border-radius:16px;padding:22px 20px 20px}',
        '.pa-login h2{margin:0 0 6px;font-size:18px}',
        '.pa-ann{padding:12px 0;border-bottom:1px solid #f0f0f0}',
        '.pa-ann .t{font-weight:650}',
        '.pa-ann .m{margin-top:4px;font-size:13.5px;line-height:1.55;color:#333}',
        '.pa-ann .d{margin-top:4px;font-size:12px;color:#9aa0a6}',
        '.pa-charts{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-bottom:12px}',
        '.pa-chart{background:#fff;border-radius:12px;padding:12px}',
        '.pa-chart h3{margin:0 0 8px;font-size:13.5px}',
        '.pa-chart svg{width:100%;height:auto;display:block}',
        '.pa-cal-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px}',
        '.pa-cal-title{border:0;background:transparent;font:700 16px/1 inherit;cursor:pointer}',
        '.pa-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}',
        '.pa-cal-wd{text-align:center;font-size:12px;color:#8b9098;padding:4px 0}',
        '.pa-cal-cell{min-height:54px;border:0;border-radius:10px;background:#fff;cursor:pointer;padding:6px 4px;text-align:left}',
        '.pa-cal-cell .d{font-weight:650}',
        '.pa-cal-cell .l{display:block;font-size:11px;color:#9aa0a6}',
        '.pa-cal-cell.out{opacity:.4}',
        '.pa-cal-cell.on{outline:2px solid #3478f6}',
        '.pa-cal-cell.jq .l{color:#b54708;font-weight:650}',
        '.pa-cal-cell.has{box-shadow:inset 0 -3px 0 #8b93ff}',
        '.pa-axis{margin-top:12px}',
        '.pa-hour{display:grid;grid-template-columns:52px 1fr;gap:8px;min-height:36px;border-top:1px dashed #e5e5e5;padding:6px 0}',
        '.pa-hour .hm{font:500 12px/1 ui-monospace,monospace;color:#8b9098}',
        '.pa-ev{background:#f6f7fb;border-radius:8px;padding:6px 8px;margin-bottom:4px}',
        '.pa-ev.done{opacity:.55;text-decoration:line-through}',
        '.pa-ev.critical{border-left:3px solid #d64545}',
        '.pa-ev.high{border-left:3px solid #e67e22}',
        '.pa-ev.normal{border-left:3px solid #3478f6}',
        '.pa-ev.low{border-left:3px solid #9aa0a6}',
        '.pa-wb{display:grid;grid-template-columns:180px 1fr;gap:12px;min-height:420px}',
        '@media (max-width:720px){.pa-wb{grid-template-columns:1fr}}',
        '.pa-rail{background:#fff;border-radius:12px;padding:8px}',
        '.pa-rail button{width:100%;text-align:left;border:0;background:transparent;padding:10px;border-radius:8px;cursor:pointer;font:500 13.5px/1.3 inherit}',
        '.pa-rail button.on{background:rgba(79,124,247,.13)}',
        '.pa-thread{background:#fff;border-radius:12px;padding:14px;display:flex;flex-direction:column;min-height:380px}',
        '.pa-msgrow{display:flex;gap:8px;margin-bottom:10px}',
        '.pa-av{width:28px;height:28px;border-radius:8px;background:#eef2f8;display:flex;align-items:center;justify-content:center;font-size:11px;flex:0 0 auto}',
        '.pa-bubble{background:#f7f8fa;border-radius:10px;padding:8px 10px;flex:1}',
        '.pa-bubble .who{font-size:11px;color:#8b9098;margin-bottom:2px}',
        '.pa-composer{display:flex;gap:8px;margin-top:auto;padding-top:10px}',
        '.pa-gate{display:flex;gap:8px;flex-wrap:wrap;align-items:center}'
      ].join("");

      function ensureCss() {
        if (typeof document === "undefined") return;
        if (document.getElementById("anywork-portal-auth-css")) return;
        var st = document.createElement("style");
        st.id = "anywork-portal-auth-css";
        st.textContent = PA_CSS;
        (document.head || document.documentElement).appendChild(st);
      }

      function h(type, props) {
        var args = [type, props];
        for (var i = 2; i < arguments.length; i++) args.push(arguments[i]);
        return React.createElement.apply(React, args);
      }
      function svg(size) {
        var props = {
          viewBox: "0 0 24 24", width: size, height: size, fill: "none", stroke: "currentColor",
          strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true",
        };
        var args = ["svg", props];
        for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
        return h.apply(null, args);
      }
      function iconPortal(size) {
        return svg(size,
          h("rect", { x: 4.5, y: 3.5, width: 15, height: 17, rx: 2 }),
          h("path", { d: "M10 21V12h4v9" }),
          h("path", { d: "M8 8h.01M12 8h.01M16 8h.01" })
        );
      }
      function measureFv() {
        var left = 0;
        try {
          if (!(window.matchMedia && window.matchMedia("(max-width: 820px)").matches)) {
            var sc = document.querySelector('[class*="sidebarCol"]');
            if (sc) {
              var r = sc.getBoundingClientRect();
              if (r && r.right > 40 && r.right < window.innerWidth * 0.6) left = Math.round(r.right);
            }
          }
          document.documentElement.style.setProperty("--pa-fv-left", left + "px");
        } catch (e) { /* ignore */ }
      }
      function notifyFv(id) {
        try { window.dispatchEvent(new CustomEvent("desk-fv", { detail: { id: id } })); } catch (e) { /* ignore */ }
      }

      function dataTable(headers, rows) {
        return h("div", { className: "pa-table-wrap" },
          h("table", { className: "pa-table" },
            h("thead", null, h("tr", null, headers.map(function (hd, i) { return h("th", { key: i }, hd); }))),
            h("tbody", null, rows.map(function (row, ri) {
              return h("tr", { key: ri }, row.map(function (cell, ci) { return h("td", { key: ci }, cell); }));
            }))
          )
        );
      }

      function lineChart(values, labels, maxVal, color, gid) {
        var left = 40, right = 400, bottom = 150, top = 20, innerH = bottom - top;
        var n = values.length;
        var pts = values.map(function (v, i) {
          var x = left + (n <= 1 ? 0 : i * (right - left) / (n - 1));
          var y = bottom - (Number(v) / maxVal) * innerH;
          return [x, y];
        });
        var line = pts.map(function (p, i) { return (i ? "L" : "M") + p[0] + "," + p[1]; }).join(" ");
        var area = line + " L" + pts[pts.length - 1][0] + "," + bottom + " L" + pts[0][0] + "," + bottom + " Z";
        var ticks = labels.map(function (lb, i) {
          var x = left + (n <= 1 ? 0 : i * (right - left) / (n - 1));
          return h("text", { key: lb, x: x, y: 168, textAnchor: "middle" }, lb);
        });
        return h("svg", { className: "chart-svg", viewBox: "0 0 420 180", role: "img" },
          h("defs", null,
            h("linearGradient", { id: gid, x1: "0", y1: "0", x2: "0", y2: "1" },
              h("stop", { offset: "0%", stopColor: color, stopOpacity: "0.35" }),
              h("stop", { offset: "100%", stopColor: color, stopOpacity: "0" })
            )
          ),
          h("g", { stroke: "#232326", strokeWidth: 1 },
            h("line", { x1: 40, y1: 20, x2: 40, y2: 150 }),
            h("line", { x1: 40, y1: 150, x2: 400, y2: 150 }),
            h("line", { x1: 40, y1: 85, x2: 400, y2: 85, strokeDasharray: "3 4" }),
            h("line", { x1: 40, y1: 50, x2: 400, y2: 50, strokeDasharray: "3 4" }),
            h("line", { x1: 40, y1: 120, x2: 400, y2: 120, strokeDasharray: "3 4" })
          ),
          h("g", { fill: "#5c5c66", fontSize: 10, fontFamily: "ui-monospace,monospace" },
            h("text", { x: 36, y: 24, textAnchor: "end" }, String(maxVal)),
            h("text", { x: 36, y: 89, textAnchor: "end" }, String(maxVal / 2)),
            h("text", { x: 36, y: 154, textAnchor: "end" }, "0"),
            ticks
          ),
          h("path", { fill: "url(#" + gid + ")", d: area }),
          h("path", { fill: "none", stroke: color, strokeWidth: 2.2, strokeLinejoin: "round", strokeLinecap: "round", d: line }),
          h("g", { fill: color }, pts.map(function (p, i) {
            return h("circle", { key: i, cx: p[0], cy: p[1], r: 3 });
          }))
        );
      }

      function barChart(items, maxVal, color) {
        var left = 40, bottom = 150, top = 20, innerH = bottom - top;
        var slot = 220 / items.length;
        var bars = items.map(function (it, i) {
          var hgt = (Number(it.v) / maxVal) * innerH;
          var x = left + 16 + i * slot;
          return h("g", { key: it.name },
            h("rect", { x: x, y: bottom - hgt, width: Math.max(18, slot - 16), height: hgt, rx: 3, fill: color, fillOpacity: String(1 - i * 0.12) }),
            h("text", { x: x + 14, y: 168, textAnchor: "middle", fill: "#5c5c66", fontSize: 10, fontFamily: "ui-monospace,monospace" }, it.name)
          );
        });
        return h("svg", { className: "chart-svg", viewBox: "0 0 280 180", role: "img" },
          h("g", { stroke: "#232326", strokeWidth: 1 },
            h("line", { x1: 40, y1: 20, x2: 40, y2: 150 }),
            h("line", { x1: 40, y1: 150, x2: 260, y2: 150 })
          ),
          h("g", { fill: "#5c5c66", fontSize: 10, fontFamily: "ui-monospace,monospace" },
            h("text", { x: 36, y: 24, textAnchor: "end" }, String(maxVal)),
            h("text", { x: 36, y: 89, textAnchor: "end" }, String(maxVal / 2)),
            h("text", { x: 36, y: 154, textAnchor: "end" }, "0")
          ),
          bars
        );
      }

      function monthCells(year, month0) {
        var first = new Date(year, month0, 1);
        var startDow = (first.getDay() + 6) % 7;
        var daysIn = new Date(year, month0 + 1, 0).getDate();
        var prevDays = new Date(year, month0, 0).getDate();
        var cells = [];
        var i, d, dt;
        for (i = 0; i < startDow; i++) {
          d = prevDays - startDow + i + 1;
          dt = new Date(year, month0 - 1, d);
          cells.push({ key: ymdFromDate(dt), day: d, inMonth: false });
        }
        for (d = 1; d <= daysIn; d++) {
          cells.push({ key: ymd(year, month0, d), day: d, inMonth: true });
        }
        i = 1;
        while (cells.length % 7) {
          dt = new Date(year, month0 + 1, i++);
          cells.push({ key: ymdFromDate(dt), day: dt.getDate(), inMonth: false });
        }
        return cells;
      }

      function PortalPanel() {
        var openPair = React.useState(false);
        var open = openPair[0], setOpen = openPair[1];
        var sessionPair = React.useState(function () { return readSession(); });
        var session = sessionPair[0], setSession = sessionPair[1];
        var viewPair = React.useState("portal");
        var view = viewPair[0], setView = viewPair[1];
        var tabPair = React.useState("overview");
        var tab = tabPair[0], setTab = tabPair[1];
        var userPair = React.useState("");
        var user = userPair[0], setUser = userPair[1];
        var passPair = React.useState("");
        var pass = passPair[0], setPass = passPair[1];
        var errPair = React.useState("");
        var loginErr = errPair[0], setLoginErr = errPair[1];
        var membersPair = React.useState(function () { return loadMembers(); });
        var members = membersPair[0], setMembers = membersPair[1];
        var notePair = React.useState("");
        var memberNote = notePair[0], setMemberNote = notePair[1];
        var regPair = React.useState("");
        var regUser = regPair[0], setRegUser = regPair[1];
        var annsPair = React.useState(function () { return loadAnns(); });
        var anns = annsPair[0], setAnns = annsPair[1];
        var annTitlePair = React.useState("");
        var annTitle = annTitlePair[0], setAnnTitle = annTitlePair[1];
        var annBodyPair = React.useState("");
        var annBody = annBodyPair[0], setAnnBody = annBodyPair[1];
        var annPinPair = React.useState(false);
        var annPin = annPinPair[0], setAnnPin = annPinPair[1];
        var annNotePair = React.useState("");
        var annNote = annNotePair[0], setAnnNote = annNotePair[1];
        var adminNotePair = React.useState("");
        var adminNote = adminNotePair[0], setAdminNote = adminNotePair[1];
        var gatePair = React.useState("");
        var gateMsg = gatePair[0], setGateMsg = gatePair[1];
        var calMonthPair = React.useState(function () { return { y: 2026, m0: 10 }; });
        var calMonth = calMonthPair[0], setCalMonth = calMonthPair[1];
        var calSelPair = React.useState("2026-11-05");
        var calSelected = calSelPair[0], setCalSelected = calSelPair[1];
        var calTrackPair = React.useState("all");
        var calTrack = calTrackPair[0], setCalTrack = calTrackPair[1];
        var calModePair = React.useState("days");
        var calMode = calModePair[0], setCalMode = calModePair[1];
        var eventsPair = React.useState(function () { return DEFAULT_EVENTS.map(function (e) { return Object.assign({}, e); }); });
        var calEvents = eventsPair[0], setCalEvents = eventsPair[1];
        var wbIdPair = React.useState("welcome");
        var wbChatId = wbIdPair[0], setWbChatId = wbIdPair[1];
        var wbExtraPair = React.useState({ welcome: [], weekly: [], kb: [] });
        var wbExtra = wbExtraPair[0], setWbExtra = wbExtraPair[1];
        var wbDraftPair = React.useState("");
        var wbDraft = wbDraftPair[0], setWbDraft = wbDraftPair[1];
        var refreshPair = React.useState(false);
        var refreshing = refreshPair[0], setRefreshing = refreshPair[1];
        var idRef = React.useRef("");
        var openRef = React.useRef(false);
        if (!idRef.current) idRef.current = "portal-auth-" + (++PA_SEQ);
        openRef.current = open;

        function persistMembers(list) {
          saveMembers(list);
          setMembers(list.map(function (m) { return Object.assign({}, m); }));
        }
        function persistAnns(list) {
          saveAnns(list);
          setAnns(list.map(function (a) { return Object.assign({}, a); }));
        }

        React.useEffect(function () {
          function onFv(e) {
            var who = e && e.detail ? e.detail.id : null;
            if (who !== idRef.current) setOpen(false);
          }
          function onKey(e) { if (e.key === "Escape" && openRef.current) setOpen(false); }
          function onDown(e) {
            if (!openRef.current) return;
            var t = e.target;
            if (t && t.closest && (t.closest(".pa-fv") || t.closest(".pa-nav"))) return;
            setOpen(false);
          }
          window.addEventListener("desk-fv", onFv);
          document.addEventListener("keydown", onKey);
          document.addEventListener("pointerdown", onDown, true);
          return function () {
            window.removeEventListener("desk-fv", onFv);
            document.removeEventListener("keydown", onKey);
            document.removeEventListener("pointerdown", onDown, true);
          };
        }, []);

        React.useEffect(function () {
          if (!open) return;
          measureFv();
          notifyFv(idRef.current);
        }, [open]);

        var isAdmin = !!(session && session.role === "admin");

        function doLogin() {
          var name = String(user || "").trim();
          var acct = USERS[name];
          if (!acct || acct.secret !== pass) {
            setLoginErr("用户未知或密码错误");
            writeSession(null);
            setSession(null);
            return;
          }
          var sess = {
            id: uid(),
            user: name,
            displayName: acct.displayName,
            role: acct.role,
            issuedAt: new Date().toISOString(),
            source: "anywork-portal-auth-0.2.0",
          };
          writeSession(sess);
          setSession(sess);
          setLoginErr("");
          setPass("");
          setView("portal");
          setTab("overview");
          setGateMsg("");
        }
        function doLogout() {
          writeSession(null);
          setSession(null);
          setLoginErr("");
          setView("portal");
          setTab("overview");
        }
        function tryGate(kind) {
          if (!session || !session.role) { setGateMsg("拒绝 · 无角色"); return; }
          if (kind === "admin") {
            setGateMsg(session.role === "admin" ? "允许 · admin" : "拒绝 · " + session.role);
          } else {
            setGateMsg(session.role === "admin" || session.role === "member" ? "允许 · " + session.role : "拒绝 · " + session.role);
          }
        }
        function changeTab(next) {
          if (next === "members" && !isAdmin) {
            setGateMsg("成员管理需要 admin");
            return;
          }
          setTab(next);
        }

        function bootSeat(id) {
          var list = loadMembers();
          var m = list.find(function (x) { return x.id === id; });
          if (!m || m.seat === "up" || m.seat === "booting") return;
          m.seat = "booting";
          m.port = null;
          persistMembers(list);
          setMemberNote("正在拉起 " + id + " 座位…（mock ~1.2s）");
          if (bootTimers[id]) clearTimeout(bootTimers[id]);
          bootTimers[id] = setTimeout(function () {
            var list2 = loadMembers();
            var m2 = list2.find(function (x) { return x.id === id; });
            if (!m2) return;
            m2.seat = "up";
            m2.port = nextPort++;
            persistMembers(list2);
            setMemberNote(id + " 已开 · 端口 :" + m2.port + "（假数据）");
          }, 1200);
        }
        function stopSeat(id) {
          var list = loadMembers();
          var m = list.find(function (x) { return x.id === id; });
          if (!m) return;
          m.seat = "off";
          m.port = null;
          persistMembers(list);
          setMemberNote("已停 " + id + " 实例（mock）");
        }
        function deleteMember(id) {
          if (!window.confirm("确认删除账号 " + id + " 并清除实例？此操作仅 mock，刷新可重置。")) return;
          if (bootTimers[id]) { clearTimeout(bootTimers[id]); delete bootTimers[id]; }
          persistMembers(loadMembers().filter(function (x) { return x.id !== id; }));
          setMemberNote("已删账号+实例：" + id);
        }
        function registerMember() {
          var name = String(regUser || "").trim().toLowerCase().replace(/\s+/g, "");
          if (!name) { setMemberNote("请输入新用户名"); return; }
          if (!/^[a-z0-9_\-]{2,24}$/.test(name)) { setMemberNote("用户名仅字母数字_-/2–24 位"); return; }
          var list = loadMembers();
          if (list.some(function (x) { return x.id === name; })) { setMemberNote(name + " 已存在"); return; }
          list.push({ id: name, role: "member", budget: "0%", seat: "off", port: null });
          persistMembers(list);
          setRegUser("");
          setMemberNote("已注册 " + name + "（未开座位）");
        }
        function refreshSeats() {
          if (refreshing) return;
          setRefreshing(true);
          setMemberNote("正在重新探测座位状态…（mock）");
          var delay = 600 + Math.floor(Math.random() * 700);
          setTimeout(function () {
            var list = loadMembers();
            var changed = 0;
            list.forEach(function (m) {
              if (m.seat === "booting") return;
              var roll = Math.random();
              if (m.seat === "up") {
                if (roll < 0.12) { m.seat = "idle"; changed++; }
                else if (!m.port) { m.port = nextPort++; changed++; }
              } else if (m.seat === "idle") {
                if (roll < 0.35) { m.seat = "up"; if (!m.port) m.port = nextPort++; changed++; }
                else if (roll > 0.85) { m.seat = "off"; m.port = null; changed++; }
              } else if (m.seat === "off" && roll < 0.08) {
                m.seat = "idle"; m.port = nextPort++; changed++;
              }
            });
            persistMembers(list);
            setRefreshing(false);
            setMemberNote("探测完成 · " + delay + "ms · " + (changed ? ("状态抖动 " + changed + " 项") : "无变化"));
          }, delay);
        }
        function resetMembers() {
          Object.keys(bootTimers).forEach(function (k) { clearTimeout(bootTimers[k]); });
          bootTimers = {};
          nextPort = 3306;
          localStorage.removeItem(MEMBERS_KEY);
          persistMembers(DEFAULT_MEMBERS.map(function (m) { return Object.assign({}, m); }));
          setMemberNote("已重置为默认 mock 列表");
        }
        function mockBudget() {
          var list = loadMembers();
          var hit = list.find(function (m) { return m.id === "test001"; });
          if (!hit) { setAdminNote("test001 不在列表（可重置成员）"); return; }
          var n = parseInt(String(hit.budget).replace(/%/g, ""), 10);
          if (isNaN(n)) n = 45;
          n = Math.min(100, n + 10);
          hit.budget = n + "%";
          persistMembers(list);
          setAdminNote("mock：test001 预算 → " + hit.budget);
        }
        function mockDisable() {
          var list = loadMembers();
          var hit = list.find(function (m) { return m.id === "test001"; });
          if (!hit) { setAdminNote("test001 不在列表（可重置成员）"); return; }
          hit.seat = "off";
          hit.port = null;
          persistMembers(list);
          setAdminNote("mock：已停用 test001 座位");
        }
        function publishAnn() {
          if (!isAdmin) { setAnnNote("需要 admin"); return; }
          var title = String(annTitle || "").trim();
          var body = String(annBody || "").trim();
          if (!title || !body) { setAnnNote("请填写标题与正文"); return; }
          var list = loadAnns();
          list.unshift({
            id: "a_" + Math.random().toString(36).slice(2, 8),
            title: title, body: body,
            author: session.user || "admin",
            at: ymdFromDate(new Date()),
            pinned: !!annPin,
          });
          persistAnns(list);
          setAnnTitle(""); setAnnBody(""); setAnnPin(false);
          setAnnNote("已发布：" + title);
        }
        function toggleAnnPin(id) {
          var list = loadAnns();
          list.forEach(function (a) { if (a.id === id) a.pinned = !a.pinned; });
          persistAnns(list);
          setAnnNote("已更新置顶");
        }
        function deleteAnn(id) {
          if (!window.confirm("删除该公告？（仅 mock）")) return;
          persistAnns(loadAnns().filter(function (a) { return a.id !== id; }));
          setAnnNote("已删除公告");
        }
        function toggleEventDone(id) {
          setCalEvents(function (prev) {
            return prev.map(function (e) { return e.id === id ? Object.assign({}, e, { done: !e.done }) : e; });
          });
        }
        function deleteEvent(id) {
          setCalEvents(function (prev) { return prev.filter(function (e) { return e.id !== id; }); });
        }
        function sendWb() {
          var txt = String(wbDraft || "").trim();
          if (!txt) return;
          setWbExtra(function (prev) {
            var next = Object.assign({}, prev);
            var arr = (next[wbChatId] || []).slice();
            arr.push({ who: "你", av: "你", txt: txt });
            arr.push({ who: "PA", av: "PA", txt: "（mock 回执）已收到：" + (txt.length > 40 ? txt.slice(0, 40) + "…" : txt) });
            next[wbChatId] = arr;
            return next;
          });
          setWbDraft("");
        }

        var trigger = h("button", {
          type: "button",
          className: "pa-nav" + (open ? " on" : ""),
          onClick: function () { setOpen(function (v) { return !v; }); },
        }, h("span", { className: "ic" }, iconPortal(16)), h("span", { className: "lbl" }, "门户"));

        if (!open) return h("div", { "data-pa-root": "1" }, trigger);

        var bodyKids;
        if (!session) {
          bodyKids = h("div", { className: "pa-login" },
            h("h2", null, "登录团队门户"),
            h("p", { className: "pa-hint" }, "mock · admin/admin 或 member/member · 写入 desk_session"),
            h("div", { className: "pa-row" },
              h("input", { className: "pa-inp", placeholder: "用户名", value: user, onChange: function (e) { setUser(e.target.value); },
                onKeyDown: function (e) { if (e.key === "Enter") doLogin(); } })
            ),
            h("div", { className: "pa-row" },
              h("input", { className: "pa-inp", type: "password", placeholder: "口令", value: pass, onChange: function (e) { setPass(e.target.value); },
                onKeyDown: function (e) { if (e.key === "Enter") doLogin(); } })
            ),
            loginErr ? h("div", { className: "pa-msg err" }, loginErr) : null,
            h("div", { className: "pa-row" },
              h("button", { type: "button", className: "pa-btn", onClick: doLogin }, "登录"),
              h("button", { type: "button", className: "pa-btn gh", onClick: function () { setUser("admin"); setPass("admin"); } }, "填入 admin"),
              h("button", { type: "button", className: "pa-btn gh", onClick: function () { setUser("member"); setPass("member"); } }, "填入 member")
            )
          );
        } else if (view === "workbench") {
          var meta = WB_THREADS[wbChatId] || WB_THREADS.welcome;
          var msgs = (meta.seed || []).concat(wbExtra[wbChatId] || []);
          bodyKids = h("div", { className: "pa-wb" },
            h("div", { className: "pa-rail" },
              ["welcome", "weekly", "kb"].map(function (id) {
                return h("button", {
                  key: id, type: "button", className: wbChatId === id ? "on" : "",
                  onClick: function () { setWbChatId(id); },
                }, WB_THREADS[id].title);
              })
            ),
            h("div", { className: "pa-thread" },
              h("div", { className: "pa-t1" }, meta.title),
              h("div", { className: "pa-t2" }, meta.sub + " · " + (session.displayName || session.user) + " · " + session.role),
              h("div", { style: { marginTop: 12, flex: 1 } }, msgs.map(function (m, i) {
                return h("div", { key: i, className: "pa-msgrow" },
                  h("div", { className: "pa-av" }, m.av),
                  h("div", { className: "pa-bubble" }, h("div", { className: "who" }, m.who), h("div", null, m.txt))
                );
              })),
              h("div", { className: "pa-composer" },
                h("input", { className: "pa-inp", value: wbDraft, placeholder: "发一句 mock 消息…",
                  onChange: function (e) { setWbDraft(e.target.value); },
                  onKeyDown: function (e) { if (e.key === "Enter") sendWb(); } }),
                h("button", { type: "button", className: "pa-btn", onClick: sendWb }, "发送")
              )
            )
          );
        } else {
          var up = members.filter(function (m) { return m.seat === "up"; }).length;
          var idle = members.filter(function (m) { return m.seat === "idle"; }).length;
          var off = members.filter(function (m) { return m.seat === "off" || m.seat === "booting"; }).length;
          var pinned = anns.filter(function (a) { return a.pinned; }).length;
          var sortedAnns = anns.slice().sort(function (a, b) {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            return String(b.at || "").localeCompare(String(a.at || ""));
          });

          var tabBar = h("div", { className: "pa-tabs" },
            [["overview", "总览"], ["members", "成员"], ["usage", "用量"], ["announce", "公告"], ["calendar", "日历"]].map(function (pair) {
              var disabled = pair[0] === "members" && !isAdmin;
              return h("button", {
                key: pair[0], type: "button",
                className: "pa-tab" + (tab === pair[0] ? " on" : ""),
                disabled: disabled,
                title: disabled ? "需要 admin" : "",
                onClick: function () { changeTab(pair[0]); },
              }, pair[1]);
            })
          );

          var tabBody = null;
          if (tab === "overview") {
            tabBody = h("div", null,
              h("div", { className: "pa-stats" },
                h("div", { className: "pa-stat" }, h("div", { className: "k" }, "座位"), h("div", { className: "v" }, String(members.length)), h("div", { className: "s" }, up + " 在线 · " + idle + " 空闲 · " + off + " 未开/启动")),
                h("div", { className: "pa-stat" }, h("div", { className: "k" }, "健康"), h("div", { className: "v" }, up + "/" + (members.length || 1)), h("div", { className: "s" }, "在线 · mock")),
                h("div", { className: "pa-stat" }, h("div", { className: "k" }, "公告"), h("div", { className: "v" }, String(anns.length)), h("div", { className: "s" }, pinned + " 置顶"))
              ),
              h("div", { className: "pa-card" },
                h("h3", null, "desk_session"),
                h("pre", { style: { margin: 0, fontSize: 12, whiteSpace: "pre-wrap" } }, JSON.stringify(session, null, 2))
              ),
              h("div", { className: "pa-card" },
                h("h3", null, "角色闸"),
                h("div", { className: "pa-gate" },
                  h("button", { type: "button", className: "pa-btn gh sm", onClick: function () { tryGate("admin"); } }, "试 Admin-only"),
                  h("button", { type: "button", className: "pa-btn gh sm", onClick: function () { tryGate("member"); } }, "试 Member 区"),
                  gateMsg ? h("span", { className: "pa-msg " + (/允许/.test(gateMsg) ? "ok" : "err") }, gateMsg) : null
                )
              ),
              isAdmin ? h("div", { className: "pa-card" },
                h("h3", null, "Admin-only mock"),
                h("div", { className: "pa-row" },
                  h("button", { type: "button", className: "pa-btn gh sm", onClick: mockBudget }, "调预算 test001"),
                  h("button", { type: "button", className: "pa-btn gh sm", onClick: mockDisable }, "停用 test001")
                ),
                adminNote ? h("div", { className: "pa-msg ok" }, adminNote) : h("p", { className: "pa-hint" }, "写入成员 mock：预算 +10% / 座位 off")
              ) : h("div", { className: "pa-card" }, h("p", { className: "pa-hint" }, "member 视角 · 管理动作已闸住")),
              h("div", { className: "pa-card" },
                h("h3", null, "最近成员"),
                dataTable(["成员", "角色", "座位"], members.slice(0, 5).map(function (m) {
                  return [m.id, m.role, seatLabel(m.seat)];
                }))
              )
            );
          } else if (tab === "members") {
            tabBody = h("div", null,
              h("p", { className: "pa-hint" }, "admin：注册 / 开座位 / 停实例 / 删账号 · mock localStorage"),
              h("div", { className: "pa-row" },
                h("input", { className: "pa-inp", style: { flex: 1 }, placeholder: "新用户名", value: regUser,
                  onChange: function (e) { setRegUser(e.target.value); },
                  onKeyDown: function (e) { if (e.key === "Enter") registerMember(); } }),
                h("button", { type: "button", className: "pa-btn", onClick: registerMember }, "注册"),
                h("button", { type: "button", className: "pa-btn gh", disabled: refreshing, onClick: refreshSeats }, refreshing ? "探测中…" : "刷新座位状态"),
                h("button", { type: "button", className: "pa-btn gh", onClick: resetMembers }, "重置成员")
              ),
              memberNote ? h("div", { className: "pa-msg" }, memberNote) : null,
              h("div", { className: "pa-card" },
                dataTable(["成员", "角色", "座位", "端口", "预算", "操作"], members.map(function (m) {
                  var acts = [];
                  if (m.seat === "off" || m.seat === "idle") {
                    acts.push(h("button", { key: "boot", type: "button", className: "pa-btn gh sm", onClick: function () { bootSeat(m.id); } }, "开座位"));
                  } else if (m.seat === "booting") {
                    acts.push(h("button", { key: "wait", type: "button", className: "pa-btn gh sm", disabled: true }, "启动中"));
                  } else if (m.seat === "up") {
                    acts.push(h("button", { key: "stop", type: "button", className: "pa-btn gh sm", onClick: function () { stopSeat(m.id); } }, "停实例"));
                  }
                  if (!(m.role === "admin" && m.id === "admin001")) {
                    acts.push(h("button", { key: "del", type: "button", className: "pa-btn danger sm", onClick: function () { deleteMember(m.id); } }, "删账号+实例"));
                  }
                  return [
                    m.id, m.role,
                    h("span", { key: "tag", className: "pa-tag " + seatClass(m.seat) }, seatLabel(m.seat)),
                    m.port ? ":" + m.port : "—",
                    m.budget || "—",
                    h("div", { key: "acts", className: "pa-row", style: { marginTop: 0 } }, acts),
                  ];
                }))
              )
            );
          } else if (tab === "usage") {
            tabBody = h("div", null,
              h("p", { className: "pa-hint" }, isAdmin ? "团队图表 + 明细 + 历史 · mock" : "个人图表 + 明细 + 历史 · mock"),
              isAdmin
                ? h("div", { className: "pa-stats" },
                    h("div", { className: "pa-stat" }, h("div", { className: "k" }, "今日"), h("div", { className: "v" }, "4.2万"), h("div", { className: "s" }, "token")),
                    h("div", { className: "pa-stat" }, h("div", { className: "k" }, "本月"), h("div", { className: "v" }, "128.4万"), h("div", { className: "s" }, "token")),
                    h("div", { className: "pa-stat" }, h("div", { className: "k" }, "本月费用"), h("div", { className: "v" }, "¥386"), h("div", { className: "s" }, "估算")),
                    h("div", { className: "pa-stat" }, h("div", { className: "k" }, "预算"), h("div", { className: "v" }, "62%"), h("div", { className: "s" }, "已用"))
                  )
                : h("div", { className: "pa-stats" },
                    h("div", { className: "pa-stat" }, h("div", { className: "k" }, "今日"), h("div", { className: "v" }, "1.8万"), h("div", { className: "s" }, "token")),
                    h("div", { className: "pa-stat" }, h("div", { className: "k" }, "本月"), h("div", { className: "v" }, "12.1万"), h("div", { className: "s" }, "token")),
                    h("div", { className: "pa-stat" }, h("div", { className: "k" }, "本月费用"), h("div", { className: "v" }, "¥36"), h("div", { className: "s" }, "估算")),
                    h("div", { className: "pa-stat" }, h("div", { className: "k" }, "配额"), h("div", { className: "v" }, "24%"), h("div", { className: "s" }, "已用"))
                  ),
              h("div", { className: "pa-charts" },
                isAdmin
                  ? [h("div", { key: "c1", className: "pa-chart" }, h("h3", null, "近 7 日 token 趋势 · 团队"), lineChart(USAGE_TEAM, USAGE_LABELS, 60, "#8b93ff", "paGTeam")),
                     h("div", { key: "c2", className: "pa-chart" }, h("h3", null, "成员占比 · 本月"), barChart(USAGE_MEMBERS, 50, "#5e6ad2"))]
                  : [h("div", { key: "c1", className: "pa-chart" }, h("h3", null, "近 7 日 token 趋势 · 我的"), lineChart(USAGE_ME, USAGE_LABELS, 4, "#3dd68c", "paGMe")),
                     h("div", { key: "c2", className: "pa-chart" }, h("h3", null, "用途拆分 · 本月"), barChart(USAGE_PURPOSE, 8, "#3dd68c"))]
              ),
              h("div", { className: "pa-card" },
                h("h3", null, isAdmin ? "团队明细" : "我的明细"),
                isAdmin
                  ? dataTable(["成员", "日期", "模型 / 用途", "Token", "费用"], USAGE_TEAM_ROWS)
                  : dataTable(["日期", "模型 / 用途", "Token", "费用"], USAGE_ME_ROWS)
              ),
              h("div", { className: "pa-card" },
                h("h3", null, isAdmin ? "历史记录 · 按日汇总（团队）" : "历史记录 · 按日汇总（我的）"),
                isAdmin
                  ? dataTable(["日期", "活跃成员", "调用次数", "Token", "费用"], USAGE_TEAM_DAYS)
                  : dataTable(["日期", "调用次数", "Token", "费用"], USAGE_ME_DAYS)
              ),
              h("div", { className: "pa-card" },
                h("h3", null, isAdmin ? "历史记录 · 按次（团队最近）" : "历史记录 · 按次（我的最近）"),
                isAdmin
                  ? dataTable(["时间", "成员", "会话", "模型", "Token", "费用"], USAGE_TEAM_CALLS)
                  : dataTable(["时间", "会话", "模型 / 用途", "Token", "费用"], USAGE_ME_CALLS)
              )
            );
          } else if (tab === "announce") {
            tabBody = h("div", null,
              h("p", { className: "pa-hint" }, isAdmin ? "admin：可发布 / 置顶 / 删除 · mock localStorage" : "全员可读 · 管理需 admin"),
              isAdmin ? h("div", { className: "pa-card" },
                h("div", { className: "pa-row" }, h("input", { className: "pa-inp", placeholder: "标题", value: annTitle, onChange: function (e) { setAnnTitle(e.target.value); } })),
                h("div", { className: "pa-row" }, h("textarea", { className: "pa-ta", placeholder: "正文", value: annBody, onChange: function (e) { setAnnBody(e.target.value); } })),
                h("div", { className: "pa-row" },
                  h("label", { style: { display: "flex", gap: 6, alignItems: "center", fontSize: 13 } },
                    h("input", { type: "checkbox", checked: annPin, onChange: function (e) { setAnnPin(!!e.target.checked); } }), "置顶"
                  ),
                  h("button", { type: "button", className: "pa-btn", onClick: publishAnn }, "发布")
                ),
                annNote ? h("div", { className: "pa-msg ok" }, annNote) : null
              ) : (annNote ? h("div", { className: "pa-msg" }, annNote) : null),
              h("div", { className: "pa-card" },
                sortedAnns.length ? sortedAnns.map(function (a) {
                  return h("div", { key: a.id, className: "pa-ann" },
                    h("div", { className: "t" }, a.pinned ? h("span", { className: "pa-tag pin", style: { marginRight: 6 } }, "置顶") : null, a.title),
                    h("div", { className: "m" }, a.body),
                    h("div", { className: "d" }, (a.at || "") + " · " + (a.author || "admin")),
                    isAdmin ? h("div", { className: "pa-row" },
                      h("button", { type: "button", className: "pa-btn gh sm", onClick: function () { toggleAnnPin(a.id); } }, a.pinned ? "取消置顶" : "置顶"),
                      h("button", { type: "button", className: "pa-btn danger sm", onClick: function () { deleteAnn(a.id); } }, "删除")
                    ) : null
                  );
                }) : h("div", { className: "pa-hint" }, "暂无公告 · admin 可上方发布")
              )
            );
          }

          else if (tab === "calendar") {
            var y = calMonth.y, m0 = calMonth.m0;
            var dt = parseYmd(calSelected);
            var hero = (dt.getMonth() + 1) + "月" + dt.getDate() + "日，星期" + WEEKDAYS_FULL[dt.getDay()];
            var heroLunarMap = { "2026-11-05": "九月廿七", "2026-11-07": "立冬", "2026-11-09": "十月", "2026-11-22": "小雪" };
            var heroLunar = heroLunarMap[calSelected] || lunarLabel(calSelected);
            var dayEvents = calEvents.filter(function (e) {
              if (e.date !== calSelected) return false;
              if (calTrack === "all") return true;
              return e.track === calTrack;
            }).sort(function (a, b) { return String(a.start).localeCompare(String(b.start)); });
            var eventDates = {};
            calEvents.forEach(function (e) { eventDates[e.date] = 1; });

            var picker;
            if (calMode === "years") {
              var years = [];
              for (var yi = y - 6; yi <= y + 5; yi++) years.push(yi);
              picker = h("div", { className: "pa-cal-grid" }, years.map(function (yy) {
                return h("button", {
                  key: yy, type: "button", className: "pa-cal-cell" + (yy === y ? " on" : ""),
                  onClick: function () { setCalMonth({ y: yy, m0: m0 }); setCalMode("months"); },
                }, h("span", { className: "d" }, String(yy)));
              }));
            } else if (calMode === "months") {
              picker = h("div", { className: "pa-cal-grid" }, MONTH_NAMES.map(function (name, idx) {
                return h("button", {
                  key: name, type: "button", className: "pa-cal-cell" + (idx === m0 ? " on" : ""),
                  onClick: function () { setCalMonth({ y: y, m0: idx }); setCalMode("days"); },
                }, h("span", { className: "d" }, name));
              }));
            } else {
              var cells = monthCells(y, m0);
              picker = h("div", null,
                h("div", { className: "pa-cal-grid" }, WEEKDAYS_MON.map(function (w) {
                  return h("div", { key: w, className: "pa-cal-wd" }, w);
                })),
                h("div", { className: "pa-cal-grid" }, cells.map(function (c) {
                  var cls = "pa-cal-cell" + (c.inMonth ? "" : " out") + (c.key === calSelected ? " on" : "") + (JIEQI[c.key] ? " jq" : "") + (eventDates[c.key] ? " has" : "");
                  return h("button", {
                    key: c.key, type: "button", className: cls,
                    onClick: function () { setCalSelected(c.key); setCalMonth({ y: parseYmd(c.key).getFullYear(), m0: parseYmd(c.key).getMonth() }); },
                  }, h("span", { className: "d" }, String(c.day)), h("span", { className: "l" }, lunarLabel(c.key)));
                }))
              );
            }

            var titleText = calMode === "years" ? "选择年份" : calMode === "months" ? (y + "年") : (y + "年" + (m0 + 1) + "月");
            var hours = [];
            for (var hr = 7; hr <= 22; hr++) hours.push(hr);

            tabBody = h("div", null,
              h("div", { className: "pa-card" },
                h("div", { className: "pa-t1" }, hero),
                h("div", { className: "pa-t2" }, heroLunar + " · 日视图 07:00–22:00"),
                h("div", { className: "pa-cal-head" },
                  h("button", { type: "button", className: "pa-cal-title", onClick: function () {
                    setCalMode(calMode === "days" ? "months" : calMode === "months" ? "years" : "days");
                  } }, titleText),
                  h("button", { type: "button", className: "pa-btn gh sm", onClick: function () {
                    var nm = m0 - 1, ny = y; if (nm < 0) { nm = 11; ny--; } setCalMonth({ y: ny, m0: nm }); setCalMode("days");
                  } }, "上月"),
                  h("button", { type: "button", className: "pa-btn gh sm", onClick: function () {
                    setCalMonth({ y: 2026, m0: 10 }); setCalSelected("2026-11-05"); setCalMode("days");
                  } }, "今天"),
                  h("button", { type: "button", className: "pa-btn gh sm", onClick: function () {
                    var nm = m0 + 1, ny = y; if (nm > 11) { nm = 0; ny++; } setCalMonth({ y: ny, m0: nm }); setCalMode("days");
                  } }, "下月"),
                  ["all", "local", "team"].map(function (tr) {
                    return h("button", {
                      key: tr, type: "button",
                      className: "pa-btn sm " + (calTrack === tr ? "" : "gh"),
                      onClick: function () { setCalTrack(tr); },
                    }, tr === "all" ? "全部" : tr === "local" ? "本地" : "团队");
                  })
                ),
                picker
              ),
              h("div", { className: "pa-card pa-axis" },
                h("h3", null, (dt.getMonth() + 1) + "月" + dt.getDate() + "日 · 日轴"),
                hours.map(function (hr) {
                  var label = pad2(hr) + ":00";
                  var slot = dayEvents.filter(function (e) { return hourOf(e.start) === hr; });
                  return h("div", { key: hr, className: "pa-hour" },
                    h("div", { className: "hm" }, label),
                    h("div", null, slot.length ? slot.map(function (e) {
                      return h("div", { key: e.id, className: "pa-ev " + e.urgency + (e.done ? " done" : "") },
                        h("div", null, e.start + "–" + e.end + "  " + e.title),
                        h("div", { className: "pa-t2" }, (URGENCY_LABEL[e.urgency] || "") + " · " + (e.track === "team" ? "团队" : "本地") + (e.note ? " · " + e.note : "")),
                        h("div", { className: "pa-row" },
                          h("button", { type: "button", className: "pa-btn gh sm", onClick: function () { toggleEventDone(e.id); } }, e.done ? "取消完成" : "完成"),
                          h("button", { type: "button", className: "pa-btn danger sm", onClick: function () { deleteEvent(e.id); } }, "删除")
                        )
                      );
                    }) : null)
                  );
                })
              )
            );
          }

          bodyKids = h("div", null, tabBar, tabBody);
        }

        var headerActions = [];
        if (session && view === "portal") {
          headerActions.push(h("button", { key: "wb", type: "button", className: "pa-chip", onClick: function () { setView("workbench"); } }, "进入工作台"));
        }
        if (session && view === "workbench") {
          headerActions.push(h("button", { key: "backp", type: "button", className: "pa-chip", onClick: function () { setView("portal"); } }, "返回门户"));
        }
        if (session) {
          headerActions.push(h("span", { key: "role", className: "pa-pill " + (isAdmin ? "admin" : "member") }, session.role));
          headerActions.push(h("button", { key: "out", type: "button", className: "pa-chip", onClick: doLogout }, "登出"));
        }
        headerActions.push(h("button", { key: "close", type: "button", className: "pa-back", onClick: function () { setOpen(false); } }, "← 返回对话"));

        return h("div", { "data-pa-root": "1" },
          trigger,
          h("section", { className: "pa-fv", "data-pa-panel": "1" },
            h("header", { className: "pa-hd" },
              h("span", { className: "pa-mark" }, iconPortal(22)),
              h("div", { className: "pa-hd-text" },
                h("div", { className: "pa-t1" }, "团队门户"),
                h("div", { className: "pa-t2" }, session
                  ? ((session.displayName || session.user) + " · desk_session mock · 非 stub")
                  : "登录 / 角色闸 / 用量 / 成员 / 日历 · 本地 mock")
              ),
              h("div", { className: "pa-hd-actions" }, headerActions)
            ),
            h("div", { className: "pa-bd" }, bodyKids)
          )
        );
      }

      function apply(ctx) {
        ctx.slots.inject("sidebar.footer.action", function () {
          return ctx.slots.register(
            {
              name: "sidebar.footer.action",
              id: "portal-auth",
              order: 92,
              label: function () { return "门户"; },
            },
            PortalPanel
          );
        });
      }

      ensureCss();

      exports.apply = apply;
      exports.inject = inject;
      return module.exports;
    },
  });
