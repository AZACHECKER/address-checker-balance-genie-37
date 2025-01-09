import React, { useState, useEffect } from 'react';
import { InputArea } from '@/components/InputArea';
import { FileUpload } from '@/components/FileUpload';
import { ResultsTable, Result } from '@/components/ResultsTable';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { fetchChainList, checkAddressBalance } from '@/utils/chainUtils';

const Index = () => {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chains, setChains] = useState<any[]>([]);
  const [totalRpcs, setTotalRpcs] = useState(0);

  useEffect(() => {
    const loadChains = async () => {
      const chainList = await fetchChainList();
      setChains(chainList);
      const totalRpcCount = chainList.reduce((acc, chain) => acc + chain.rpc.length, 0);
      setTotalRpcs(totalRpcCount);
      console.log('Loaded chains:', chainList.length, 'Total RPCs:', totalRpcCount);
    };
    loadChains();
  }, []);

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

    if (chains.length === 0) {
      toast.error('Chain list not loaded yet');
      return;
    }

    setIsProcessing(true);
    
    try {
      const lines = input.split('\n').filter(line => line.trim());
      
      const initialResults: Result[] = lines.map(line => ({
        address: line.trim(),
        type: 'address',
        balances: [],
        status: 'pending',
        totalRpcs,
        checkedRpcs: 0,
        progress: 0
      }));
      
      setResults(initialResults);

      for (let i = 0; i < initialResults.length; i++) {
        const result = initialResults[i];
        let checkedRpcs = 0;
        
        setResults(prev => prev.map((r, idx) => 
          idx === i ? { ...r, status: 'checking' } : r
        ));

        const balances = [];
        for (const chain of chains) {
          const balance = await checkAddressBalance(
            result.address, 
            chain,
            (rpc, success) => {
              checkedRpcs++;
              const progress = (checkedRpcs / totalRpcs) * 100;
              setResults(prev => prev.map((r, idx) => 
                idx === i ? { 
                  ...r, 
                  checkedRpcs,
                  progress
                } : r
              ));
            }
          );
          if (balance) {
            balances.push(balance);
          }
        }
        
        setResults(prev => prev.map((r, idx) => 
          idx === i ? {
            ...r,
            status: 'done',
            balances: balances,
            progress: 100
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
    <div className="container mx-auto p-4 md:py-8 space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Crypto Address Checker</h1>
      
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Total chains: {chains.length} | Total RPCs: {totalRpcs}
        </div>
        
        <InputArea value={input} onChange={handleInputChange} />
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <FileUpload onFileSelect={handleFileSelect} />
          <Button 
            onClick={processInput}
            disabled={isProcessing || !input.trim()}
            className="w-full md:w-auto"
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