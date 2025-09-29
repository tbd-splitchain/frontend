import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ProfilePicture } from '../ui/ProfilePicture';
import { MoreVertical, ArrowRight, Plus, Camera, User } from 'lucide-react';
import { useAccount, useBalance, useChainId } from 'wagmi';
import { formatEther } from 'viem';
import { useExpenseSplitter, useUserExpenseDashboard } from '@/hooks/useExpenseSplitter';
import { getContractAddress, isChainSupported, getSupportedChainNames, getContractAddresses } from '@/contracts/config';

// Extend window object for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface Participant {
  name: string;
  amount: number;
  status: string;
}

interface BillData {
  id: string;
  amount: number;
  title: string;
  participants: Participant[];
  totalApproved: number;
  totalParticipants: number;
  isReady: boolean;
}

interface ExpenseData {
  id: string;
  description: string;
  amount: number;
  date: string;
  timestamp: string;
  merchant: string;
  location: string;
  paidBy: string;
  participants: Array<{
    name: string;
    amount: number;
    status: string;
  }>;
  status: string;
  approvals: number;
  totalParticipants: number;
  isReady: boolean;
  txHash: string | null;
  category: string;
  splitMethod: string;
  receipt: string;
  notes: string;
  group?: string;
  youWillReceive: number;
  youOwe: number;
  userAction: string;
  items?: Array<{
    name: string;
    price: number;
  }>;
}

interface GroupMember {
  id: string;
  name: string;
  username: string;
  balance: number;
  status: string;
  role: string;
}

interface GroupData {
  id: string;
  name: string;
  description: string;
  totalExpenses: number;
  pendingAmount: number;
  monthlyTotal: number;
  members: GroupMember[];
  recentExpenses: Array<{
    id: string;
    description: string;
    amount: number;
    date: string;
    timestamp: string;
    merchant: string;
    location: string;
    paidBy: string;
    participants: Array<{
      name: string;
      amount: number;
      status: string;
    }>;
    status: string;
    approvals: number;
    totalParticipants: number;
    isReady: boolean;
    txHash: string | null;
    category: string;
    splitMethod: string;
    receipt: string;
    notes: string;
    youWillReceive: number;
    youOwe: number;
    userAction: string;
    items: Array<{
      name: string;
      price: number;
    }>;
  }>;
  groupSettings: {
    autoApproveLimit: number;
    requireAllApprovals: boolean;
    allowMemberInvites: boolean;
  };
}

