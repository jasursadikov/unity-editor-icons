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

/** File ID shown as plain mono text with an icon copy button. */
function IdField({ id }: { id: string }) {
  return (
    <span className="id-field" title="File ID">
      <span className="id-value">{id}</span>
      <CopyButton text={id} title="Copy File ID" className="icon-copy" />
    </span>
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
        width={icon.width || undefined}
        height={icon.height || undefined}
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
      <CopyButton text={icon.name} title="Copy name" className="icon-copy" />
    </div>
  );
}

/** List row — single line: name (+copy), resolution, and ID on the right. */
export function IconRow({ icon, base, repo, branch }: Props) {
  return (
    <li className="row" style={{ contentVisibility: "auto" } as React.CSSProperties}>
      <Thumb icon={icon} base={base} />
      <NameCell icon={icon} repo={repo} branch={branch} />
      {icon.size && <span className="res">{icon.size}</span>}
      <div className="right">{icon.fileId && <IdField id={icon.fileId} />}</div>
    </li>
  );
}

/** Grid card: size in the top-right corner, centered thumbnail, name + ID. */
export function IconCard({ icon, base, repo, branch }: Props) {
  return (
    <li className="card" style={{ contentVisibility: "auto" } as React.CSSProperties}>
      {icon.size && <span className="card-size">{icon.size}</span>}
      <Thumb icon={icon} base={base} />
      <NameCell icon={icon} repo={repo} branch={branch} />
      <div className="bottom">
        {icon.fileId && <IdField id={icon.fileId} />}
      </div>
    </li>
  );
}
