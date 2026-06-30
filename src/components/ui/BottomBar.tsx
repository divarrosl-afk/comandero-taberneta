"use client";

import type { ReactNode } from "react";

interface BottomBarProps {
  children: ReactNode;
  hint?: string;
}

export function BottomBar({ children, hint }: BottomBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur">
      <div className="mx-auto max-w-lg">
        {hint && (
          <p className="mb-2 text-center text-sm font-medium text-amber-700">
            {hint}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
