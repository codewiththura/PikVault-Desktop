import React, { useState, useRef, useEffect, useCallback } from "react";

export interface UseResizableSidebarOptions {
  /** Minimum allowable sidebar width in pixels. Default: 260 */
  minWidth?: number;
  /** Maximum allowable sidebar width in pixels. Default: 600 */
  maxWidth?: number;
  /** Default width when no persisted value exists or when reset. Default: 380 */
  defaultWidth?: number;
  /** LocalStorage key used to persist user preference. Default: "account_vault_sidebar_width" */
  storageKey?: string;
  /** Minimum width to preserve for the main content area. Default: 320 */
  minRemainingWidth?: number;
}

export interface UseResizableSidebarReturn {
  sidebarWidth: number;
  isResizing: boolean;
  startResizing: (e: React.MouseEvent) => void;
  resetWidth: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  minWidth: number;
  maxWidth: number;
  setSidebarWidth: React.Dispatch<React.SetStateAction<number>>;
}

export const useResizableSidebar = ({
  minWidth = 260,
  maxWidth = 600,
  defaultWidth = 380,
  storageKey = "account_vault_sidebar_width",
  minRemainingWidth = 320,
}: UseResizableSidebarOptions = {}): UseResizableSidebarReturn => {
  // Read initial width from localStorage if available
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= minWidth && parsed <= maxWidth) {
          return parsed;
        }
      }
    } catch {
      // Ignore storage access errors
    }
    return defaultWidth;
  });

  const [isResizing, setIsResizing] = useState(false);
  const isResizingRef = useRef(false);

  // Mouse drag initializer
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    isResizingRef.current = true;
  }, []);

  // Reset to default width
  const resetWidth = useCallback(() => {
    setSidebarWidth(defaultWidth);
    try {
      localStorage.setItem(storageKey, String(defaultWidth));
    } catch {
      // Ignore storage access errors
    }
  }, [defaultWidth, storageKey]);

  // Keyboard accessibility handler for Left / Right arrow adjustment
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const step = e.shiftKey ? 20 : 10;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSidebarWidth((prev) => {
          const next = Math.max(minWidth, prev - step);
          try {
            localStorage.setItem(storageKey, String(next));
          } catch {}
          return next;
        });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setSidebarWidth((prev) => {
          const maxAllowed = Math.min(
            maxWidth,
            Math.max(minWidth, window.innerWidth - minRemainingWidth)
          );
          const next = Math.min(maxAllowed, prev + step);
          try {
            localStorage.setItem(storageKey, String(next));
          } catch {}
          return next;
        });
      } else if (e.key === "Home") {
        e.preventDefault();
        setSidebarWidth(minWidth);
        try {
          localStorage.setItem(storageKey, String(minWidth));
        } catch {}
      } else if (e.key === "End") {
        e.preventDefault();
        const maxAllowed = Math.min(
          maxWidth,
          Math.max(minWidth, window.innerWidth - minRemainingWidth)
        );
        setSidebarWidth(maxAllowed);
        try {
          localStorage.setItem(storageKey, String(maxAllowed));
        } catch {}
      }
    },
    [minWidth, maxWidth, minRemainingWidth, storageKey]
  );

  // Window mouse move & up listeners during active drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      const maxAllowed = Math.min(
        maxWidth,
        Math.max(minWidth, window.innerWidth - minRemainingWidth)
      );
      const clampedWidth = Math.max(minWidth, Math.min(maxAllowed, e.clientX));
      setSidebarWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      if (isResizingRef.current) {
        isResizingRef.current = false;
        setIsResizing(false);
        setSidebarWidth((currentWidth) => {
          try {
            localStorage.setItem(storageKey, String(currentWidth));
          } catch {
            // Ignore storage access errors
          }
          return currentWidth;
        });
      }
    };

    if (isResizing) {
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, minWidth, maxWidth, minRemainingWidth, storageKey]);

  return {
    sidebarWidth,
    isResizing,
    startResizing,
    resetWidth,
    handleKeyDown,
    minWidth,
    maxWidth,
    setSidebarWidth,
  };
};
