"use client";

import "@/styles/clinical-semiotics.css";
import { useState, useCallback } from "react";
import ClinicalSemioticsExperience from "@/components/clinical-semiotics/ClinicalSemioticsExperience";
import ClinicalSemioticsEmbedConfigurator from "@/components/clinical-semiotics/ClinicalSemioticsEmbedConfigurator";
import AttributionReminderModal from "@/components/resources/AttributionReminderModal";
import AttributionBanner from "@/components/resources/AttributionBanner";
import {
  hasValidAttribution,
  generateBadgePngBlob,
  generateAttributionEmbedHtml,
  generateHowToAttributeText,
  loadAttribution,
} from "@/lib/attribution";
export default function ClinicalSemioticsClient() {
  /* ── State ── */
  const [embedExamType, setEmbedExamType] = useState<string | null>(null);
  const [showAttributionModal, setShowAttributionModal] = useState(false);
  const [pendingDownloadExam, setPendingDownloadExam] = useState<string | null>(null);

  /* ── Handlers ── */
  const handleOpenEmbed = useCallback((examType: string) => {
    setEmbedExamType(examType);
  }, []);

  const handleDownload = useCallback((examType: string) => {
    if (hasValidAttribution()) {
      buildAndDownloadZip(examType);
    } else {
      setPendingDownloadExam(examType);
      setShowAttributionModal(true);
    }
  }, []);

  const buildAndDownloadZip = useCallback(async (examType: string) => {
    const attribution = loadAttribution();
    if (!attribution || !attribution.name.trim()) return;

    const [{ default: JSZip }, { saveAs }, { getExamChain, EXAM_COPY }] = await Promise.all([
      import("jszip"),
      import("file-saver"),
      import("@/components/clinical-semiotics/examChains"),
    ]);

    const chain = getExamChain(examType);
    const copy = EXAM_COPY[examType];
    const title = copy?.title ?? examType;

    const zip = new JSZip();

    // 1. Exam chain data
    zip.file("exam-chain.json", JSON.stringify(chain, null, 2));

    // 2. Embed code HTML
    const embedHtml = generateAttributionEmbedHtml(attribution);
    zip.file("embed-code.html", embedHtml);

    // 3. Attribution badge PNG
    const badgeBlob = await generateBadgePngBlob(attribution);
    zip.file("attribution-badge.png", badgeBlob);

    // 4. How-to-attribute text
    const howTo = generateHowToAttributeText(title, attribution);
    zip.file("HOW-TO-ATTRIBUTE.txt", howTo);

    // Generate and download
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `entermedschool-clinical-semiotics-${examType}-assets.zip`);
  }, []);

  const handleAttributionSaved = useCallback(() => {
    if (pendingDownloadExam) {
      buildAndDownloadZip(pendingDownloadExam);
      setPendingDownloadExam(null);
    }
  }, [pendingDownloadExam, buildAndDownloadZip]);

  /* ── Render ── */
  return (
    <>
      {/* Attribution banner for returning users */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mt-4 mb-2">
        <AttributionBanner />
      </div>

      <ClinicalSemioticsExperience
        onOpenEmbed={handleOpenEmbed}
        onDownload={handleDownload}
      />

      {embedExamType && (
        <ClinicalSemioticsEmbedConfigurator
          examType={embedExamType}
          onClose={() => setEmbedExamType(null)}
        />
      )}

      <AttributionReminderModal
        open={showAttributionModal}
        onClose={() => {
          setShowAttributionModal(false);
          setPendingDownloadExam(null);
        }}
        onSaved={handleAttributionSaved}
      />
    </>
  );
}