interface HomeScreenProps {
  onSplitBill: (billData?: BillData) => void;
  onCreateExpense: () => void;
  onFriends: () => void;
  onTransactions?: () => void;
  onReceiptScan?: () => void;
  onGroupDetails?: (groupData?: GroupData) => void;
  onExpenseDetails?: (expenseData?: ExpenseData) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onCreateExpense, onFriends, onTransactions, onReceiptScan, onGroupDetails, onExpenseDetails }) => {
  const [mounted, setMounted] = useState(false);

  // Wallet hooks with error handling
  let address, isConnected, balance, chainId;
  try {
    const account = useAccount();
    const currentChainId = useChainId();

    // Force refetch balance when address or chainId changes
    const balanceResult = useBalance({
      address: account.address,
      chainId: account.chainId || currentChainId,
      query: {
        enabled: !!account.address && !!account.isConnected,
        refetchOnWindowFocus: false,
        refetchInterval: 10000, // Refetch every 10 seconds
      }
    });

    console.log('Balance query result:', {
      data: balanceResult.data,
      error: balanceResult.error,
      isLoading: balanceResult.isLoading,
      isFetching: balanceResult.isFetching,
      status: balanceResult.status
    });

    address = account.address;
    isConnected = account.isConnected;
    balance = balanceResult.data;
    chainId = account.chainId || currentChainId;
  } catch (error) {
    console.error('Wallet hook error:', error);
    address = undefined;
    isConnected = false;
    balance = undefined;
    chainId = undefined;
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper function to truncate address
  const truncateAddress = (addr: string | undefined) => {
    if (!addr) return 'Not Connected';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Helper function to get network name
  const getNetworkName = (chainId: number | undefined) => {
    switch (chainId) {
      case 1: return 'Ethereum';
      case 42161: return 'Arbitrum';
      case 421614: return 'Arbitrum Sepolia';
      case 11155111: return 'Sepolia';
      default: return 'Unknown Network';
    }
  };

  // Helper function to format balance
  const formatBalance = (balance: any, chainId: number | undefined) => {
    if (!balance || !mounted) return '0.00';
    const ethBalance = parseFloat(formatEther(balance.value));

    // For testnets, don't show USD conversion, just show the ETH amount
    if (chainId === 421614 || chainId === 11155111) {
      return `${ethBalance.toFixed(4)} ETH`;
    }

    // For mainnet, show USD equivalent
    const usdBalance = ethBalance * 2000;
    return `$${usdBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const displayName = mounted && address ? truncateAddress(address) : 'Connecting...';
  const displayBalance = formatBalance(balance, chainId);
  const networkName = getNetworkName(chainId);

  // Contract integration
  const contracts = getContractAddresses();
  const contractAddress = contracts.EXPENSE_SPLITTER;
  const chainSupported = isChainSupported(chainId);
  const contractError = !chainSupported && chainId ?
    `Unsupported chain ID: ${chainId}. Supported chains: ${getSupportedChainNames()}` :
    null;

  const expenseSplitter = useExpenseSplitter();
  const userDashboard = useUserExpenseDashboard(address as `0x${string}`, BigInt(1)); // Example group ID

  // Handle transaction success (following Agro's pattern)
  useEffect(() => {
    if (expenseSplitter.isSuccess && expenseSplitter.hash) {
      console.log('Transaction confirmed successfully! Hash:', expenseSplitter.hash);
      // The toast notification is already handled in the hook
    }
  }, [expenseSplitter.isSuccess, expenseSplitter.hash]);

  // Debug logging
  useEffect(() => {
    if (mounted) {
      console.log('Debug wallet info:', {
        address,
        chainId,
        networkName,
        balance: balance?.value,
        isConnected,
        contractAddress
      });
    }
  }, [mounted, address, chainId, balance, isConnected, contractAddress]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <ProfilePicture name={displayName} size="lg" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
              <p className="text-gray-600">SplitChain Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <MoreVertical className="w-6 h-6 text-gray-400" />
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left Column - Wallet & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Wallet Balance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1" onClick={onTransactions}>
                {/* Balance card with folder tab at top */}
                <div className="relative">
                  {/* Folder tab at top */}
                  <div className="absolute -top-3 left-8 bg-gray-800 px-6 py-2 rounded-t-2xl z-10">
                    {/* Tab notch on right side - wider */}
                    <div className="absolute -right-4 top-0 w-8 h-full">
                      <div className="w-full h-full bg-gray-800 transform skew-x-12 rounded-tr-2xl"></div>
                    </div>
                  </div>

                  {/* Main card body */}
                  <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl p-6 relative z-0">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-gray-400 text-sm mb-2">
                          My Balance {mounted && chainId && (
                            <span className="text-blue-400">• {networkName}</span>
                          )}
                        </p>
                        <p className="text-3xl font-bold text-white">
                          {mounted ? displayBalance : (
                            <span className="animate-pulse">Loading...</span>
                          )}
                        </p>
                        {mounted && balance && chainId && (chainId === 1 || chainId === 42161) && (
                          <p className="text-gray-500 text-xs mt-1">
                            {parseFloat(formatEther(balance.value)).toFixed(4)} ETH
                          </p>
                        )}
                      </div>
                      <ArrowRight className="w-6 h-6 text-gray-400" />
                    </div>

                    {/* Subtle wave lines at bottom right */}
                    <div className="absolute bottom-2 right-4 opacity-15">
                      <svg width="80" height="20" viewBox="0 0 80 20" fill="none">
                        <path d="M0 10C10 5 20 15 30 10C40 5 50 15 60 10C70 5 80 15 80 10" stroke="white" strokeWidth="1" fill="none"/>
                        <path d="M0 15C10 10 20 20 30 15C40 10 50 20 60 15C70 10 80 20 80 15" stroke="white" strokeWidth="1" fill="none"/>
                      </svg>
                    </div>
                  </div>

                  {/* Bottom arrow pointer */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <div className="w-4 h-4 bg-gray-800 transform rotate-45"></div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={onCreateExpense}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Plus className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="font-medium text-gray-900">Create Expense</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </button>

                  <button
                    onClick={onReceiptScan}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Camera className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-900">Scan Receipt</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </button>

                  <button
                    onClick={onFriends}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="font-medium text-gray-900">Manage Groups</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Smart Contract Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Smart Contract</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${contractAddress ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={`text-sm font-medium ${contractAddress ? 'text-green-600' : 'text-red-600'}`}>
                        {contractAddress ? 'Available' : 'Not Available'}
                      </span>
                    </div>
                  </div>
                  {contractAddress && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Address</span>
                      <span className="text-xs font-mono text-gray-900">
                        {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Network</span>
                    <span className="text-sm font-medium text-blue-600">{networkName}</span>
                  </div>
                  {(!contractAddress || contractError) && chainId && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 text-sm font-medium mb-2">
                        {contractError || `Contract not available on ${networkName}`}
                      </p>
                      <p className="text-yellow-700 text-xs mb-2">
                        Please switch to Arbitrum Sepolia to use the contract
                      </p>
                      <button
                        onClick={async () => {
                          if (window.ethereum) {
                            try {
                              await window.ethereum.request({
                                method: 'wallet_switchEthereumChain',
                                params: [{ chainId: '0x17EAE' }], // 421614 in hex for Arbitrum Sepolia
                              });
                            } catch (error: any) {
                              // If the chain doesn't exist, add it
                              if (error.code === 4902) {
                                try {
                                  await window.ethereum.request({
                                    method: 'wallet_addEthereumChain',
                                    params: [{
                                      chainId: '0x17EAE',
                                      chainName: 'Arbitrum Sepolia',
                                      nativeCurrency: {
                                        name: 'ETH',
                                        symbol: 'ETH',
                                        decimals: 18
                                      },
                                      rpcUrls: ['https://arb-sepolia.g.alchemy.com/v2/woz-6XsoF8SYpREpEiPG1'],
                                      blockExplorerUrls: ['https://sepolia.arbiscan.io/']
                                    }]
                                  });
                                } catch (addError) {
                                  console.error('Error adding network:', addError);
                                }
                              }
                            }
                          }
                        }}
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Switch to Arbitrum Sepolia
                      </button>
                    </div>
                  )}
                  {contractAddress && chainSupported && (
                    <div className="space-y-2 mt-2">
                      {/* Contract Status Info */}
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800 text-sm font-medium mb-2">
                          ✅ Contract Activated
                        </p>
                        <p className="text-green-700 text-xs">
                          Contract is now ready for testing. Check console for detailed error logs if issues occur.
                        </p>
                      </div>

                      {/* Test Read Function First */}
                      <button
                        onClick={async () => {
                          try {
                            console.log('Testing read function first...');
                            const groupInfo = await fetch(`https://arb-sepolia.g.alchemy.com/v2/woz-6XsoF8SYpREpEiPG1`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                jsonrpc: '2.0',
                                method: 'eth_call',
                                params: [{
                                  to: contractAddress,
                                  data: '0x8da5cb5b' // Simple read call
                                }, 'latest'],
                                id: 1
                              })
                            });
                            const result = await groupInfo.json();
                            console.log('Contract read test result:', result);
                          } catch (error) {
                            console.error('Read test error:', error);
                          }
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors mb-2"
                      >
                        🔍 Test Read Function
                      </button>

                      {/* Test Contract Button */}
                      <button
                        onClick={async () => {
                          try {
                            // Create a simple test group with minimum 2 members
                            const testAddress2 = '0x1234567890123456789012345678901234567890'; // Dummy second address

                            // Use WETH token for test group
                            const contracts = getContractAddresses();
                            const tokenAddress = contracts.TOKENS?.WETH || '0x980B62Da83eFf3D4576C647993b0c1D7faf17c73';

                            console.log('Creating test group with WETH token:', tokenAddress);

                            await expenseSplitter.createGroup(
                              'Test Group (WETH)',
                              tokenAddress, // Use WETH token address
                              ['You', 'TestUser'],
                              [address as `0x${string}`, testAddress2 as `0x${string}`]
                            );
                          } catch (error) {
                            console.error('Error creating group:', error);
                          }
                        }}
                        disabled={expenseSplitter.isPending || !address || !chainSupported}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        {expenseSplitter.isPending ? 'Creating...' : '🧪 Test Create Group'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Recent Activity</h3>
                {expenseSplitter.hash && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        expenseSplitter.isSuccess ? 'bg-green-500' :
                        expenseSplitter.isConfirming ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {expenseSplitter.isSuccess ? 'Group Created' :
                           expenseSplitter.isConfirming ? 'Creating Group...' :
                           'Group Transaction Sent'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Tx: {expenseSplitter.hash.slice(0, 10)}...{expenseSplitter.hash.slice(-8)}
                        </p>
                      </div>
                      <span className="text-xs text-blue-600">
                        {expenseSplitter.isSuccess ? '✓' : '⏳'}
                      </span>
                    </div>
                  </div>
                )}
                {!expenseSplitter.hash && (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500">No recent activity</p>
                    <p className="text-xs text-gray-400 mt-1">Create your first group to get started</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            {/* My Groups & Balances */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">My Groups & Balances</h2>
                <Button variant="ghost" className="text-[#7C3AED] hover:text-[#6D28D9]" onClick={onFriends}>
                  Manage Groups
                </Button>
              </div>

              <div className="grid gap-6">
                {/* Example: Group 1 Balance */}
                {userDashboard.memberBalance && !userDashboard.isLoading && (address && isConnected) ? (
                  <div className="bg-gradient-to-br from-blue-100 to-purple-200 rounded-3xl p-6 hover:shadow-xl transition-all duration-300">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-900 text-xl">Group #1</h3>
                        <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Active</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-green-600 text-sm font-medium mb-1">💰 You Are Owed</p>
                          <p className="font-bold text-gray-900 text-lg">{userDashboard.memberBalance.totalOwedByOthersFormatted} ETH</p>
                        </div>
                        <div>
                          <p className="text-red-600 text-sm font-medium mb-1">💳 You Owe</p>
                          <p className="font-bold text-gray-900 text-lg">{userDashboard.memberBalance.totalOwedFormatted} ETH</p>
                        </div>
                      </div>

                      <div className="bg-white bg-opacity-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-600 mb-1">Net Balance</p>
                        <p className={`font-bold text-lg ${
                          parseFloat(userDashboard.memberBalance.netBalanceFormatted) > 0 ? 'text-green-600' :
                          parseFloat(userDashboard.memberBalance.netBalanceFormatted) < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {parseFloat(userDashboard.memberBalance.netBalanceFormatted) > 0 ? '+' : ''}
                          {userDashboard.memberBalance.netBalanceFormatted} ETH
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
                        onClick={() => onGroupDetails && onGroupDetails()}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 py-2 rounded-lg font-medium"
                        onClick={onCreateExpense}
                      >
                        Add Expense
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-6">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto bg-gray-300 rounded-full flex items-center justify-center mb-4">
                        <User className="w-8 h-8 text-gray-500" />
                      </div>
                      <h3 className="font-bold text-gray-900 text-xl mb-2">No Groups Yet</h3>
                      <p className="text-gray-600 mb-4">Create or join a group to start splitting expenses</p>
                      <Button
                        variant="primary"
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-lg font-medium"
                        onClick={onFriends}
                      >
                        Create Group
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
};
