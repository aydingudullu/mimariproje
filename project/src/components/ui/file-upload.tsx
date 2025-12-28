'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  File, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in MB
  label?: string;
  description?: string;
  className?: string;
}

interface FilePreview {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export function FileUpload({
  onUpload,
  accept = 'image/*',
  multiple = false,
  maxFiles = 10,
  maxSize = 10,
  label = 'Dosya Yükle',
  description = 'Dosyaları sürükleyip bırakın veya seçmek için tıklayın',
  className = '',
}: FileUploadProps) {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
    }
  };

  const processFiles = (newFiles: File[]) => {
    // Validate file count
    if (!multiple && files.length + newFiles.length > 1) {
      newFiles = [newFiles[0]];
    } else if (files.length + newFiles.length > maxFiles) {
      newFiles = newFiles.slice(0, maxFiles - files.length);
    }

    // Validate and create previews
    const validFiles: FilePreview[] = newFiles
      .filter(file => {
        // Check size
        if (file.size > maxSize * 1024 * 1024) {
          alert(`${file.name} dosyası çok büyük. Maksimum boyut: ${maxSize}MB`);
          return false;
        }
        return true;
      })
      .map(file => ({
        file,
        preview: file.type.startsWith('image/') 
          ? URL.createObjectURL(file) 
          : '',
        status: 'pending' as const,
      }));

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      // Revoke object URL to prevent memory leak
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    
    // Update all files to uploading status
    setFiles(prev => prev.map(f => ({ ...f, status: 'uploading' as const })));

    try {
      await onUpload(files.map(f => f.file));
      
      // Mark all as success
      setFiles(prev => prev.map(f => ({ ...f, status: 'success' as const })));
      
      // Clear after short delay
      setTimeout(() => {
        setFiles([]);
      }, 1500);
    } catch (error: any) {
      setFiles(prev => prev.map(f => ({ 
        ...f, 
        status: 'error' as const,
        error: error.message || 'Yükleme başarısız'
      })));
    } finally {
      setIsUploading(false);
    }
  };

  const clearAll = () => {
    files.forEach(f => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    setFiles([]);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Drop Zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${isDragging 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
          }
          ${files.length > 0 ? 'pb-4' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          <div className={`
            p-4 rounded-full transition-colors
            ${isDragging ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-700'}
          `}>
            <Upload className={`h-8 w-8 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
              {label}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Maksimum {maxSize}MB • {multiple ? `En fazla ${maxFiles} dosya` : 'Tek dosya'}
            </p>
          </div>
        </div>
      </div>

      {/* File Previews */}
      {files.length > 0 && (
        <div className="mt-4 space-y-3">
          {files.map((filePreview, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              {/* Preview */}
              <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                {filePreview.preview ? (
                  <img 
                    src={filePreview.preview} 
                    alt={filePreview.file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <File className="h-6 w-6 text-gray-400" />
                )}
              </div>

              {/* Info */}
              <div className="flex-grow min-w-0">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                  {filePreview.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(filePreview.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              {/* Status */}
              <div className="flex-shrink-0">
                {filePreview.status === 'pending' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                )}
                {filePreview.status === 'uploading' && (
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                )}
                {filePreview.status === 'success' && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {filePreview.status === 'error' && (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
          ))}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleUpload}
              disabled={isUploading || files.every(f => f.status !== 'pending')}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Yükle ({files.filter(f => f.status === 'pending').length})
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={clearAll}
              disabled={isUploading}
            >
              Temizle
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
