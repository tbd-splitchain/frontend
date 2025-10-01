import { BillSplitterABI } from '../config/abi/bill_splitter';

// Contract addresses by network - Following Agro's environment pattern
export const CONTRACT_ADDRESSES = {
  // Arbitrum Sepolia (Testnet)
  421614: '0xb9473739a8f6e71fe985217f5b69d14122cc44c0' as `0x${string}`,
  // Add other networks as needed
  // 42161: '0x...', // Arbitrum Mainnet
  // 1: '0x...', // Ethereum Mainnet
} as const;

// Token addresses for different networks
export const TOKEN_ADDRESSES = {
  // Arbitrum Sepolia tokens - Only STK token
  421614: {
    STK: '0x5423d4026EdeB17e30DF603Dc65Db7d8C5dC1c25', // Your SplitChain (STK) token
  },
  // Arbitrum Mainnet tokens (for future)
  42161: {
    STK: '0x5423d4026EdeB17e30DF603Dc65Db7d8C5dC1c25', // Your SplitChain (STK) token
  },
} as const;

// Environment-based contract selection (following Agro's pattern)
export const getContractAddresses = () => {
  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'testnet';

  if (environment === 'mainnet') {
    return {
      EXPENSE_SPLITTER: CONTRACT_ADDRESSES[421614], // Using testnet for now
      TOKENS: TOKEN_ADDRESSES[421614],
    };
  } else {
    // Default to testnet
    return {
      EXPENSE_SPLITTER: CONTRACT_ADDRESSES[421614],
      TOKENS: TOKEN_ADDRESSES[421614],
    };
  }
};

// Static contract addresses for easier import
export const contracts = getContractAddresses();

export const getContractAddress = (chainId?: number): string | undefined => {
  console.log('Getting contract address for chainId:', chainId);
  console.log('Available contract addresses:', CONTRACT_ADDRESSES);

  // If no chainId provided, default to Arbitrum Sepolia
  if (!chainId) {
    const defaultAddress = CONTRACT_ADDRESSES[421614];
    console.log('No chainId provided, using default address:', defaultAddress);
    return defaultAddress;
  }

  const address = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  console.log('Found address:', address);

  // Return undefined for unsupported chains (graceful handling)
  return address;
};

// Separate function to check if chain is supported (for UI messaging)
export const isChainSupported = (chainId?: number): boolean => {
  if (!chainId) return true; // Default fallback is supported
  return !!CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
};

export const getSupportedChainNames = (): string => {
  return Object.keys(CONTRACT_ADDRESSES).join(', ');
};

export { BillSplitterABI };