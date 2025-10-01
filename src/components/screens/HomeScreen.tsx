import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ProfilePicture } from '../ui/ProfilePicture';
import { MoreVertical, ArrowRight, Plus, Camera, User, DollarSign } from 'lucide-react';
import { useAccount, useBalance, useChainId } from 'wagmi';
import { formatEther } from 'viem';
import { useExpenseSplitter, useUserExpenseDashboard, useSplitChainBalance, useGroupManagementData } from '@/hooks/useExpenseSplitter';
import { getContractAddress, isChainSupported, getSupportedChainNames, getContractAddresses } from '@/contracts/config';

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

  // Get SplitChain token balance
  const splitChainBalance = useSplitChainBalance(address);

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
  
  // Load bills from multiple groups for recent expenses dashboard
  const { groups: allGroups, isLoading: groupsLoading } = useGroupManagementData();
  
  // Get recent bills across all groups (flattened)
  const recentExpenses = React.useMemo(() => {
    if (!allGroups || allGroups.length === 0) return [];
    
    // Collect all bills from all groups
    const allBills: any[] = [];
    
    allGroups.forEach((group: any) => {
      // For now, show groups as expense summary
      if (group.members && group.members[0]) {
        const balance = group.members[0].balance;
        if (balance !== 0) {
          allBills.push({
            id: `group-${group.id}`,
            groupId: group.id,
            groupName: group.name,
            description: group.description,
            amount: Math.abs(balance),
            type: balance > 0 ? 'receiving' : 'paying',
            date: 'Recent',
            memberCount: group.members.length,
            groupData: group // Store the full group data for navigation
          });
        }
      }
    });
    
    return allBills.slice(0, 5); // Show max 5 recent items
  }, [allGroups]);

  // Quick Stats: Show summary from all groups with activity
  const totalGroups = allGroups?.length || 0;
  const totalOwedByOthers = allGroups?.reduce((sum: number, g: any) => {
    const balance = g.members?.[0]?.balance || 0;
    return sum + (balance > 0 ? balance : 0);
  }, 0) || 0;
  const totalOwed = allGroups?.reduce((sum: number, g: any) => {
    const balance = g.members?.[0]?.balance || 0;
    return sum + (balance < 0 ? Math.abs(balance) : 0);
  }, 0) || 0;

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
                        {mounted && splitChainBalance && !splitChainBalance.isLoading && (
                          <p className="text-green-400 text-sm mt-2">
                            {splitChainBalance.balanceFormatted} STK
                          </p>
                        )}
                        {mounted && splitChainBalance?.isLoading && (
                          <p className="text-gray-500 text-sm mt-2 animate-pulse">
                            Loading STK...
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

            {/* Get STK Tokens */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Get STK Tokens</h3>
                
                {/* Current STK Balance */}
                <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Your STK Balance</p>
                  <p className="text-2xl font-bold text-green-900">
                    {mounted && splitChainBalance && !splitChainBalance.isLoading 
                      ? splitChainBalance.balanceFormatted 
                      : '0.00'} STK
                  </p>
                </div>

                {/* Network Status */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Network</span>
                    <span className="text-sm font-medium text-blue-600">{networkName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Contract</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${contractAddress ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={`text-xs font-medium ${contractAddress ? 'text-green-600' : 'text-red-600'}`}>
                        {contractAddress ? 'Ready' : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Switch Network Warning */}
                {(!contractAddress || contractError) && chainId && (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-3">
                    <p className="text-yellow-800 text-xs font-medium mb-2">
                      ⚠️ Please switch to Arbitrum Sepolia
                    </p>
                    <button
                      onClick={async () => {
                        if (window.ethereum && 'request' in window.ethereum) {
                          try {
                            await (window.ethereum.request as (args: { method: string; params?: unknown[] }) => Promise<unknown>)({
                              method: 'wallet_switchEthereumChain',
                              params: [{ chainId: '0x17EAE' }],
                            });
                          } catch (error: unknown) {
                            const err = error as { code?: number };
                            if (err.code === 4902) {
                              try {
                                await (window.ethereum.request as (args: { method: string; params?: unknown[] }) => Promise<unknown>)({
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
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg text-xs font-medium transition-colors"
                    >
                      Switch Network
                    </button>
                  </div>
                )}

                {/* Faucet Button */}
                {contractAddress && chainSupported && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 mb-2">
                      Get free STK tokens for testing. You'll receive 100 STK tokens.
                    </p>
                    <button
                      onClick={async () => {
                        // TODO: Implement faucet functionality
                        // This will call the publicMint function on the STK token contract
                        console.log('Faucet button clicked - mint STK tokens');
                        alert('Faucet functionality coming soon!');
                      }}
                      disabled={!address || !chainSupported}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 rounded-lg text-sm font-bold transition-all transform hover:scale-105 disabled:hover:scale-100"
                    >
                      💰 Get Free STK Tokens
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recent Expenses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Recent Expenses</h3>

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
                          {expenseSplitter.isSuccess ? 'Transaction Complete' :
                           expenseSplitter.isConfirming ? 'Processing...' :
                           'Transaction Sent'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {expenseSplitter.hash.slice(0, 10)}...{expenseSplitter.hash.slice(-8)}
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500">No expenses yet</p>
                    <p className="text-xs text-gray-400 mt-1">Add your first expense</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            {/* Quick Stats Overview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
            >
              <div className="grid grid-cols-3 gap-4 mb-6">
                {/* Total Groups */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-purple-200 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-700" />
                    </div>
                  </div>
                  <p className="text-sm text-purple-600 font-medium mb-1">Total Groups</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {groupsLoading ? '...' : totalGroups}
                  </p>
                </div>

                {/* Amount You're Owed */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-green-200 rounded-xl flex items-center justify-center">
                      <span className="text-xl">💰</span>
                    </div>
                  </div>
                  <p className="text-sm text-green-600 font-medium mb-1">You're Owed</p>
                  <p className="text-2xl font-bold text-green-900">
                    {groupsLoading ? '...' : totalOwedByOthers.toFixed(4)} STK
                  </p>
                </div>

                {/* Amount You Owe */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-orange-200 rounded-xl flex items-center justify-center">
                      <span className="text-xl">💳</span>
                    </div>
                  </div>
                  <p className="text-sm text-orange-600 font-medium mb-1">You Owe</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {groupsLoading ? '...' : totalOwed.toFixed(4)} STK
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Recent Expenses */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
                  <p className="text-sm text-gray-500 mt-1">Your latest expense activity across all groups</p>
                </div>
                <Button variant="ghost" className="text-[#7C3AED] hover:text-[#6D28D9]" onClick={onTransactions}>
                  View All Transactions
                </Button>
              </div>

              <div className="space-y-4">
                {/* Show recent expenses */}
                {!groupsLoading && recentExpenses.length > 0 ? (
                  recentExpenses.map((expense) => (
                    <Card key={expense.id} className="p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onGroupDetails && onGroupDetails(expense.groupData)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            expense.type === 'receiving' ? 'bg-green-100' : 'bg-orange-100'
                          }`}>
                            <span className="text-2xl">
                              {expense.type === 'receiving' ? '💰' : '💳'}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{expense.groupName}</h3>
                            <p className="text-sm text-gray-600 mt-1">{expense.description}</p>
                            <p className="text-xs text-gray-400 mt-1">{expense.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${
                            expense.type === 'receiving' ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            {expense.type === 'receiving' ? '+' : '-'}{expense.amount.toFixed(4)} STK
                          </p>
                          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                            expense.type === 'receiving' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {expense.type === 'receiving' ? 'You\'ll Receive' : 'You Owe'}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : null}
                
                {/* Show "View All" link when expenses exist */}
                {!groupsLoading && recentExpenses.length > 0 && (
                  <div className="text-center py-4 border-t border-gray-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-purple-600 hover:text-purple-700 font-medium"
                      onClick={onTransactions}
                    >
                      See All Transactions →
                    </Button>
                  </div>
                )}

                {/* Loading State */}
                {groupsLoading && (
                  <Card className="p-8">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                        <DollarSign className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600">Loading expenses...</p>
                    </div>
                  </Card>
                )}

                {/* Empty State */}
                {!groupsLoading && recentExpenses.length === 0 && (
                  <Card className="p-8">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <DollarSign className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recent Expenses</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Create a group and add your first expense to get started
                      </p>
                      <div className="flex gap-3 justify-center">
                        <Button
                          variant="primary"
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                          onClick={onCreateExpense}
                        >
                          Create Expense
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={onFriends}
                        >
                          Manage Groups
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
};
