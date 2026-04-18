import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const runtimeStore = path.join(root, "backend/data/runtime-store.json");
const backupStore = path.join(root, "backend/data/runtime-store.smoke-backup.json");
const port = 4111;
let server;
let authToken = "";

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
      ...options,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`${command} ${args.join(" ")} failed with code ${code}\n${stdout}\n${stderr}`));
      }
    });
  });
}

async function waitForHealth(url, timeoutMs = 12000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function backupRuntimeStore() {
  try {
    await fs.copyFile(runtimeStore, backupStore);
  } catch {}
  try {
    await fs.unlink(runtimeStore);
  } catch {}
}

async function restoreRuntimeStore() {
  try {
    await fs.copyFile(backupStore, runtimeStore);
    await fs.unlink(backupStore);
    return;
  } catch {}

  try {
    await fs.unlink(runtimeStore);
  } catch {}
}

async function startBackend() {
  server = spawn("node", ["backend/src/server.js"], {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(port),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  server.stdout.on("data", (chunk) => process.stdout.write(chunk));
  server.stderr.on("data", (chunk) => process.stderr.write(chunk));

  await waitForHealth(`http://127.0.0.1:${port}/api/health`);
}

async function stopBackend() {
  if (!server) return;
  const child = server;
  server = null;
  child.kill("SIGINT");
  await new Promise((resolve) => child.on("exit", resolve));
}

async function api(pathname, options = {}) {
  const response = await fetch(`http://127.0.0.1:${port}${pathname}`, {
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`API ${pathname} failed with ${response.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function login(email, password) {
  const response = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  authToken = response.token;
  return response;
}

async function expectFailure(pathname, expectedStatus, options = {}) {
  const response = await fetch(`http://127.0.0.1:${port}${pathname}`, {
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  assert(response.status === expectedStatus, `Expected ${pathname} to fail with ${expectedStatus}, got ${response.status}`);
  return data;
}

async function main() {
  await backupRuntimeStore();

  try {
    await startBackend();

    const ready = await api("/api/ready");
    assert(ready.status === "ok", "Expected readiness endpoint to report healthy state");

    const adminLogin = await login("admin@claimswift.ai", "admin123");
    assert(adminLogin.user.role === "ops_admin", "Expected admin login to return ops admin role");

    const bootstrap = await api("/api/bootstrap");
    assert(Array.isArray(bootstrap.claims) && bootstrap.claims.length >= 6, "Expected seeded claims in bootstrap payload");
    assert(bootstrap.featured.clarificationId, "Expected a featured clarification claim");
    assert(bootstrap.featured.reviewId, "Expected a featured review claim");

    const intakeAnalysis = await api("/api/intake/analyze", {
      method: "POST",
      body: JSON.stringify({
        insuranceType: "health",
        documents: [
          { name: "blurred_bill_scan.jpg", size: 120000, type: "image/jpeg" },
          { name: "policy_card.pdf", size: 24000, type: "application/pdf" },
        ],
      }),
    });
    assert(intakeAnalysis.analysis.recommendedScenario === "clarification", "Expected blurred package to trigger clarification analysis");
    assert(intakeAnalysis.analysis.missingDocuments.includes("discharge summary"), "Expected intake analysis to flag missing discharge summary");

    await login("adjuster@claimswift.ai", "adjust123");

    const clarificationCreated = await api("/api/claims", {
      method: "POST",
      body: JSON.stringify({
        insuranceType: "health",
        scenario: "clarification",
        claimantName: "Smoke Health",
        providerName: "Sunrise Multispeciality Hospital",
        city: "Pune",
        claimAmount: 22000,
        policyNumber: "POL-HEALTH-SMOKE",
      }),
    });
    assert(clarificationCreated.claim.status === "clarification_required", "Expected clarification scenario to pause the claim");

    const clarified = await api(`/api/claims/${clarificationCreated.claim.id}/clarifications`, {
      method: "POST",
      body: JSON.stringify({ invoiceAmount: 12500 }),
    });
    assert(clarified.claim.status === "approved_for_stp", "Expected clarified claim to resume into STP");

    const reviewCreated = await api("/api/claims", {
      method: "POST",
      body: JSON.stringify({
        insuranceType: "motor",
        scenario: "review",
        claimantName: "Smoke Motor",
        providerName: "Rapid Auto Garage",
        city: "Bengaluru",
        claimAmount: 24000,
        policyNumber: "POL-MOTOR-SMOKE",
      }),
    });
    assert(reviewCreated.claim.status === "human_review", "Expected review scenario to create a manual-review claim");

    await login("reviewer@claimswift.ai", "review123");

    const reviewed = await api(`/api/claims/${reviewCreated.claim.id}/review`, {
      method: "POST",
      body: JSON.stringify({ action: "approve" }),
    });
    assert(reviewed.claim.status === "approved_for_stp", "Expected approved review claim to move back to STP");

    await expectFailure(`/api/claims/${reviewed.claim.id}/settle`, 403, {
      method: "POST",
    });

    await login("adjuster@claimswift.ai", "adjust123");

    const settled = await api(`/api/claims/${reviewed.claim.id}/settle`, {
      method: "POST",
    });
    assert(settled.claim.status === "settled", "Expected settlement endpoint to settle the claim");

    const dashboard = await api("/api/dashboard/metrics");
    assert(dashboard.metrics.settledCount >= 1, "Expected dashboard settled count to update");

    await login("analyst@claimswift.ai", "analyst123");
    const ops = await api("/api/platform/ops");
    assert(ops.ops.readiness.status === "ok", "Expected platform ops endpoint to surface readiness");
    assert(Array.isArray(ops.ops.recentAuditEvents) && ops.ops.recentAuditEvents.length >= 4, "Expected audit events to be available in ops payload");

    await run("npm", ["run", "build", "--prefix", "frontend"]);
    const builtHtml = await fs.readFile(path.join(root, "frontend/dist/index.html"), "utf8");
    assert(builtHtml.includes("ClaimSwift AI"), "Expected built frontend HTML to contain the app title");

    console.log("Smoke test passed.");
  } finally {
    await stopBackend();
    await restoreRuntimeStore();
  }
}

main().catch((error) => {
  console.error(error.stack || String(error));
  process.exitCode = 1;
});
