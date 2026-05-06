import { existsSync, readFileSync, rmSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const root = join(scriptsDir, "..");
const source = join(scriptsDir, "focus-projects-launcher.js");
const compiledSource = join("/private/tmp", `focus-projects-launcher-${process.pid}.js`);
const appPath = join(root, "Focus Projects.app");
const appContents = join(appPath, "Contents");

if (!existsSync(source)) {
  console.error(`Missing AppleScript source: ${source}`);
  process.exit(1);
}

if (existsSync(appPath)) {
  const stat = statSync(appPath);
  if (!stat.isDirectory()) {
    console.error(`${appPath} exists and is not an app bundle directory.`);
    process.exit(1);
  }
  rmSync(appPath, { recursive: true, force: true });
}

const sourceText = readFileSync(source, "utf8").replaceAll("__PROJECT_DIR__", root);
writeFileSync(compiledSource, sourceText);

const result = spawnSync("/usr/bin/osacompile", ["-l", "JavaScript", "-o", appPath, compiledSource], {
  stdio: "inherit",
});

try {
  unlinkSync(compiledSource);
} catch {
  // The temporary source is best-effort cleanup only.
}

if (result.status !== 0 && !existsSync(appContents)) {
  process.exit(result.status ?? 1);
}

spawnSync("/usr/bin/xattr", ["-cr", appPath], { stdio: "ignore" });

if (result.status !== 0) {
  console.warn(
    "osacompile reported a local signing/xattr warning, but the app bundle was created.",
  );
}

console.log(`Created ${appPath}`);
