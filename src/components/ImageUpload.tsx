import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ImageUploadProps {
  onUpload: (base64: string, mimeType: string) => void;
  onReset: () => void;
  preview: string | null;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload, onReset, preview }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64 = result.split(',')[1];
      onUpload(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-300
              ${isDragging ? 'border-[#1a1a1a] bg-[#1a1a1a]/5' : 'border-[#1a1a1a]/20 hover:border-[#1a1a1a]/40'}
            `}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
              accept="image/*"
            />
            <div className="w-16 h-16 rounded-full bg-[#1a1a1a]/5 flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-[#1a1a1a]/60" />
            </div>
            <h3 className="text-xl font-serif font-medium mb-2">Upload your piece</h3>
            <p className="text-[#1a1a1a]/40 text-sm text-center">
              Drag and drop an image of the item you want to style,<br />or click to browse your files.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-3xl overflow-hidden aspect-square bg-white shadow-2xl group"
          >
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={(e) => { e.stopPropagation(); onReset(); }}
                className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-red-500 hover:scale-110 transition-transform"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
