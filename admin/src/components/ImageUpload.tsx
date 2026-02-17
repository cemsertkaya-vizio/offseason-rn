import { useRef, useState, type DragEvent, type ChangeEvent } from 'react';

interface ImageUploadProps {
  label: string;
  currentUrl: string | null;
  onFileSelected: (file: File) => void;
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export default function ImageUpload({ label, currentUrl, onFileSelected }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      alert('Please select a PNG, JPG, or WebP image.');
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onFileSelected(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-brand-grayDark mb-2">
        {label}
      </label>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl cursor-pointer
                    flex items-center justify-center overflow-hidden transition-colors
                    h-40 ${
                      isDragging
                        ? 'border-brand-yellow bg-brand-yellow/10'
                        : 'border-brand-grayMedium hover:border-brand-grayDark bg-brand-grayLight'
                    }`}
      >
        {preview ? (
          <img
            src={preview}
            alt={label}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-center px-4">
            <p className="text-sm text-brand-grayMuted">
              Drag and drop or click to upload
            </p>
            <p className="text-xs text-brand-grayMuted mt-1">
              PNG, JPG, WebP
            </p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.webp"
          onChange={handleChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
