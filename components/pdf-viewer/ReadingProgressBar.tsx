"use client";

import { useEffect, useState } from "react";
import { m } from "framer-motion";

export default function ReadingProgressBar() {
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop =
            document.documentElement.scrollTop || document.body.scrollTop;
          const scrollHeight =
            document.documentElement.scrollHeight -
            document.documentElement.clientHeight;
          const percent =
            scrollHeight > 0
              ? Math.min(100, Math.round((scrollTop / scrollHeight) * 100))
              : 0;
          setScrollPercent(percent);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed left-0 right-0 top-0 z-[60] h-1">
      <m.div
        className="h-full bg-gradient-to-r from-showcase-purple via-showcase-teal to-showcase-green"
        style={{ width: `${scrollPercent}%` }}
        transition={{ duration: 0.1 }}
      />
    </div>
  );
}
