/**
 * Client stub for anywork-portal-auth.
 *
 * Real DSH inject would register a sidebar/slot panel that:
 *  - reads portal cookie /desk_session from the Anywork host
 *  - gates admin vs member UI
 *
 * Shell v0: this file documents the future inject surface.
 * Open demo/index.html for the runnable mock (no DSH install).
 *
 * Cordis/HARNESS requires the ModuleLoader factory to export a function
 * or an object with an `apply` method — name/mount alone is invalid.
 */
window.__ModuleLoader__ &&
  window.__ModuleLoader__.load({
    id: "anywork-portal-auth",
    factory: (require) => {
      var module = { exports: {} };
      var exports = module.exports;
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

      // Stub: future portal cookie / sidebar UI goes here.
      // Demo path does not load this module; see demo/index.html.
      function apply(_ctx) {
        // v0 no-op — do not register real sidebar UI yet.
      }

      exports.apply = apply;
      return module.exports;
    },
  });
