import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { client } from '../api/client';

export const PlantIdentifyPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleIdentify = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    try {
      // Send photo to Claude Vision API for identification
      const result = await client.identifyPlant(selectedFile);
      navigate('/plant-identify-result', {
        state: { result },
      });
    } catch (err) {
      console.error('Error identifying plant:', err);
      setError('Could not identify plant. Please try again with a clearer photo.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-[100px] flex flex-col">
      <div className="p-4 max-w-lg mx-auto flex-1">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold mb-2">
            Identify a Plant
          </h1>
          <p className="text-[var(--color-text-2)] text-sm">
            Take a photo or upload an image to identify the plant
          </p>
        </div>

        {/* Preview Area or Camera Guide */}
        {preview ? (
          <div className="mb-6">
            <Card className="overflow-hidden">
              <img
                src={preview}
                alt="Selected plant"
                className="w-full h-64 object-cover"
              />
            </Card>

            <p className="text-xs text-[var(--color-text-muted)] mt-3 text-center">
              Selected photo
            </p>
          </div>
        ) : (
          <Card variant="elevated" className="p-12 mb-6 flex flex-col items-center justify-center min-h-72">
            <div className="text-6xl mb-4">📷</div>
            <p className="font-body text-sm text-[var(--color-text-2)] text-center mb-4">
              Take a clear photo of the plant leaves, flowers, or overall
              appearance
            </p>
            <div className="w-32 h-32 border-2 border-dashed border-[var(--color-border)] rounded-lg flex items-center justify-center text-[var(--color-text-muted)]">
              Camera View
            </div>
          </Card>
        )}

        {/* File Input (Hidden) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          <Button
            variant="primary"
            fullWidth
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            📷 Take Photo
          </Button>

          <Button
            variant="secondary"
            fullWidth
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            📁 Choose from Library
          </Button>
        </div>

        {/* Identify Button */}
        {preview && (
          <div className="space-y-3">
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={handleIdentify}
              disabled={loading || !selectedFile}
            >
              {loading ? '⏳ Identifying...' : '✓ Identify Plant'}
            </Button>

            <Button
              variant="ghost"
              fullWidth
              onClick={handleClear}
              disabled={loading}
            >
              Clear & Try Again
            </Button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <Card className="p-4 mt-4 bg-semantic-error/10">
            <p className="text-sm text-semantic-error">{error}</p>
          </Card>
        )}

        {/* Tips */}
        <Card className="p-4 mt-8 bg-brand-sage/10">
          <p className="font-body font-medium text-sm text-[var(--color-text)] mb-2">
            💡 Tips for best results:
          </p>
          <ul className="text-xs text-[var(--color-text-2)] space-y-1">
            <li>• Use natural lighting</li>
            <li>• Focus on leaves or distinctive features</li>
            <li>• Avoid shadows and reflections</li>
            <li>• Take a clear, close-up photo</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};
