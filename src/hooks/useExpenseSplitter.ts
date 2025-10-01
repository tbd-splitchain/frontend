'use client'

import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useEstimateGas, useAccount } from 'wagmi';
import { BillSplitterABI, getContractAddresses } from '@/contracts/config';
import { formatEther, parseEther } from 'viem';
import { toast } from 'react-hot-toast'; // Assuming you have react-hot-toast

// Types for ExpenseSplitter
export interface GroupInfo {
  name: string;
  token: `0x${string}`;
  memberCount: bigint;
  billCount: bigint;
}

export interface GroupMember {
  name: string;
  address: `0x${string}`;
  totalOwed: bigint;
  totalOwedByOthers: bigint;
  netBalance: bigint; // positive = owed money, negative = owes money
}

export interface Bill {
  id: bigint;
  description: string;
  amount: bigint;
  payer: `0x${string}`;
  participants: `0x${string}`[];
  isSettled: boolean;
  createdAt: bigint;
}

// Utility functions for token formatting (following Agro's pattern)
export const formatTokenAmount = (amount: bigint | undefined, decimals: number = 18): string => {
  if (!amount) return '0';
  return formatEther(amount);
};

export const parseTokenAmount = (amount: string, decimals: number = 18): bigint => {
  return parseEther(amount);
};

