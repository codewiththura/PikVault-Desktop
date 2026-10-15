import { useState, useEffect, useRef, useCallback } from 'react';
import { DroppedFileInfo } from '../types';
import { extractFileMetadata, isFilesDragEvent } from '../utils/fileDrop';

interface UseFileDropOptions {
  onFilesDropped: (files: DroppedFileInfo[]) => void;
  enabled?: boolean;
}

export function useFileDrop({ onFilesDropped, enabled = true }: UseFileDropOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  // Prevent default OS file opening behavior on the window
  useEffect(() => {
    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleWindowDrop = (e: DragEvent) => {
      e.preventDefault();
    };

    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('drop', handleWindowDrop);

    return () => {
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('drop', handleWindowDrop);
    };
  }, []);

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      if (!enabled || !isFilesDragEvent(e)) return;
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current += 1;
      if (dragCounterRef.current === 1) {
        setIsDragging(true);
      }
    },
    [enabled]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!enabled || !isFilesDragEvent(e)) return;
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'copy';
    },
    [enabled]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      if (!enabled || !isFilesDragEvent(e)) return;
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
      if (dragCounterRef.current === 0) {
        setIsDragging(false);
      }
    },
    [enabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (!enabled || !isFilesDragEvent(e)) return;
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setIsDragging(false);

      const fileList = e.dataTransfer.files;
      if (!fileList || fileList.length === 0) return;

      const extracted: DroppedFileInfo[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        extracted.push(extractFileMetadata(file));
      }

      if (extracted.length > 0) {
        onFilesDropped(extracted);
      }
    },
    [enabled, onFilesDropped]
  );

  return {
    isDragging,
    dropProps: {
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
}
