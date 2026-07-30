import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile, cp, access } from "fs/promises";
import { execFileSync } from "child_process";
import path from "path";

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "pg",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

const BLOG_DIR = path.resolve("blog");

async function exists(p: string) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * The blog is built in its own process, from its own package.json, so its
 * Vite 8 / React 19 / Tailwind 4 toolchain never mixes with the marketing
 * app's Vite 7 / React 18 one. Its own build script also runs the prerender
 * step (SSR render + sitemaps), which needs network access to Sanity.
 * Output lands in dist/public/blog, which the server mounts at /blog.
 */
async function buildBlog() {
  if (!(await exists(path.join(BLOG_DIR, "package.json")))) {
    console.log("no blog/ directory, skipping blog build");
    return;
  }

  if (!(await exists(path.join(BLOG_DIR, "node_modules")))) {
    console.log("installing blog dependencies...");
    execFileSync("npm", ["install", "--no-audit", "--no-fund"], {
      cwd: BLOG_DIR,
      stdio: "inherit",
      shell: true,
    });
  }

  console.log("building blog...");
  execFileSync("npm", ["run", "build"], {
    cwd: BLOG_DIR,
    stdio: "inherit",
    shell: true,
  });

  // Copied after the client build, which empties dist/public.
  await cp(path.join(BLOG_DIR, "dist"), path.resolve("dist", "public", "blog"), {
    recursive: true,
  });
}

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });

  await buildBlog();
}

// `npm run build:blog` rebuilds only the blog and refreshes dist/public/blog,
// leaving the marketing build in place.
const run = process.argv.includes("--blog-only") ? buildBlog : buildAll;

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
