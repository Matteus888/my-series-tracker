// scripts/loader.mjs
import { fileURLToPath, pathToFileURL } from "node:url";
import { existsSync } from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(fileURLToPath(import.meta.url), "../..");
const srcRoot = path.join(projectRoot, "src");

export function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const relative = specifier.slice(2);
    let resolved = path.join(srcRoot, relative);

    // Ajoute .js si pas d'extension et que le fichier existe
    if (!path.extname(resolved)) {
      if (existsSync(resolved + ".js")) resolved += ".js";
      else if (existsSync(resolved + ".jsx")) resolved += ".jsx";
      else if (existsSync(path.join(resolved, "index.js"))) {
        resolved = path.join(resolved, "index.js");
      }
    }

    return nextResolve(pathToFileURL(resolved).href, context);
  }
  return nextResolve(specifier, context);
}
