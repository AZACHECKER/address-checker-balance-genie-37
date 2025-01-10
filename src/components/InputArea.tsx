import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface InputAreaProps {
  value: string;
  onChange: (value: string) => void;
}

export const InputArea: React.FC<InputAreaProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-2 w-full">
      <Label htmlFor="input" className="text-sm md:text-base">
        Введите адреса, приватные ключи или мнемонические фразы (по одному на строку)
      </Label>
      <Textarea
        id="input"
        placeholder="Введите данные здесь или загрузите файл..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="win98-inset min-h-[150px] md:min-h-[200px] font-mono text-sm md:text-base p-2"
      />
    </div>
  );
};