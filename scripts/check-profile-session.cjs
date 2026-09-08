const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
function source(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}
function evaluate(code, context) {
  return vm.runInNewContext(ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, context);
}
function findCallback(file, predicate) {
  const content = source(file);
  const ast = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let result;
  function visit(node) {
    if (predicate(node)) result = node.arguments[0].getText(ast);
    ts.forEachChild(node, visit);
  }
  visit(ast);
  assert.ok(result, `Callback not found in ${file}`);
  return result;
}

async function check(status, body, networkFailure = false) {
  let cleared = 0;
  const fetch = async () => {
    if (networkFailure) throw new Error("offline");
    return new Response(body, { status });
  };
  const exports = {};
  evaluate(source("app/api/auth/me/route.ts"), {
    exports, fetch,
    require(name) {
      if (name === "next/server") return { NextResponse: Response };
      if (name === "../_cookies") return {
        API_URL: "https://example.test", getSessionToken: async () => "test-token",
        clearSessionCookie: async () => { cleared++; },
      };
      if (name === "../_profile-photo-urls") return { attachOwnPhotoUrls: value => value };
      throw new Error(name);
    },
  });
  const response = await exports.GET();
  assert.equal(cleared, status === 401 && !networkFailure ? 1 : 0);

  let removed = 0;
  let redirected = 0;
  let user = { id: "existing-user" };
  let error = "";
  const context = {
    fetch: async () => response.clone(),
    setUser: value => { user = value; },
    setSecurityIncidentNotices() {}, setIsAuthLoading() {},
    removeAuthUser() { removed++; }, saveAuthUser() {},
    loadSecurityIncidentNotices: async () => {},
    router: { replace() { redirected++; } },
    window: { dispatchEvent() {}, sessionStorage: { getItem: () => null } }, Event,
    reapplication: false, setRemoteProfile() {}, hydrateProfile() {},
    shouldShowPendingApproval: () => false,
    setError: value => { error = value; },
  };
  const refresh = findCallback("app/components/AuthProvider.tsx", node =>
    ts.isCallExpression(node) && node.expression.getText() === "useCallback" &&
    ts.isVariableDeclaration(node.parent) && node.parent.name.getText() === "refreshUser");
  await evaluate(`(${refresh})()`, context);
  assert.equal(user === null, response.status === 401);
  assert.equal(removed, response.status === 401 ? 1 : 0);

  removed = 0;
  const effect = findCallback("app/perfil/page.tsx", node =>
    ts.isCallExpression(node) && node.expression.getText() === "useEffect" &&
    node.arguments[0].getText().includes('fetch(reapplication ? "/api/auth/reapplication-profile"'));
  evaluate(`(${effect})()`, context);
  await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal(redirected, response.status === 401 ? 1 : 0);
  assert.equal(removed, response.status === 401 ? 1 : 0);
  assert.equal(Boolean(error), !response.ok && response.status !== 401);
}

(async () => {
  await check(200, JSON.stringify({ id: "user-1", role: "SUGAR_BABY" }));
  for (const status of [401, 403, 429, 500, 502, 503]) {
    await check(status, JSON.stringify({ message: "Request failed" }));
  }
  await check(200, "invalid json");
  await check(200, "null");
  await check(200, "{}", true);
  console.log("Profile session regression: 10 scenarios passed across API, auth provider and profile loading.");
})().catch(error => { console.error(error); process.exitCode = 1; });
