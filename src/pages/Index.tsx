import React, { useState, useEffect } from 'react';
import { InputArea } from '@/components/InputArea';
import { FileUpload } from '@/components/FileUpload';
import { ResultsTable, Result } from '@/components/ResultsTable';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  fetchChainList, 
  checkAddressBalance,
  deriveAddressFromPrivateKey,
  deriveAddressFromMnemonic
} from '@/utils/chainUtils';

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
      console.log('Загружено сетей:', chainList.length, 'Всего RPC:', totalRpcCount);
    };
    loadChains();
  }, []);

  const handleInputChange = (value: string) => {
    setInput(value);
  };

  const handleFileSelect = (content: string) => {
    setInput(content);
    toast.success('Файл успешно загружен');
  };

  const detectInputType = (input: string): 'address' | 'private_key' | 'mnemonic' => {
    input = input.trim();
    if (input.match(/^(0x)?[0-9a-fA-F]{40}$/)) {
      return 'address';
    } else if (input.match(/^(0x)?[0-9a-fA-F]{64}$/)) {
      return 'private_key';
    } else if (input.split(' ').length >= 12) {
      return 'mnemonic';
    }
    return 'address';
  };

  const getAddressFromInput = (input: string, type: 'address' | 'private_key' | 'mnemonic'): string => {
    switch (type) {
      case 'private_key':
        return deriveAddressFromPrivateKey(input);
      case 'mnemonic':
        return deriveAddressFromMnemonic(input);
      default:
        return input;
    }
  };

  const processInput = async () => {
    if (!input.trim()) {
      toast.error('Пожалуйста, введите данные');
      return;
    }

    if (chains.length === 0) {
      toast.error('Список сетей не загружен');
      return;
    }

    setIsProcessing(true);
    
    try {
      const lines = input.split('\n').filter(line => line.trim());
      
      const initialResults: Result[] = lines.map(line => {
        const type = detectInputType(line.trim());
        const address = getAddressFromInput(line.trim(), type);
        return {
          address,
          type,
          balances: [],
          status: 'pending',
          totalRpcs,
          checkedRpcs: 0,
          progress: 0
        };
      });
      
      setResults(initialResults);

      for (let i = 0; i < initialResults.length; i++) {
        const result = initialResults[i];
        let checkedRpcs = 0;
        
        setResults(prev => prev.map((r, idx) => 
          idx === i ? { ...r, status: 'checking' } : r
        ));

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
            setResults(prev => prev.map((r, idx) => 
              idx === i ? {
                ...r,
                balances: [...r.balances, balance]
              } : r
            ));
          }
        }
        
        setResults(prev => prev.map((r, idx) => 
          idx === i ? {
            ...r,
            status: 'done',
            progress: 100
          } : r
        ));
      }

      toast.success('Проверка завершена');
    } catch (error) {
      console.error('Ошибка обработки:', error);
      toast.error('Произошла ошибка при обработке');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:py-8 space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-white">Проверка криптовалютных адресов</h1>
      
      <div className="space-y-4">
        <div className="text-sm text-white/60">
          Всего сетей: {chains.length} | Всего RPC: {totalRpcs}
        </div>
        
        <InputArea value={input} onChange={handleInputChange} />
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <FileUpload onFileSelect={handleFileSelect} />
          <Button 
            onClick={processInput}
            disabled={isProcessing || !input.trim()}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
          >
            {isProcessing ? 'Проверка...' : 'Проверить адреса'}
          </Button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Результаты</h2>
          <ResultsTable results={results} />
        </div>
      )}
    </div>
  );
};

export default Index;