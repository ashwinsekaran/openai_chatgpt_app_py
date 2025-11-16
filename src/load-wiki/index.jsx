import React, { useMemo } from "react";
import { createRoot } from "react-dom/client";
import { useWidgetProps } from "../use-widget-props";

// Utilities
function toWikipediaTitle(q) {
    // Try to extract text inside quotes first
    const quoted = q.match(/['"`]([^'"`]+)['"`]/);
    const raw = quoted ? quoted[1] : q.replace(/^\s*who\s+is\s+/i, "").trim();
    if (!raw) return null;
    // Basic normalization for Wikipedia URLs
    return raw.replace(/\s+/g, "_");
}

function buildWikipediaUrl(q) {
    const title = toWikipediaTitle(q);
    return title ? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}` : null;
}

function buildAdditionDataUrl(a, b) {
    const aNum = Number(a);
    const bNum = Number(b);
    const sum = (Number.isFinite(aNum) ? aNum : 0) + (Number.isFinite(bNum) ? bNum : 0);

    const html = `
<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Addition Result</title>
<style>
  :root { color-scheme: dark; }
  body {
    margin: 0; min-height: 100vh; display: grid; place-items: center;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial;
    background: radial-gradient(1200px 600px at 10% -20%, #11203a 0%, #0b1220 60%), #0b1220; color: #e6eefc;
  }
  .card {
    width: min(560px, 92vw);
    background: linear-gradient(180deg, rgba(109,40,217,0.14), rgba(59,130,246,0.1)), #111a2b;
    border: 1px solid rgba(148,163,184,0.18);
    border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.35);
    padding: 20px 22px;
  }
  .title {
    display: flex; gap: 8px; align-items: center; margin: 2px 0 14px 0;
    font-size: 16px; color: #9bb0d3; letter-spacing: 0.3px;
  }
  .result {
    display: flex; align-items: center; justify-content: center;
    font-size: clamp(32px, 6vw, 48px); font-weight: 800; letter-spacing: 0.4px; margin: 6px 0 10px 0;
    background: linear-gradient(90deg, #6ee7ff, #a78bfa); -webkit-background-clip: text; background-clip: text; color: transparent;
    text-shadow: 0 2px 16px rgba(110, 231, 255, 0.22);
  }
  .pills {
    display: flex; gap: 10px; align-items: center; justify-content: center; color: #9bb0d3; font-size: 14px;
  }
  .pill {
    border: 1px solid rgba(148,163,184,0.24); border-radius: 999px; padding: 6px 10px; background: rgba(2,6,23,0.28);
  }
  .pill--sum { color: #10b981; font-weight: 600; }
</style>
<div class="card">
  <div class="title">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
    Simple addition result
  </div>
  <div class="result">${aNum} + ${bNum} = ${sum}</div>
  <div class="pills">
    <span class="pill">a = ${aNum}</span>
    <span class="pill">b = ${bNum}</span>
    <span class="pill pill--sum">sum = ${sum}</span>
  </div>
</div>
</html>
  `.trim();

    return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

function parseAddition(query) {
    // Matches: "add 300 and 200" (integers or decimals, optional sign)
    const m = query.match(/\badd\s+(-?\d+(?:\.\d+)?)\s+and\s+(-?\d+(?:\.\d+)?)/i);
    if (!m) return null;
    return { a: m[1], b: m[2] };
}

function isHttpUrl(s) {
    try {
        const u = new URL(s);
        return u.protocol === "http:" || u.protocol === "https:";
    } catch {
        return false;
    }
}

function App() {
    // Props you can pass in:
    // - query: natural-language request, e.g., "who is 'sachin tendulkar'" or "add 300 and 200"
    // - url: direct URL to load (overrides query)
    const { query = "", url = "" } = useWidgetProps({ query: "", url: "" });

    const iframeSrc = useMemo(() => {
        // If explicit URL provided, use it
        if (url && isHttpUrl(url)) return url;

        // Try addition pattern
        const add = parseAddition(query);
        if (add) return buildAdditionDataUrl(add.a, add.b);

        // Try "who is ..." -> Wikipedia
        if (/^\s*who\s+is\b/i.test(query) || /wikipedia/i.test(query)) {
            const wiki = buildWikipediaUrl(query);
            if (wiki) return wiki;
        }

        // If query looks like a URL, use it
        if (isHttpUrl(query)) return query;

        // Fallback: tiny helper page
        const fallback = `
<!doctype html>
<meta charset="utf-8">
<title>Web View</title>
<style>
  :root { color-scheme: dark; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial;
    background: radial-gradient(1200px 600px at 10% -20%, #11203a 0%, #0b1220 60%), #0b1220; color: #e6eefc;
    padding: 24px; text-align: center;
  }
  .box {
    width: min(620px, 92vw);
    background: linear-gradient(180deg, rgba(109,40,217,0.14), rgba(59,130,246,0.1)), #111a2b;
    border: 1px solid rgba(148,163,184,0.18);
    border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.35);
    padding: 22px;
  }
  code { color: #a5b4fc }
</style>
<div class="box">
  <h2>Enter a query</h2>
  <p>Try queries like:</p>
  <p><code>who is 'sachin tendulkar'</code> or <code>add 300 and 200</code></p>
</div>
`;
        return `data:text/html;charset=utf-8,${encodeURIComponent(fallback)}`;
    }, [query, url]);

    return (
        <div
            style={{
                height: 520,
                display: "grid",
                placeItems: "center",
                padding: 24,
                background:
                    "radial-gradient(1200px 600px at 10% -20%, #11203a 0%, #0b1220 60%), #0b1220",
                color: "#e6eefc",
                fontFamily:
                    'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial',
            }}
        >
            <div
                style={{
                    width: "min(900px, 96vw)",
                    height: "min(460px, 78vh)",
                    background:
                        "linear-gradient(180deg, rgba(109,40,217,0.14), rgba(59,130,246,0.1)), #111a2b",
                    border: "1px solid rgba(148,163,184,0.18)",
                    borderRadius: 16,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                    overflow: "hidden",
                }}
            >
                <iframe
                    title="Embedded Webpage"
                    src={iframeSrc}
                    style={{ width: "100%", height: "100%", border: "none" }}
                    // Sandbox for a safer embed; relax as needed
                    sandbox="allow-scripts allow-forms allow-pointer-lock allow-popups allow-same-origin"
                    referrerPolicy="no-referrer"
                />
            </div>
        </div>
    );
}

createRoot(document.getElementById("add-result-root")).render(<App />);