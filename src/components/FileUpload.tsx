import React from 'react';
import { Button } from "@/components/ui/button";
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (content: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileSelect(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileChange}
        accept=".txt,.csv,.json"
      />
      <Button
        variant="outline"
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <Upload className="mr-2 h-4 w-4" />
        Upload File
      </Button>
    </div>
  );
};