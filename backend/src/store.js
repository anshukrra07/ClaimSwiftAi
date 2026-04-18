import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { seedState } from "./seed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, "../data");
const stateFile = path.join(dataDir, "runtime-store.json");

let statePromise;

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function hydrateState(current, template) {
  if (Array.isArray(template)) {
    return current === undefined ? deepClone(template) : current;
  }

  if (template && typeof template === "object") {
    const source = current && typeof current === "object" ? current : {};
    const next = {};
    for (const [key, value] of Object.entries(template)) {
      next[key] = hydrateState(source[key], value);
    }
    for (const [key, value] of Object.entries(source)) {
      if (!(key in next)) next[key] = value;
    }
    return next;
  }

  return current === undefined ? template : current;
}

async function ensureDataDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

export async function loadState() {
  if (!statePromise) {
    statePromise = (async () => {
      await ensureDataDir();

      try {
        const raw = await fs.readFile(stateFile, "utf8");
        const parsed = JSON.parse(raw);
        const hydrated = hydrateState(parsed, seedState);
        const changed = JSON.stringify(parsed) !== JSON.stringify(hydrated);
        if (changed) {
          await fs.writeFile(stateFile, `${JSON.stringify(hydrated, null, 2)}\n`, "utf8");
        }
        return hydrated;
      } catch {
        const fresh = deepClone(seedState);
        await fs.writeFile(stateFile, `${JSON.stringify(fresh, null, 2)}\n`, "utf8");
        return fresh;
      }
    })();
  }

  return statePromise;
}

export async function saveState(nextState) {
  statePromise = Promise.resolve(nextState);
  await ensureDataDir();
  await fs.writeFile(stateFile, `${JSON.stringify(nextState, null, 2)}\n`, "utf8");
}

export async function updateState(updater) {
  const current = await loadState();
  const next = await updater(deepClone(current));
  await saveState(next);
  return next;
}
