import { useState } from "react";
import type { Icon } from "./types";

interface Props {
  icon: Icon;
  base: string;
  repo: string;
  branch: string;
}

export function Copy({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className={done ? "copy copied" : "copy"}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1000);
        } catch {
          /* clipboard unavailable */
        }
      }}
      title={`Copy ${label}`}
    >
      {done ? "Copied" : label}
    </button>
  );
}

function Actions({ icon }: { icon: Icon }) {
  return (
    <div className="actions">
      <Copy text={icon.name} label="Name" />
      <Copy text={`EditorGUIUtility.IconContent("${icon.name}")`} label="C#" />
      {icon.fileId && (
        <>
          <span className="tag id">id {icon.fileId}</span>
          <Copy text={icon.fileId} label="ID" />
        </>
      )}
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

/** List row: thumbnail on the left, name on top, values + copy buttons below. */
export function IconRow({ icon, base, repo, branch }: Props) {
  const metaUrl = `https://github.com/${repo}/blob/${branch}/${icon.meta}`;
  return (
    <li className="row" style={{ contentVisibility: "auto" } as React.CSSProperties}>
      <Thumb icon={icon} base={base} />
      <div className="meta">
        <a className="name" href={metaUrl} target="_blank" rel="noreferrer">
          {icon.name}
        </a>
        <div className="bottom">
          {icon.size && <span className="tag">{icon.size}</span>}
          {icon.dark && <span className="tag dark-tag">dark</span>}
          <Actions icon={icon} />
        </div>
      </div>
    </li>
  );
}

/** Grid card: centered thumbnail, name below, values + copy buttons at bottom. */
export function IconCard({ icon, base, repo, branch }: Props) {
  const metaUrl = `https://github.com/${repo}/blob/${branch}/${icon.meta}`;
  return (
    <li className="card" style={{ contentVisibility: "auto" } as React.CSSProperties}>
      <Thumb icon={icon} base={base} />
      <a className="name" href={metaUrl} target="_blank" rel="noreferrer" title={icon.name}>
        {icon.name}
      </a>
      <div className="bottom">
        {icon.size && <span className="tag">{icon.size}</span>}
        {icon.dark && <span className="tag dark-tag">dark</span>}
        <Actions icon={icon} />
      </div>
    </li>
  );
}
