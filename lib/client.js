/**
 * Web client for anywork-portal-auth.
 *
 * The harness loads this file as a classic script and expects a ModuleLoader
 * factory whose exports include apply. The portal covers the shell until
 * "进入工作台". In the workbench, the sidebar account menu's 登录 entry shows
 * the portal user and returns to the portal page.
 */
window.__ModuleLoader__ &&
  window.__ModuleLoader__.load({
    id: "anywork-portal-auth",
    factory: (require) => {
      var module = { exports: {} };
      var exports = module.exports;
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

      var WORKBENCH_KEY = "anywork-portal-auth-in-workbench";
      var SESSION_URL = "/plugins/anywork-portal-auth/session";
      var PORTAL_URL = "/plugins/anywork-portal-auth/";

      function itemText(node) {
        return (node.textContent || "").replace(/\s+/g, " ").trim();
      }

      function accountMenu(node) {
        var menu = node.closest && node.closest("[role='menu']");
        if (!menu) return null;
        var blob = itemText(menu);
        if (blob.indexOf("设置") === -1 && blob.indexOf("Settings") === -1) return null;
        return menu;
      }

      function isLoginItem(node) {
        if (!node || !accountMenu(node)) return false;
        var text = itemText(node);
        return text === "登录" || text === "Sign in" || (portalUser && text === portalUser);
      }

      var portalUser = "";
      var root = null;
      var seatWorkspaceId = "";
      var boundSeat = "";
      var workspaces = null;
      var uiWorkspace = null;
      var sessionsApi = null;

      function workspaceItems() {
        if (!workspaces || !workspaces.list || typeof workspaces.list.getSnapshot !== "function") return [];
        var snap = workspaces.list.getSnapshot() || {};
        return snap.items || [];
      }

      function findSeat(user, seatPath) {
        var items = workspaceItems();
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          if (!item) continue;
          if (item.title === user || item.path === seatPath) return item;
        }
        return null;
      }

      function filterSeatRows() {
        if (!seatWorkspaceId || typeof document === "undefined") return;
        var rows = document.querySelectorAll("[data-row-key]");
        var hiding = false;
        var seenWorkspace = false;
        for (var i = 0; i < rows.length; i++) {
          var key = rows[i].getAttribute("data-row-key") || "";
          if (key.indexOf("workspace:") === 0) {
            seenWorkspace = true;
            hiding = key !== "workspace:" + seatWorkspaceId;
          } else if (!seenWorkspace && key.indexOf("session:") === 0) {
            hiding = true;
          }
          if (key.indexOf("workspace:") === 0 || key.indexOf("session:") === 0 || key.indexOf("overflow:") === 0) {
            rows[i].style.display = hiding ? "none" : "";
          }
        }
      }

      function clearSeatRows() {
        if (typeof document === "undefined") return;
        var rows = document.querySelectorAll("[data-row-key]");
        for (var i = 0; i < rows.length; i++) rows[i].style.display = "";
      }

      function bindSeat(user) {
        if (!user || boundSeat === user) {
          filterSeatRows();
          return Promise.resolve();
        }
        boundSeat = user;
        return fetch("/plugins/anywork-portal-auth/seat", {
          method: "POST",
          credentials: "same-origin"
        }).then(function (response) {
          if (!response.ok) throw new Error("seat");
          return response.json();
        }).then(function (body) {
          var mine = findSeat(user, body.path);
          if (mine || !workspaces || typeof workspaces.create !== "function") return mine;
          return workspaces.create({ path: body.path }).then(function (created) {
            return created || findSeat(user, body.path);
          }).catch(function () {
            return findSeat(user, body.path);
          });
        }).then(function (mine) {
          seatWorkspaceId = mine && (mine.workspaceId || mine.id) || "";
          var ids = mine && mine.sessionIds || [];
          if (seatWorkspaceId && ids.length && sessionsApi && typeof sessionsApi.open === "function") {
            try { sessionsApi.open(ids[0]); } catch (e) {}
          } else if (seatWorkspaceId && uiWorkspace && typeof uiWorkspace.startSession === "function") {
            uiWorkspace.startSession(seatWorkspaceId).catch(function () {});
          }
          filterSeatRows();
        }).catch(function () {
          boundSeat = "";
        });
      }

      function showPortal() {
        if (typeof document === "undefined" || !document.body) return;
        try { sessionStorage.removeItem(WORKBENCH_KEY); } catch (e) {}
        boundSeat = "";
        seatWorkspaceId = "";
        clearSeatRows();
        if (root && root.isConnected) return;
        var existing = document.getElementById("anywork-portal-auth-root");
        if (existing) existing.remove();
        root = document.createElement("div");
        root.id = "anywork-portal-auth-root";
        root.style.cssText = "position:fixed;inset:0;z-index:2147483000;background:#0a0a0b;";
        var frame = document.createElement("iframe");
        frame.title = "TokenAI门户";
        frame.src = PORTAL_URL;
        frame.style.cssText = "border:0;width:100%;height:100%;background:#0a0a0b;";
        root.appendChild(frame);
        document.body.appendChild(root);
      }

      function hidePortal() {
        try { sessionStorage.setItem(WORKBENCH_KEY, "1"); } catch (e) {}
        if (root) root.remove();
      }

      var LOGO_D = "M1 0 h85 v1 h-85 zM92 0 h172 v1 h-172 zM90 1 h174 v1 h-174 zM83 2 h181 v1 h-181 zM0 3 h264 v1 h-264 zM0 4 h264 v1 h-264 zM0 5 h264 v1 h-264 zM0 6 h264 v1 h-264 zM0 7 h264 v1 h-264 zM0 8 h264 v1 h-264 zM0 9 h264 v1 h-264 zM0 10 h264 v1 h-264 zM0 11 h264 v1 h-264 zM0 12 h264 v1 h-264 zM0 13 h264 v1 h-264 zM0 14 h264 v1 h-264 zM0 15 h264 v1 h-264 zM0 16 h264 v1 h-264 zM0 17 h264 v1 h-264 zM0 18 h264 v1 h-264 zM0 19 h264 v1 h-264 zM0 20 h264 v1 h-264 zM0 21 h264 v1 h-264 zM0 22 h264 v1 h-264 zM0 23 h264 v1 h-264 zM0 24 h264 v1 h-264 zM0 25 h264 v1 h-264 zM0 26 h264 v1 h-264 zM0 27 h264 v1 h-264 zM0 28 h264 v1 h-264 zM0 29 h264 v1 h-264 zM0 30 h264 v1 h-264 zM0 31 h264 v1 h-264 zM0 32 h264 v1 h-264 zM0 33 h264 v1 h-264 zM0 34 h264 v1 h-264 zM0 35 h264 v1 h-264 zM0 36 h264 v1 h-264 zM0 37 h264 v1 h-264 zM0 38 h264 v1 h-264 zM0 39 h264 v1 h-264 zM0 40 h264 v1 h-264 zM0 41 h264 v1 h-264 zM0 42 h264 v1 h-264 zM0 43 h264 v1 h-264 zM0 44 h264 v1 h-264 zM0 45 h264 v1 h-264 zM0 46 h264 v1 h-264 zM0 47 h264 v1 h-264 zM0 48 h264 v1 h-264 zM0 49 h264 v1 h-264 zM0 50 h264 v1 h-264 zM0 51 h264 v1 h-264 zM0 52 h264 v1 h-264 zM0 53 h264 v1 h-264 zM0 54 h264 v1 h-264 zM0 55 h264 v1 h-264 zM0 56 h264 v1 h-264 zM0 57 h264 v1 h-264 zM0 58 h264 v1 h-264 zM0 59 h264 v1 h-264 zM0 60 h264 v1 h-264 zM0 61 h264 v1 h-264 zM0 62 h264 v1 h-264 zM0 63 h264 v1 h-264 zM0 64 h264 v1 h-264 zM0 65 h264 v1 h-264 zM0 66 h263 v1 h-263 zM169 67 h41 v1 h-41 zM171 68 h30 v1 h-30 zM172 69 h26 v1 h-26 zM173 70 h22 v1 h-22 zM173 71 h20 v1 h-20 zM173 72 h18 v1 h-18 zM172 73 h17 v1 h-17 zM171 74 h16 v1 h-16 zM171 75 h15 v1 h-15 zM171 76 h14 v1 h-14 zM170 77 h14 v1 h-14 zM170 78 h13 v1 h-13 zM169 79 h13 v1 h-13 zM168 80 h13 v1 h-13 zM167 81 h14 v1 h-14 zM166 82 h14 v1 h-14 zM165 83 h14 v1 h-14 zM163 84 h16 v1 h-16 zM162 85 h16 v1 h-16 zM160 86 h18 v1 h-18 zM158 87 h19 v1 h-19 zM156 88 h21 v1 h-21 zM153 89 h23 v1 h-23 zM145 90 h31 v1 h-31 zM78 91 h98 v1 h-98 zM78 92 h98 v1 h-98 zM78 93 h98 v1 h-98 zM78 94 h98 v1 h-98 zM78 95 h98 v1 h-98 zM78 96 h98 v1 h-98 zM78 97 h98 v1 h-98 zM78 98 h98 v1 h-98 zM78 99 h98 v1 h-98 zM78 100 h98 v1 h-98 zM78 101 h98 v1 h-98 zM78 102 h98 v1 h-98 zM78 103 h99 v1 h-99 zM78 104 h99 v1 h-99 zM78 105 h100 v1 h-100 zM78 106 h100 v1 h-100 zM78 107 h100 v1 h-100 zM78 108 h101 v1 h-101 zM78 109 h101 v1 h-101 zM78 110 h102 v1 h-102 zM78 111 h103 v1 h-103 zM78 112 h104 v1 h-104 zM78 113 h105 v1 h-105 zM78 114 h106 v1 h-106 zM78 115 h107 v1 h-107 zM78 116 h108 v1 h-108 zM78 117 h109 v1 h-109 zM78 118 h111 v1 h-111 zM78 119 h113 v1 h-113 zM78 120 h115 v1 h-115 zM78 121 h118 v1 h-118 zM78 122 h121 v1 h-121 zM78 123 h160 v1 h-160 zM78 124 h165 v1 h-165 zM78 125 h168 v1 h-168 zM78 126 h171 v1 h-171 zM78 127 h173 v1 h-173 zM78 128 h174 v1 h-174 zM78 129 h175 v1 h-175 zM78 130 h176 v1 h-176 zM78 131 h178 v1 h-178 zM78 132 h178 v1 h-178 zM78 133 h179 v1 h-179 zM78 134 h180 v1 h-180 zM78 135 h181 v1 h-181 zM78 136 h182 v1 h-182 zM78 137 h182 v1 h-182 zM78 138 h183 v1 h-183 zM78 139 h183 v1 h-183 zM78 140 h184 v1 h-184 zM78 141 h184 v1 h-184 zM78 142 h185 v1 h-185 zM78 143 h185 v1 h-185 zM78 144 h185 v1 h-185 zM78 145 h186 v1 h-186 zM78 146 h186 v1 h-186 zM78 147 h186 v1 h-186 zM78 148 h186 v1 h-186 zM78 149 h186 v1 h-186 zM78 150 h186 v1 h-186 zM78 151 h186 v1 h-186 zM173 152 h91 v1 h-91 zM175 153 h89 v1 h-89 zM177 154 h87 v1 h-87 zM179 155 h85 v1 h-85 zM180 156 h84 v1 h-84 zM181 157 h83 v1 h-83 zM181 158 h83 v1 h-83 zM182 159 h82 v1 h-82 zM182 160 h82 v1 h-82 zM183 161 h81 v1 h-81 zM183 162 h81 v1 h-81 zM183 163 h81 v1 h-81 zM184 164 h80 v1 h-80 zM184 165 h80 v1 h-80 zM183 166 h81 v1 h-81 zM183 167 h81 v1 h-81 zM183 168 h81 v1 h-81 zM182 169 h82 v1 h-82 zM182 170 h82 v1 h-82 zM181 171 h83 v1 h-83 zM180 172 h84 v1 h-84 zM179 173 h85 v1 h-85 zM178 174 h86 v1 h-86 zM176 175 h88 v1 h-88 zM174 176 h89 v1 h-89 zM85 177 h49 v1 h-49 zM151 177 h1 v1 h-1 zM166 177 h96 v1 h-96 zM78 178 h125 v1 h-125 zM78 179 h121 v1 h-121 zM78 180 h118 v1 h-118 zM78 181 h116 v1 h-116 zM78 182 h114 v1 h-114 zM78 183 h112 v1 h-112 zM78 184 h111 v1 h-111 zM78 185 h109 v1 h-109 zM78 186 h108 v1 h-108 zM78 187 h107 v1 h-107 zM78 188 h106 v1 h-106 zM78 189 h105 v1 h-105 zM78 190 h104 v1 h-104 zM78 191 h104 v1 h-104 zM78 192 h103 v1 h-103 zM78 193 h102 v1 h-102 zM78 194 h102 v1 h-102 zM78 195 h101 v1 h-101 zM78 196 h101 v1 h-101 zM78 197 h100 v1 h-100 zM78 198 h100 v1 h-100 zM78 199 h100 v1 h-100 zM78 200 h99 v1 h-99 zM78 201 h99 v1 h-99 zM78 202 h98 v1 h-98 zM78 203 h98 v1 h-98 zM78 204 h98 v1 h-98 zM78 205 h98 v1 h-98 zM78 206 h98 v1 h-98 zM78 207 h98 v1 h-98 zM78 208 h98 v1 h-98 zM78 209 h97 v1 h-97 zM78 210 h97 v1 h-97 zM78 211 h97 v1 h-97 zM78 212 h97 v1 h-97 zM78 213 h97 v1 h-97 zM78 214 h97 v1 h-97 zM78 215 h97 v1 h-97 zM78 216 h97 v1 h-97 zM78 217 h97 v1 h-97 zM78 218 h97 v1 h-97 zM78 219 h97 v1 h-97 zM78 220 h97 v1 h-97 zM78 221 h97 v1 h-97 zM78 222 h97 v1 h-97 zM78 223 h97 v1 h-97 zM78 224 h97 v1 h-97 zM78 225 h97 v1 h-97 zM78 226 h97 v1 h-97 z";

      function logoSvg(size) {
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("data-anywork-brand", "1");
        svg.setAttribute("width", String(size));
        svg.setAttribute("height", String(Math.round(size * 227 / 264)));
        svg.setAttribute("viewBox", "0 0 264 227");
        svg.setAttribute("fill", "currentColor");
        svg.setAttribute("aria-hidden", "true");
        var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", LOGO_D);
        svg.appendChild(path);
        return svg;
      }

      function replaceSlot(name, size) {
        var slots = document.querySelectorAll('[data-slot="' + name + '"]');
        for (var i = 0; i < slots.length; i++) {
          if (slots[i].querySelector("[data-anywork-brand]")) continue;
          slots[i].replaceChildren(logoSvg(size));
        }
      }

      function replaceBrandName() {
        var slots = document.querySelectorAll('[data-slot="sidebar.brand.name"]');
        for (var i = 0; i < slots.length; i++) {
          if (slots[i].querySelector("[data-anywork-brand]")) continue;
          var label = document.createElement("span");
          label.setAttribute("data-anywork-brand", "1");
          label.textContent = "TokenAI anywork";
          label.style.cssText = "display:inline-block;font:600 13px/24px Inter,Segoe UI,sans-serif;letter-spacing:-0.02em;color:inherit;white-space:nowrap;";
          slots[i].replaceChildren(label);
        }
      }

      function replaceHeroText() {
        var mark = document.querySelector('[data-slot="conversation.hero.brand.mark"]');
        var headline = mark && mark.parentElement && mark.parentElement.parentElement;
        if (!headline) return;
        var spans = headline.querySelectorAll("span");
        for (var i = 0; i < spans.length; i++) {
          var text = (spans[i].textContent || "").replace(/\s+/g, " ").trim();
          if (text === "探索未至之境" || text === "TokenAI anywork") spans[i].textContent = "ANYWORK";
          if (text === "预览版") spans[i].style.display = "none";
        }
      }

      function rebrand() {
        if (typeof document === "undefined") return;
        replaceSlot("sidebar.brand.mark", 24);
        replaceBrandName();
        replaceSlot("conversation.hero.brand.mark", 34);
        replaceHeroText();
      }

      function relabel() {
        if (!portalUser || typeof document === "undefined") return;
        var items = document.querySelectorAll("[role='menuitem']");
        for (var i = 0; i < items.length; i++) {
          if (!accountMenu(items[i])) continue;
          var walker = document.createTreeWalker(items[i], NodeFilter.SHOW_TEXT);
          var textNode;
          while ((textNode = walker.nextNode())) {
            var value = textNode.nodeValue.replace(/\s+/g, " ").trim();
            if (value === "登录" || value === "Sign in") textNode.nodeValue = portalUser;
          }
        }
      }

      function refreshUser() {
        if (typeof fetch !== "function") return;
        fetch(SESSION_URL, { credentials: "same-origin", cache: "no-store" })
          .then(function (response) { return response.json(); })
          .then(function (body) {
            portalUser = body && body.session && body.session.user ? body.session.user : "";
            relabel();
            try {
              if (portalUser && sessionStorage.getItem(WORKBENCH_KEY) === "1") bindSeat(portalUser);
            } catch (e) {}
          })
          .catch(function () {});
      }

      function start() {
        if (typeof document === "undefined" || !document.body) return function () {};
        function onMessage(event) {
          if (event.origin !== window.location.origin) return;
          if (!event.data || event.data.type !== "anywork-portal-auth:enter-workbench") return;
          hidePortal();
          var user = event.data.user || portalUser;
          if (user) bindSeat(user);
        }
        function onClick(event) {
          var item = event.target && event.target.closest && event.target.closest("[role='menuitem']");
          if (!isLoginItem(item)) return;
          event.preventDefault();
          event.stopPropagation();
          if (event.stopImmediatePropagation) event.stopImmediatePropagation();
          showPortal();
        }
        var observer = new MutationObserver(function () {
          relabel();
          rebrand();
          filterSeatRows();
        });
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
        window.addEventListener("message", onMessage);
        window.addEventListener("pointerdown", onClick, true);
        window.addEventListener("click", onClick, true);
        var timer = setInterval(refreshUser, 3000);
        refreshUser();
        rebrand();
        try {
          if (sessionStorage.getItem(WORKBENCH_KEY) !== "1") showPortal();
        } catch (e) {
          showPortal();
        }
        return function () {
          window.removeEventListener("message", onMessage);
          window.removeEventListener("pointerdown", onClick, true);
          window.removeEventListener("click", onClick, true);
          observer.disconnect();
          clearInterval(timer);
          if (root) root.remove();
        };
      }

      function apply(ctx) {
        workspaces = ctx && ctx.workspaces;
        uiWorkspace = ctx && ctx.uiWorkspace;
        sessionsApi = ctx && ctx.sessions;
        if (ctx && typeof ctx.effect === "function") {
          ctx.effect(function () { return start(); });
          return;
        }
        start();
      }

      exports.name = "anywork-portal-auth";
      exports.inject = ["slots", "workspaces", "uiWorkspace", "sessions"];
      exports.apply = apply;
      return module.exports;
    },
  });
