// ── null — Pages Function: maintenance gate ────────────────────────────────
//
// Runs in front of every request to null.inpriv.xyz. If admin.inpriv.xyz
// has flipped the "null" switch (or the global kill switch), serves the
// shared Inpriv maintenance page. /api/health always passes.
//
// State source:
//   GET https://admin.inpriv.xyz/public/state
//
// Cache: 3 s in-isolate, plus ~2 s edge cache on the admin endpoint
// itself (admin's publicState response is cached with cache-control:
// public, max-age=5, stale-while-revalidate=30). Total worst-case
// staleness for a kill switch: ~8 s. Acceptable.
//
// Fail-open: if the admin endpoint is unreachable, the game stays
// available — losing a kill switch is far less bad than accidentally
// locking everyone out.

const GATE_URL = "https://admin.inpriv.xyz/public/state";
const SERVICE_ID = "null";
const GATE_TTL_MS = 3000;

let cache = { data: null, until: 0 };

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  // /api/health always passes — used by monitoring to confirm Pages
  // is alive even when the gate is closed.
  if (url.pathname === "/api/health") {
    return new Response(JSON.stringify({ ok: true, service: "null" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }

  let locked = false;
  let message = "";
  let info = null;
  try {
    const gate = await getGate();
    locked = gate.locked;
    message = gate.message;
    info = gate.info;
  } catch (_) {
    // fail open — game stays playable
  }

  if (locked) {
    return new Response(maintenancePage(message), {
      status: 503,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "retry-after": "300",
        "cache-control": "no-store",
      },
    });
  }

  // Pass through to the static asset (the actual level page).
  const res = await next();

  // If admin has an active global info banner, surface it as a small
  // sticky note at the top of every level page. We do this by string-
  // splicing into the HTML — Pages lets us mutate the response body
  // because the gate runs first and serves the cached asset after.
  if (info && res.headers.get("content-type")?.includes("text/html")) {
    return await injectInfoBanner(res, info);
  }
  return res;
}

async function getGate() {
  const now = Date.now();
  if (cache.data && cache.until > now) return cache.data;

  const res = await fetch(GATE_URL, {
    headers: { "User-Agent": "inpriv-gate/null-pages" },
    cf: { cacheTtl: 2, cacheEverything: true },
  });
  const st = await res.json();
  cache = { data: project(st), until: now + GATE_TTL_MS };
  return cache.data;
}

function project(st) {
  const svc = (st.services && st.services[SERVICE_ID]) || { locked: false, message: "" };
  const locked = !!(st.global && st.global.locked) || !!svc.locked;
  const message =
    (st.global && st.global.locked && st.global.message) || svc.message || "";
  const info = st.info && st.info.active ? st.info.message : null;
  return { locked, message, info };
}

async function injectInfoBanner(res, info) {
  const html = await res.text();
  // Only inject on the game pages, not on _headers/_redirects or static
  // asset responses (those don't get here because content-type is filtered
  // above). On every level page, prepend a small dismissable banner.
  const banner =
    `<div id="info-banner" style="position:sticky;top:0;z-index:100;` +
    `padding:8px 12px;background:#242229;color:#CBBEFF;border-bottom:` +
    `1px solid #47464F;font:13px/1.4 ui-monospace,Menlo,monospace;text-align:center;">` +
    escapeHtml(info) +
    `</div>`;
  // Insert before <main>. If no <main> tag, fall back to <body>.
  const out = html.includes("<main>")
    ? html.replace("<main>", banner + "<main>")
    : html.replace(/<body[^>]*>/, (m) => m + banner);
  return new Response(out, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  });
}

