import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = false,
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="460px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={isDestructive ? "danger" : "primary"}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : confirmLabel}
          </Button>
        </>
      }
    >
      <div
        style={{
          color: "var(--text-secondary)",
          lineHeight: 1.5,
          fontSize: "var(--font-size-sm)",
          wordBreak: "break-word",
          whiteSpace: "pre-line",
        }}
      >
        {message}
      </div>
    </Modal>
  );
};
