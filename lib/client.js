/**
 * Client stub for anywork-portal-auth.
 *
 * Real DSH inject would register a sidebar/slot panel that:
 *  - reads portal cookie /desk_session from the Anywork host
 *  - gates admin vs member UI
 *
 * Shell v0: this file documents the future inject surface.
 * Open demo/index.html for the runnable mock (no DSH install).
 */
window.__ModuleLoader__ &&
  window.__ModuleLoader__.load({
    id: "anywork-portal-auth",
    factory: (require) => {
      var module = { exports: {} };
      var exports = module.exports;
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

      // Stub: future portal cookie integration goes here.
      // Demo path does not load this module; see demo/index.html.
      exports.name = "anywork-portal-auth";
      exports.mount = function mount() {
        console.info(
          "[anywork-portal-auth] client stub — use demo/index.html for login/desk_session/role-gate mock"
        );
      };

      return module.exports;
    },
  });
