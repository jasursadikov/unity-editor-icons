import { useEffect, useMemo, useRef, useState } from "react";
import type { Icon, IconsData } from "./types";
import { IconRow, IconCard } from "./IconRow";

const REPO = "jasursadikov/unity-editor-icons";
const BRANCH = "master";
const PAGE = 200; // rows appended per scroll batch

type View = "list" | "grid";

const base = import.meta.env.BASE_URL;

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="4" cy="6" r="1.5" fill="currentColor" />
      <circle cx="4" cy="12" r="1.5" fill="currentColor" />
      <circle cx="4" cy="18" r="1.5" fill="currentColor" />
      <path
        d="M9 6h11M9 12h11M9 18h11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" />
    </svg>
  );
}

export function App() {
  const [data, setData] = useState<IconsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
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
    if (!q) return icons;
    return icons.filter((icon) => icon.name.toLowerCase().includes(q));
  }, [data, query]);

  // Reset the incremental window whenever the result set changes.
  useEffect(() => setLimit(PAGE), [query]);

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
          <span className="ver">{data ? data.version : "Loading…"}</span>
        </div>

        <div className="controls">
          <div className="search-bar">
            <input
              className="search"
              type="search"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <button className="search-btn" aria-label="Search" title="Search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M21 21l-4.3-4.3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          <div className="tools">
            <div className="toggle-group view" role="group" aria-label="View">
              <button
                className={view === "list" ? "toggle active" : "toggle"}
                onClick={() => setView("list")}
                title="List view"
                aria-label="List view"
                aria-pressed={view === "list"}
              >
                <ListIcon />
              </button>
              <button
                className={view === "grid" ? "toggle active" : "toggle"}
                onClick={() => setView("grid")}
                title="Grid view"
                aria-label="Grid view"
                aria-pressed={view === "grid"}
              >
                <GridIcon />
              </button>
            </div>
          </div>
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

        <ul className={`list view-${view}`}>
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
