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
  // Arbitrum Sepolia tokens
  421614: {
    WETH: '0x980B62Da83eFf3D4576C647993b0c1D7faf17c73', // WETH on Arbitrum Sepolia
    USDC: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', // USDC on Arbitrum Sepolia
    CUSTOM: '0x0f764437ffBE1fcd0d0d276a164610422710B482', // Custom ERC20 Token
  },
  // Arbitrum Mainnet tokens (for future)
  42161: {
    WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // WETH on Arbitrum Mainnet
    USDC: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', // USDC on Arbitrum Mainnet
    CUSTOM: '0x0f764437ffBE1fcd0d0d276a164610422710B482', // Custom ERC20 Token (same on both networks)
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