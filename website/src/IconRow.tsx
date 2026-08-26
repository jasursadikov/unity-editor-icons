import { useState } from "react";
import type { Icon } from "./types";

interface Props {
  icon: Icon;
  base: string;
  repo: string;
  branch: string;
}

function ClipboardIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
      <path
        d="M5 15V5a2 2 0 0 1 2-2h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Read-only File ID input merged with an icon copy button. */
function IdField({ id }: { id: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(id);
      setDone(true);
      setTimeout(() => setDone(false), 1000);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <div className="id-field" title="File ID">
      <span className="id-label">ID</span>
      <input
        className="id-input"
        value={id}
        readOnly
        size={id.length}
        onFocus={(e) => e.currentTarget.select()}
      />
      <button
        className={done ? "id-copy copied" : "id-copy"}
        onClick={copy}
        title="Copy File ID"
        aria-label="Copy File ID"
      >
        {done ? <CheckIcon /> : <ClipboardIcon />}
      </button>
    </div>
  );
}

function Thumb({ icon, base }: { icon: Icon; base: string }) {
  return (
    <div className="thumb">
      <img
        src={`${base}${icon.img}`}
        alt={icon.name}
        loading="lazy"
        decoding="async"
        width={Math.min(icon.width || 32, 48)}
        height={Math.min(icon.height || 32, 48)}
      />
    </div>
  );
}

function Bottom({ icon }: { icon: Icon }) {
  return (
    <div className="bottom">
      {icon.size && <span className="tag">{icon.size}</span>}
      {icon.dark && <span className="tag dark-tag">dark</span>}
      {icon.fileId && <IdField id={icon.fileId} />}
    </div>
  );
}

/** List row: thumbnail on the left, name on top, values + ID field below. */
export function IconRow({ icon, base, repo, branch }: Props) {
  const metaUrl = `https://github.com/${repo}/blob/${branch}/${icon.meta}`;
  return (
    <li className="row" style={{ contentVisibility: "auto" } as React.CSSProperties}>
      <Thumb icon={icon} base={base} />
      <div className="meta">
        <a className="name" href={metaUrl} target="_blank" rel="noreferrer">
          {icon.name}
        </a>
        <Bottom icon={icon} />
      </div>
    </li>
  );
}

/** Grid card: centered thumbnail, name below, values + ID field at bottom. */
export function IconCard({ icon, base, repo, branch }: Props) {
  const metaUrl = `https://github.com/${repo}/blob/${branch}/${icon.meta}`;
  return (
    <li className="card" style={{ contentVisibility: "auto" } as React.CSSProperties}>
      <Thumb icon={icon} base={base} />
      <a className="name" href={metaUrl} target="_blank" rel="noreferrer" title={icon.name}>
        {icon.name}
      </a>
      <Bottom icon={icon} />
    </li>
  );
}
