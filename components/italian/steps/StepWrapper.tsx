"use client";

const STEP_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  glossary: { label: "Vocabulary", color: "bg-showcase-green text-white" },
  dialogue: { label: "Dialogue", color: "bg-showcase-blue text-white" },
  multi_choice: { label: "Quiz", color: "bg-showcase-purple text-white" },
  read_respond: { label: "Clinical Case", color: "bg-showcase-coral text-white" },
};

interface StepWrapperProps {
  stepType: string;
  title: string;
  subtitle?: string | null;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function StepWrapper({
  stepType,
  title,
  subtitle,
  children,
  footer,
}: StepWrapperProps) {
  const typeInfo = STEP_TYPE_LABELS[stepType] ?? {
    label: stepType,
    color: "bg-gray-400 text-white",
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block rounded-md px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${typeInfo.color}`}
          >
            {typeInfo.label}
          </span>
        </div>
        <h3 className="font-display text-lg font-bold text-ink-dark">{title}</h3>
        {subtitle && (
          <p className="text-sm text-ink-muted">{subtitle}</p>
        )}
      </div>

      <div>{children}</div>

      {footer && <div className="mt-2">{footer}</div>}
    </div>
  );
}
