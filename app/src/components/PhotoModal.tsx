import React from 'react';
import { Button } from './Button';
import { Photo } from '../types';

interface PhotoModalProps {
  photo: Photo;
  onClose: () => void;
  onDelete: (photoId: number) => void;
}

// Fullscreen photo viewer with caption, date, and delete option
export const PhotoModal: React.FC<PhotoModalProps> = ({ photo, onClose, onDelete }) => {
  const handleDelete = () => {
    if (!window.confirm('Delete this photo?')) return;
    onDelete(photo.id);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center"
      onClick={onClose}
    >
      {/* Photo — stop click propagation so tapping image doesn't close */}
      <div
        className="flex-1 flex items-center justify-center w-full p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={`/photos/${photo.filename}`}
          alt={photo.caption || 'Batch photo'}
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      </div>

      {/* Caption and date */}
      <div
        className="w-full px-4 pb-2 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {photo.caption && (
          <p className="text-white text-sm mb-1">{photo.caption}</p>
        )}
        <p className="text-white/60 text-xs">
          {new Date(photo.taken_at).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Action buttons */}
      <div
        className="w-full px-4 pb-6 flex gap-3 max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <Button variant="secondary" fullWidth onClick={onClose}>
          Close
        </Button>
        <Button variant="secondary" fullWidth onClick={handleDelete} className="!text-red-400 !border-red-400/30">
          Delete
        </Button>
      </div>
    </div>
  );
};
