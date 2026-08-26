import { useState } from "react";
import type { Icon } from "./types";

interface Props {
  icon: Icon;
  base: string;
  repo: string;
  branch: string;
}

function Copy({ text, label }: { text: string; label: string }) {
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

export function IconRow({ icon, base, repo, branch }: Props) {
  const src = `${base}${icon.img}`;
  const metaUrl = `https://github.com/${repo}/blob/${branch}/${icon.meta}`;

  return (
    <li className="row" style={{ contentVisibility: "auto" } as React.CSSProperties}>
      <div className="thumb">
        <img
          src={src}
          alt={icon.name}
          loading="lazy"
          decoding="async"
          width={Math.min(icon.width || 32, 48)}
          height={Math.min(icon.height || 32, 48)}
        />
      </div>

      <div className="meta">
        <a className="name" href={metaUrl} target="_blank" rel="noreferrer">
          {icon.name}
        </a>
        <div className="tags">
          {icon.size && <span className="tag">{icon.size}</span>}
          {icon.dark && <span className="tag dark-tag">dark</span>}
          {icon.fileId && <span className="tag id">id {icon.fileId}</span>}
        </div>
      </div>

      <div className="actions">
        <Copy text={icon.name} label="Name" />
        <Copy
          text={`EditorGUIUtility.IconContent("${icon.name}")`}
          label="C#"
        />
        {icon.fileId && <Copy text={icon.fileId} label="File ID" />}
      </div>
    </li>
  );
}
