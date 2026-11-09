import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const ADMIN_ID = "admin001";
export const ADMIN_PORT = 3301;
export const INITIAL_PASSWORD = "qwer123";
export const BOOT_MS = 1200;
const MEMBER_PASSWORD = "member";
const DEMO_MEMBER_IDS = new Set(["cth", "test001", "yk", "xc"]);
const DEMO_ANN_IDS = new Set(["a1", "a2", "a3"]);

let bootTimer = null;

function dataFile() {
  const home = process.env.DSH_HOME || path.join(os.homedir(), ".dsh");
  return path.join(home, "anywork-portal-auth", "state.json");
}

function blankState() {
  return {
    users: [
      { id: ADMIN_ID, password: INITIAL_PASSWORD, role: "admin", displayName: ADMIN_ID },
    ],
    sessions: [],
    members: [],
    announcements: [],
    demoCleared: true,
  };
}

function stripDemo(state) {
  if (state.demoCleared) return false;
  state.members = state.members.filter((m) => m && !DEMO_MEMBER_IDS.has(m.id));
  state.announcements = state.announcements.filter((a) => a && !DEMO_ANN_IDS.has(a.id));
  state.users = state.users.filter((u) => {
    if (!u) return false;
    if (DEMO_MEMBER_IDS.has(u.id)) return false;
    return !(u.id === "member" && u.displayName === "Member Demo");
  });
  state.sessions = state.sessions.filter((s) => s && !DEMO_MEMBER_IDS.has(s.user) && !(s.user === "member"));
  state.demoCleared = true;
  return true;
}

function load() {
  try {
    const raw = fs.readFileSync(dataFile(), "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return blankState();
    const state = {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      members: Array.isArray(parsed.members) ? parsed.members : [],
      announcements: Array.isArray(parsed.announcements) ? parsed.announcements : [],
      demoCleared: parsed.demoCleared === true,
    };
    if (stripDemo(state)) save(state);
    return state;
  } catch {
    return blankState();
  }
}

function save(state) {
  const file = dataFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = file + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(state));
  fs.renameSync(tmp, file);
}

function findUser(state, id) {
  return state.users.find((u) => u && u.id === id) || null;
}

function findMember(state, id) {
  return state.members.find((m) => m && m.id === id) || null;
}

function ensureAccounts(state) {
  let admin = findUser(state, ADMIN_ID);
  if (!admin) {
    admin = { id: ADMIN_ID, password: INITIAL_PASSWORD, role: "admin", displayName: ADMIN_ID };
    state.users.unshift(admin);
  }
  admin.role = "admin";
  if (!admin.password) admin.password = INITIAL_PASSWORD;
  if (!admin.displayName) admin.displayName = ADMIN_ID;
  for (const member of state.members) {
    if (!member || !member.id || member.id === ADMIN_ID) continue;
    let user = findUser(state, member.id);
    if (!user) {
      user = { id: member.id, password: MEMBER_PASSWORD, role: "member", displayName: member.id };
      state.users.push(user);
    }
    if (!user.password) user.password = MEMBER_PASSWORD;
    if (user.role !== "admin") user.role = member.role === "admin" ? "admin" : "member";
  }
  let row = findMember(state, ADMIN_ID);
  if (!row) {
    row = { id: ADMIN_ID, role: "admin", budget: "—", seat: "off", port: null };
    state.members.unshift(row);
  }
  row.role = "admin";
  delete row.password;
  return row;
}

function freeAdminPort(state) {
  const used = new Set();
  for (const m of state.members) {
    if (m && m.id !== ADMIN_ID && m.port) used.add(m.port);
  }
  if (!used.has(ADMIN_PORT)) return ADMIN_PORT;
  let port = 3306;
  while (used.has(port)) port += 1;
  return port;
}

export function cancelBoot() {
  if (bootTimer) {
    clearTimeout(bootTimer);
    bootTimer = null;
  }
}

