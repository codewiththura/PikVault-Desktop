import React from 'react';
import { Modal } from './Modal';

interface ImagePreviewModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  imageUrl,
  onClose,
}) => {
  if (!imageUrl) return null;

  return (
    <Modal
      isOpen={!!imageUrl}
      onClose={onClose}
      title="Image Preview"
      maxWidth="800px"
    >
      <div style={{ textAlign: 'center', background: 'var(--bg-primary)', padding: '8px' }}>
        <img
          src={imageUrl}
          alt="Preview"
          style={{
            maxWidth: '100%',
            maxHeight: '70vh',
            objectFit: 'contain',
            display: 'inline-block',
          }}
        />
      </div>
    </Modal>
  );
};
