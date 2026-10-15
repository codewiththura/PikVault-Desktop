import React from "react";
import { UploadIcon } from "../common/Icons";

interface DropOverlayProps {
  isVisible: boolean;
  targetAccountName?: string | null;
}

export const DropOverlay: React.FC<DropOverlayProps> = ({
  isVisible,
  targetAccountName,
}) => {
  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "var(--bg-dropzone-backdrop)",
        backdropFilter: "blur(4px)",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
        pointerEvents: "none",
        userSelect: "none",
        transition: "opacity var(--transition-fast)",
      }}
    >
      <div
        style={{
          border: "2px dashed var(--border-accent)",
          borderRadius: "var(--radius-lg)",
          backgroundColor: "var(--bg-dropzone)",
          padding: "40px 32px",
          maxWidth: "540px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          boxShadow: "0 12px 36px var(--border-subtle)",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--bg-tonal)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--accent-white)",
            marginBottom: "16px",
          }}
        >
          <UploadIcon size={32} />
        </div>

        <h3
          style={{
            color: "var(--text-primary)",
            fontSize: "18px",
            fontWeight: 600,
            marginBottom: "8px",
          }}
        >
          {targetAccountName
            ? `Drop file to catalog into "${targetAccountName}"`
            : "Drop file to catalog stored record"}
        </h3>

        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "var(--font-size-sm)",
            lineHeight: 1.5,
            maxWidth: "420px",
            margin: 0,
          }}
        >
          File metadata (name, file size in MB, format extension) will be
          extracted and confirmed before adding to your vault.
        </p>
      </div>
    </div>
  );
};
