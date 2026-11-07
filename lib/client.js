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
          filterSeatRows();
        });
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
        window.addEventListener("message", onMessage);
        window.addEventListener("pointerdown", onClick, true);
        window.addEventListener("click", onClick, true);
        var timer = setInterval(refreshUser, 3000);
        refreshUser();
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
