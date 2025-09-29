# SplitChain - Crypto Group Expense Management

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app), integrated with [Reown AppKit](https://docs.reown.com/appkit) for wallet connections.

## Features

- 🔗 **Multi-wallet Support**: Connect with MetaMask, WalletConnect, Coinbase Wallet, and more
- 🌐 **Social Login**: Sign in with Google, Apple, GitHub, and email
- ⚡ **Instant Settlements**: Split bills and settle payments using cryptocurrency
- 🔒 **Secure**: Built on Web3 infrastructure with smart contract automation
- 📱 **Mobile Ready**: Responsive design that works on all devices

## Getting Started

### Prerequisites

1. Get your Project ID from [Reown Dashboard](https://dashboard.reown.com)
2. Update the `NEXT_PUBLIC_PROJECT_ID` in your `.env.local` file

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Set up environment variables:

```bash
# Copy the example environment file
cp .env.local.example .env.local

# Edit .env.local and add your Reown Project ID
NEXT_PUBLIC_PROJECT_ID=your_project_id_here
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Wallet Connection

The app uses Reown AppKit for wallet connections, which provides:

- **Traditional Wallets**: MetaMask, Coinbase Wallet, WalletConnect compatible wallets
- **Social Logins**: Google, Apple, GitHub sign-in options
- **Email Login**: Connect using email address
- **Mobile Wallets**: Support for mobile wallet apps

Simply click "Connect Wallet" on the onboarding screen to see all available options.

### Network Configuration

Currently configured for:
- **Mainnet**: Ethereum mainnet
- **Arbitrum**: Layer 2 scaling solution

You can modify the supported networks in `src/config/wagmi.tsx`.

## Project Structure

```
src/
├── app/              # Next.js app router
├── components/       # React components
│   ├── screens/     # Page-level components
│   ├── ui/          # Reusable UI components
│   └── ConnectWallet.tsx # Wallet connection component
├── config/          # Configuration files
│   └── wagmi.tsx    # Wagmi/AppKit configuration
└── context/         # React context providers
    └── index.tsx    # Wallet providers setup
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
