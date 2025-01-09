import axios from 'axios';
import Web3 from 'web3';

interface Chain {
  name: string;
  chain: string;
  icon?: string;
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
    
    // Преобразуем предоставленный JSON в массив цепочек
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

export const checkRpc = async (rpc: string): Promise<boolean> => {
  try {
    const web3 = new Web3(new Web3.providers.HttpProvider(rpc, {
      timeout: 5000, // 5 second timeout
      headers: [
        {
          name: 'Origin',
          value: window.location.origin
        }
      ]
    }));
    await web3.eth.getBlockNumber();
    return true;
  } catch (error: any) {
    // Log specific error types for debugging
    if (error.message?.includes('CORS')) {
      console.log(`CORS error for RPC ${rpc}`);
    } else if (error.response?.status === 429) {
      console.log(`Rate limit error for RPC ${rpc}`);
    }
    return false;
  }
};

const findWorkingRpc = async (chain: Chain, onRpcCheck?: (rpc: string, success: boolean) => void): Promise<string | null> => {
  // Check cache first
  if (workingRpcCache[chain.chainId]) {
    try {
      // Verify cached RPC is still working
      const isWorking = await checkRpc(workingRpcCache[chain.chainId]);
      if (isWorking) {
        return workingRpcCache[chain.chainId];
      }
      // If not working, delete from cache
      delete workingRpcCache[chain.chainId];
    } catch (error) {
      delete workingRpcCache[chain.chainId];
    }
  }

  console.log(`Finding working RPC for chain ${chain.name}...`);
  
  for (const rpc of chain.rpc) {
    if (!rpc.startsWith('http')) continue; // Skip WebSocket RPCs
    
    try {
      onRpcCheck?.(rpc, false);
      const isWorking = await checkRpc(rpc);
      
      if (isWorking) {
        workingRpcCache[chain.chainId] = rpc;
        onRpcCheck?.(rpc, true);
        console.log(`Found working RPC for ${chain.name}: ${rpc}`);
        return rpc;
      }
      
      console.log(`RPC ${rpc} failed for ${chain.name}`);
    } catch (error) {
      console.error(`Error checking RPC ${rpc}:`, error);
      onRpcCheck?.(rpc, false);
    }
  }
  
  console.log(`No working RPC found for chain ${chain.name}`);
  return null;
};

export const checkAddressBalance = async (
  address: string, 
  chain: Chain,
  onRpcCheck?: (rpc: string, success: boolean) => void
): Promise<ChainBalance | null> => {
  const rpc = await findWorkingRpc(chain, onRpcCheck);
  if (!rpc) {
    console.log(`No working RPC found for chain ${chain.name}`);
    return null;
  }

  try {
    const web3 = new Web3(new Web3.providers.HttpProvider(rpc, {
      timeout: 5000,
      headers: [
        {
          name: 'Origin',
          value: window.location.origin
        }
      ]
    }));
    
    const balance = await web3.eth.getBalance(address);
    const formattedBalance = web3.utils.fromWei(balance, 'ether');
    
    console.log(`Balance for ${address} on ${chain.name}: ${formattedBalance}`);
    
    return {
      chainId: chain.name,
      amount: formattedBalance,
      rpcUrl: rpc
    };
  } catch (error) {
    console.error(`Error checking balance for ${address} on ${chain.name}:`, error);
    return null;
  }
};