import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { StoredItem, FileType } from "../../types";
import { todayString } from "../../utils/date";

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
  itemToEdit?: StoredItem | null;
  onSave: (data: {
    id?: string;
    accountId: string;
    fileName: string;
    imageUrl?: string;
    fileSizeMB?: number;
    fileType: FileType;
    externalLinks?: string[];
    updatedDate?: string;
    note?: string;
  }) => Promise<void>;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  accountId,
  itemToEdit,
  onSave,
}) => {
  const [fileName, setFileName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [fileSizeValue, setFileSizeValue] = useState<number | "">("");
  const [sizeUnit, setSizeUnit] = useState<"MB" | "GB">("MB");
  const [fileType, setFileType] = useState<FileType>("mp4");
  const [externalLinksText, setExternalLinksText] = useState("");
  const [updatedDate, setUpdatedDate] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (itemToEdit) {
      setFileName(itemToEdit.fileName);
      setImageUrl(itemToEdit.imageUrl || "");

      const mb = itemToEdit.fileSizeMB || 0;
      if (mb >= 1024 && mb % 1024 === 0) {
        setFileSizeValue(mb / 1024);
        setSizeUnit("GB");
      } else {
        setFileSizeValue(mb > 0 ? mb : "");
        setSizeUnit("MB");
      }

      setFileType(itemToEdit.fileType || "mp4");
      setExternalLinksText((itemToEdit.externalLinks || []).join("\n"));
      setUpdatedDate(itemToEdit.updatedDate || todayString());
      setNote(itemToEdit.note || "");
    } else {
      setFileName("");
      setImageUrl("");
      setFileSizeValue("");
      setSizeUnit("MB");
      setFileType("mp4"); // Default mp4 as specified by user
      setExternalLinksText("");
      setUpdatedDate(todayString());
      setNote("");
    }
    setError("");
  }, [itemToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) {
      setError("File name is required");
      return;
    }

    let calculatedMB = 0;
    if (
      typeof fileSizeValue === "number" &&
      !isNaN(fileSizeValue) &&
      fileSizeValue > 0
    ) {
      calculatedMB = sizeUnit === "GB" ? fileSizeValue * 1024 : fileSizeValue;
    }

    const links = externalLinksText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    try {
      setIsSubmitting(true);
      await onSave({
        id: itemToEdit ? itemToEdit.id : undefined,
        accountId,
        fileName: fileName.trim(),
        imageUrl: imageUrl.trim() || undefined,
        fileSizeMB: calculatedMB,
        fileType: (fileType.trim() || "mp4").toLowerCase(),
        externalLinks: links.length > 0 ? links : undefined,
        updatedDate: updatedDate || undefined,
        note: note.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to save item");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        itemToEdit ? "Edit Stored Data Record" : "Add New Stored Data Record"
      }
      maxWidth="620px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Saving..."
              : itemToEdit
                ? "Update Item"
                : "Add Item"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {/* File Name (Required) */}
        <Input
          label="File Name *"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder="e.g. tutorials-linux-v1.mp4"
          autoFocus
          required
        />

        {/* File Type & File Size */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.5fr",
            gap: "12px",
          }}
        >
          <div className="form-group">
            <label className="form-label">File Type (default: mp4)</label>
            <input
              type="text"
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              placeholder="mp4"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">File Size (Optional)</label>
            <div style={{ display: "flex", gap: "6px" }}>
              <input
                type="number"
                step="0.01"
                min="0"
                value={fileSizeValue}
                onChange={(e) =>
                  setFileSizeValue(
                    e.target.value === "" ? "" : parseFloat(e.target.value),
                  )
                }
                placeholder="e.g. 500 or 1.5"
                className="form-input"
                style={{ flex: 1 }}
              />
              <select
                value={sizeUnit}
                onChange={(e) => setSizeUnit(e.target.value as "MB" | "GB")}
                className="form-select"
                style={{ width: "80px" }}
              >
                <option value="MB">MB</option>
                <option value="GB">GB</option>
              </select>
            </div>
          </div>
        </div>

        {/* Image URL (Optional) with live preview */}
        <div className="form-group">
          <Input
            label="Image URL (Optional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/cover.jpg"
          />
          {imageUrl && (
            <div
              style={{
                marginTop: "6px",
                height: "80px",
                background: "var(--bg-primary)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={imageUrl}
                alt="Preview"
                style={{ height: "100%", objectFit: "contain" }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>

        {/* Updated Date */}
        <div className="form-group">
          <label className="form-label">Updated Date (Optional)</label>
          <input
            type="date"
            value={updatedDate}
            onChange={(e) => setUpdatedDate(e.target.value)}
            className="form-input"
          />
        </div>

        {/* External Links (Optional) */}
        <div className="form-group">
          <label className="form-label">
            External Links (Optional - one per line)
          </label>
          <textarea
            value={externalLinksText}
            onChange={(e) => setExternalLinksText(e.target.value)}
            placeholder="https://mega.nz/file/...\nhttps://drive.google.com/..."
            className="form-textarea"
            rows={3}
          />
        </div>

        {/* Note (Optional) */}
        <div className="form-group">
          <label className="form-label">Note (Optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Additional description or remarks..."
            className="form-textarea"
            rows={2}
          />
        </div>

        {error && (
          <div style={{ color: "var(--accent-danger)", marginTop: "8px" }}>
            {error}
          </div>
        )}
      </form>
    </Modal>
  );
};
