import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileImage } from "lucide-react";

interface FileUploadProps {
  onImageUpload: (imageData: string) => void;
}

export default function FileUpload({ onImageUpload }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onImageUpload(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`upload-zone rounded-xl p-12 text-center bg-white cursor-pointer transition-all duration-300 ${
        isDragOver ? 'drag-over' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={triggerFileInput}
      data-testid="upload-zone"
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileInputChange}
        data-testid="input-file"
      />
      
      <FileImage className="text-orange-500 mx-auto mb-6" size={64} />
      <h3 className="text-xl font-semibold text-gray-800 mb-3">
        Drop your artwork image here
      </h3>
      <p className="text-gray-600 mb-6">
        or click to browse from your device
      </p>
      <Button 
        className="bg-orange-500 text-white hover:bg-orange-600"
        data-testid="button-choose-image"
      >
        <Upload className="mr-2" size={16} />
        Choose Image
      </Button>
      
      <div className="mt-4 text-sm text-gray-500">
        Supported formats: JPG, PNG, GIF (max 10MB)
      </div>
    </div>
  );
}
