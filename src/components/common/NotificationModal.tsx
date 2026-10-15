import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

export interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "success" | "error" | "info";
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="460px"
      footer={
        <Button variant="primary" onClick={onClose}>
          OK
        </Button>
      }
    >
      <div
        style={{
          color: type === "error" ? "var(--accent-danger)" : "var(--text-secondary)",
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
