import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ProfilePicture } from '../ui/ProfilePicture';
import { ArrowLeft, Plus, DollarSign, Calendar, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { useGroupMembers, useGroupBills, useGroupInfo } from '@/hooks/useExpenseSplitter';
import { formatUnits } from 'viem';
import { CreateExpenseScreen } from './CreateExpenseScreen';

interface GroupData {
  id: string;
  name: string;
  description: string;
  totalExpenses: number;
  pendingAmount: number;
  monthlyTotal: number;
  members: Array<{
    id: string;
    name: string;
    username: string;
    balance: number;
    status: string;
    role: string;
  }>;
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

interface GroupDetailsScreenProps {
  onBack: () => void;
  onExpenseDetails?: (expenseData: GroupData['recentExpenses'][0]) => void;
  groupData?: GroupData;
}

export const GroupDetailsScreen: React.FC<GroupDetailsScreenProps> = ({ onBack, onExpenseDetails, groupData: passedGroupData }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'members'>('overview');
  const [showCreateExpense, setShowCreateExpense] = useState(false);

  // Extract group ID from passed data - ensure it's a valid number
  let groupId: bigint | undefined;
  try {
    if (passedGroupData?.id !== undefined) {
      groupId = BigInt(passedGroupData.id);
    }
  } catch (error) {
    console.error('Failed to convert group ID to BigInt:', passedGroupData?.id, error);
    groupId = undefined;
  }

  console.log('GroupDetailsScreen - passedGroupData:', passedGroupData);
  console.log('GroupDetailsScreen - groupId:', groupId);

  // Load real contract data
  const groupInfo = useGroupInfo(groupId);
  const groupMembersData = useGroupMembers(groupId);
  const groupBillsData = useGroupBills(groupId);

  // Loading state
  const isLoading = groupId && (groupMembersData.isLoading || groupBillsData.isLoading || groupInfo.isLoading);

  // Default SF Roommates data
  const sfRoommatesData = {
    id: 'sf-roommates',
    name: 'SF Roommates',
    description: 'Shared expenses for San Francisco apartment',
    totalExpenses: 3330.30,
    pendingAmount: 966.30,
    monthlyTotal: 3330.30,
    members: [
      { id: '1', name: 'ogazboiz', username: '0x1234567890abcdef...1234', balance: 45.20, status: 'admin', role: 'admin' },
      { id: '2', name: 'Jimmy Cooper', username: '0xabcd1234567890ef...5678', balance: -23.50, status: 'active', role: 'member' },
      { id: '3', name: 'Guy Hawkins', username: '0xef9876543210abcd...9abc', balance: 0, status: 'active', role: 'member' },
      { id: '4', name: 'Robert Fox', username: '0x567890abcdef1234...def0', balance: -21.70, status: 'active', role: 'member' },
    ],
    recentExpenses: [
      // This matches the HomeScreen "Coffee & Lunch" settlement - you will receive money
      {
        id: 'bill-150',
        description: 'Coffee & Lunch',
        amount: 150.50,
        date: '2024-09-23',
        timestamp: '2 hours ago',
        merchant: 'Downtown Café',
        location: 'San Francisco, CA',
        paidBy: 'You (ogazboiz)',
        participants: [
          { name: 'You (ogazboiz)', amount: 50.17, status: 'paid' },
          { name: 'Jimmy Cooper', amount: 50.17, status: 'approved' },
          { name: 'Guy Hawkins', amount: 50.17, status: 'approved' },
          { name: 'Robert Fox', amount: 50.16, status: 'approved' }
        ],
        status: 'pending',
        approvals: 4,
        totalParticipants: 4,
        isReady: true,
        txHash: null,
        category: 'Food & Dining',
        splitMethod: 'equal',
        receipt: 'Available',
        notes: 'You paid for lunch at downtown cafe. Others will reimburse you.',
        youWillReceive: 150.50,
        youOwe: 0,
        userAction: 'collect',
        items: [
          { name: 'Coffee (4x)', price: 20.00 },
          { name: 'Sandwiches (4x)', price: 80.00 },
          { name: 'Pastries (4x)', price: 32.00 },
          { name: 'Tax & Tip', price: 18.50 }
        ]
      },
      // This matches the HomeScreen "Team Dinner" settlement - you need to pay
      {
        id: 'bill-89',
        description: 'Team Dinner',
        amount: 89.30,
        date: '2024-09-22',
        timestamp: '1 day ago',
        merchant: 'Upscale Restaurant',
        location: 'San Francisco, CA',
        paidBy: 'Alice Smith',
        participants: [
          { name: 'Alice Smith', amount: 29.77, status: 'paid' },
          { name: 'Bob Johnson', amount: 29.77, status: 'approved' },
          { name: 'You (ogazboiz)', amount: 29.76, status: 'pending' }
        ],
        status: 'pending',
        approvals: 2,
        totalParticipants: 3,
        isReady: false,
        txHash: null,
        category: 'Food & Dining',
        splitMethod: 'equal',
        receipt: 'Available',
        notes: 'Alice paid for team dinner. You need to pay your share.',
        youWillReceive: 0,
        youOwe: 29.76,
        userAction: 'pay',
        items: [
          { name: 'Main Courses (3x)', price: 54.00 },
          { name: 'Appetizers', price: 18.00 },
          { name: 'Drinks', price: 12.00 },
          { name: 'Tax & Tip', price: 5.30 }
        ]
      },
      {
        id: '3',
        description: 'Monthly Rent',
        amount: 2000.00,
        date: '2024-09-01',
        timestamp: '3 weeks ago',
        merchant: 'San Francisco Apartment Complex',
        location: 'San Francisco, CA',
        paidBy: 'Guy Hawkins',
        participants: [
          { name: 'ogazboiz', amount: 500.00, status: 'approved' },
          { name: 'Jimmy Cooper', amount: 500.00, status: 'approved' },
          { name: 'Guy Hawkins', amount: 500.00, status: 'approved' },
          { name: 'Robert Fox', amount: 500.00, status: 'approved' }
        ],
        status: 'settled',
        approvals: 4,
        totalParticipants: 4,
        isReady: true,
        txHash: '0xd4e7b9f2...3C8A',
        category: 'Housing',
        splitMethod: 'equal',
        receipt: 'N/A',
        notes: 'Monthly rent payment for apartment',
        userAction: 'pay',
        youWillReceive: 0,
        youOwe: 500.00,
        items: [
          { name: 'Monthly Rent', price: 2000.00 }
        ]
      },
      {
        id: '4',
        description: 'Groceries & Household',
        amount: 185.20,
        date: '2024-09-18',
        timestamp: '5 days ago',
        merchant: 'Whole Foods Market',
        location: 'San Francisco, CA',
        paidBy: 'Robert Fox',
        participants: [
          { name: 'ogazboiz', amount: 46.30, status: 'approved' },
          { name: 'Jimmy Cooper', amount: 46.30, status: 'approved' },
          { name: 'Guy Hawkins', amount: 46.30, status: 'approved' },
          { name: 'Robert Fox', amount: 46.30, status: 'approved' }
        ],
        status: 'settled',
        approvals: 4,
        totalParticipants: 4,
        isReady: true,
        txHash: '0xa5c8f2b3...9E4D',
        category: 'Groceries',
        splitMethod: 'equal',
        receipt: 'Available',
        notes: 'Weekly grocery shopping and household supplies',
        userAction: 'pay',
        youWillReceive: 0,
        youOwe: 46.30,
        items: [
          { name: 'Fresh Produce', price: 65.40 },
          { name: 'Dairy & Eggs', price: 28.80 },
          { name: 'Household Items', price: 42.20 },
          { name: 'Meat & Seafood', price: 48.80 }
        ]
      },
      {
        id: '5',
        description: 'Utilities & Internet',
        amount: 815.80,
        date: '2024-09-15',
        timestamp: '1 week ago',
        merchant: 'PG&E & Comcast',
        location: 'San Francisco, CA',
        paidBy: 'You (ogazboiz)',
        participants: [
          { name: 'You (ogazboiz)', amount: 203.95, status: 'paid' },
          { name: 'Jimmy Cooper', amount: 203.95, status: 'approved' },
          { name: 'Guy Hawkins', amount: 203.95, status: 'approved' },
          { name: 'Robert Fox', amount: 203.95, status: 'approved' }
        ],
        status: 'pending',
        approvals: 4,
        totalParticipants: 4,
        isReady: true,
        txHash: null,
        category: 'Utilities',
        splitMethod: 'equal',
        receipt: 'Available',
        notes: 'Monthly utilities: electricity, gas, internet, water',
        youWillReceive: 611.85,
        youOwe: 0,
        userAction: 'collect',
        items: [
          { name: 'Electricity (PG&E)', price: 285.40 },
          { name: 'Gas (PG&E)', price: 125.60 },
          { name: 'Internet (Comcast)', price: 199.90 },
          { name: 'Water & Sewer', price: 204.90 }
        ]
      },
      {
        id: '6',
        description: 'Cleaning Supplies',
        amount: 89.50,
        date: '2024-09-10',
        timestamp: '2 weeks ago',
        merchant: 'Target',
        location: 'San Francisco, CA',
        paidBy: 'Jimmy Cooper',
        participants: [
          { name: 'You (ogazboiz)', amount: 22.38, status: 'approved' },
          { name: 'Jimmy Cooper', amount: 22.38, status: 'paid' },
          { name: 'Guy Hawkins', amount: 22.37, status: 'approved' },
          { name: 'Robert Fox', amount: 22.37, status: 'approved' }
        ],
        status: 'settled',
        approvals: 4,
        totalParticipants: 4,
        isReady: true,
        txHash: '0xf7e8a9d2...1B5C',
        category: 'Household',
        splitMethod: 'equal',
        receipt: 'Available',
        notes: 'Cleaning supplies and detergents',
        userAction: 'pay',
        youWillReceive: 0,
        youOwe: 22.38,
        items: [
          { name: 'All-Purpose Cleaner', price: 18.99 },
          { name: 'Laundry Detergent', price: 24.99 },
          { name: 'Paper Towels', price: 15.49 },
          { name: 'Dish Soap', price: 8.99 },
          { name: 'Toilet Paper', price: 21.04 }
        ]
      }
    ],
    groupSettings: {
      autoApproveLimit: 50.00,
      requireAllApprovals: true,
      allowMemberInvites: true
    }
  };

  // Work Lunch Crew data
  const workLunchCrewData = {
    id: 'work-lunch-crew',
    name: 'Work Lunch Crew',
    description: 'Shared work lunch and dinner expenses',
    totalExpenses: 89.30,
    pendingAmount: 29.76,
    monthlyTotal: 89.30,
    members: [
      { id: '1', name: 'Alice Smith', username: '0x9876543210fedcba...4321', balance: 59.54, status: 'active', role: 'admin' },
      { id: '2', name: 'Bob Johnson', username: '0xfedcba0987654321...8765', balance: 0, status: 'active', role: 'member' },
      { id: '3', name: 'ogazboiz', username: '0x1234567890abcdef...1234', balance: -29.76, status: 'active', role: 'member' },
    ],
    recentExpenses: [
      {
        id: 'bill-89',
        description: 'Team Dinner',
        amount: 89.30,
        date: '2024-09-22',
        timestamp: '1 day ago',
        merchant: 'Upscale Restaurant',
        location: 'San Francisco, CA',
        paidBy: 'Alice Smith',
        participants: [
          { name: 'Alice Smith', amount: 29.77, status: 'paid' },
          { name: 'Bob Johnson', amount: 29.77, status: 'approved' },
          { name: 'You (ogazboiz)', amount: 29.76, status: 'pending' }
        ],
        status: 'pending',
        approvals: 2,
        totalParticipants: 3,
        isReady: false,
        txHash: null,
        category: 'Food & Dining',
        splitMethod: 'equal',
        receipt: 'Available',
        notes: 'Alice paid for team dinner. You need to pay your share.',
        youWillReceive: 0,
        youOwe: 29.76,
        userAction: 'pay',
        items: [
          { name: 'Main Courses (3x)', price: 54.00 },
          { name: 'Appetizers', price: 18.00 },
          { name: 'Drinks', price: 12.00 },
          { name: 'Tax & Tip', price: 5.30 }
        ]
      }
    ],
    groupSettings: {
      autoApproveLimit: 30.00,
      requireAllApprovals: false,
      allowMemberInvites: true
    }
  };

  // Transform contract data into UI format
  const contractGroupData = useMemo(() => {
    console.log('contractGroupData useMemo - checking data:');
    console.log('  - groupInfo.groupInfo:', groupInfo.groupInfo);
    console.log('  - groupInfo.isLoading:', groupInfo.isLoading);
    console.log('  - groupInfo.error:', groupInfo.error);
    console.log('  - groupMembersData.members:', groupMembersData.members);
    console.log('  - groupMembersData.members.length:', groupMembersData.members?.length);
    console.log('  - groupMembersData.isLoading:', groupMembersData.isLoading);
    console.log('  - groupMembersData.error:', groupMembersData.error);
    console.log('  - groupBillsData.bills:', groupBillsData.bills);
    console.log('  - groupBillsData.bills.length:', groupBillsData.bills?.length);
    console.log('  - groupBillsData.isLoading:', groupBillsData.isLoading);
    console.log('  - groupBillsData.error:', groupBillsData.error);
    console.log('  - passedGroupData:', passedGroupData);

    // Log the token address for this group
    if (groupInfo.groupInfo?.token) {
      console.log(`🪙 Group ${groupId} Token Address:`, groupInfo.groupInfo.token);
      console.log(`🎯 Expected STK Token:`, '0x5423d4026EdeB17e30DF603Dc65Db7d8C5dC1c25');
      console.log(`✅ Addresses Match:`, groupInfo.groupInfo.token.toLowerCase() === '0x5423d4026EdeB17e30DF603Dc65Db7d8C5dC1c25'.toLowerCase());
    } else {
      console.log('❌ No token address found for this group');
    }

    // Check if we have the basic group info and the data arrays exist (even if empty)
    if (!groupInfo.groupInfo || !passedGroupData || groupMembersData.members === undefined || groupBillsData.bills === undefined) {
      console.log('contractGroupData: Missing required data, returning null');
      console.log('  - groupInfo.groupInfo:', !!groupInfo.groupInfo);
      console.log('  - passedGroupData:', !!passedGroupData);
      console.log('  - groupMembersData.members defined:', groupMembersData.members !== undefined);
      console.log('  - groupBillsData.bills defined:', groupBillsData.bills !== undefined);
      return null;
    }

    // Transform members data
    const transformedMembers = groupMembersData.members
      .filter((member): member is NonNullable<typeof member> => member !== null)
      .map((member, index) => ({
        id: index.toString(),
        name: member.name || `Member ${index + 1}`,
        username: member.address,
        balance: parseFloat(formatUnits(member.netBalance, 18)),
        status: 'active',
        role: index === 0 ? 'admin' : 'member'
      }));

    // Transform bills data
    const transformedExpenses = groupBillsData.bills.map((bill, index) => {
      const billAmountETH = bill.amount ? parseFloat(formatUnits(bill.amount, 18)) : 0;

      // Get actual participants for this bill from the contract
      const participantCount = bill.participantCount ? Number(bill.participantCount) : 0;
      const amountPerPerson = participantCount > 0 ? billAmountETH / participantCount : 0;

      console.log(`Bill ${index}:`, {
        description: bill.description,
        amountWei: bill.amount,
        amountETH: billAmountETH,
        actualParticipantCount: participantCount,
        totalGroupMembers: transformedMembers.length,
        amountPerPerson: amountPerPerson
      });

      // Create participants list - for now showing participant count
      // TODO: We need to add a hook to fetch individual participant addresses for each bill
      const participants = Array.from({ length: participantCount }, (_, i) => ({
        name: `Participant ${i + 1}`, // Will be replaced with actual names when we add the hook
        amount: amountPerPerson,
        status: 'approved'
      }));

      return {
        id: `bill-${index}`,
        billIndex: index, // Add bill index for expense details
        groupId: passedGroupData.id, // Add group ID for expense details
        description: bill.description || `Expense ${index + 1}`,
        amount: billAmountETH,
        date: new Date().toISOString().split('T')[0],
        timestamp: 'Recently',
        merchant: 'Contract',
        location: 'Blockchain',
        paidBy: bill.creator || 'Unknown',
        participants: participants,
        status: 'pending', // Bills don't have settled status in the current structure
        approvals: participantCount,
        totalParticipants: participantCount,
        isReady: true,
        txHash: null,
        category: 'General',
        splitMethod: 'equal',
        receipt: 'N/A',
        notes: bill.description || '',
        youWillReceive: 0,
        youOwe: 0,
        userAction: 'view',
        items: []
      };
    });

    // Calculate totals
    const totalExpenses = transformedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const pendingExpenses = transformedExpenses.filter(e => e.status === 'pending');
    const pendingAmount = pendingExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    return {
      id: passedGroupData.id,
      name: `Group ${passedGroupData.id}`,
      description: passedGroupData.description || 'Blockchain expense group',
      totalExpenses,
      pendingAmount,
      monthlyTotal: totalExpenses,
      members: transformedMembers,
      recentExpenses: transformedExpenses,
      groupSettings: {
        autoApproveLimit: 50.00,
        requireAllApprovals: true,
        allowMemberInvites: true
      }
    };
  }, [groupInfo.groupInfo, groupMembersData.members, groupBillsData.bills, passedGroupData]);

  // Use contract data if available, otherwise fall back to dummy data with proper naming
  const fallbackData = passedGroupData?.id === 'work-lunch-crew' ? workLunchCrewData : sfRoommatesData;
  if (passedGroupData && !contractGroupData) {
    fallbackData.name = `Group ${passedGroupData.id}`;
  }
  const groupData = contractGroupData || fallbackData;

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600 bg-green-50';
    if (balance < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  // Calculate user's balance in the group
  const userBalance = useMemo(() => {
    if (contractGroupData?.members) {
      // Find the first member (assumes current user is first member/creator)
      const userMember = contractGroupData.members[0];
      return userMember?.balance || 0;
    }
    return 45.20; // fallback to dummy data
  }, [contractGroupData]);


  // Show create expense screen
  if (showCreateExpense) {
    // Prepare group members data (use contract data if available, otherwise fallback)
    const membersForExpense = contractGroupData?.members?.map(m => ({
      address: m.username,
      name: m.name
    })) || groupData.members?.map(m => ({
      address: m.username,
      name: m.name
    })) || [];

    console.log('GroupDetailsScreen - About to render CreateExpenseScreen with:');
    console.log('  - groupId:', groupId);
    console.log('  - groupId type:', typeof groupId);
    console.log('  - membersForExpense:', membersForExpense);
    console.log('  - passedGroupData:', passedGroupData);
    console.log('  - contractGroupData:', contractGroupData);
    console.log('  - groupBillsData:', groupBillsData);

    return (
      <CreateExpenseScreen
        onBack={() => setShowCreateExpense(false)}
        groupId={groupId}
        groupMembers={membersForExpense}
      />
    );
  }

  // Show loading state while fetching contract data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" className="p-3" onClick={onBack}>
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Loading Group Details...</h1>
              <p className="text-gray-600">Fetching data from blockchain...</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="p-3" onClick={onBack}>
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{groupData.name}</h1>
                {contractGroupData && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    Live Data
                  </span>
                )}
                {!contractGroupData && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                    Demo Data
                  </span>
                )}
              </div>
              <p className="text-gray-600">{groupData.description}</p>
            </div>
          </div>
          <Button
            variant="primary"
            icon={<Plus className="w-5 h-5" />}
            onClick={() => setShowCreateExpense(true)}
          >
            Add Expense
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {contractGroupData ? `${groupData.monthlyTotal.toFixed(4)} ETH` : `$${groupData.monthlyTotal.toFixed(2)}`}
                  </p>
                  <p className="text-xs text-gray-400">Total expenses</p>
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
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm mb-1 font-medium">Pending Settlements</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {contractGroupData ? `${groupData.pendingAmount.toFixed(4)} ETH` : `$${groupData.pendingAmount.toFixed(2)}`}
                  </p>
                  <p className="text-xs text-orange-500">Needs approval</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Active Members</p>
                  <p className="text-2xl font-bold text-gray-900">{groupData.members.length}</p>
                  <p className="text-xs text-gray-400">In this group</p>
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
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Your Balance</p>
                  <p className={`text-2xl font-bold ${userBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {userBalance >= 0 ? '+' : ''}${Math.abs(userBalance).toFixed(2)}
                  </p>
                  <p className={`text-xs ${userBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {userBalance > 0 ? 'Others owe you' : userBalance < 0 ? 'You owe others' : 'All settled'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
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
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'expenses', label: 'Expenses', icon: DollarSign },
                { id: 'members', label: 'Members', icon: Users },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'expenses' | 'members')}
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
            {/* Recent Activity */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {groupData.recentExpenses.slice(0, 3).map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => {
                    console.log('Clicking expense:', expense);
                    onExpenseDetails && onExpenseDetails(expense);
                  }}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                        <span className="text-lg font-bold text-blue-600">
                          {expense.description.split(' ').map(word => word[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{expense.description}</p>
                        <p className="text-sm text-gray-500">Paid by {expense.paidBy} • {expense.date}</p>
                        {expense.status === 'pending' && (
                          <p className="text-xs text-orange-600 font-medium mt-1">
                            {expense.approvals}/{expense.totalParticipants} approved
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-lg">
                        {contractGroupData ? `${expense.amount.toFixed(4)} ETH` : `$${expense.amount.toFixed(2)}`}
                      </p>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        expense.status === 'settled' ? 'bg-green-100 text-green-700' :
                        expense.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {expense.status === 'settled' ? 'Settled' :
                         expense.status === 'pending' ? expense.isReady ? 'Ready' : 'Pending' :
                         expense.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Member Balances */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Balances</h3>
              <div className="space-y-3">
                {groupData.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <ProfilePicture name={member.name} size="md" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{member.name}</p>
                          {member.role === 'admin' && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{member.username}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${
                        member.balance > 0 ? 'text-green-600' :
                        member.balance < 0 ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {member.balance > 0 ? '+' : ''}${Math.abs(member.balance).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {member.balance > 0 ? 'Owes you' :
                         member.balance < 0 ? 'You owe' :
                         'Settled'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'expenses' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">All Expenses</h3>
                <Button variant="secondary" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Filter by Date
                </Button>
              </div>
              <div className="space-y-4">
                {groupData.recentExpenses.map((expense) => (
                  <div key={expense.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer" onClick={() => {
                    console.log('Clicking expense (expenses tab):', expense);
                    onExpenseDetails && onExpenseDetails(expense);
                  }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                          <span className="text-xl font-bold text-blue-600">
                            {expense.description.split(' ').map(word => word[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-gray-900 text-xl">{expense.description}</p>
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                              {expense.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mb-1">
                            Paid by {expense.paidBy} • {expense.timestamp}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span>Split: {expense.splitMethod}</span>
                            <span>•</span>
                            <span>Receipt: {expense.receipt}</span>
                            {expense.txHash && (
                              <>
                                <span>•</span>
                                <span className="text-blue-600 hover:text-blue-800">Tx: {expense.txHash.slice(0, 8)}...</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-gray-900">
                          {contractGroupData ? `${expense.amount.toFixed(4)} ETH` : `$${expense.amount.toFixed(2)}`}
                        </p>
                        {expense.status === 'pending' && (
                          <div className="flex items-center justify-end gap-2 mt-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${expense.isReady ? 'bg-green-500' : 'bg-orange-500'}`}
                                style={{width: `${(expense.approvals / expense.totalParticipants) * 100}%`}}
                              ></div>
                            </div>
                            <span className={`text-sm font-medium ${expense.isReady ? 'text-green-600' : 'text-orange-600'}`}>
                              {expense.approvals}/{expense.totalParticipants}
                            </span>
                          </div>
                        )}
                        <span className={`inline-block mt-2 px-4 py-2 rounded-full text-sm font-medium ${
                          expense.status === 'settled' ? 'bg-green-100 text-green-700' :
                          expense.status === 'pending' ? (expense.isReady ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700') :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {expense.status === 'settled' ? 'Settled' :
                           expense.status === 'pending' ? (expense.isReady ? 'Ready to Execute' : 'Pending Approval') :
                           expense.status}
                        </span>
                      </div>
                    </div>

                    {/* Detailed participant breakdown */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Participant Breakdown</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {expense.participants.map((participant, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg">
                            <div className="flex items-center gap-2">
                              <ProfilePicture name={participant.name} size="sm" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{participant.name}</p>
                                <p className={`text-xs ${participant.status === 'approved' ? 'text-green-600' : 'text-orange-600'}`}>
                                  {participant.status === 'approved' ? '✓ Approved' : '⏳ Pending'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-gray-900">
                                {contractGroupData ? `${participant.amount.toFixed(4)} ETH` : `$${participant.amount.toFixed(2)}`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notes section */}
                    {expense.notes && (
                      <div className="bg-blue-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">Notes:</span> {expense.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-1">
                          {expense.participants.map((participant, index) => (
                            <ProfilePicture key={index} name={participant.name} size="sm" />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {expense.participants.length} participants • {contractGroupData ?
                            `${(expense.amount / expense.participants.length).toFixed(4)} ETH` :
                            `$${(expense.amount / expense.participants.length).toFixed(2)}`
                          } each
                        </span>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {expense.status === 'pending' && expense.isReady && (
                          <Button
                            variant="primary"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => alert('Executing payment...')}
                          >
                            Execute Payment
                          </Button>
                        )}
                        {expense.status === 'pending' && !expense.isReady && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              alert('Approving settlement...');
                            }}
                          >
                            Approve Settlement
                          </Button>
                        )}
                        <Button variant="secondary" size="sm" onClick={() => { onExpenseDetails?.(expense); }}>
                          More Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'members' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Group Members</h3>
                <Button variant="primary" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Invite Member
                </Button>
              </div>
              <div className="space-y-4">
                {groupData.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <ProfilePicture name={member.name} size="lg" />
                      <div>
                        <p className="font-semibold text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.username}</p>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          {member.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getBalanceColor(member.balance).split(' ')[0]}`}>
                        {member.balance > 0 ? '+' : ''}${member.balance.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {member.balance > 0 ? 'Owes you' : member.balance < 0 ? 'You owe' : 'Settled'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};
