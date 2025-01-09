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
  amount: string;
  rpcUrl?: string;
}

// Кэш для рабочих RPC
const workingRpcCache: { [chainId: number]: string } = {};

export const fetchChainList = async () => {
  try {
    console.log('Fetching chain list...');
    const chainList: Chain[] = [];
    
    const response = await axios.get('https://raw.githubusercontent.com/XDeFi-tech/chainlist-json/refs/heads/main/export.json');
    const data = response.data;
    
    for (const [chainId, rpcs] of Object.entries(data)) {
      if (Array.isArray(rpcs) && rpcs.length > 0) {
        chainList.push({
          name: `Chain ${chainId}`,
          chain: chainId,
          rpc: rpcs.filter(rpc => rpc.startsWith('http')), // Фильтруем только HTTP RPC
          chainId: parseInt(chainId)
        });
      }
    }
    
    console.log(`Loaded ${chainList.length} chains with HTTP RPCs`);
    return chainList;
  } catch (error) {
    console.error('Error fetching chain list:', error);
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
    console.error('Error deriving address from private key:', error);
    return '';
  }
};

export const deriveAddressFromMnemonic = (mnemonic: string): string => {
  try {
    const web3 = new Web3();
    const hdWallet = web3.eth.accounts.wallet.create(1, mnemonic);
    return hdWallet[0].address;
  } catch (error) {
    console.error('Error deriving address from mnemonic:', error);
    return '';
  }
};

export const checkAddressBalance = async (
  address: string,
  chain: Chain,
  onRpcCheck?: (rpc: string, success: boolean) => void
): Promise<ChainBalance | null> => {
  for (const rpc of chain.rpc) {
    try {
      const web3 = new Web3(new Web3.providers.HttpProvider(rpc, {
        timeout: 5000,
      }));

      onRpcCheck?.(rpc, false);
      const balance = await web3.eth.getBalance(address);
      const formattedBalance = web3.utils.fromWei(balance, 'ether');
      
      if (parseFloat(formattedBalance) > 0) {
        onRpcCheck?.(rpc, true);
        return {
          chainId: chain.name,
          amount: formattedBalance,
          rpcUrl: rpc
        };
      }
      
      onRpcCheck?.(rpc, true);
    } catch (error) {
      console.error(`Error checking balance on ${chain.name} (${rpc}):`, error);
      onRpcCheck?.(rpc, false);
    }
  }
  return null;
};