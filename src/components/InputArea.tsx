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
      <Label htmlFor="input" className="text-sm md:text-base">Enter addresses, private keys or mnemonic phrases (one per line)</Label>
      <Textarea
        id="input"
        placeholder="Enter data here or upload a file..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[150px] md:min-h-[200px] font-mono text-sm md:text-base"
      />
    </div>
  );
};