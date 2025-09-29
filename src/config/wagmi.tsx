import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { arbitrumSepolia } from '@reown/appkit/networks'
import { defineChain } from 'viem'

// Get projectId from environment variable
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || "1922d8f34388fb1c3b3553c342d31094"

if (!projectId) {
  throw new Error('Project ID is not defined')
}

// Define custom Arbitrum Sepolia with Alchemy RPC
const arbitrumSepoliaAlchemy = defineChain({
  id: 421614,
  name: 'Arbitrum Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://arb-sepolia.g.alchemy.com/v2/woz-6XsoF8SYpREpEiPG1'] },
    public: { http: ['https://arb-sepolia.g.alchemy.com/v2/woz-6XsoF8SYpREpEiPG1'] },
  },
  blockExplorers: {
    default: { name: 'Arbiscan', url: 'https://sepolia.arbiscan.io' },
  },
  testnet: true,
})

export const networks = [arbitrumSepoliaAlchemy]

// Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig