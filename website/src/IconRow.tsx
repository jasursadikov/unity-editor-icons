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

function CopyButton({
  text,
  title,
  className,
}: {
  text: string;
  title: string;
  className: string;
}) {
  const [done, setDone] = useState(false);
  return (
    <button
      className={done ? `${className} copied` : className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1000);
        } catch {
          /* clipboard unavailable */
        }
      }}
      title={title}
      aria-label={title}
    >
      {done ? <CheckIcon /> : <ClipboardIcon />}
    </button>
  );
}

/** Read-only File ID input merged with an icon copy button. */
function IdField({ id }: { id: string }) {
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
      <CopyButton text={id} title="Copy File ID" className="merge-copy" />
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

function NameCell({ icon, repo, branch }: Omit<Props, "base">) {
  const metaUrl = `https://github.com/${repo}/blob/${branch}/${icon.meta}`;
  return (
    <div className="name-wrap">
      <a
        className="name"
        href={metaUrl}
        target="_blank"
        rel="noreferrer"
        title={icon.name}
      >
        {icon.name}
      </a>
      <CopyButton text={icon.name} title="Copy name" className="name-copy" />
    </div>
  );
}

/** List row — single line: name (+copy), resolution, and ID on the right. */
export function IconRow({ icon, base, repo, branch }: Props) {
  return (
    <li className="row" style={{ contentVisibility: "auto" } as React.CSSProperties}>
      <Thumb icon={icon} base={base} />
      <NameCell icon={icon} repo={repo} branch={branch} />
      {icon.size && <span className="tag res">{icon.size}</span>}
      <div className="right">{icon.fileId && <IdField id={icon.fileId} />}</div>
    </li>
  );
}

/** Grid card: centered thumbnail, name (+copy), then resolution + ID. */
export function IconCard({ icon, base, repo, branch }: Props) {
  return (
    <li className="card" style={{ contentVisibility: "auto" } as React.CSSProperties}>
      <Thumb icon={icon} base={base} />
      <NameCell icon={icon} repo={repo} branch={branch} />
      <div className="bottom">
        {icon.size && <span className="tag res">{icon.size}</span>}
        {icon.dark && <span className="tag dark-tag">dark</span>}
        {icon.fileId && <IdField id={icon.fileId} />}
      </div>
    </li>
  );
}
