"use client";

import { useState, useCallback } from "react";
import { Share2, Check } from "lucide-react";

interface ShareLinkButtonProps {
  url: string;
  label: string;
}

export default function ShareLinkButton({ url, label }: ShareLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [url]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2 text-sm font-bold transition-all ${
        copied
          ? "border-green-400 bg-green-50 text-green-700"
          : "border-showcase-purple/20 bg-showcase-purple/5 text-showcase-purple hover:bg-showcase-purple/10"
      }`}
    >
      {copied ? (
        <Check className="h-4 w-4" />
      ) : (
        <Share2 className="h-4 w-4" />
      )}
      {copied ? "Link Copied!" : label}
    </button>
  );
}
