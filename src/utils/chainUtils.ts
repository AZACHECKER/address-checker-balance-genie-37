import axios from 'axios';
import Web3 from 'web3';

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
        chainList.push({
          name: `Chain ${chainId}`,
          chain: chainId,
          rpc: rpcs.filter(rpc => rpc.startsWith('http')),
          chainId: parseInt(chainId)
        });
      }
    }
    
    console.log(`Загружено ${chainList.length} сетей с HTTP RPC`);
    return chainList;
  } catch (error) {
    console.error('Ошибка загрузки списка сетей:', error);
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

export const checkAddressBalance = async (
  address: string,
  chain: Chain,
  onRpcCheck?: (rpc: string, success: boolean) => void
): Promise<ChainBalance | null> => {
  let balance = '0';
  let successfulRpc = null;

  const rpcPromises = chain.rpc.map(async (rpc) => {
    try {
      const provider = new Web3.providers.HttpProvider(rpc);
      const web3 = new Web3(provider);
      
      onRpcCheck?.(rpc, false);
      const rawBalance = await web3.eth.getBalance(address);
      const currentBalance = web3.utils.fromWei(rawBalance, 'ether');
      
      onRpcCheck?.(rpc, true);
      return {
        balance: currentBalance,
        rpc
      };
    } catch (error) {
      console.error(`Ошибка проверки баланса в сети ${chain.name} (${rpc}):`, error);
      onRpcCheck?.(rpc, false);
      return null;
    }
  });

  const results = await Promise.race(rpcPromises);
  
  if (results) {
    balance = results.balance;
    successfulRpc = results.rpc;
  }

  return {
    chainId: chain.name,
    networkName: `Chain ${chain.chainId}`,
    amount: balance,
    rpcUrl: successfulRpc
  };
};