import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ensurePulled,
  login,
  logout,
  replaceState,
  resetState,
  sessionById,
  viewState,
} from "./state.js";
import { checkLatest, currentVersion, enableDefaultBundles, GITHUB_URL, installLatest } from "./update.js";

export const name = "anywork-portal-auth";

const PREFIX = "/plugins/anywork-portal-auth";
const portalFile = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "demo", "index.html");

function portalHtml() {
  const raw = fs.readFileSync(portalFile, "utf8");
  return raw.replace(
    "<head>",
    "<head><script>window.__ANYWORK_PORTAL_REMOTE__=true;" +
      "window.__ANYWORK_PORTAL_VERSION__=" + JSON.stringify(currentVersion()) + ";" +
      "window.__ANYWORK_PORTAL_GITHUB__=" + JSON.stringify(GITHUB_URL) + ";</script>",
  );
}

function send(res, status, body, headers) {
  const payload = Buffer.from(JSON.stringify(body));
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "content-length": payload.length,
    ...headers,
  });
  res.end(payload);
}

function cookieId(req) {
  const raw = req.headers.cookie || "";
  for (const part of raw.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    if (part.slice(0, i).trim() !== "desk_session") continue;
    try { return decodeURIComponent(part.slice(i + 1).trim()); }
    catch { return ""; }
  }
  return "";
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > 256 * 1024) {
        reject(Object.assign(new Error("too large"), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (!chunks.length) return resolve({});
      try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8"))); }
      catch { reject(Object.assign(new Error("bad json"), { status: 400 })); }
    });
    req.on("error", reject);
  });
}

function seatDirectory(user) {
  const safe = String(user || "").replace(/[^a-zA-Z0-9_-]/g, "");
  if (!safe) {
    const error = new Error("bad user");
    error.status = 400;
    throw error;
  }
  const dir = path.join("/root/seats", safe);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function sessionOf(req) {
  return sessionById(cookieId(req));
}

function deskCookie(id) {
  const value = id ? encodeURIComponent(id) : "";
  const base = "desk_session=" + value + "; Path=/; HttpOnly; SameSite=Lax";
  return id ? base : base + "; Max-Age=0";
}

async function handle(req, res) {
  const url = new URL(req.url || "/", "http://portal.local");
  const pathname = url.pathname;
  if (req.method === "GET" && (pathname === PREFIX || pathname === PREFIX + "/")) {
    const html = Buffer.from(portalHtml());
    res.writeHead(200, {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "content-length": html.length,
    });
    res.end(html);
    return;
  }
  if (req.method === "GET" && pathname === PREFIX + "/session") {
    send(res, 200, { session: sessionOf(req) });
    return;
  }
  if (req.method === "GET" && pathname === PREFIX + "/state") {
    if (!sessionOf(req)) return send(res, 401, { error: "no session" });
    send(res, 200, viewState());
    return;
  }
  if (req.method === "POST" && pathname === PREFIX + "/login") {
    const body = await readBody(req);
    const result = login(body.user, body.password);
    if (!result.ok) return send(res, 401, { error: "denied" });
    send(res, 200, { session: result.session }, { "set-cookie": deskCookie(result.session.id) });
    return;
  }
  if (req.method === "POST" && pathname === PREFIX + "/logout") {
    logout(cookieId(req));
    send(res, 200, { ok: true }, { "set-cookie": deskCookie("") });
    return;
  }
  if ((req.method === "PUT" || req.method === "POST") && pathname === PREFIX + "/state") {
    const session = sessionOf(req);
    if (!session) return send(res, 401, { error: "no session" });
    if (session.role !== "admin") return send(res, 403, { error: "admin only" });
    const body = await readBody(req);
    send(res, 200, replaceState(body.members, body.announcements));
    return;
  }
  if (req.method === "GET" && pathname === PREFIX + "/update") {
    if (!sessionOf(req)) return send(res, 401, { error: "no session" });
    try {
      send(res, 200, await checkLatest());
    } catch {
      send(res, 502, { error: "github", github: GITHUB_URL, current: currentVersion() });
    }
    return;
  }
  if (req.method === "POST" && pathname === PREFIX + "/update") {
    const session = sessionOf(req);
    if (!session) return send(res, 401, { error: "no session" });
    if (session.role !== "admin") return send(res, 403, { error: "admin only" });
    const body = await readBody(req);
    try {
      send(res, 200, await installLatest(body.version));
    } catch (err) {
      send(res, err.status || 500, {
        error: "install failed",
        message: err.publicMessage || "升级没有完成",
      });
    }
    return;
  }
  if (req.method === "POST" && pathname === PREFIX + "/seat") {
    const session = sessionOf(req);
    if (!session) return send(res, 401, { error: "no session" });
    send(res, 200, { path: seatDirectory(session.user), title: session.user });
    return;
  }
  if (req.method === "POST" && pathname === PREFIX + "/reset") {
    const session = sessionOf(req);
    if (!session) return send(res, 401, { error: "no session" });
    if (session.role !== "admin") return send(res, 403, { error: "admin only" });
    send(res, 200, resetState());
    return;
  }
  send(res, 404, { error: "not found" });
}

function routes() {
  const paths = [
    PREFIX,
    PREFIX + "/",
    PREFIX + "/session",
    PREFIX + "/state",
    PREFIX + "/login",
    PREFIX + "/logout",
    PREFIX + "/reset",
    PREFIX + "/seat",
    PREFIX + "/update",
  ];
  return paths.map((routePath) => ({
    kind: "exact",
    path: routePath,
    handler: (req, res) => handle(req, res).catch((err) => {
      if (res.headersSent) return;
      send(res, err.status || 500, { error: "failed" });
    }),
  }));
}

function bindRoutes(ctx) {
  const web = ctx.get?.("webServer") ?? ctx.get?.("httpServer");
  if (!web || typeof web.register !== "function") return null;
  const stops = [];
  for (const route of routes()) {
    const stop = web.register(route);
    if (typeof stop === "function") stops.push(stop);
  }
  return () => {
    for (const stop of stops) stop();
  };
}

/**
 * Host entry. After install, a restart runs apply:
 * the login portal is served, and admin001 (initial password qwer123)
 * is created with its instance if that instance is down.
 */
export function apply(ctx) {
  try { enableDefaultBundles(); } catch {}
  const cancel = ensurePulled();
  if (!ctx || typeof ctx.effect !== "function") return;
  ctx.effect(() => {
    let unbind = bindRoutes(ctx);
    let alive = true;
    const onService = (name) => {
      if (!alive || unbind) return;
      if (name === "webServer" || name === "httpServer") unbind = bindRoutes(ctx);
    };
    if (!unbind && typeof ctx.on === "function") ctx.on("internal/service", onService);
    return () => {
      alive = false;
      cancel();
      if (unbind) unbind();
    };
  });
}
