'use client'

import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useEstimateGas } from 'wagmi';
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
        availableWETH: contracts.TOKENS?.WETH,
        finalTokenAddress: tokenAddress,
        tokenType: token === '0x0000000000000000000000000000000000000000' ? 'WETH' : 'Custom Token'
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
      console.log('Approving token:', { tokenAddress, spenderAddress, amount });

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

      toast.success('Token approval submitted! ✅');
      console.log('Token approval transaction submitted');
    } catch (error) {
      toast.error('Failed to approve token');
      console.error('approveToken error:', error);
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
      console.log('Settling debt:', { groupId, creditor, amount });

      if (!contracts.EXPENSE_SPLITTER) {
        throw new Error('Contract not available on this network');
      }

      await writeContract({
        address: contracts.EXPENSE_SPLITTER,
        abi: BillSplitterABI,
        functionName: 'settleDebt',
        args: [groupId, creditor, amount],
      });

      toast.success('Debt settlement submitted! Waiting for confirmation... ✅');
      console.log('Debt settlement transaction submitted');
    } catch (error) {
      toast.error('Failed to settle debt');
      console.error('settleDebt error:', error);
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
      gcTime: 5000, // Cache for 5 seconds
      staleTime: 0, // Always refetch
    },
  });

  const groupInfo: GroupInfo | undefined = result.data ? {
    name: result.data[0] as string,
    token: result.data[1] as `0x${string}`,
    memberCount: result.data[2] as bigint,
    billCount: result.data[3] as bigint,
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
      gcTime: 5000,
      staleTime: 0,
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
      gcTime: 5000,
      staleTime: 0,
    },
  });

  const totalOwedByOthersResult = useReadContract({
    address: contracts.EXPENSE_SPLITTER,
    abi: BillSplitterABI,
    functionName: 'getMemberTotalOwedByOthers',
    args: groupId !== undefined && member ? [groupId, member] : undefined,
    query: {
      enabled: !!contracts.EXPENSE_SPLITTER && groupId !== undefined && !!member,
      gcTime: 5000,
      staleTime: 0,
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