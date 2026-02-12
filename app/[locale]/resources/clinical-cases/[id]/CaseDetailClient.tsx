"use client";

import { useCallback } from "react";
import { Download } from "lucide-react";

interface CaseDetailClientProps {
  studentUrl: string;
}

export default function CaseDetailClient({ studentUrl }: CaseDetailClientProps) {
  const handleDownloadQr = useCallback(async () => {
    try {
      const QRCode = (await import("qrcode")).default;
      const dataUrl = await QRCode.toDataURL(studentUrl, {
        width: 512,
        margin: 2,
        color: { dark: "#1a1a2e", light: "#ffffff" },
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "clinical-case-qr.png";
      link.click();
    } catch {
      // Fallback: copy the URL
      await navigator.clipboard.writeText(studentUrl);
      alert("QR generation failed. Student link copied to clipboard instead.");
    }
  }, [studentUrl]);

  return (
    <button
      onClick={handleDownloadQr}
      className="inline-flex items-center gap-1.5 rounded-xl border-2 border-showcase-purple/30 bg-showcase-purple/5 px-4 py-2 text-xs font-bold text-showcase-purple transition-all hover:bg-showcase-purple/10"
    >
      <Download className="h-3.5 w-3.5" />
      Download QR
    </button>
  );
}
