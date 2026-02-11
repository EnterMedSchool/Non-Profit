"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { NextIntlClientProvider, useTranslations } from "next-intl";
import type { MCQQuestion, MCQEmbedTheme } from "@/components/tools/mcq-maker/types";

const MCQQuizViewer = dynamic(
  () => import("@/components/embed/MCQQuizViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-purple-500" />
      </div>
    ),
  }
);

type McqErrorKey = "noQuizData" | "noValidQuestions" | "decodeFailed";

function MCQEmbedError({ errorKey }: { errorKey: McqErrorKey }) {
  const t = useTranslations("embed.mcqErrors");
  return (
    <div className="flex min-h-screen items-center justify-center p-8 text-center">
      <div>
        <p className="text-lg font-bold text-gray-800 mb-2">
          {t("couldNotLoadQuiz")}
        </p>
        <p className="text-sm text-gray-500">{t(errorKey)}</p>
      </div>
    </div>
  );
}

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
  const [errorKey, setErrorKey] = useState<McqErrorKey | null>(null);
  const [messages, setMessages] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    import("@/i18n/messages/en.json").then((mod) => setMessages(mod.default));
  }, []);

  useEffect(() => {
    try {
      const hash = window.location.hash.slice(1); // Remove leading #
      if (!hash) {
        setErrorKey("noQuizData");
        return;
      }

      const json = decodeURIComponent(escape(atob(hash)));
      const data = JSON.parse(json) as EmbedPayload;

      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        setErrorKey("noValidQuestions");
        return;
      }

      setPayload(data);
    } catch {
      setErrorKey("decodeFailed");
    }
  }, []);

  if (!messages) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-purple-500" />
      </div>
    );
  }

  if (errorKey) {
    return (
      <NextIntlClientProvider locale="en" messages={messages}>
        <MCQEmbedError errorKey={errorKey} />
      </NextIntlClientProvider>
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
    <NextIntlClientProvider locale="en" messages={messages}>
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
    </NextIntlClientProvider>
  );
}
