import React, { useState } from 'react';
import { InputArea } from '@/components/InputArea';
import { FileUpload } from '@/components/FileUpload';
import { ResultsTable, Result } from '@/components/ResultsTable';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Index = () => {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (value: string) => {
    setInput(value);
  };

  const handleFileSelect = (content: string) => {
    setInput(content);
    toast.success('File loaded successfully');
  };

  const processInput = async () => {
    if (!input.trim()) {
      toast.error('Please enter some data first');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Split input into lines and remove empty lines
      const lines = input.split('\n').filter(line => line.trim());
      
      // Initialize results
      const initialResults: Result[] = lines.map(line => ({
        address: line.trim(),
        type: 'address', // This is a placeholder - we'll need to detect the actual type
        balances: [],
        status: 'pending'
      }));
      
      setResults(initialResults);

      // Process each line
      for (let i = 0; i < initialResults.length; i++) {
        const result = initialResults[i];
        
        // Update status to checking
        setResults(prev => prev.map((r, idx) => 
          idx === i ? { ...r, status: 'checking' } : r
        ));

        // Simulate balance checking (this should be replaced with actual API calls)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update with mock balances (replace with actual balance checking)
        setResults(prev => prev.map((r, idx) => 
          idx === i ? {
            ...r,
            status: 'done',
            balances: [
              { chainId: 'ETH', amount: '0.0' },
              { chainId: 'BSC', amount: '0.0' }
            ]
          } : r
        ));
      }

      toast.success('Processing complete');
    } catch (error) {
      console.error('Processing error:', error);
      toast.error('An error occurred while processing');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold mb-8">Crypto Address Checker</h1>
      
      <div className="space-y-4">
        <InputArea value={input} onChange={handleInputChange} />
        <div className="flex justify-between items-center">
          <FileUpload onFileSelect={handleFileSelect} />
          <Button 
            onClick={processInput}
            disabled={isProcessing || !input.trim()}
          >
            {isProcessing ? 'Processing...' : 'Check Addresses'}
          </Button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Results</h2>
          <ResultsTable results={results} />
        </div>
      )}
    </div>
  );
};

export default Index;