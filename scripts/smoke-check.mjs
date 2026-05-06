import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const requiredFiles = [
  "package.json",
  "index.html",
  "src/main.tsx",
  "src/App.tsx",
  "src/lib/storage.ts",
  "src/stores/AppStoreContext.tsx",
  "src/pages/DashboardPage.tsx",
  "src/pages/CalendarPage.tsx",
  "src/pages/ProjectDetailPage.tsx",
  "src/components/TimerPanel.tsx",
  "src/types/index.ts",
  "scripts/launch-focus-projects.sh",
  "scripts/focus-existing-tab.js",
  "scripts/focus-projects-launcher.js",
  "scripts/build-macos-app.mjs",
  "Start Focus Projects.command",
  "README.md",
];

const missing = requiredFiles.filter((file) => !existsSync(join(root, file)));
if (missing.length > 0) {
  console.error(`Missing required files:\n${missing.join("\n")}`);
  process.exit(1);
}

const storageSource = readFileSync(join(root, "src/lib/storage.ts"), "utf8");
if (!storageSource.includes("localStorage")) {
  console.error("Storage layer does not reference localStorage.");
  process.exit(1);
}

const appSource = readFileSync(join(root, "src/App.tsx"), "utf8");
if (!appSource.includes("Route") || !appSource.includes("ProjectDetailPage")) {
  console.error("App routes are not wired.");
  process.exit(1);
}

if (!appSource.includes("/calendar") || !appSource.includes("CalendarPage")) {
  console.error("Calendar route is not wired.");
  process.exit(1);
}

const layoutSource = readFileSync(join(root, "src/components/Layout.tsx"), "utf8");
if (!layoutSource.includes("<TimerPanel />")) {
  console.error("TimerPanel is not globally mounted in Layout.");
  process.exit(1);
}

if (!layoutSource.includes('to="/#timer"') || !layoutSource.includes('to="/#projects"')) {
  console.error("Timer/Projects navigation links are not route-aware.");
  process.exit(1);
}

const dashboardSource = readFileSync(join(root, "src/pages/DashboardPage.tsx"), "utf8");
if (dashboardSource.includes("TimerPanel")) {
  console.error("Dashboard should not mount TimerPanel directly.");
  process.exit(1);
}

const timerPanelSource = readFileSync(join(root, "src/components/TimerPanel.tsx"), "utf8");
if (
  timerPanelSource.includes("playBeep") ||
  timerPanelSource.includes("AudioContext") ||
  timerPanelSource.includes("webkitAudioContext") ||
  timerPanelSource.includes("开启通知") ||
  timerPanelSource.includes("requestNotifications")
) {
  console.error("TimerPanel should not include sound playback or a manual notification button.");
  process.exit(1);
}

if (
  !timerPanelSource.includes("ensureNotificationPermission") ||
  !timerPanelSource.includes("Notification.requestPermission") ||
  !timerPanelSource.includes("new Notification")
) {
  console.error("TimerPanel must auto-request browser notifications from the start action.");
  process.exit(1);
}

const packageSource = readFileSync(join(root, "package.json"), "utf8");
if (!packageSource.includes("--port 5173 --strictPort")) {
  console.error("Vite scripts must pin port 5173 with --strictPort.");
  process.exit(1);
}

if (!packageSource.includes("build:mac-app")) {
  console.error("Missing build:mac-app script.");
  process.exit(1);
}

const commandSource = readFileSync(join(root, "Start Focus Projects.command"), "utf8");
if (!commandSource.includes("scripts/launch-focus-projects.sh")) {
  console.error("The .command launcher must call the shared launcher script.");
  process.exit(1);
}

const launcherSource = readFileSync(join(root, "scripts/launch-focus-projects.sh"), "utf8");
if (
  !launcherSource.includes("--background") ||
  !launcherSource.includes("npm run dev") ||
  !launcherSource.includes("http://127.0.0.1:5173/") ||
  !launcherSource.includes("focus-existing-tab.js") ||
  !launcherSource.includes("open -b com.openai.atlas.web") ||
  !launcherSource.includes("open -a Safari")
) {
  console.error("Shared launcher script does not contain the required app launch behavior.");
  process.exit(1);
}

const focusExistingTabSource = readFileSync(join(root, "scripts/focus-existing-tab.js"), "utf8");
if (
  !focusExistingTabSource.includes("ChatGPT Atlas") ||
  !focusExistingTabSource.includes("com.openai.atlas.web") ||
  !focusExistingTabSource.includes("focused")
) {
  console.error("Browser tab focusing helper is missing expected browser support.");
  process.exit(1);
}

const macAppLauncherSource = readFileSync(join(root, "scripts/focus-projects-launcher.js"), "utf8");
if (
  !macAppLauncherSource.includes("launch-focus-projects.sh") ||
  !macAppLauncherSource.includes("__PROJECT_DIR__")
) {
  console.error("macOS app launcher must call the shared launcher script.");
  process.exit(1);
}

const builtAppContents = join(root, "Focus Projects.app", "Contents");
if (existsSync(join(root, "Focus Projects.app")) && !existsSync(builtAppContents)) {
  console.error("Focus Projects.app exists but does not look like a macOS app bundle.");
  process.exit(1);
}

const projectDetailSource = readFileSync(join(root, "src/pages/ProjectDetailPage.tsx"), "utf8");
if (
  !projectDetailSource.includes("Done Archive") ||
  !projectDetailSource.includes("onCycleStatus") ||
  projectDetailSource.includes('type="checkbox"')
) {
  console.error("Todo list must use status cycling with a Done Archive, not checkbox completion.");
  process.exit(1);
}

const storeSource = readFileSync(join(root, "src/stores/AppStoreContext.tsx"), "utf8");
if (!storeSource.includes("cycleTodoStatus") || !storeSource.includes("nextTodoStatus")) {
  console.error("Todo status cycling is not wired in the app store.");
  process.exit(1);
}

console.log("Smoke check passed: project structure, storage layer, and routes are present.");
