import { access, copyFile, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const outputDir = join(root, ".output");
const distDir = join(root, "dist");
const hostingFile = join(root, ".openai", "hosting.json");

await access(join(outputDir, "server", "index.mjs"));
await access(join(outputDir, "server", "wrangler.json"));
await access(join(outputDir, "public"));
await access(hostingFile);

await rm(distDir, { recursive: true, force: true });
await mkdir(join(distDir, "server"), { recursive: true });
await mkdir(join(distDir, "client"), { recursive: true });
await mkdir(join(distDir, ".openai"), { recursive: true });

await cp(join(outputDir, "server"), join(distDir, "server"), { recursive: true });
await cp(join(outputDir, "public"), join(distDir, "client"), { recursive: true });
await copyFile(hostingFile, join(distDir, ".openai", "hosting.json"));

await writeFile(
  join(distDir, "server", "index.js"),
  'export { default } from "./index.mjs";\n',
  "utf8",
);

const wranglerFile = join(distDir, "server", "wrangler.json");
const wrangler = JSON.parse(await readFile(wranglerFile, "utf8"));
wrangler.main = "index.js";
wrangler.assets = {
  ...(wrangler.assets ?? {}),
  directory: "../client",
};
await writeFile(wranglerFile, `${JSON.stringify(wrangler, null, 2)}\n`, "utf8");

const hosting = JSON.parse(await readFile(hostingFile, "utf8"));
if (!hosting.project_id || typeof hosting.project_id !== "string") {
  throw new Error(".openai/hosting.json precisa conter um project_id válido.");
}

console.log("Sites staging ready: dist/server, dist/client and hosting metadata validated.");
