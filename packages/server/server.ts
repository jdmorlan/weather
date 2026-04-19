const UI_DIST = process.env.UI_DIST ?? `${import.meta.dir}/../ui/dist`;
const TEMPEST_TOKEN = process.env.TEMPEST_TOKEN;
const TEMPEST_STATION_ID = process.env.TEMPEST_STATION_ID;
if (!TEMPEST_TOKEN) throw new Error("TEMPEST_TOKEN env var required");
if (!TEMPEST_STATION_ID) throw new Error("TEMPEST_STATION_ID env var required");

const PORT = Number(process.env.PORT ?? 8080);
const SERVE_STATIC = process.env.SERVE_STATIC !== "false";
const VITE_DEV_URL = process.env.VITE_DEV_URL ?? "http://localhost:5173";

const NOAA_BASE =
  "https://mapservices.weather.noaa.gov/vector/rest/services/outlooks/SPC_wx_outlks/MapServer";
const TEMPEST_BASE = "https://swd.weatherflow.com/swd/rest";
const NWS_BASE = "https://api.weather.gov";
const NWS_USER_AGENT = "weather.hl.jmorlan.com (jay.d.morlan@gmail.com)";

// Bun's fetch auto-decompresses gzip/br responses but preserves the upstream
// Content-Encoding header; strip it (and stale Content-Length) before forwarding
// so browsers don't try to decompress already-decompressed bytes.
function forward(res: Response): Response {
  const headers = new Headers(res.headers);
  headers.delete("content-encoding");
  headers.delete("content-length");
  return new Response(res.body, { status: res.status, headers });
}

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname.startsWith("/api/spc")) {
      const upstream = new URL(
        NOAA_BASE + url.pathname.replace("/api/spc", "") + url.search,
      );
      return forward(await fetch(upstream));
    }

    if (url.pathname.startsWith("/api/tempest")) {
      const upstream = new URL(TEMPEST_BASE + url.pathname.replace("/api/tempest", ""));
      for (const [k, v] of url.searchParams) upstream.searchParams.set(k, v);
      upstream.searchParams.set("station_id", TEMPEST_STATION_ID);
      upstream.searchParams.set("token", TEMPEST_TOKEN);
      return forward(await fetch(upstream));
    }

    if (url.pathname.startsWith("/api/nws")) {
      const upstream = new URL(
        NWS_BASE + url.pathname.replace("/api/nws", "") + url.search,
      );
      return forward(await fetch(upstream, {
        headers: {
          "User-Agent": NWS_USER_AGENT,
          "Accept": "application/geo+json",
        },
      }));
    }

    if (!SERVE_STATIC) {
      // Dev: pass-through to Vite. HMR WebSocket connects to :5173 directly
      // (see packages/ui/vite.config.ts: hmr.clientPort), so only HTTP lands here.
      const upstream = `${VITE_DEV_URL}${url.pathname}${url.search}`;
      return forward(await fetch(upstream, {
        method: req.method,
        headers: req.headers,
        body: req.body,
        redirect: "manual",
      }));
    }

    const filePath = url.pathname === "/" ? "/index.html" : url.pathname;
    const file = Bun.file(UI_DIST + filePath);
    if (await file.exists()) return new Response(file);
    return new Response(Bun.file(`${UI_DIST}/index.html`));
  },
});

console.log(`weather server listening on :${PORT} (static=${SERVE_STATIC})`);
