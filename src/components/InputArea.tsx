import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface InputAreaProps {
  value: string;
  onChange: (value: string) => void;
}

export const InputArea: React.FC<InputAreaProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="input">Enter addresses, private keys or mnemonic phrases (one per line)</Label>
      <Textarea
        id="input"
        placeholder="Enter data here or upload a file..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[200px] font-mono"
      />
    </div>
  );
};