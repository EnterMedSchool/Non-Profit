"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  PlayCircle,
  HelpCircle,
  GitFork,
  Zap,
  Flag,
  Info,
  BookOpen,
} from "lucide-react";

type AlgoNodeType =
  | "start"
  | "question"
  | "decision"
  | "action"
  | "outcome"
  | "info";

interface AlgoNodeData {
  label: string;
  nodeType: AlgoNodeType;
  active: boolean;
  visited: boolean;
  hasEducation: boolean;
  [key: string]: unknown;
}

const ICON_MAP: Record<AlgoNodeType, typeof PlayCircle> = {
  start: PlayCircle,
  question: HelpCircle,
  decision: GitFork,
  action: Zap,
  outcome: Flag,
  info: Info,
};

const TYPE_STYLES: Record<
  AlgoNodeType,
  { bg: string; border: string; iconBg: string; iconColor: string }
> = {
  start: {
    bg: "bg-showcase-purple/5",
    border: "border-showcase-purple/40",
    iconBg: "bg-showcase-purple/15",
    iconColor: "text-showcase-purple",
  },
  question: {
    bg: "bg-blue-50",
    border: "border-blue-300",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  decision: {
    bg: "bg-amber-50",
    border: "border-amber-300",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  action: {
    bg: "bg-teal-50",
    border: "border-teal-300",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
  },
  outcome: {
    bg: "bg-green-50",
    border: "border-green-300",
    iconBg: "bg-green-100",
    iconColor: "text-green-700",
  },
  info: {
    bg: "bg-gray-50",
    border: "border-gray-300",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
  },
};

function AlgorithmNodeComponent({ data }: NodeProps) {
  const { label, nodeType, active, visited, hasEducation } =
    data as unknown as AlgoNodeData;
  const Icon = ICON_MAP[nodeType] ?? Info;
  const style = TYPE_STYLES[nodeType] ?? TYPE_STYLES.info;

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-gray-400 !border-0"
      />

      <div
        className={`
          relative rounded-xl border-2 px-3 py-2.5 min-w-[140px] max-w-[200px]
          transition-all duration-200 cursor-pointer select-none
          ${style.bg} ${style.border}
          ${active ? "ring-2 ring-showcase-purple ring-offset-2 shadow-lg scale-105" : ""}
          ${visited && !active ? "opacity-80" : ""}
        `}
      >
        <div className="flex items-start gap-2">
          <div
            className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-lg ${style.iconBg}`}
          >
            <Icon className={`w-3.5 h-3.5 ${style.iconColor}`} />
          </div>
          <span className="text-xs font-semibold text-ink-dark leading-snug line-clamp-3">
            {label}
          </span>
        </div>

        {hasEducation && (
          <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-showcase-purple text-white">
            <BookOpen className="w-2.5 h-2.5" />
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-gray-400 !border-0"
      />
    </>
  );
}

export default memo(AlgorithmNodeComponent);
