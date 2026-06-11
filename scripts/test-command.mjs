import { spawn } from "node:child_process";
import path from "node:path";

const rootDir = process.cwd();
const isWindows = process.platform === "win32";
const nodeBin = process.execPath;
const tests = {
  "app-init-readiness": {
    command: nodeBin,
    args: ["--loader", "./tests/helpers/alias-loader.mjs", "tests/app/private-init-readiness.test.ts"],
  },
  "app-stream-state": {
    command: nodeBin,
    args: ["--loader", "./tests/helpers/alias-loader.mjs", "tests/app/stream-lifecycle-state.test.ts"],
  },
  "app-monthly-calendar": {
    command: nodeBin,
    args: ["--loader", "./tests/helpers/alias-loader.mjs", "tests/app/monthly-payroll-calendar.test.ts"],
  },
  "app-monthly-start-modes": {
    command: nodeBin,
    args: ["--loader", "./tests/helpers/alias-loader.mjs", "tests/app/monthly-stream-start-modes.test.ts"],
  },
};

const target = process.argv[2];
const selected = target ? tests[target] : undefined;

if (!selected) {
  console.error("Unknown test target.");
  console.error(`Available targets: ${Object.keys(tests).join(", ")}`);
  process.exit(1);
}

const child = spawn(selected.command, selected.args, {
  cwd: rootDir,
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
