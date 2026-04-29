const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const serverRoot = path.resolve(__dirname, "..");
const prismaClientEntry = path.resolve(serverRoot, "../node_modules/.prisma/client/default.js");

if (fs.existsSync(prismaClientEntry)) {
  console.log("Prisma client already present.");
  process.exit(0);
}

console.log("Prisma client missing. Running prisma generate...");
const npxCmd = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(npxCmd, ["prisma", "generate"], {
  cwd: serverRoot,
  stdio: "inherit",
  shell: false,
});

if (typeof result.status === "number") {
  process.exit(result.status);
}

process.exit(1);
