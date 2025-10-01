import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ProfilePicture } from '../ui/ProfilePicture';
import { ArrowLeft, DollarSign, Calendar, MapPin, Users, CheckCircle, Clock } from 'lucide-react';
import { useGroupMembers, useGroupBills, useExpenseSplitter, useGroupInfo, useDebtAmount, useGroupCreator } from '@/hooks/useExpenseSplitter';
import { useReadContract, useAccount } from 'wagmi';
import { formatUnits, parseEther } from 'viem';
import { getContractAddresses } from '@/contracts/config';
import { BillSplitterABI } from '@/config/abi/bill_splitter';

interface ExpenseDetailsScreenProps {
  onBack: () => void;
  expenseData?: ExpenseData;
  groupId?: bigint;
  billIndex?: number;
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
  groupId?: string;
  billIndex?: number;
  youWillReceive: number;
  youOwe: number;
  userAction: string;
  items?: Array<{
    name: string;
    price: number;
  }>;
}

interface ExpenseItem {
  name: string;
  price: number;
}

interface Participant {
  name: string;
  amount: number;
  status: string;
}

export const ExpenseDetailsScreen: React.FC<ExpenseDetailsScreenProps> = ({ onBack, expenseData: passedExpenseData, groupId, billIndex }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'split' | 'history'>('overview');
  const [isSettling, setIsSettling] = useState(false);

  const contracts = getContractAddresses();
  const { address: currentUserAddress } = useAccount();
  const { settleDebt, approveToken, isConfirming, isSuccess } = useExpenseSplitter();

  // Use passed parameters or extract from expense data
  const actualGroupId = groupId || (passedExpenseData?.groupId ? BigInt(passedExpenseData.groupId) : undefined);
  const actualBillIndex = billIndex !== undefined ? billIndex : passedExpenseData?.billIndex;

  console.log('ExpenseDetailsScreen - groupId:', groupId);
  console.log('ExpenseDetailsScreen - billIndex:', billIndex);
  console.log('ExpenseDetailsScreen - passedExpenseData:', passedExpenseData);
  console.log('ExpenseDetailsScreen - passedExpenseData.groupId:', passedExpenseData?.groupId);
  console.log('ExpenseDetailsScreen - passedExpenseData.billIndex:', passedExpenseData?.billIndex);
  console.log('ExpenseDetailsScreen - actualGroupId:', actualGroupId);
  console.log('ExpenseDetailsScreen - actualBillIndex:', actualBillIndex);
  console.log('ExpenseDetailsScreen - contracts.EXPENSE_SPLITTER:', contracts.EXPENSE_SPLITTER);

  // Load contract data for the specific bill
  const billAmount = useReadContract({
    address: contracts.EXPENSE_SPLITTER,
    abi: BillSplitterABI,
    functionName: 'getBillAmount',
    args: actualGroupId !== undefined && actualBillIndex !== undefined ? [actualGroupId, actualBillIndex] : undefined,
    query: {
      enabled: !!contracts.EXPENSE_SPLITTER && actualGroupId !== undefined && actualBillIndex !== undefined,
    },
  });

  const billDescription = useReadContract({
    address: contracts.EXPENSE_SPLITTER,
    abi: BillSplitterABI,
    functionName: 'getBillDescription',
    args: actualGroupId !== undefined && actualBillIndex !== undefined ? [actualGroupId, actualBillIndex] : undefined,
    query: {
      enabled: !!contracts.EXPENSE_SPLITTER && actualGroupId !== undefined && actualBillIndex !== undefined,
    },
  });

  const billCreator = useReadContract({
    address: contracts.EXPENSE_SPLITTER,
    abi: BillSplitterABI,
    functionName: 'getBillCreator',
    args: actualGroupId !== undefined && actualBillIndex !== undefined ? [actualGroupId, actualBillIndex] : undefined,
    query: {
      enabled: !!contracts.EXPENSE_SPLITTER && actualGroupId !== undefined && actualBillIndex !== undefined,
    },
  });

  const participantCount = useReadContract({
    address: contracts.EXPENSE_SPLITTER,
    abi: BillSplitterABI,
    functionName: 'getBillParticipantCount',
    args: actualGroupId !== undefined && actualBillIndex !== undefined ? [actualGroupId, actualBillIndex] : undefined,
    query: {
      enabled: !!contracts.EXPENSE_SPLITTER && actualGroupId !== undefined && actualBillIndex !== undefined,
    },
  });

  // Load group members to get member details
  const groupMembersData = useGroupMembers(actualGroupId);

  // Get group info to get token address and bill creator
  const groupInfo = useGroupInfo(actualGroupId);

  // Get the actual group creator (admin)
  const groupCreatorData = useGroupCreator(actualGroupId);

  // Get the debt amount - check if current user owes bill creator
  const debtInfo = useDebtAmount(
    actualGroupId,
    currentUserAddress,
    billCreator.data as `0x${string}` | undefined
  );

  // Also check if others owe current user (when current user is the bill creator)
  const reverseDebtInfo = useDebtAmount(
    actualGroupId,
    billCreator.data as `0x${string}` | undefined,
    currentUserAddress
  );

  // Check debt for each member to determine their payment status
  const memberDebts = groupMembersData.members?.map((member) => {
    if (!member) return null;
    
    const debtResult = useReadContract({
      address: contracts.EXPENSE_SPLITTER,
      abi: BillSplitterABI,
      functionName: 'getDebt',
      args: actualGroupId !== undefined && billCreator.data && member.address 
        ? [actualGroupId, member.address as `0x${string}`, billCreator.data as `0x${string}`]
        : undefined,
      query: {
        enabled: !!contracts.EXPENSE_SPLITTER && actualGroupId !== undefined && !!billCreator.data && !!member.address,
        gcTime: 1000,
        staleTime: 0,
        refetchInterval: 3000, // Auto-refresh to detect payments
      },
    });
    
    return {
      address: member.address as `0x${string}`,
      debt: debtResult.data as bigint | undefined,
      isLoading: debtResult.isLoading,
    };
  }).filter((debt): debt is { address: `0x${string}`; debt: bigint | undefined; isLoading: boolean } => debt !== null) || [];

  // Basic contract test - try to read member count for group 0
  const testMemberCount = useReadContract({
    address: contracts.EXPENSE_SPLITTER,
    abi: BillSplitterABI,
    functionName: 'getMemberCount',
    args: [BigInt(0)],
    query: {
      enabled: !!contracts.EXPENSE_SPLITTER,
    },
  });

  console.log('ExpenseDetailsScreen - testMemberCount:', testMemberCount.data);
  console.log('ExpenseDetailsScreen - testMemberCount.isLoading:', testMemberCount.isLoading);
  console.log('ExpenseDetailsScreen - testMemberCount.error:', testMemberCount.error);

  // Log individual contract call results
  console.log('ExpenseDetailsScreen - billAmount:', {
    data: billAmount.data,
    isLoading: billAmount.isLoading,
    error: billAmount.error
  });
  console.log('ExpenseDetailsScreen - billDescription:', {
    data: billDescription.data,
    isLoading: billDescription.isLoading,
    error: billDescription.error
  });
  console.log('ExpenseDetailsScreen - billCreator:', {
    data: billCreator.data,
    isLoading: billCreator.isLoading,
    error: billCreator.error
  });

  // DEBUG: Print raw contract data to console
  console.log('=== RAW SMART CONTRACT DEBUG DATA ===');
  console.log('Your wallet address:', currentUserAddress);
  console.log('Group creator (admin) address:', groupCreatorData.groupCreator);
  console.log('Bill creator address from contract:', billCreator.data);
  console.log('Are you the group admin?:', groupCreatorData.groupCreator?.toLowerCase() === currentUserAddress?.toLowerCase());
  console.log('Are you the bill creator?:', (billCreator.data as string)?.toLowerCase() === currentUserAddress?.toLowerCase());
  console.log('Your debt to bill creator:', debtInfo.debtAmount?.toString(), 'wei');
  console.log('Your debt formatted:', debtInfo.debtAmountFormatted, 'STK');
  console.log('Bill creator owes you:', reverseDebtInfo.debtAmount?.toString(), 'wei');
  console.log('Bill creator owes you formatted:', reverseDebtInfo.debtAmountFormatted, 'STK');
  console.log('Group ID:', actualGroupId?.toString());
  console.log('Bill Index:', actualBillIndex);

  // Key payment status analysis
  const youAreBillCreator = (billCreator.data as string | undefined)?.toLowerCase() === currentUserAddress?.toLowerCase();
  const youHavePaid = debtInfo.debtAmount === BigInt(0);
  const youWillReceive = youAreBillCreator && reverseDebtInfo.debtAmount > BigInt(0);

  console.log('--- PAYMENT STATUS ANALYSIS ---');
  console.log('You are the bill creator:', youAreBillCreator);
  console.log('You have paid your debt:', youHavePaid);
  console.log('You will receive payment:', youWillReceive);
  console.log('=====================================');

  // Create contract-based expense data
  const contractExpenseData = useMemo(() => {
    console.log('contractExpenseData useMemo triggered with:');
    console.log('  - billAmount.data:', billAmount.data);
    console.log('  - billDescription.data:', billDescription.data);
    console.log('  - billCreator.data:', billCreator.data);
    console.log('  - groupMembersData.members:', groupMembersData.members);
    console.log('  - participantCount.data:', participantCount.data);

    if (!billAmount.data || !billDescription.data || !billCreator.data || !groupMembersData.members) {
      console.log('contractExpenseData: Missing required data, returning null');
      return null;
    }

    const amountETH = parseFloat(formatUnits(billAmount.data as bigint, 18));
    const participantCountNum = participantCount.data ? Number(participantCount.data) : groupMembersData.members.length;
    const amountPerPerson = participantCountNum > 0 ? amountETH / participantCountNum : 0;

    console.log('contractExpenseData calculations:');
    console.log('  - amountETH:', amountETH);
    console.log('  - participantCountNum:', participantCountNum);
    console.log('  - amountPerPerson:', amountPerPerson);

    // Find creator in group members
    const creatorAddress = billCreator.data as string;
    const creator = groupMembersData.members.find(m => m && m.address.toLowerCase() === creatorAddress.toLowerCase());

    // Create participants array - exclude the bill creator since they already paid
    const participants = groupMembersData.members
      .filter((member): member is NonNullable<typeof member> => member !== null && member.address.toLowerCase() !== creatorAddress.toLowerCase())
      .map(member => {
        // Find this member's debt information
        const memberDebtInfo = memberDebts.find(
          d => d.address.toLowerCase() === member.address.toLowerCase()
        );
        
        // If debt is 0, they've paid. Otherwise, they still owe money.
        const hasPaid = memberDebtInfo?.debt === BigInt(0);
        const status = hasPaid ? 'paid' : 'approved';
        
        return {
          name: member.name || 'Member',
          address: member.address,
          amount: amountPerPerson,
          status: status,
          isCreator: false,
          isCurrentUser: member.address.toLowerCase() === currentUserAddress?.toLowerCase(),
          owesAmount: amountPerPerson,
          willReceive: 0,
          debt: memberDebtInfo?.debt
        };
      });

    const isCurrentUserCreator = currentUserAddress?.toLowerCase() === creatorAddress.toLowerCase();

    const result = {
      id: `bill-${billIndex}`,
      description: billDescription.data as string || 'Contract Expense',
      amount: amountETH,
      date: new Date().toISOString().split('T')[0],
      timestamp: 'Recently created',
      merchant: 'Smart Contract',
      location: 'Blockchain',
      paidBy: creator?.name || 'Unknown',
      paidByAddress: creatorAddress,
      participants,
      status: 'pending',
      approvals: participantCountNum,
      totalParticipants: participantCountNum,
      isReady: true,
      txHash: null,
      category: 'General',
      splitMethod: 'equal',
      receipt: 'On-chain',
      notes: `Bill created on blockchain by ${creator?.name || 'Unknown'}`,
      group: `Group ${groupId}`,
      // Fixed logic: if you created the bill, you'll receive back the total minus your own share
      youWillReceive: isCurrentUserCreator ? (amountPerPerson * participants.length) : 0,
      youOwe: isCurrentUserCreator ? 0 : amountPerPerson,
      userAction: isCurrentUserCreator ? 'collect' : 'pay',
      items: [
        { name: billDescription.data as string || 'Expense', price: amountETH }
      ]
    };

    console.log('contractExpenseData final result:', result);
    return result;
  }, [billAmount.data, billDescription.data, billCreator.data, groupMembersData.members, participantCount.data, actualGroupId, actualBillIndex, memberDebts, currentUserAddress]);

  // Payment function for settling debt
  const handlePayment = async () => {
    console.log('handlePayment called - checking payment data:', {
      actualGroupId,
      'groupInfo.groupInfo': groupInfo.groupInfo,
      'groupInfo.groupInfo?.token': groupInfo.groupInfo?.token,
      'billCreator.data': billCreator.data,
      'debtInfo.debtAmount': debtInfo.debtAmount,
      'debtInfo.debtAmount toString': debtInfo.debtAmount?.toString(),
      currentUserAddress,
      'contracts.EXPENSE_SPLITTER': contracts.EXPENSE_SPLITTER
    });

    if (actualGroupId === undefined || actualGroupId === null) {
      console.error('Missing actualGroupId');
      return;
    }
    if (!groupInfo.groupInfo?.token) {
      console.error('Missing group token address');
      return;
    }
    if (!billCreator.data) {
      console.error('Missing bill creator');
      return;
    }
    if (!debtInfo.debtAmount || debtInfo.debtAmount === BigInt(0)) {
      console.error('Missing or zero debt amount');
      return;
    }
    if (!currentUserAddress) {
      console.error('Missing current user address');
      return;
    }
    if (!contracts.EXPENSE_SPLITTER) {
      console.error('Missing contract address');
      return;
    }

    setIsSettling(true);
    try {
      // Use the known STK token address instead of potentially corrupted contract data
      const tokenAddress = contracts.TOKENS?.STK as `0x${string}`;
      if (!tokenAddress) {
        throw new Error('STK token address not found in config');
      }

      const creditorAddress = billCreator.data as `0x${string}`;
      const debtAmount = debtInfo.debtAmount;

      // Validate all required data
      if (!creditorAddress || creditorAddress === '0x0000000000000000000000000000000000000000') {
        throw new Error('Invalid creditor address');
      }
      if (!debtAmount || debtAmount === BigInt(0)) {
        throw new Error('No debt amount to settle');
      }

      console.log('Starting payment process with verified data:', {
        tokenAddress,
        creditorAddress,
        debtAmount: debtAmount.toString(),
        debtAmountFormatted: formatUnits(debtAmount, 18),
        contractAddress: contracts.EXPENSE_SPLITTER,
        currentUserAddress
      });

      // Step 1: Approve token spending
      console.log(`Step 1: Approving ${formatUnits(debtAmount, 18)} STK tokens for contract ${contracts.EXPENSE_SPLITTER}...`);
      await approveToken(tokenAddress, contracts.EXPENSE_SPLITTER!, debtAmount);
      console.log('STK token approval transaction submitted successfully');

      // Wait for approval to be confirmed before settling
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 2: Settle the debt
      console.log(`Step 2: Settling ${formatUnits(debtAmount, 18)} STK tokens to creditor ${creditorAddress}...`);
      await settleDebt(actualGroupId, creditorAddress, debtAmount);
      console.log('STK debt settlement transaction submitted successfully');

      // Auto-refresh after successful payment
      setTimeout(() => {
        window.location.reload();
      }, 3000);

      console.log('Payment process completed successfully');
    } catch (error) {
      console.error('Payment failed:', error);
      // Add user-friendly error message
      alert(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSettling(false);
    }
  };

  // Use passed expense data or fallback to default
  const defaultExpenseData = {
    id: 'bill-150',
    description: 'Coffee & Lunch',
    amount: 150.50,
    date: '2024-09-23',
    timestamp: '2 hours ago',
    merchant: 'Downtown Café',
    location: 'San Francisco, CA',
    paidBy: 'You (ogazboiz)',
    participants: [
      { name: 'Jimmy Cooper', amount: 50.17, status: 'approved' },
      { name: 'Guy Hawkins', amount: 50.17, status: 'approved' },
      { name: 'Robert Fox', amount: 50.16, status: 'approved' }
    ],
    status: 'pending',
    approvals: 3,
    totalParticipants: 3,
    isReady: true,
    txHash: null,
    category: 'Food & Dining',
    splitMethod: 'equal',
    receipt: 'Available',
    notes: 'You paid for lunch at downtown cafe. Others will reimburse you.',
    group: 'SF Roommates',
    youWillReceive: 150.50,
    youOwe: 0,
    userAction: 'collect',
    items: [
      { name: 'Americano x3', price: 15.00 },
      { name: 'Avocado Toast x2', price: 28.00 },
      { name: 'Caesar Salad x1', price: 16.50 },
      { name: 'Grilled Chicken Sandwich x1', price: 18.00 },
      { name: 'Fresh Juice x2', price: 12.00 },
      { name: 'Tax (8.5%)', price: 7.56 },
      { name: 'Tip (18%)', price: 16.20 },
      { name: 'Service Fee', price: 2.74 }
    ]
  };

  // Loading state for contract data
  const isLoadingContractData = actualGroupId !== undefined && actualBillIndex !== undefined &&
    (billAmount.isLoading || billDescription.isLoading || billCreator.isLoading || groupMembersData.isLoading);

  // Use contract data if available, otherwise fallback to passed data or default
  const expenseData = contractExpenseData || passedExpenseData || defaultExpenseData;

  console.log('ExpenseDetailsScreen - groupInfo:', groupInfo);
  console.log('ExpenseDetailsScreen - debtInfo:', debtInfo);
  console.log('ExpenseDetailsScreen - reverseDebtInfo:', reverseDebtInfo);
  console.log('ExpenseDetailsScreen - currentUserAddress:', currentUserAddress);
  console.log('ExpenseDetailsScreen - billCreator.data:', billCreator.data);
  console.log('ExpenseDetailsScreen - isCurrentUserBillCreator:', currentUserAddress?.toLowerCase() === (billCreator.data as string)?.toLowerCase());
  console.log('ExpenseDetailsScreen - contractExpenseData:', contractExpenseData);
  console.log('ExpenseDetailsScreen - isLoadingContractData:', isLoadingContractData);

  // Determine correct user action based on actual smart contract debt data
  const getUserAction = () => {
    if (!contractExpenseData) {
      return expenseData.userAction || 'pay'; // Use passed data or default for demo mode
    }

    // Use actual debt data from smart contract
    const youOweDebt = debtInfo.debtAmount > BigInt(0);
    const othersOweYou = reverseDebtInfo.debtAmount > BigInt(0);
    const youAreBillCreator = (billCreator.data as string | undefined)?.toLowerCase() === currentUserAddress?.toLowerCase();

    console.log('getUserAction analysis:', {
      youOweDebt,
      othersOweYou,
      youAreBillCreator,
      debtAmount: debtInfo.debtAmount?.toString(),
      reverseDebtAmount: reverseDebtInfo.debtAmount?.toString()
    });

    if (youOweDebt) {
      return 'pay'; // You still owe money
    } else if (othersOweYou || youAreBillCreator) {
      return 'collect'; // Others owe you money or you're waiting to be paid
    } else {
      return 'paid'; // You've paid your share and nobody owes you
    }
  };

  // Enhanced expense data with additional details and safe defaults
  const detailedExpenseData = {
    ...expenseData,
    amount: expenseData.amount || 0,
    merchant: expenseData.merchant || 'Downtown Café',
    location: expenseData.location || 'San Francisco, CA',
    participants: expenseData.participants || [],
    approvals: expenseData.approvals || 0,
    totalParticipants: expenseData.totalParticipants || 1,
    youWillReceive: expenseData.youWillReceive || 0,
    youOwe: expenseData.youOwe || 0,
    userAction: getUserAction(), // Use smart contract-based logic
    items: expenseData.items || [
      { name: 'Americano x3', price: 15.00 },
      { name: 'Avocado Toast x2', price: 28.00 },
      { name: 'Caesar Salad x1', price: 16.50 },
      { name: 'Grilled Chicken Sandwich x1', price: 18.00 },
      { name: 'Fresh Juice x2', price: 12.00 },
      { name: 'Tax (8.5%)', price: 7.56 },
      { name: 'Tip (18%)', price: 16.20 },
      { name: 'Service Fee', price: 2.74 }
    ],
    createdAt: expenseData.timestamp || '2 hours ago',
    settledAt: expenseData.isReady ? null : 'Not yet settled',
    transactionHash: expenseData.txHash || (expenseData.isReady ? 'Ready for execution' : null),
    paymentMethod: 'USDC on Arbitrum',
    createdBy: expenseData.paidBy,
    contractAddress: '0x742d35f8...8D32'
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="p-3" onClick={onBack}>
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{detailedExpenseData.description}</h1>
                {contractExpenseData && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    Live Data
                  </span>
                )}
                {!contractExpenseData && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                    Demo Data
                  </span>
                )}
              </div>
              <p className="text-gray-600">{detailedExpenseData.merchant} • {detailedExpenseData.timestamp}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            {detailedExpenseData.userAction === 'collect' && (
              <div className="text-right">
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl font-bold text-lg mb-2">
                  💰 You Will Receive: {contractExpenseData ? `${(detailedExpenseData.youWillReceive || 0).toFixed(4)} ETH` : `$${(detailedExpenseData.youWillReceive || 0).toFixed(2)}`}
                </div>
                <p className="text-sm text-green-600 font-medium">Others owe you money</p>
              </div>
            )}
            {detailedExpenseData.userAction === 'pay' && (
              <div className="text-right">
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl font-bold text-lg mb-2">
                  💳 You Owe: {contractExpenseData ? `${debtInfo.debtAmountFormatted} STK` : `$${(detailedExpenseData.youOwe || 0).toFixed(2)}`}
                </div>
                <p className="text-sm text-red-600 font-medium">You need to pay your share</p>
              </div>
            )}
            {detailedExpenseData.userAction === 'paid' && (
              <div className="text-right">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl font-bold text-lg mb-2">
                  ✅ You Paid: {contractExpenseData ? `${debtInfo.debtAmountFormatted} STK` : `$${(detailedExpenseData.youOwe || 0).toFixed(2)}`}
                </div>
                <p className="text-sm text-blue-600 font-medium">Your payment has been settled</p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                detailedExpenseData.isReady ? 'bg-green-100 text-green-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {detailedExpenseData.isReady ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                {detailedExpenseData.isReady ? 'Ready' : 'Pending'}
              </span>
              <span className="text-xs text-gray-500">
                {detailedExpenseData.approvals}/{detailedExpenseData.totalParticipants}
              </span>
            </div>
          </div>
        </div>

        {/* Action Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          {detailedExpenseData.userAction === 'collect' ? (
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-3xl p-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💰</span>
                </div>
                <h2 className="text-3xl font-bold text-green-900 mb-2">
                  You Will Receive {contractExpenseData ?
                    `${(detailedExpenseData.youWillReceive || 0).toFixed(4)} ETH` :
                    `$${(detailedExpenseData.youWillReceive || 0).toFixed(2)}`
                  }
                </h2>
                <p className="text-green-700 text-lg mb-4">You paid the bill - others will reimburse you automatically when they settle</p>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-600 font-medium">Waiting for participants to pay</span>
                </div>
                <div className="bg-green-100 rounded-xl p-4">
                  <p className="text-green-800 text-sm">
                    💡 <strong>No action needed!</strong> When participants click "Pay Your Share" below,
                    tokens will be transferred directly to your wallet automatically.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-red-50 to-orange-100 border-2 border-red-200 rounded-3xl p-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💳</span>
                </div>
                <h2 className="text-3xl font-bold text-red-900 mb-2">
                  You Owe {contractExpenseData ?
                    `${debtInfo.debtAmountFormatted} ETH` :
                    `$${(detailedExpenseData.youOwe || 0).toFixed(2)}`
                  }
                </h2>
                <p className="text-red-700 text-lg mb-4">Pay your share of the bill</p>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="text-orange-600 font-medium">
                    {contractExpenseData ? 'Payment required' : 'Your approval needed'}
                  </span>
                </div>
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-2xl font-bold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                  onClick={() => {
                    console.log('Pay Your Share button clicked');
                    handlePayment();
                  }}
                  disabled={isSettling || isConfirming || !contractExpenseData || debtInfo.debtAmount === BigInt(0) || (currentUserAddress?.toLowerCase() === (billCreator.data as string)?.toLowerCase())}
                >
                  {isSettling ? 'Step 1: Approving Tokens...' :
                   isConfirming ? 'Step 2: Settling Debt...' :
                   contractExpenseData ? `Pay ${debtInfo.debtAmountFormatted} STK` : 'Demo Mode - No Payment'}
                </Button>
                {contractExpenseData && debtInfo.debtAmount > BigInt(0) && (
                  <p className="text-xs text-gray-600 mt-2">
                    This will approve and transfer {debtInfo.debtAmountFormatted} STK tokens to {contractExpenseData.paidBy}
                  </p>
                )}
                {contractExpenseData && debtInfo.debtAmount === BigInt(0) && (
                  <p className="text-xs text-yellow-600 mt-2">
                    {currentUserAddress?.toLowerCase() === (billCreator.data as string)?.toLowerCase()
                      ? "You created this bill - others owe you money"
                      : "No debt found - you may have already paid or are not part of this bill"
                    }
                  </p>
                )}
                {contractExpenseData && !currentUserAddress && (
                  <p className="text-xs text-red-600 mt-2">
                    Please connect your wallet to pay
                  </p>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {contractExpenseData ? `${(detailedExpenseData.amount || 0).toFixed(4)} ETH` : `$${(detailedExpenseData.amount || 0).toFixed(2)}`}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Participants</p>
                  <p className="text-2xl font-bold text-gray-900">{detailedExpenseData.participants.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Per Person</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {contractExpenseData ?
                      `${((detailedExpenseData.amount || 0) / Math.max(detailedExpenseData.participants.length, 1)).toFixed(4)} ETH` :
                      `$${((detailedExpenseData.amount || 0) / Math.max(detailedExpenseData.participants.length, 1)).toFixed(2)}`
                    }
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: DollarSign },
                { id: 'split', label: 'Split Details', icon: Users },
                { id: 'history', label: 'History', icon: Calendar },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'split' | 'history')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-[#7C3AED] text-[#7C3AED]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Expense Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Merchant</label>
                  <p className="text-gray-900">{detailedExpenseData.merchant}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <p className="text-gray-900">{detailedExpenseData.timestamp}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {detailedExpenseData.location}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Group</label>
                  <p className="text-gray-900">{detailedExpenseData.group}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <p className="text-gray-900">{detailedExpenseData.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Split Method</label>
                  <p className="text-gray-900 capitalize">{detailedExpenseData.splitMethod}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Receipt</label>
                  <p className="text-gray-900">{detailedExpenseData.receipt}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <p className="text-gray-900">{detailedExpenseData.paymentMethod}</p>
                </div>
              </div>
            </Card>

            {/* Items Breakdown */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Items Breakdown</h3>
              <div className="space-y-3">
                {detailedExpenseData.items.map((item: ExpenseItem, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{item.name}</span>
                    <span className="text-gray-600">${(item.price || 0).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl font-bold border border-blue-200">
                  <span className="text-gray-900 text-lg">Total</span>
                  <span className="text-gray-900 text-xl">${(detailedExpenseData.amount || 0).toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'split' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Split Details</h3>
              <div className="space-y-4">
                {detailedExpenseData.userAction === 'collect' ? (
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">💰</span>
                      </div>
                      <div>
                        <p className="font-bold text-green-900 text-lg">You Paid the Bill</p>
                        <p className="text-sm text-green-700">Others will reimburse you • {detailedExpenseData.timestamp}</p>
                      </div>
                    </div>
                    {detailedExpenseData.notes && (
                      <p className="text-sm text-green-800 italic border-l-4 border-green-300 pl-3">
                        &ldquo;{detailedExpenseData.notes}&rdquo;
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-red-50 to-orange-100 border-2 border-red-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">💳</span>
                      </div>
                      <div>
                        <p className="font-bold text-red-900 text-lg">You Need to Pay</p>
                        <p className="text-sm text-red-700">{detailedExpenseData.paidBy} paid the bill • {detailedExpenseData.timestamp}</p>
                      </div>
                    </div>
                    {detailedExpenseData.notes && (
                      <p className="text-sm text-red-800 italic border-l-4 border-red-300 pl-3">
                        &ldquo;{detailedExpenseData.notes}&rdquo;
                      </p>
                    )}
                  </div>
                )}

                {detailedExpenseData.participants
                  .filter((participant: Participant) => {
                    // If you're collecting money, don't show yourself in the list since you already paid
                    if (detailedExpenseData.userAction === 'collect' && participant.name.includes('You')) {
                      return false;
                    }
                    return true;
                  })
                  .map((participant: Participant, index: number) => (
                  <div key={index} className={`flex items-center justify-between p-4 rounded-xl hover:shadow-md transition-shadow border-2 ${
                    detailedExpenseData.userAction === 'collect' ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
                  }`}>
                    <div className="flex items-center gap-4">
                      <ProfilePicture name={participant.name} size="lg" />
                      <div>
                        <p className="font-bold text-gray-900 text-lg">{participant.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            participant.status === 'approved' ? 'bg-green-100 text-green-700' :
                            participant.status === 'paid' ? 'bg-blue-100 text-blue-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {participant.status === 'approved' ? '✅ Will Pay You' :
                             participant.status === 'paid' ? '💰 Already Paid' :
                             participant.status === 'pending' && participant.name.includes('You') ? '⏳ You Need to Approve' :
                             '⏳ Pending'}
                          </span>
                        </div>
                        <p className="text-sm font-medium mt-2">
                          {detailedExpenseData.userAction === 'collect' ? (
                            participant.status === 'paid' ? (
                              <span className="text-blue-600">
                                ✅ Paid {contractExpenseData ? `${(participant.amount || 0).toFixed(4)} ETH` : `$${(participant.amount || 0).toFixed(2)}`} - Settled
                              </span>
                            ) : (
                              <span className="text-green-600">
                                Will transfer {contractExpenseData ? `${(participant.amount || 0).toFixed(4)} ETH` : `$${(participant.amount || 0).toFixed(2)}`} to you
                              </span>
                            )
                          ) : participant.name.includes('You') ? (
                            <span className="text-red-600">
                              You need to pay {contractExpenseData ? `${(participant.amount || 0).toFixed(4)} ETH` : `$${(participant.amount || 0).toFixed(2)}`}
                            </span>
                          ) : participant.status === 'paid' ? (
                            <span className="text-blue-600">Already covered their share</span>
                          ) : (
                            <span className="text-gray-600">
                              Will pay {contractExpenseData ? `${(participant.amount || 0).toFixed(4)} ETH` : `$${(participant.amount || 0).toFixed(2)}`}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${
                        detailedExpenseData.userAction === 'collect' ? 'text-green-600' :
                        participant.name.includes('You') ? 'text-red-600' :
                        'text-gray-900'
                      }`}>
                        {contractExpenseData ? `${(participant.amount || 0).toFixed(4)} ETH` : `$${(participant.amount || 0).toFixed(2)}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(((participant.amount || 0) / Math.max(detailedExpenseData.amount || 1, 1)) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
              <div className="space-y-4">
                {detailedExpenseData.isReady ? (
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold text-green-900">Ready to Execute Payment</p>
                        <p className="text-sm text-green-700">All participants have approved • Smart contract ready</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-900 text-lg">${(detailedExpenseData.amount || 0).toFixed(2)}</p>
                      <p className="text-xs text-green-600">Contract: {detailedExpenseData.contractAddress}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                        <Clock className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-bold text-orange-900">Pending Approvals</p>
                        <p className="text-sm text-orange-700">
                          {detailedExpenseData.approvals}/{detailedExpenseData.totalParticipants} participants approved
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-900 text-lg">${(detailedExpenseData.amount || 0).toFixed(2)}</p>
                      <p className="text-xs text-orange-600">Awaiting approval</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-blue-900">Expense Created</p>
                      <p className="text-sm text-blue-700">{detailedExpenseData.createdAt}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-900 text-lg">${(detailedExpenseData.amount || 0).toFixed(2)}</p>
                    <p className="text-xs text-blue-600">Paid by {detailedExpenseData.paidBy}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Participants Added</p>
                      <p className="text-sm text-gray-700">{detailedExpenseData.participants.length} people in this expense</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${((detailedExpenseData.amount || 0) / Math.max(detailedExpenseData.participants.length, 1)).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">per person</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};
