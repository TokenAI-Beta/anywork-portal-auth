import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import { viewState } from "./state.js";

const ZONE = "Asia/Shanghai";
const CACHE_MS = 15000;
const DAY_LIMIT = 45;
const CALL_LIMIT = 40;

let cache = { at: 0, value: null };

function dshHome() {
  return process.env.DSH_HOME || path.join(os.homedir(), ".dsh");
}

function dayKey(ms) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(ms));
}

function numberOf(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function tokensOf(usage) {
  if (!usage || typeof usage !== "object") return 0;
  return numberOf(usage.inputTokens ?? usage.uncachedInputTokens)
    + numberOf(usage.outputTokens)
    + numberOf(usage.cacheReadTokens)
    + numberOf(usage.cacheWriteTokens);
}

function seatUser(dirName) {
  const match = /^--root-seats-([A-Za-z0-9_-]+)--$/.exec(dirName);
  return match ? match[1] : "";
}

function blankAccount(user) {
  return {
    user,
    today: 0,
    month: 0,
    callsToday: 0,
    callsMonth: 0,
    days: new Map(),
    calls: [],
  };
}

function readCalls(file) {
  if (typeof zlib.zstdDecompressSync !== "function") return [];
  let text = "";
  try {
    text = zlib.zstdDecompressSync(fs.readFileSync(file)).toString("utf8");
  } catch {
    return [];
  }
  const calls = [];
  for (const line of text.split("\n")) {
    if (!line) continue;
    let event;
    try { event = JSON.parse(line); }
    catch { continue; }
    if (event.type !== "assistant/message" && event.type !== "compaction/summary") continue;
    const data = event.data || {};
    const tokens = tokensOf(data.usage);
    if (!tokens) continue;
    const at = Number(event.time);
    if (!Number.isFinite(at) || at <= 0) continue;
    const model = String(data.model || data.provider || "").slice(0, 80);
    calls.push({ at, tokens, model: model || "—" });
  }
  return calls;
}

function scan() {
  const now = Date.now();
  const today = dayKey(now);
  const month = today.slice(0, 7);
  const accounts = new Map();
  const root = path.join(dshHome(), "sessions");
  let seatDirs = [];
  try { seatDirs = fs.readdirSync(root, { withFileTypes: true }); }
  catch { seatDirs = []; }
  for (const seatDir of seatDirs) {
    if (!seatDir.isDirectory()) continue;
    const user = seatUser(seatDir.name);
    if (!user) continue;
    const account = accounts.get(user) || blankAccount(user);
    accounts.set(user, account);
    const seatPath = path.join(root, seatDir.name);
    let sessions = [];
    try { sessions = fs.readdirSync(seatPath, { withFileTypes: true }); }
    catch { continue; }
    for (const session of sessions) {
      if (!session.isDirectory()) continue;
      const file = path.join(seatPath, session.name, "session.v4.jsonl.zstd");
      for (const call of readCalls(file)) {
        const day = dayKey(call.at);
        if (!day.startsWith(month)) continue;
        account.month += call.tokens;
        account.callsMonth += 1;
        const bucket = account.days.get(day) || { tokens: 0, calls: 0 };
        bucket.tokens += call.tokens;
        bucket.calls += 1;
        account.days.set(day, bucket);
        if (day === today) {
          account.today += call.tokens;
          account.callsToday += 1;
        }
        account.calls.push({ ...call, day });
      }
    }
  }
  return accounts;
}

function knownUsers() {
  try {
    return [...new Set((viewState().members || []).map((member) => member && member.id).filter(Boolean))].sort();
  } catch {
    return [];
  }
}

function reportOf(accounts, users) {
  const rows = users.map((user) => {
    const account = accounts.get(user) || blankAccount(user);
    return {
      user,
      today: account.today,
      month: account.month,
      callsToday: account.callsToday,
      callsMonth: account.callsMonth,
    };
  });
  const days = [];
  const calls = [];
  for (const user of users) {
    const account = accounts.get(user);
    if (!account) continue;
    for (const [day, bucket] of account.days) {
      days.push({ day, user, tokens: bucket.tokens, calls: bucket.calls });
    }
    calls.push(...account.calls.map((call) => ({ ...call, user })));
  }
  days.sort((a, b) => b.day.localeCompare(a.day) || a.user.localeCompare(b.user));
  calls.sort((a, b) => b.at - a.at);
  const today = rows.reduce((sum, row) => sum + row.today, 0);
  const month = rows.reduce((sum, row) => sum + row.month, 0);
  const callsToday = rows.reduce((sum, row) => sum + row.callsToday, 0);
  const callsMonth = rows.reduce((sum, row) => sum + row.callsMonth, 0);
  return {
    today,
    month,
    callsToday,
    callsMonth,
    rows,
    days: days.slice(0, DAY_LIMIT),
    calls: calls.slice(0, CALL_LIMIT).map((call) => ({
      at: new Date(call.at).toISOString(),
      day: call.day,
      user: call.user,
      tokens: call.tokens,
      model: call.model,
    })),
  };
}

export function usageFor(session) {
  const now = Date.now();
  if (!cache.value || now - cache.at > CACHE_MS) {
    cache = { at: now, value: scan() };
  }
  const accounts = cache.value;
  const users = session && session.role === "admin"
    ? knownUsers()
    : [String(session && session.user || "")].filter(Boolean);
  return reportOf(accounts, users);
}
