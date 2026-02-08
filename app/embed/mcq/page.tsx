"use client";

import { useState, useEffect } from "react";
import MCQQuizViewer from "@/components/embed/MCQQuizViewer";
import type { MCQQuestion, MCQEmbedTheme } from "@/components/tools/mcq-maker/types";
import { DEFAULT_EMBED_THEME } from "@/components/tools/mcq-maker/types";

/**
 * Embed route for the MCQ quiz viewer.
 *
 * Quiz data is encoded in the URL hash fragment as base64 JSON:
 *   /embed/mcq#BASE64_ENCODED_JSON
 *
 * The JSON payload shape:
 *   {
 *     questions: MCQQuestion[],
 *     theme?: Partial<MCQEmbedTheme>,
 *     title?: string,
 *     timeLimit?: number,
 *     passingScore?: number,
 *   }
 *
 * Using the hash fragment keeps data client-side (never sent to server)
 * and avoids URL length limits on some servers since hash isn't sent in
 * HTTP requests.
 */

interface EmbedPayload {
  questions: MCQQuestion[];
  theme?: Partial<MCQEmbedTheme>;
  title?: string;
  timeLimit?: number;
  passingScore?: number;
}

export default function MCQEmbedPage() {
  const [payload, setPayload] = useState<EmbedPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const hash = window.location.hash.slice(1); // Remove leading #
      if (!hash) {
        setError("No quiz data found. The embed URL may be incomplete.");
        return;
      }

      const json = decodeURIComponent(escape(atob(hash)));
      const data = JSON.parse(json) as EmbedPayload;

      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        setError("No valid questions in the quiz data.");
        return;
      }

      setPayload(data);
    } catch {
      setError("Failed to decode quiz data. The embed URL may be corrupted.");
    }
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-center">
        <div>
          <p className="text-lg font-bold text-gray-800 mb-2">
            Could not load quiz
          </p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-stretch">
      <div className="flex-1">
        <MCQQuizViewer
          questions={payload.questions}
          theme={payload.theme}
          title={payload.title}
          timeLimit={payload.timeLimit}
          passingScore={payload.passingScore}
        />
      </div>
    </div>
  );
}
