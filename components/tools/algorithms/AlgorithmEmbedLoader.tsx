"use client";

import { useState, useEffect } from "react";
import { algorithmRegistry } from "./index";
import AlgorithmViewer from "./AlgorithmViewer";
import type { AlgorithmDefinition } from "@/lib/algorithmTypes";

interface AlgorithmEmbedLoaderProps {
  id: string;
}

export default function AlgorithmEmbedLoader({
  id,
}: AlgorithmEmbedLoaderProps) {
  const [definition, setDefinition] = useState<AlgorithmDefinition | null>(
    null,
  );

  useEffect(() => {
    const loader = algorithmRegistry[id];
    if (loader) {
      loader().then((mod) => setDefinition(mod.default));
    }
  }, [id]);

  if (!definition) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-showcase-purple border-t-transparent" />
      </div>
    );
  }

  return <AlgorithmViewer definition={definition} compact />;
}
