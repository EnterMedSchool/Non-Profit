"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Copy,
  Clipboard,
  Scissors,
  Trash2,
  ChevronsUp,
  ChevronsDown,
  ArrowUp,
  ArrowDown,
  Group,
  Ungroup,
  Lock,
  Unlock,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  Image,
} from "lucide-react";
import { useIllustration } from "./IllustrationContext";
import { useTranslations } from "next-intl";

interface ContextMenuPosition {
  x: number;
  y: number;
}

export default function ContextMenu() {
  const t = useTranslations("tools.illustrationMaker.ui.contextMenu");
  const {
    canvas,
    selectedObjects,
    copySelected,
    pasteClipboard,
    deleteSelected,
    duplicateSelected,
    bringToFront,
    bringForward,
    sendBackward,
    sendToBack,
    groupSelected,
    ungroupSelected,
    lockSelected,
  } = useIllustration();

  const [position, setPosition] = useState<ContextMenuPosition | null>(null);

  const hasSelection = selectedObjects.length > 0;
  const isGroup = selectedObjects.length === 1 && selectedObjects[0]?.type === "group";
  const isMultiSelect =
    selectedObjects.length > 1 ||
    (selectedObjects.length === 1 && selectedObjects[0]?.type === "activeSelection");
  const isLocked = selectedObjects.length > 0 && selectedObjects[0]?.lockMovementX;

  const close = useCallback(() => setPosition(null), []);

  /* ── Listen for right-click on canvas ─────────────────────── */

  useEffect(() => {
    if (!canvas) return;

    const handleRightClick = (opt: any) => {
      const e = opt.e as MouseEvent;
      e.preventDefault();
      e.stopPropagation();

      // If right-clicked on an object, select it
      if (opt.target && !selectedObjects.includes(opt.target)) {
        canvas.setActiveObject(opt.target);
        canvas.renderAll();
      }

      setPosition({ x: e.clientX, y: e.clientY });
    };

    canvas.on("mouse:down", (opt: any) => {
      const e = opt.e as MouseEvent;
      if (e.button === 2) {
        handleRightClick(opt);
      }
    });

    return () => {
      canvas.off("mouse:down");
    };
  }, [canvas, selectedObjects]);

  /* ── Close on click outside / Escape ─────────────────────── */

  useEffect(() => {
    if (!position) return;

    const handleClose = () => close();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    window.addEventListener("click", handleClose);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("click", handleClose);
      window.removeEventListener("keydown", handleKey);
    };
  }, [position, close]);

  if (!position) return null;

  /* ── Menu items ──────────────────────────────────────────── */

  const MenuItem = ({
    icon: Icon,
    label,
    shortcut,
    onClick,
    disabled,
    danger,
  }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    shortcut?: string;
    onClick: () => void;
    disabled?: boolean;
    danger?: boolean;
  }) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) {
          onClick();
          close();
        }
      }}
      disabled={disabled}
      className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors ${
        disabled
          ? "cursor-not-allowed opacity-30"
          : danger
            ? "text-showcase-coral hover:bg-showcase-coral/10"
            : "text-ink-muted hover:bg-pastel-lavender/50 hover:text-ink-dark"
      }`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="flex-1 text-start">{label}</span>
      {shortcut && (
        <kbd className="text-[10px] text-ink-light">{shortcut}</kbd>
      )}
    </button>
  );

  const Separator = () => <div className="my-1 border-t border-showcase-navy/5" />;

  // Adjust position to keep menu on screen
  const menuStyle: React.CSSProperties = {
    position: "fixed",
    left: Math.min(position.x, window.innerWidth - 220),
    top: Math.min(position.y, window.innerHeight - 400),
    zIndex: 100,
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[99]" onClick={close} onContextMenu={(e) => e.preventDefault()} />

      {/* Menu */}
      <div
        style={menuStyle}
        className="w-52 rounded-xl border-3 border-showcase-navy/10 bg-white p-1.5 shadow-chunky"
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem icon={Scissors} label={t("cut")} shortcut="Ctrl+X" onClick={() => { copySelected(); deleteSelected(); }} disabled={!hasSelection} />
        <MenuItem icon={Copy} label={t("copy")} shortcut="Ctrl+C" onClick={copySelected} disabled={!hasSelection} />
        <MenuItem icon={Clipboard} label={t("paste")} shortcut="Ctrl+V" onClick={pasteClipboard} />
        <MenuItem icon={Image} label={t("duplicate")} shortcut="Ctrl+D" onClick={duplicateSelected} disabled={!hasSelection} />

        <Separator />

        <MenuItem icon={ChevronsUp} label={t("bringToFront")} onClick={bringToFront} disabled={!hasSelection} />
        <MenuItem icon={ArrowUp} label={t("bringForward")} onClick={bringForward} disabled={!hasSelection} />
        <MenuItem icon={ArrowDown} label={t("sendBackward")} onClick={sendBackward} disabled={!hasSelection} />
        <MenuItem icon={ChevronsDown} label={t("sendToBack")} onClick={sendToBack} disabled={!hasSelection} />

        <Separator />

        <MenuItem icon={Group} label={t("group")} shortcut="Ctrl+G" onClick={groupSelected} disabled={!isMultiSelect} />
        <MenuItem icon={Ungroup} label={t("ungroup")} shortcut="Ctrl+Shift+G" onClick={ungroupSelected} disabled={!isGroup} />
        <MenuItem
          icon={isLocked ? Lock : Unlock}
          label={isLocked ? t("unlock") : t("lock")}
          onClick={lockSelected}
          disabled={!hasSelection}
        />

        {isMultiSelect && (
          <>
            <Separator />
            <div className="px-3 py-1">
              <span className="text-[10px] font-bold text-ink-light">{t("quickAlign")}</span>
            </div>
            <div className="flex items-center gap-0.5 px-2 pb-1">
              <QuickAlignButton icon={AlignHorizontalJustifyCenter} title={t("alignCentersHorizontally")} />
              <QuickAlignButton icon={AlignVerticalJustifyCenter} title={t("alignCentersVertically")} />
            </div>
          </>
        )}

        <Separator />

        <MenuItem icon={Trash2} label={t("delete")} shortcut="Del" onClick={deleteSelected} disabled={!hasSelection} danger />
      </div>
    </>
  );
}

function QuickAlignButton({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <button
      className="rounded-lg border-2 border-transparent p-1.5 text-ink-muted transition-colors hover:border-showcase-navy/10 hover:bg-pastel-lavender/50 hover:text-ink-dark"
      title={title}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}
