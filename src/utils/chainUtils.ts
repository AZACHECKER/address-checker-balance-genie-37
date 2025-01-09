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
    const web3 = new Web3(rpc);
    await web3.eth.getBlockNumber();
    return true;
  } catch (error) {
    return false;
  }
};

const findWorkingRpc = async (chain: Chain, onRpcCheck?: (rpc: string, success: boolean) => void): Promise<string | null> => {
  if (workingRpcCache[chain.chainId]) {
    return workingRpcCache[chain.chainId];
  }

  console.log(`Finding working RPC for chain ${chain.name}...`);
  
  for (const rpc of chain.rpc) {
    if (!rpc.startsWith('http')) continue; // Пропускаем WebSocket RPC
    
    try {
      const web3 = new Web3(rpc);
      await web3.eth.getBlockNumber();
      workingRpcCache[chain.chainId] = rpc;
      onRpcCheck?.(rpc, true);
      console.log(`Found working RPC for ${chain.name}: ${rpc}`);
      return rpc;
    } catch (error) {
      onRpcCheck?.(rpc, false);
      console.log(`RPC ${rpc} failed for ${chain.name}`);
      continue;
    }
  }
  
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
    const web3 = new Web3(rpc);
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