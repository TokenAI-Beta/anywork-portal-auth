import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const GITHUB_URL = "https://github.com/TokenAI-Beta/anywork-portal-auth";
const RAW_PACKAGE = "https://raw.githubusercontent.com/TokenAI-Beta/anywork-portal-auth/main/package.json";
const SOURCE_TARBALL = "https://codeload.github.com/TokenAI-Beta/anywork-portal-auth/tar.gz/refs/heads/main";

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

function fail(status, message) {
  const error = new Error(message);
  error.status = status;
  error.publicMessage = message;
  return error;
}

async function downloadSource(expected) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "anywork-portal-auth-"));
  try {
    const archive = path.join(dir, "src.tar.gz");
    const extracted = path.join(dir, "src");
    const response = await fetch(SOURCE_TARBALL, {
      headers: { "user-agent": "anywork-portal-auth" },
      signal: AbortSignal.timeout(60000),
    });
    if (!response.ok) throw fail(502, "下不了 GitHub 上的安装包");
    fs.writeFileSync(archive, Buffer.from(await response.arrayBuffer()));
    fs.mkdirSync(extracted);
    const unpacked = await run("tar", ["-xzf", archive, "-C", extracted]);
    if (unpacked.code !== 0) throw fail(500, "解包失败");
    const entries = fs.readdirSync(extracted);
    const root = path.join(extracted, entries[0] || "");
    const pkgPath = path.join(root, "package.json");
    if (!fs.existsSync(pkgPath)) throw fail(500, "安装包里没有 package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    if (String(pkg.version) !== expected) throw fail(409, "GitHub 上的版本和要升级的版本不一致");
    return { dir, root };
  } catch (err) {
    fs.rmSync(dir, { recursive: true, force: true });
    throw err;
  }
}

export async function installLatest(expected) {
  if (!/^[\d.]+$/.test(String(expected || ""))) throw fail(400, "版本号不正确");
  const info = await checkLatest();
  if (!info.update || info.latest !== expected) throw fail(409, "没有可升级的新版本");
  const downloaded = await downloadSource(expected);
  try {
    const bin = fs.existsSync("/usr/local/bin/dsh") ? "/usr/local/bin/dsh" : "dsh";
    const result = await run(bin, ["plugin", "--profile", "web", "add", downloaded.root]);
    if (result.code !== 0) throw fail(500, "安装没有完成");
  } finally {
    fs.rmSync(downloaded.dir, { recursive: true, force: true });
  }
  return {
    ok: true,
    version: info.latest,
    message: "已安装 " + info.latest + "。重启实例后才会换成新版本。",
  };
}
