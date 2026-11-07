import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const GITHUB_URL = "https://github.com/TokenAI-Beta/anywork-portal-auth";
const RAW_PACKAGE = "https://raw.githubusercontent.com/TokenAI-Beta/anywork-portal-auth/main/package.json";
const INSTALL_SPEC = "github:TokenAI-Beta/anywork-portal-auth";

export function currentVersion() {
  const pkgPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  return String(pkg.version || "");
}

export function compareVersions(left, right) {
  const parse = (value) => String(value).replace(/^v/, "").split(".").map((part) => parseInt(part, 10) || 0);
  const a = parse(left);
  const b = parse(right);
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i++) {
    const diff = (a[i] || 0) - (b[i] || 0);
    if (diff) return diff;
  }
  return 0;
}

export async function checkLatest() {
  const current = currentVersion();
  const response = await fetch(RAW_PACKAGE, {
    headers: { accept: "application/json", "user-agent": "anywork-portal-auth" },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    const error = new Error("github");
    error.status = 502;
    throw error;
  }
  const pkg = await response.json();
  const latest = String(pkg.version || "");
  return {
    current,
    latest,
    github: GITHUB_URL,
    update: Boolean(latest) && compareVersions(latest, current) > 0,
  };
}

function dshHome() {
  return process.env.DSH_HOME || path.join(os.homedir(), ".dsh");
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: dshHome(),
      env: { ...process.env, DSH_HOME: dshHome() },
      windowsHide: true,
    });
    let out = "";
    const take = (chunk) => {
      out = (out + chunk.toString()).slice(-4000);
    };
    child.stdout?.on("data", take);
    child.stderr?.on("data", take);
    const timer = setTimeout(() => {
      child.kill();
      reject(Object.assign(new Error("timeout"), { status: 504 }));
    }, 180000);
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, out });
    });
  });
}

export async function installLatest(expected) {
  if (!/^[\d.]+$/.test(String(expected || ""))) {
    const error = new Error("bad version");
    error.status = 400;
    throw error;
  }
  const info = await checkLatest();
  if (!info.update || info.latest !== expected) {
    const error = new Error("not an upgrade");
    error.status = 409;
    throw error;
  }
  const bin = fs.existsSync("/usr/local/bin/dsh") ? "/usr/local/bin/dsh" : "dsh";
  const result = await run(bin, ["plugin", "--profile", "web", "add", INSTALL_SPEC]);
  if (result.code !== 0) {
    const error = new Error("install failed");
    error.status = 500;
    throw error;
  }
  return {
    ok: true,
    version: info.latest,
    message: "已安装 " + info.latest + "。重启实例后才会换成新版本。",
  };
}