function maintenancePage(message) {
  const msg = message
    ? `<p class="msg">${escapeHtml(message)}</p>`
    : "";
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex">
<title>null — temporarily unavailable</title>
<style>
:root{color-scheme:dark}
*{margin:0;padding:0;box-sizing:border-box}
body{min-height:100vh;display:grid;place-items:center;
     font:16px/1.6 'Roboto Flex',system-ui,-apple-system,sans-serif;
     background:radial-gradient(ellipse 80% 50% at 50% -10%,#242229,transparent),#141218;
     color:#E6E1E3;padding:20px;-webkit-font-smoothing:antialiased}
.box{max-width:460px;width:100%;padding:52px 40px;text-align:center;
     background:rgba(26,28,23,0.85);backdrop-filter:blur(28px) saturate(180%);-webkit-backdrop-filter:blur(28px) saturate(180%);
     border:1px solid rgba(141,146,131,0.25);border-radius:28px;
     box-shadow:0 16px 48px -8px rgba(0,0,0,0.6);
     animation:rise .5s cubic-bezier(0.2,1.4,0,1) both}
@keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.box{animation:none}}
.icon{width:68px;height:68px;border-radius:20px;background:#4B21BD;color:#E6DEFF;
      display:grid;place-items:center;margin:0 auto 22px;box-shadow:0 8px 24px rgba(0,0,0,0.35)}
.icon svg{width:32px;height:32px;stroke:#E6DEFF}
h1{font-size:1.4rem;font-weight:700;letter-spacing:-0.01em;margin-bottom:10px;color:#E6E1E3}
p{color:#CBC4D4;font-size:.92rem;line-height:1.55}
.msg{margin:18px auto 0;padding:12px 18px;border-radius:14px;background:#1E2416;
     border:1px solid #47464F;color:#CBBEFF;font-weight:500;display:inline-block;word-break:break-word;max-width:100%}
.status{display:inline-flex;align-items:center;gap:8px;margin-top:20px;padding:6px 14px;
        border-radius:9999px;background:#3A373F;color:#E6E1E3;font-size:.8rem;font-weight:600;letter-spacing:.03em}
.btn{display:inline-flex;align-items:center;gap:8px;margin-top:28px;padding:12px 26px;
     border-radius:9999px;background:#CBBEFF;color:#340098;font-weight:700;font-size:.92rem;
     text-decoration:none;transition:transform .2s cubic-bezier(0.2,1.4,0,1),box-shadow .2s;
     box-shadow:0 6px 20px -4px rgba(171,211,122,0.45)}
.btn:hover{transform:translateY(-2px);box-shadow:0 10px 26px -4px rgba(171,211,122,0.55)}
.btn:active{transform:translateY(0)}
.btn svg{width:17px;height:17px;stroke:#340098}
.home{display:inline-block;margin-top:16px;color:#948F99;text-decoration:none;font-size:.85rem;transition:color .2s}
.home:hover{color:#E6DEFF}
</style></head><body>
<div class="box">
  <div class="icon">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 6v6l4 2"></path>
    </svg>
  </div>
  <h1>null is taking a short break</h1>
  <p>This puzzle chain is paused for maintenance.<br>Everything is safe — it will be back shortly.</p>
  ${msg}
  <div class="status">Paused — checking availability…</div>
  <br>
  <a class="btn" href="#" onclick="location.reload();return false">
    Try again
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12a9 9 0 1 1-2.64-6.36"></path><path d="M21 3v6h-6"></path>
    </svg>
  </a>
  <br>
  <a class="home" href="https://inpriv.xyz">Browse other Inpriv tools</a>
</div>
<script>
  // Auto-retry: when the service is unlocked, return to it automatically.
  (function () {
    var tries = 0;
    var statusEl = document.querySelector('.status');
    setInterval(function () {
      tries++;
      fetch(location.href, { method: 'HEAD', cache: 'no-store' })
        .then(function (r) {
          if (r.ok) {
            statusEl.innerHTML = 'Back online — loading…';
            setTimeout(function () { location.reload(); }, 600);
          } else if (statusEl && tries % 5 === 0) {
            statusEl.innerHTML = 'Still paused — will keep checking';
          }
        })
        .catch(function () {});
    }, 5000);
  })();
</script>
</body></html>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}