/** Restart path: make sure admin001 exists, and bring the instance up when it is down. */
export function ensurePulled() {
  const state = load();
  const row = ensureAccounts(state);
  if (row.seat === "up" && row.port) {
    save(state);
    return cancelBoot;
  }
  if (row.seat === "booting" && bootTimer) {
    save(state);
    return cancelBoot;
  }
  row.seat = "booting";
  row.port = null;
  save(state);
  cancelBoot();
  bootTimer = setTimeout(() => {
    bootTimer = null;
    const next = load();
    const m = findMember(next, ADMIN_ID);
    if (!m || m.seat !== "booting") return;
    m.role = "admin";
    m.seat = "up";
    m.port = freeAdminPort(next);
    delete m.password;
    save(next);
  }, BOOT_MS);
  return cancelBoot;
}

function publicSession(session) {
  if (!session) return null;
  return {
    id: session.id,
    user: session.user,
    displayName: session.displayName,
    role: session.role,
    issuedAt: session.issuedAt,
    source: "anywork-portal-auth",
  };
}

function publicMembers(members) {
  return (members || []).map((m) => ({
    id: String(m.id || ""),
    role: m.role === "admin" ? "admin" : "member",
    budget: m.budget == null ? "—" : String(m.budget),
    seat: ["up", "idle", "off", "booting"].includes(m.seat) ? m.seat : "off",
    port: Number.isInteger(m.port) ? m.port : null,
  })).filter((m) => m.id);
}

export function changePassword(userId, currentPassword, nextPassword) {
  const next = String(nextPassword || "");
  if (next.length < 4 || next.length > 64 || /\s/.test(next)) {
    return { ok: false, message: "新密码需要 4–64 位，且不能包含空格" };
  }
  const state = load();
  ensureAccounts(state);
  const acct = findUser(state, String(userId || "").trim());
  if (!acct || acct.password !== String(currentPassword || "")) {
    save(state);
    return { ok: false, message: "当前密码不正确" };
  }
  acct.password = next;
  save(state);
  return { ok: true };
}

export function login(user, password) {
  const state = load();
  ensureAccounts(state);
  const acct = findUser(state, String(user || "").trim());
  if (!acct || acct.password !== String(password || "")) {
    save(state);
    return { ok: false };
  }
  const session = {
    id: "ds_" + crypto.randomBytes(8).toString("hex"),
    user: acct.id,
    displayName: acct.displayName || acct.id,
    role: acct.role,
    issuedAt: new Date().toISOString(),
  };
  state.sessions.push(session);
  save(state);
  return { ok: true, session: publicSession(session) };
}

export function sessionById(id) {
  if (!id) return null;
  const state = load();
  const session = state.sessions.find((s) => s && s.id === id) || null;
  return publicSession(session);
}

export function logout(id) {
  const state = load();
  state.sessions = state.sessions.filter((s) => s && s.id !== id);
  save(state);
}

export function viewState() {
  const state = load();
  return {
    members: publicMembers(state.members),
    announcements: state.announcements,
  };
}

function cleanAnnouncements(list) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, 100).map((a) => ({
    id: String(a.id || "").slice(0, 40),
    title: String(a.title || "").slice(0, 80),
    body: String(a.body || "").slice(0, 500),
    author: String(a.author || "admin").slice(0, 40),
    at: String(a.at || "").slice(0, 20),
    pinned: !!a.pinned,
  })).filter((a) => a.id && a.title);
}

export function replaceState(members, announcements) {
  const state = load();
  if (Array.isArray(members)) state.members = publicMembers(members).slice(0, 200);
  if (Array.isArray(announcements)) state.announcements = cleanAnnouncements(announcements);
  ensureAccounts(state);
  save(state);
  return viewState();
}

export function resetState() {
  cancelBoot();
  const kept = load();
  const next = blankState();
  next.sessions = kept.sessions;
  save(next);
  ensurePulled();
  return viewState();
}
