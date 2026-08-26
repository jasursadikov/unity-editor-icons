import { useEffect, useMemo, useRef, useState } from "react";
import type { Icon, IconsData } from "./types";
import { IconRow, IconCard } from "./IconRow";

const REPO = "jasursadikov/unity-editor-icons";
const BRANCH = "master";
const PAGE = 200; // rows appended per scroll batch

type Preview = "dark" | "light" | "checker";
type Variant = "all" | "light" | "dark";
type View = "list" | "grid";

const base = import.meta.env.BASE_URL;

export function App() {
  const [data, setData] = useState<IconsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState<Preview>("dark");
  const [variant, setVariant] = useState<Variant>("all");
  const [view, setView] = useState<View>("list");
  const [limit, setLimit] = useState(PAGE);
  const sentinel = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch(`${base}icons.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d: IconsData) => setData(d))
      .catch((e) => setError(String(e)));
  }, []);

  const filtered = useMemo(() => {
    const icons = data?.icons ?? [];
    const q = query.trim().toLowerCase();
    return icons.filter((icon) => {
      if (variant === "dark" && !icon.dark) return false;
      if (variant === "light" && icon.dark) return false;
      if (q && !icon.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [data, query, variant]);

  // Reset the incremental window whenever the result set changes.
  useEffect(() => setLimit(PAGE), [query, variant]);

  // Infinite scroll: grow the window as the sentinel comes into view.
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setLimit((n) => Math.min(n + PAGE, filtered.length));
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [filtered.length]);

  const visible = filtered.slice(0, limit);

  return (
    <div className="app">
      <header className="topbar">
        <div className="titles">
          <h1>Unity Editor Built-in Icons</h1>
          <p className="subtitle">
            {data ? (
              <>
                Unity <strong>{data.version}</strong>
              </>
            ) : (
              "Loading…"
            )}
          </p>
        </div>

        <div className="controls">
          <input
            className="search"
            type="search"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <div className="toggle-group" role="group" aria-label="View">
            {(["list", "grid"] as View[]).map((v) => (
              <button
                key={v}
                className={view === v ? "toggle active" : "toggle"}
                onClick={() => setView(v)}
                title={`${v[0].toUpperCase() + v.slice(1)} view`}
              >
                {v === "list" ? "List" : "Grid"}
              </button>
            ))}
          </div>
          <select
            className="select"
            aria-label="Variant"
            value={variant}
            onChange={(e) => setVariant(e.target.value as Variant)}
          >
            <option value="all">All</option>
            <option value="light">Light</option>
            <option value="dark">Dark (d_)</option>
          </select>
          <select
            className="select"
            aria-label="Preview background"
            value={preview}
            onChange={(e) => setPreview(e.target.value as Preview)}
          >
            <option value="dark">Dark bg</option>
            <option value="light">Light bg</option>
            <option value="checker">Checker bg</option>
          </select>
        </div>
      </header>

      <main>
        {error && <div className="notice error">Failed to load icons: {error}</div>}
        {data && filtered.length === 0 && (
          <div className="notice">No icons match “{query}”.</div>
        )}

        <div className="result-count">
          {data ? `${filtered.length} result${filtered.length === 1 ? "" : "s"}` : ""}
        </div>

        <ul className={`list preview-${preview} view-${view}`}>
          {visible.map((icon: Icon) =>
            view === "grid" ? (
              <IconCard
                key={icon.meta}
                icon={icon}
                base={base}
                repo={REPO}
                branch={BRANCH}
              />
            ) : (
              <IconRow
                key={icon.meta}
                icon={icon}
                base={base}
                repo={REPO}
                branch={BRANCH}
              />
            )
          )}
        </ul>
        <div ref={sentinel} className="sentinel" />
        {limit < filtered.length && (
          <div className="notice">Scroll for more… ({limit}/{filtered.length})</div>
        )}
      </main>

      <footer className="footer">
        <a href={`https://github.com/${REPO}`}>Repository</a>
        <span>·</span>
        <span>
          Icons mined with <code>IconsMiner.cs</code>. Original script by{" "}
          <a href="https://github.com/halak">@halak</a>.
        </span>
      </footer>
    </div>
  );
}
