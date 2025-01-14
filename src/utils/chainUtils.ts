import axios from 'axios';
import Web3 from 'web3';
import { toast } from 'sonner';

interface Chain {
  name: string;
  chain: string;
  rpc: string[];
  chainId: number;
}

export interface ChainBalance {
  chainId: string;
  networkName: string;
  amount: string;
  rpcUrl?: string;
}

export const fetchChainList = async () => {
  try {
    console.log('Загрузка списка сетей...');
    const chainList: Chain[] = [];
    
    const response = await axios.get('https://raw.githubusercontent.com/XDeFi-tech/chainlist-json/refs/heads/main/export.json');
    const data = response.data;
    
    for (const [chainId, rpcs] of Object.entries(data)) {
      if (Array.isArray(rpcs) && rpcs.length > 0) {
        // Фильтруем только HTTP/HTTPS RPC и исключаем проблемные эндпоинты
        const filteredRpcs = rpcs.filter(rpc => {
          const isHttps = rpc.startsWith('http');
          const isProblematicEndpoint = rpc.includes('bitstack.com') || 
                                      rpc.includes('nodereal.io') ||
                                      rpc.includes('elastos.net');
          return isHttps && !isProblematicEndpoint;
        });

        if (filteredRpcs.length > 0) {
          chainList.push({
            name: `Chain ${chainId}`,
            chain: chainId,
            rpc: filteredRpcs,
            chainId: parseInt(chainId)
          });
        }
      }
    }
    
    console.log(`Загружено ${chainList.length} сетей с HTTP RPC`);
    return chainList;
  } catch (error) {
    console.error('Ошибка загрузки списка сетей:', error);
    toast.error('Не удалось загрузить список сетей');
    return [];
  }
};

export const deriveAddressFromPrivateKey = (privateKey: string): string => {
  try {
    if (!privateKey.startsWith('0x')) {
      privateKey = '0x' + privateKey;
    }
    const web3 = new Web3();
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    return account.address;
  } catch (error) {
    console.error('Ошибка получения адреса из приватного ключа:', error);
    return '';
  }
};

export const deriveAddressFromMnemonic = (mnemonic: string): string => {
  try {
    const web3 = new Web3();
    const hdWallet = web3.eth.accounts.wallet.create(1);
    const account = web3.eth.accounts.create();
    hdWallet.add(account);
    return account.address;
  } catch (error) {
    console.error('Ошибка получения адреса из мнемоники:', error);
    return '';
  }
};

const isRpcError = (error: any): boolean => {
  if (!error) return false;
  
  // Проверяем различные типы ошибок
  const errorMessage = error.message?.toLowerCase() || '';
  return errorMessage.includes('cors') ||
         errorMessage.includes('failed to fetch') ||
         errorMessage.includes('network error') ||
         error.code === 429 ||
         (error.response?.status >= 400);
};

export const checkAddressBalance = async (
  address: string,
  chain: Chain,
  onRpcCheck?: (rpc: string, success: boolean) => void
): Promise<ChainBalance | null> => {
  let balance = '0';
  let successfulRpc = null;

  // Создаем массив промисов для всех RPC эндпоинтов
  const rpcPromises = chain.rpc.map(async (rpc) => {
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 5000); // 5 секунд таймаут
      });

      const provider = new Web3.providers.HttpProvider(rpc, {
        timeout: 5000,
      });
      const web3 = new Web3(provider);
      
      onRpcCheck?.(rpc, false);

      // Race между запросом баланса и таймаутом
      const rawBalance = await Promise.race([
        web3.eth.getBalance(address),
        timeoutPromise
      ]);

      const currentBalance = web3.utils.fromWei(rawBalance, 'ether');
      
      onRpcCheck?.(rpc, true);
      return {
        balance: currentBalance,
        rpc
      };
    } catch (error) {
      if (isRpcError(error)) {
        console.error(`Ошибка проверки баланса в сети ${chain.name} (${rpc}):`, error);
      }
      onRpcCheck?.(rpc, false);
      return null;
    }
  });

  // Используем Promise.any чтобы получить первый успешный результат
  try {
    const results = await Promise.any(rpcPromises);
    if (results) {
      balance = results.balance;
      successfulRpc = results.rpc;
    }
  } catch (error) {
    // Если все RPC запросы завершились с ошибкой, возвращаем нулевой баланс
    console.error(`Не удалось проверить баланс в сети ${chain.name}`);
  }

  return {
    chainId: chain.name,
    networkName: `Chain ${chain.chainId}`,
    amount: balance,
    rpcUrl: successfulRpc
  };
};