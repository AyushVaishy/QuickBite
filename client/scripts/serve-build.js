const { spawn } = require("child_process");
const path = require("path");

const port = process.env.PORT || "3000";
const serveBin = require.resolve("serve/build/main.js");
const buildDir = path.resolve(__dirname, "../build");

const child = spawn(process.execPath, [serveBin, "-s", buildDir, "-l", port], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