// Main ExpenseSplitter hook (following Agro's combined hook pattern)
export const useExpenseSplitter = () => {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Get contracts dynamically to avoid SSR issues
  const contracts = getContractAddresses();

  // Create a new expense group
  const createGroup = async (
    name: string,
    token: `0x${string}`,
    memberNames: string[],
    memberAddresses: `0x${string}`[]
  ) => {
    try {
      console.log('Creating expense group with detailed validation:', {
        name,
        token,
        memberNames,
        memberAddresses,
        memberNamesLength: memberNames.length,
        memberAddressesLength: memberAddresses.length,
        contractAddress: contracts.EXPENSE_SPLITTER
      });

      if (!contracts.EXPENSE_SPLITTER) {
        throw new Error('Contract not available on this network');
      }

      // Validate requirements (match contract validation exactly)
      if (memberAddresses.length < 2) {
        throw new Error(`Minimum 2 members required. Got: ${memberAddresses.length}`);
      }

      if (memberNames.length !== memberAddresses.length) {
        throw new Error(`Member names and addresses arrays must have the same length. Names: ${memberNames.length}, Addresses: ${memberAddresses.length}`);
      }

      // Limit to reasonable array sizes to avoid gas issues
      if (memberNames.length > 10) {
        throw new Error('Maximum 10 members allowed per group');
      }

      // Validate all addresses are properly formatted
      for (let i = 0; i < memberAddresses.length; i++) {
        if (!memberAddresses[i] || !memberAddresses[i].startsWith('0x') || memberAddresses[i].length !== 42) {
          throw new Error(`Invalid address at index ${i}: ${memberAddresses[i]}`);
        }
      }

      // Validate all names are non-empty
      for (let i = 0; i < memberNames.length; i++) {
        if (!memberNames[i] || memberNames[i].trim().length === 0) {
          throw new Error(`Empty name at index ${i}: "${memberNames[i]}"`);
        }
      }

      console.log('Submitting contract transaction with args:', {
        contract: contracts.EXPENSE_SPLITTER,
        name,
        token,
        memberNames,
        memberAddresses
      });

      // For now, let's try with the original token address to see if create_group works with ETH
      // The ERC20 validation might only happen in settle_debt, not create_group
      const tokenAddress = token;

      console.log('Token conversion details:', {
        originalToken: token,
        isETH: token === '0x0000000000000000000000000000000000000000',
        availableSTK: contracts.TOKENS?.STK,
        finalTokenAddress: tokenAddress,
        tokenType: token === '0x0000000000000000000000000000000000000000' ? 'ETH' : 'Custom Token'
      });

      // Let wagmi handle gas estimation automatically
      await writeContract({
        address: contracts.EXPENSE_SPLITTER,
        abi: BillSplitterABI,
        functionName: 'createGroup',
        args: [name, tokenAddress as `0x${string}`, memberNames, memberAddresses],
      });

      toast.success('Group creation transaction submitted! Waiting for confirmation... 🎯');
      console.log('Group creation transaction submitted');
    } catch (error) {
      console.error('createGroup error details:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        cause: error instanceof Error ? error.cause : undefined,
        stack: error instanceof Error ? error.stack : undefined
      });

      // Try to extract more specific error information
      let errorMessage = 'Failed to create group';
      if (error instanceof Error) {
        if (error.message.includes('InsufficientMembers')) {
          errorMessage = 'Minimum 2 members required';
        } else if (error.message.includes('MismatchedArrays')) {
          errorMessage = 'Member names and addresses count mismatch';
        } else if (error.message.includes('execution reverted')) {
          errorMessage = 'Contract execution failed - check console for details';
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
      throw error;
    }
  };

  // Add a bill to a group
  const addBill = async (
    groupId: bigint,
    description: string,
    amount: bigint,
    participantAddresses: `0x${string}`[]
  ) => {
    try {
      console.log('Adding bill:', { groupId, description, amount, participantAddresses });

      if (!contracts.EXPENSE_SPLITTER) {
        throw new Error('Contract not available on this network');
      }

      await writeContract({
        address: contracts.EXPENSE_SPLITTER,
        abi: BillSplitterABI,
        functionName: 'addBill',
        args: [groupId, description, amount, participantAddresses],
      });

      toast.success('Bill transaction submitted! Waiting for confirmation... 💰');
      console.log('Bill transaction submitted');
    } catch (error) {
      toast.error('Failed to add bill');
      console.error('addBill error:', error);
      throw error;
    }
  };

  // Approve ERC20 token spending
  const approveToken = async (
    tokenAddress: `0x${string}`,
    spenderAddress: `0x${string}`,
    amount: bigint
  ) => {
    try {
      console.log('Approving STK token:', {
        tokenAddress,
        spenderAddress,
        amount: amount.toString(),
        formattedAmount: formatTokenAmount(amount)
      });

      // Log token address for debugging
      console.log('Token address being used:', tokenAddress);
      if (tokenAddress !== '0x5423d4026EdeB17e30DF603Dc65Db7d8C5dC1c25') {
        console.warn(`Warning: Using different token address than expected STK token. Got: ${tokenAddress}`);
      }

      const erc20ABI = [
        {
          "inputs": [
            { "internalType": "address", "name": "spender", "type": "address" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" }
          ],
          "name": "approve",
          "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ];

      await writeContract({
        address: tokenAddress,
        abi: erc20ABI,
        functionName: 'approve',
        args: [spenderAddress, amount],
      });

      toast.success(`STK token approval submitted for ${formatTokenAmount(amount)} tokens! ✅`);
      console.log('STK token approval transaction submitted successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to approve STK token: ${errorMessage}`);
      console.error('approveToken error details:', {
        error,
        message: errorMessage,
        tokenAddress,
        spenderAddress,
        amount: amount.toString()
      });
      throw error;
    }
  };

  // Settle debt between members
  const settleDebt = async (
    groupId: bigint,
    creditor: `0x${string}`,
    amount: bigint
  ) => {
    try {
      console.log('Settling debt with STK tokens:', {
        groupId: groupId.toString(),
        creditor,
        amount: amount.toString(),
        formattedAmount: formatTokenAmount(amount),
        contractAddress: contracts.EXPENSE_SPLITTER
      });

      if (!contracts.EXPENSE_SPLITTER) {
        throw new Error('BillSplitter contract not available on this network');
      }

      await writeContract({
        address: contracts.EXPENSE_SPLITTER,
        abi: BillSplitterABI,
        functionName: 'settleDebt',
        args: [groupId, creditor, amount],
      });

      toast.success(`Debt settlement submitted! Paying ${formatTokenAmount(amount)} STK tokens... ✅`);
      console.log('STK debt settlement transaction submitted successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to settle debt: ${errorMessage}`);
      console.error('settleDebt error details:', {
        error,
        message: errorMessage,
        groupId: groupId.toString(),
        creditor,
        amount: amount.toString(),
        contractAddress: contracts.EXPENSE_SPLITTER
      });
      throw error;
    }
  };

  // Activate Stylus contract
  const activateContract = async () => {
    try {
      console.log('Activating Stylus contract...');

      if (!contracts.EXPENSE_SPLITTER) {
        throw new Error('Contract not available on this network');
      }

      // Call the activation function
      await writeContract({
        address: contracts.EXPENSE_SPLITTER,
        abi: [{
          "inputs": [],
          "name": "activate",
          "outputs": [],
          "stateMutability": "payable",
          "type": "function"
        }],
        functionName: 'activate',
        args: [],
        value: parseEther('0.01'), // Small amount of ETH for activation
      });

      toast.success('Contract activation submitted! 🚀');
      console.log('Contract activation submitted');
    } catch (error) {
      toast.error('Failed to activate contract');
      console.error('activateContract error:', error);
      throw error;
    }
  };

  return {
    // Write operations
    createGroup,
    addBill,
    settleDebt,
    approveToken,
    activateContract,

    // Transaction state
    hash,
    isPending,
    isConfirming,
    isSuccess,

    // Utility functions
    formatTokenAmount,
    parseTokenAmount,
  };
};

// Read hooks for fetching group data (following Agro's read pattern)
export const useGroupInfo = (groupId: bigint | undefined) => {
  const contracts = getContractAddresses();

  const result = useReadContract({
    address: contracts.EXPENSE_SPLITTER,
    abi: BillSplitterABI,
    functionName: 'getGroupInfo',
    args: groupId !== undefined ? [groupId] : undefined,
    query: {
      enabled: !!contracts.EXPENSE_SPLITTER && groupId !== undefined,
      gcTime: 1000, // Cache for 1 second
      staleTime: 0, // Always refetch
      refetchInterval: 3000, // Auto-refresh every 3 seconds
    },
  });

  const groupInfo: GroupInfo | undefined = result.data ? {
    name: (result.data as [string, `0x${string}`, bigint, bigint])[0],
    token: (result.data as [string, `0x${string}`, bigint, bigint])[1],
    memberCount: (result.data as [string, `0x${string}`, bigint, bigint])[2],
    billCount: (result.data as [string, `0x${string}`, bigint, bigint])[3],
  } : undefined;

  return {
    ...result,
    groupInfo,
  };
};

export const useMemberCount = (groupId: bigint | undefined) => {
  const contracts = getContractAddresses();

  const result = useReadContract({
    address: contracts.EXPENSE_SPLITTER,
    abi: BillSplitterABI,
    functionName: 'getMemberCount',
    args: groupId !== undefined ? [groupId] : undefined,
    query: {
      enabled: !!contracts.EXPENSE_SPLITTER && groupId !== undefined,
      gcTime: 1000,
      staleTime: 0,
      refetchInterval: 3000, // Auto-refresh every 3 seconds
    },
  });

  return {
    ...result,
    memberCount: result.data as bigint | undefined,
  };
};

// NOTE: getMemberName function not available in new BillSplitterABI
// TODO: Re-implement when function becomes available or use alternative approach
/*
export const useMemberInfo = (groupId: bigint | undefined, memberIndex: bigint | undefined) => {
  const contracts = getContractAddresses();

  const result = useReadContract({
    address: contracts.EXPENSE_SPLITTER,
    abi: BillSplitterABI,
    functionName: 'getMemberName',
    args: groupId !== undefined && memberIndex !== undefined ? [groupId, memberIndex] : undefined,
    query: {
      enabled: !!contracts.EXPENSE_SPLITTER && groupId !== undefined && memberIndex !== undefined,
      gcTime: 5000,
      staleTime: 0,
    },
  });

  return {
    ...result,
    memberName: result.data as string | undefined,
  };
};
*/

export const useMemberAddress = (groupId: bigint | undefined, memberIndex: bigint | undefined) => {
  const contracts = getContractAddresses();

  const result = useReadContract({
    address: contracts.EXPENSE_SPLITTER,
    abi: BillSplitterABI,
    functionName: 'getMemberAddress',
    args: groupId !== undefined && memberIndex !== undefined ? [groupId, memberIndex] : undefined,
    query: {
      enabled: !!contracts.EXPENSE_SPLITTER && groupId !== undefined && memberIndex !== undefined,
      gcTime: 5000,
      staleTime: 0,
    },
  });

  return {
    ...result,
    memberAddress: result.data as `0x${string}` | undefined,
  };
};

export const useMemberBalance = (groupId: bigint | undefined, member: `0x${string}` | undefined) => {
  const contracts = getContractAddresses();

  const totalOwedResult = useReadContract({
    address: contracts.EXPENSE_SPLITTER,
    abi: BillSplitterABI,
    functionName: 'getMemberTotalOwed',
    args: groupId !== undefined && member ? [groupId, member] : undefined,
    query: {
      enabled: !!contracts.EXPENSE_SPLITTER && groupId !== undefined && !!member,
      gcTime: 1000,
      staleTime: 0,
      refetchInterval: 3000, // Auto-refresh every 3 seconds
    },
  });

  const totalOwedByOthersResult = useReadContract({
    address: contracts.EXPENSE_SPLITTER,
    abi: BillSplitterABI,
    functionName: 'getMemberTotalOwedByOthers',
    args: groupId !== undefined && member ? [groupId, member] : undefined,
    query: {
      enabled: !!contracts.EXPENSE_SPLITTER && groupId !== undefined && !!member,
      gcTime: 1000,
      staleTime: 0,
      refetchInterval: 3000, // Auto-refresh every 3 seconds
    },
  });

  const totalOwed = totalOwedResult.data as bigint || BigInt(0);
  const totalOwedByOthers = totalOwedByOthersResult.data as bigint || BigInt(0);
  const netBalance = totalOwedByOthers - totalOwed; // positive = owed money, negative = owes money

  return {
    totalOwed,
    totalOwedByOthers,
    netBalance,
    totalOwedFormatted: formatTokenAmount(totalOwed),
    totalOwedByOthersFormatted: formatTokenAmount(totalOwedByOthers),
    netBalanceFormatted: formatTokenAmount(netBalance),
    isLoading: totalOwedResult.isLoading || totalOwedByOthersResult.isLoading,
    error: totalOwedResult.error || totalOwedByOthersResult.error,
  };
};

// Hook to get specific debt between two members
export const useDebtAmount = (groupId: bigint | undefined, debtor: `0x${string}` | undefined, creditor: `0x${string}` | undefined) => {
  const contracts = getContractAddresses();

  const result = useReadContract({
    address: contracts.EXPENSE_SPLITTER,
    abi: BillSplitterABI,
    functionName: 'getDebt',
    args: groupId !== undefined && debtor && creditor ? [groupId, debtor, creditor] : undefined,
    query: {
      enabled: !!contracts.EXPENSE_SPLITTER && groupId !== undefined && !!debtor && !!creditor,
      gcTime: 5000,
      staleTime: 0,
    },
  });

  return {
    debtAmount: result.data as bigint || BigInt(0),
    debtAmountFormatted: formatTokenAmount(result.data as bigint || BigInt(0)),
    isLoading: result.isLoading,
    error: result.error,
  };
};

// Hook to load all members of a group
export const useGroupMembers = (groupId: bigint | undefined) => {
  const contracts = getContractAddresses();
  const memberCount = useMemberCount(groupId);

  // Create an array of member indices based on member count
  const memberIndices = memberCount.memberCount ?
    Array.from({ length: Number(memberCount.memberCount) }, (_, i) => i) : [];

  // Get each member's address
  const memberAddresses = memberIndices.map(index => {
    return useReadContract({
      address: contracts.EXPENSE_SPLITTER,
      abi: BillSplitterABI,
      functionName: 'getMemberAddress',
      args: groupId !== undefined ? [groupId, index] : undefined,
      query: {
        enabled: !!contracts.EXPENSE_SPLITTER && groupId !== undefined,
        gcTime: 5000,
        staleTime: 0,
      },
    });
  });

  // Get balances for each member
  const memberBalances = memberAddresses.map(addressResult => {
    const address = addressResult.data as `0x${string}` | undefined;
    return useMemberBalance(groupId, address);
  });

  const members = memberAddresses.map((addressResult, index) => {
    const address = addressResult.data as `0x${string}`;
    const balance = memberBalances[index];

    return address ? {
      index,
      address,
      name: `Member ${index + 1}`, // Fallback name since getMemberName is not available
      totalOwed: balance.totalOwed,
      totalOwedByOthers: balance.totalOwedByOthers,
      netBalance: balance.netBalance,
      totalOwedFormatted: balance.totalOwedFormatted,
      totalOwedByOthersFormatted: balance.totalOwedByOthersFormatted,
      netBalanceFormatted: balance.netBalanceFormatted,
    } : null;
  }).filter(Boolean);

  return {
    members,
    memberCount: memberCount.memberCount,
    isLoading: memberCount.isLoading || memberAddresses.some(r => r.isLoading) || memberBalances.some(b => b.isLoading),
    error: memberCount.error || memberAddresses.find(r => r.error)?.error || memberBalances.find(b => b.error)?.error,
  };
};

// Hook to get participants for a specific bill
export const useBillParticipants = (groupId: bigint | undefined, billIndex: number | undefined) => {
  const contracts = getContractAddresses();

  // First get participant count
  const participantCountResult = useReadContract({
    address: contracts.EXPENSE_SPLITTER,
    abi: BillSplitterABI,
    functionName: 'getBillParticipantCount',
    args: groupId !== undefined && billIndex !== undefined ? [groupId, billIndex] : undefined,
    query: {
      enabled: !!contracts.EXPENSE_SPLITTER && groupId !== undefined && billIndex !== undefined,
      gcTime: 5000,
      staleTime: 0,
    },
  });

  const participantCount = participantCountResult.data ? Number(participantCountResult.data as bigint) : 0;
  const participantIndices = Array.from({ length: participantCount }, (_, i) => i);

  // Get each participant's address
  const participantAddresses = participantIndices.map(index => {
    return useReadContract({
      address: contracts.EXPENSE_SPLITTER,
      abi: BillSplitterABI,
      functionName: 'getBillParticipant',
      args: groupId !== undefined && billIndex !== undefined ? [groupId, billIndex, index] : undefined,
      query: {
        enabled: !!contracts.EXPENSE_SPLITTER && groupId !== undefined && billIndex !== undefined,
        gcTime: 5000,
        staleTime: 0,
      },
    });
  });

  const participants = participantAddresses.map((addressResult, index) => {
    const address = addressResult.data as `0x${string}` | undefined;
    return address ? {
      index,
      address,
      name: `Participant ${index + 1}`, // Fallback name since we don't have participant names stored
    } : null;
  }).filter(Boolean);

  return {
    participants,
    participantCount,
    isLoading: participantCountResult.isLoading || participantAddresses.some(r => r.isLoading),
    error: participantCountResult.error || participantAddresses.find(r => r.error)?.error,
  };
};

// Hook to load bills for a group
export const useGroupBills = (groupId: bigint | undefined) => {
  const contracts = getContractAddresses();
  const groupInfo = useGroupInfo(groupId);

  // Get bill count from group info
  const billCount = groupInfo.groupInfo?.billCount ? Number(groupInfo.groupInfo.billCount) : 0;
  const billIndices = Array.from({ length: billCount }, (_, i) => i);

  // Get bill details for each bill
  const bills = billIndices.map(index => {
    const amount = useReadContract({
      address: contracts.EXPENSE_SPLITTER,
      abi: BillSplitterABI,
      functionName: 'getBillAmount',
      args: groupId !== undefined ? [groupId, index] : undefined,
      query: {
        enabled: !!contracts.EXPENSE_SPLITTER && groupId !== undefined,
        gcTime: 5000,
        staleTime: 0,
      },
    });

    const description = useReadContract({
      address: contracts.EXPENSE_SPLITTER,
      abi: BillSplitterABI,
      functionName: 'getBillDescription',
      args: groupId !== undefined ? [groupId, index] : undefined,
      query: {
        enabled: !!contracts.EXPENSE_SPLITTER && groupId !== undefined,
        gcTime: 5000,
        staleTime: 0,
      },
    });

    const creator = useReadContract({
      address: contracts.EXPENSE_SPLITTER,
      abi: BillSplitterABI,
      functionName: 'getBillCreator',
      args: groupId !== undefined ? [groupId, index] : undefined,
      query: {
        enabled: !!contracts.EXPENSE_SPLITTER && groupId !== undefined,
        gcTime: 5000,
        staleTime: 0,
      },
    });

    const participantCount = useReadContract({
      address: contracts.EXPENSE_SPLITTER,
      abi: BillSplitterABI,
      functionName: 'getBillParticipantCount',
      args: groupId !== undefined ? [groupId, index] : undefined,
      query: {
        enabled: !!contracts.EXPENSE_SPLITTER && groupId !== undefined,
        gcTime: 5000,
        staleTime: 0,
      },
    });

    return {
      id: index,
      amount: amount.data as bigint | undefined,
      description: description.data as string | undefined,
      creator: creator.data as `0x${string}` | undefined,
      participantCount: participantCount.data as bigint | undefined,
      amountFormatted: amount.data ? formatTokenAmount(amount.data as bigint) : '0',
      isLoading: amount.isLoading || description.isLoading || creator.isLoading || participantCount.isLoading,
      error: amount.error || description.error || creator.error || participantCount.error,
    };
  });

  return {
    bills,
    billCount,
    isLoading: groupInfo.isLoading || bills.some(b => b.isLoading),
    error: groupInfo.error || bills.find(b => b.error)?.error,
  };
};

// Hook to get SplitChain token balance
export const useSplitChainBalance = (userAddress: `0x${string}` | undefined) => {
  const contracts = getContractAddresses();

  const result = useReadContract({
    address: contracts.TOKENS?.STK as `0x${string}`,
    abi: [
      {
        "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!contracts.TOKENS?.STK && !!userAddress,
      gcTime: 1000,
      staleTime: 0,
      refetchInterval: 5000, // Auto-refresh every 5 seconds
    },
  });

  return {
    balance: result.data as bigint || BigInt(0),
    balanceFormatted: formatTokenAmount(result.data as bigint || BigInt(0)),
    isLoading: result.isLoading,
    error: result.error,
  };
};

// Combined hook for user dashboard (following Agro's dashboard pattern)
export const useUserExpenseDashboard = (userAddress: `0x${string}` | undefined, groupId: bigint | undefined) => {
  const groupInfo = useGroupInfo(groupId);
  const memberBalance = useMemberBalance(groupId, userAddress);
  const memberCount = useMemberCount(groupId);

  return {
    groupInfo: groupInfo.groupInfo,
    memberBalance,
    memberCount: memberCount.memberCount,
    isLoading: groupInfo.isLoading || memberBalance.isLoading || memberCount.isLoading,
    error: groupInfo.error || memberBalance.error || memberCount.error,
  };
};

// Efficient hook to load user's groups and recent activity (to avoid Rules of Hooks violations)
export const useUserGroupsAndActivity = (userAddress: `0x${string}` | undefined) => {
  const contracts = getContractAddresses();

  // Check each group individually to ensure consistent hook calls
  const group0Info = useGroupInfo(BigInt(0));
  const group1Info = useGroupInfo(BigInt(1));
  const group2Info = useGroupInfo(BigInt(2));
  const group3Info = useGroupInfo(BigInt(3));
  const group4Info = useGroupInfo(BigInt(4));

  const group0Count = useMemberCount(BigInt(0));
  const group1Count = useMemberCount(BigInt(1));
  const group2Count = useMemberCount(BigInt(2));
  const group3Count = useMemberCount(BigInt(3));
  const group4Count = useMemberCount(BigInt(4));

  const group0Balance = useMemberBalance(BigInt(0), userAddress);
  const group1Balance = useMemberBalance(BigInt(1), userAddress);
  const group2Balance = useMemberBalance(BigInt(2), userAddress);
  const group3Balance = useMemberBalance(BigInt(3), userAddress);
  const group4Balance = useMemberBalance(BigInt(4), userAddress);

  const group0Bills = useGroupBills(BigInt(0));
  const group1Bills = useGroupBills(BigInt(1));
  const group2Bills = useGroupBills(BigInt(2));
  const group3Bills = useGroupBills(BigInt(3));
  const group4Bills = useGroupBills(BigInt(4));

  // Create groups array
  const groups = [
    {
      id: '0',
      groupInfo: group0Info.groupInfo,
      memberCount: group0Count.memberCount,
      userBalance: group0Balance,
      bills: group0Bills.bills,
      isLoading: group0Info.isLoading || group0Count.isLoading || group0Balance.isLoading || group0Bills.isLoading,
      error: group0Info.error || group0Count.error || group0Balance.error || group0Bills.error,
    },
    {
      id: '1',
      groupInfo: group1Info.groupInfo,
      memberCount: group1Count.memberCount,
      userBalance: group1Balance,
      bills: group1Bills.bills,
      isLoading: group1Info.isLoading || group1Count.isLoading || group1Balance.isLoading || group1Bills.isLoading,
      error: group1Info.error || group1Count.error || group1Balance.error || group1Bills.error,
    },
    {
      id: '2',
      groupInfo: group2Info.groupInfo,
      memberCount: group2Count.memberCount,
      userBalance: group2Balance,
      bills: group2Bills.bills,
      isLoading: group2Info.isLoading || group2Count.isLoading || group2Balance.isLoading || group2Bills.isLoading,
      error: group2Info.error || group2Count.error || group2Balance.error || group2Bills.error,
    },
    {
      id: '3',
      groupInfo: group3Info.groupInfo,
      memberCount: group3Count.memberCount,
      userBalance: group3Balance,
      bills: group3Bills.bills,
      isLoading: group3Info.isLoading || group3Count.isLoading || group3Balance.isLoading || group3Bills.isLoading,
      error: group3Info.error || group3Count.error || group3Balance.error || group3Bills.error,
    },
    {
      id: '4',
      groupInfo: group4Info.groupInfo,
      memberCount: group4Count.memberCount,
      userBalance: group4Balance,
      bills: group4Bills.bills,
      isLoading: group4Info.isLoading || group4Count.isLoading || group4Balance.isLoading || group4Bills.isLoading,
      error: group4Info.error || group4Count.error || group4Balance.error || group4Bills.error,
    },
  ];

  // Filter valid groups and create UI objects
  const userGroups = groups
    .filter(group => {
      const actualMemberCount = group.memberCount ? Number(group.memberCount) : 0;
      return actualMemberCount > 0;
    })
    .map(group => {
      // Clean up corrupted names
      let groupName = group.groupInfo?.name || `Group ${group.id}`;
      if (groupName && (groupName.includes('\u0000') || groupName.includes('\u0002') || groupName.includes('\u0004'))) {
        groupName = `Group ${group.id}`;
      }

      // Calculate total expenses from bills
      const realBills = group.bills || [];
      const totalExpenses = realBills.reduce((sum: number, bill: any) => {
        const amount = bill.amount ? parseFloat(formatTokenAmount(bill.amount)) : 0;
        return sum + amount;
      }, 0);

      return {
        id: group.id,
        name: groupName,
        description: `Group with ${Number(group.memberCount)} members (Bills: ${realBills.length})`,
        totalExpenses,
        totalOwed: group.userBalance?.totalOwedFormatted || '0',
        totalOwedByOthers: group.userBalance?.totalOwedByOthersFormatted || '0',
        netBalance: group.userBalance?.netBalanceFormatted || '0',
        recentBills: realBills.slice(0, 3)
      };
    });

  // Combine all recent bills for activity
  const allRecentBills = groups
    .flatMap(group =>
      (group.bills || []).map((bill: any, index: number) => ({
        ...bill,
        groupId: group.id,
        billIndex: index
      }))
    )
    .slice(0, 5);

  return {
    userGroups,
    allRecentBills,
    isLoading: groups.some(g => g.isLoading),
    error: groups.find(g => g.error)?.error,
  };
};

// Simple hook to load just one group for testing (to avoid hook errors)
export const useSimpleUserGroup = (userAddress: `0x${string}` | undefined, groupId: bigint = BigInt(0)) => {
  const groupInfo = useGroupInfo(groupId);
  const memberCount = useMemberCount(groupId);
  const userBalance = useMemberBalance(groupId, userAddress);

  // Check if this user is actually in this group
  const actualMemberCount = memberCount.memberCount ? Number(memberCount.memberCount) : 0;
  const hasValidMembers = actualMemberCount > 0;

  if (!hasValidMembers) {
    return {
      userGroups: [],
      allRecentBills: [],
      isLoading: groupInfo.isLoading || memberCount.isLoading || userBalance.isLoading,
      error: groupInfo.error || memberCount.error || userBalance.error,
    };
  }

  // Clean up corrupted names
  let groupName = groupInfo.groupInfo?.name || `Group ${groupId}`;
  if (groupName && (groupName.includes('\u0000') || groupName.includes('\u0002') || groupName.includes('\u0004'))) {
    groupName = `Group ${groupId}`;
  }

  const userGroup = {
    id: groupId.toString(),
    name: groupName,
    description: `Group with ${actualMemberCount} members`,
    totalExpenses: 0, // Simplified for now
    totalOwed: userBalance?.totalOwedFormatted || '0',
    totalOwedByOthers: userBalance?.totalOwedByOthersFormatted || '0',
    netBalance: userBalance?.netBalanceFormatted || '0',
    recentBills: []
  };

  return {
    userGroups: [userGroup],
    allRecentBills: [], // Simplified for now
    isLoading: groupInfo.isLoading || memberCount.isLoading || userBalance.isLoading,
    error: groupInfo.error || memberCount.error || userBalance.error,
  };
};

// Dynamic hook to load all real groups from smart contract
export const useGroupManagementData = () => {
  const { address } = useAccount();

  // Check groups 0-9 (enough to discover most groups without excessive hook calls)
  // This gives us a consistent hook count while being practical
  const group0 = useUserExpenseDashboard(address as `0x${string}`, BigInt(0));
  const group1 = useUserExpenseDashboard(address as `0x${string}`, BigInt(1));
  const group2 = useUserExpenseDashboard(address as `0x${string}`, BigInt(2));
  const group3 = useUserExpenseDashboard(address as `0x${string}`, BigInt(3));
  const group4 = useUserExpenseDashboard(address as `0x${string}`, BigInt(4));
  const group5 = useUserExpenseDashboard(address as `0x${string}`, BigInt(5));
  const group6 = useUserExpenseDashboard(address as `0x${string}`, BigInt(6));
  const group7 = useUserExpenseDashboard(address as `0x${string}`, BigInt(7));
  const group8 = useUserExpenseDashboard(address as `0x${string}`, BigInt(8));
  const group9 = useUserExpenseDashboard(address as `0x${string}`, BigInt(9));

  // Get group creators for all groups (admin detection)
  const group0Creator = useGroupCreator(BigInt(0));
  const group1Creator = useGroupCreator(BigInt(1));
  const group2Creator = useGroupCreator(BigInt(2));
  const group3Creator = useGroupCreator(BigInt(3));
  const group4Creator = useGroupCreator(BigInt(4));
  const group5Creator = useGroupCreator(BigInt(5));
  const group6Creator = useGroupCreator(BigInt(6));
  const group7Creator = useGroupCreator(BigInt(7));
  const group8Creator = useGroupCreator(BigInt(8));
  const group9Creator = useGroupCreator(BigInt(9));

  // Check all groups and filter valid ones
  const allGroupData = [
    { id: '0', data: group0, creator: group0Creator },
    { id: '1', data: group1, creator: group1Creator },
    { id: '2', data: group2, creator: group2Creator },
    { id: '3', data: group3, creator: group3Creator },
    { id: '4', data: group4, creator: group4Creator },
    { id: '5', data: group5, creator: group5Creator },
    { id: '6', data: group6, creator: group6Creator },
    { id: '7', data: group7, creator: group7Creator },
    { id: '8', data: group8, creator: group8Creator },
    { id: '9', data: group9, creator: group9Creator },
  ];

  // Filter valid groups
  // Note: We show all groups that exist for now. 
  // The proper solution requires checking member lists which violates Rules of Hooks
  // For production, you'd need a backend service or subgraph to query membership
  const groups = allGroupData.filter(group => {
    const memberCount = group.data.memberCount ? Number(group.data.memberCount) : 0;
    return memberCount > 0; // Show all groups that exist
  }).map(group => {
    const groupInfo = group.data.groupInfo;
    const balance = group.data.memberBalance;
    const groupCreatorAddress = group.creator.groupCreator;

    // Clean up corrupted names
    let groupName = groupInfo?.name || `Group ${group.id}`;
    if (groupName && (groupName.includes('\u0000') || groupName.includes('\u0002') || groupName.includes('\u0004'))) {
      groupName = `Group ${group.id}`;
    }

    const memberCount = Number(group.data.memberCount || 0);

    // Calculate real expense totals from blockchain
    const totalOwed = parseFloat(balance?.totalOwedFormatted || '0');
    const totalOwedByOthers = parseFloat(balance?.totalOwedByOthersFormatted || '0');
    const netBalance = parseFloat(balance?.netBalanceFormatted || '0');

    // Determine if current user is the group admin
    const isCurrentUserAdmin = groupCreatorAddress?.toLowerCase() === address?.toLowerCase();

    console.log(`Group ${group.id} admin check:`, {
      groupCreatorAddress,
      currentUserAddress: address,
      isCurrentUserAdmin
    });

    return {
      id: group.id,
      name: groupName,
      description: `Group with ${memberCount} members`,
      totalExpenses: totalOwed + totalOwedByOthers, // Real total expenses
      pendingAmount: Math.abs(netBalance), // Real pending amount
      monthlyTotal: totalOwed + totalOwedByOthers,
      members: [
        {
          id: '1',
          name: isCurrentUserAdmin ? 'You (Admin)' : 'You',
          username: '@you',
          balance: netBalance,
          status: netBalance === 0 ? 'settled' : 'pending',
          role: isCurrentUserAdmin ? 'admin' : 'member'
        },
        // Add placeholder members (will be replaced with real member data in the future)
        ...Array.from({ length: Math.max(0, memberCount - 1) }, (_, i) => ({
          id: (i + 2).toString(),
          name: `Member ${i + 2}`,
          username: `@member${i + 2}`,
          balance: -netBalance / (memberCount - 1), // Distribute the balance
          status: 'pending' as const,
          role: 'member' as const
        }))
      ],
      recentExpenses: [],
      groupSettings: {
        autoApproveLimit: 0,
        requireAllApprovals: false,
        allowMemberInvites: true
      }
    };
  });

  // Calculate loading state from all checked groups
  const isLoading = group0.isLoading || group1.isLoading || group2.isLoading ||
                   group3.isLoading || group4.isLoading || group5.isLoading ||
                   group6.isLoading || group7.isLoading || group8.isLoading || group9.isLoading ||
                   group0Creator.isLoading || group1Creator.isLoading || group2Creator.isLoading ||
                   group3Creator.isLoading || group4Creator.isLoading || group5Creator.isLoading ||
                   group6Creator.isLoading || group7Creator.isLoading || group8Creator.isLoading || group9Creator.isLoading;

  // Calculate error state from all checked groups
  const error = group0.error || group1.error || group2.error ||
               group3.error || group4.error || group5.error ||
               group6.error || group7.error || group8.error || group9.error ||
               group0Creator.error || group1Creator.error || group2Creator.error ||
               group3Creator.error || group4Creator.error || group5Creator.error ||
               group6Creator.error || group7Creator.error || group8Creator.error || group9Creator.error;

  return {
    groups,
    isLoading,
    error,
  };
};

// Hook to get group creator (admin) address
export const useGroupCreator = (groupId: bigint | undefined) => {
  const contracts = getContractAddresses();

  // Get the first member (index 0) who is typically the group creator
  const result = useReadContract({
    address: contracts.EXPENSE_SPLITTER,
    abi: BillSplitterABI,
    functionName: 'getMemberAddress',
    args: groupId !== undefined ? [groupId, 0] : undefined,
    query: {
      enabled: !!contracts.EXPENSE_SPLITTER && groupId !== undefined,
      gcTime: 5000,
      staleTime: 0,
    },
  });

  return {
    ...result,
    groupCreator: result.data as `0x${string}` | undefined,
  };
};