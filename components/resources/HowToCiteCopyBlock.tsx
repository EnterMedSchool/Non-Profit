"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface Props {
  code: string;
  label: string;
}

export default function HowToCiteCopyBlock({ code, label }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="mt-4 relative">
      <pre className="rounded-xl bg-white border-2 border-ink-light/10 p-4 pr-12 text-sm text-ink-dark leading-relaxed whitespace-pre-wrap break-words font-body">
        {code}
      </pre>
      <button
        onClick={handleCopy}
        className={`absolute right-3 top-3 flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold transition-all ${
          copied
            ? "bg-showcase-green/10 text-showcase-green"
            : "bg-pastel-lavender text-showcase-purple hover:bg-showcase-purple/10"
        }`}
        aria-label={`Copy ${label} citation`}
      >
        {copied ? (
          <>
            <Check className="h-3 w-3" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" />
            Copy
          </>
        )}
      </button>
    </div>
  );
}
