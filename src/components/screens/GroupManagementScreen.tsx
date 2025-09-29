import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ProfilePicture } from '../ui/ProfilePicture';
import { ArrowLeft, Plus, Settings, Users, DollarSign, Calendar, MoreVertical, UserPlus, MessageCircle } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useExpenseSplitter, useGroupInfo, useMemberBalance, useMemberCount, useGroupMembers, useGroupBills } from '@/hooks/useExpenseSplitter';
import { formatEther } from 'viem';
import { toast } from 'react-hot-toast';
import { getContractAddresses } from '@/contracts/config';

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

interface GroupManagementScreenProps {
  onBack: () => void;
  onGroupDetails?: (groupData?: GroupData) => void;
}

interface Member {
  name: string;
  address: string;
}

export const GroupManagementScreen: React.FC<GroupManagementScreenProps> = ({ onBack, onGroupDetails }) => {
  const [activeTab, setActiveTab] = useState<'groups' | 'create'>('groups');
  const [groupName, setGroupName] = useState('');
  const [selectedToken, setSelectedToken] = useState('WETH');
  const [members, setMembers] = useState<Member[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAddress, setNewMemberAddress] = useState('');

  const { address, isConnected } = useAccount();
  const expenseSplitter = useExpenseSplitter();

  // Expanded solution: Check more group IDs since your group might be at a higher ID
  // Use our existing hooks to check groups 0-9
  const group0 = useGroupInfo(BigInt(0));
  const group1 = useGroupInfo(BigInt(1));
  const group2 = useGroupInfo(BigInt(2));
  const group3 = useGroupInfo(BigInt(3));
  const group4 = useGroupInfo(BigInt(4));
  const group5 = useGroupInfo(BigInt(5));
  const group6 = useGroupInfo(BigInt(6));
  const group7 = useGroupInfo(BigInt(7));
  const group8 = useGroupInfo(BigInt(8));
  const group9 = useGroupInfo(BigInt(9));

  // Check membership in each group
  const member0 = useMemberBalance(BigInt(0), address);
  const member1 = useMemberBalance(BigInt(1), address);
  const member2 = useMemberBalance(BigInt(2), address);
  const member3 = useMemberBalance(BigInt(3), address);
  const member4 = useMemberBalance(BigInt(4), address);
  const member5 = useMemberBalance(BigInt(5), address);
  const member6 = useMemberBalance(BigInt(6), address);
  const member7 = useMemberBalance(BigInt(7), address);
  const member8 = useMemberBalance(BigInt(8), address);
  const member9 = useMemberBalance(BigInt(9), address);

  // Get actual member counts using dedicated hook (more reliable than getGroupInfo)
  const count0 = useMemberCount(BigInt(0));
  const count1 = useMemberCount(BigInt(1));
  const count2 = useMemberCount(BigInt(2));
  const count3 = useMemberCount(BigInt(3));
  const count4 = useMemberCount(BigInt(4));
  const count5 = useMemberCount(BigInt(5));
  const count6 = useMemberCount(BigInt(6));
  const count7 = useMemberCount(BigInt(7));
  const count8 = useMemberCount(BigInt(8));
  const count9 = useMemberCount(BigInt(9));

  // Helper function to create group object - use reliable member count
  const createGroupObject = (groupData: any, membersData: any, memberCountData: any, id: string) => {
    // Use the reliable getMemberCount instead of corrupted getGroupInfo.memberCount
    const actualMemberCount = memberCountData?.memberCount ? Number(memberCountData.memberCount) : 0;
    const hasValidMembers = actualMemberCount > 0;

    if (!hasValidMembers) return null;

    // Clean up corrupted names
    let groupName = groupData?.name || `Group ${id}`;
    if (groupName && (groupName.includes('\u0000') || groupName.includes('\u0002') || groupName.includes('\u0004'))) {
      groupName = `Group ${id}`; // Use fallback name for corrupted data
    }

    return {
      id,
      name: groupName,
      description: `Group with ${actualMemberCount} members (Bills: ${groupData?.billCount || 0})`,
      totalExpenses: 0,
      pendingAmount: 0,
      monthlyTotal: 0,
      members: [],
      recentExpenses: []
    };
  };

  // Filter groups where user is a member - use reliable member counts
  const groups = [
    createGroupObject(group0.groupInfo, member0, count0, '0'),
    createGroupObject(group1.groupInfo, member1, count1, '1'),
    createGroupObject(group2.groupInfo, member2, count2, '2'),
    createGroupObject(group3.groupInfo, member3, count3, '3'),
    createGroupObject(group4.groupInfo, member4, count4, '4'),
    createGroupObject(group5.groupInfo, member5, count5, '5'),
    createGroupObject(group6.groupInfo, member6, count6, '6'),
    createGroupObject(group7.groupInfo, member7, count7, '7'),
    createGroupObject(group8.groupInfo, member8, count8, '8'),
    createGroupObject(group9.groupInfo, member9, count9, '9'),
  ].filter(Boolean);

  // Debug logging - show all groups to find your groups
  console.log('Group data debug:', {
    validGroups: groups.length,
    group0: {
      reliableMemberCount: count0.memberCount ? Number(count0.memberCount) : 0,
      corruptedMemberCount: group0.groupInfo?.memberCount ? Number(group0.groupInfo.memberCount) : 0,
      hasValidMembers: count0.memberCount ? Number(count0.memberCount) > 0 : false
    },
    group1: {
      reliableMemberCount: count1.memberCount ? Number(count1.memberCount) : 0,
      corruptedMemberCount: group1.groupInfo?.memberCount ? Number(group1.groupInfo.memberCount) : 0,
      hasValidMembers: count1.memberCount ? Number(count1.memberCount) > 0 : false
    },
    foundGroups: groups.map(g => `${g?.name} (${g?.id})`),
    memberCountErrors: {
      count0Error: count0.error,
      count1Error: count1.error
    }
  });
  // Add a new member to the list
  const addMember = () => {
    if (!newMemberName.trim() || !newMemberAddress.trim()) {
      toast.error('Please enter both member name and address');
      return;
    }

    if (!newMemberAddress.startsWith('0x') || newMemberAddress.length !== 42) {
      toast.error('Please enter a valid Ethereum address (0x followed by 40 hex characters)');
      return;
    }

    // Check for duplicate addresses
    if (members.some(member => member.address.toLowerCase() === newMemberAddress.toLowerCase())) {
      toast.error('This address is already added to the group');
      return;
    }

    // Check if it's the current user's address (they will be added as group creator automatically)
    if (address && newMemberAddress.toLowerCase() === address.toLowerCase()) {
      toast.error('You will be added as the group creator automatically - no need to add yourself');
      return;
    }

    setMembers([...members, { name: newMemberName.trim(), address: newMemberAddress.trim() }]);
    setNewMemberName('');
    setNewMemberAddress('');
  };

  // Remove member from list
  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || !address) {
      toast.error('Please fill in group name and connect wallet');
      return;
    }

    // Validate minimum 2 members requirement (including current user)
    if (members.length === 0) {
      toast.error('Please add at least 1 other member (minimum 2 total members required)');
      return;
    }

    // Prepare data for contract
    const memberNames = ['You', ...members.map(member => member.name)];
    const memberAddresses = [address as `0x${string}`, ...members.map(member => member.address as `0x${string}`)];

    console.log('Creating group with:', {
      name: groupName,
      memberNames,
      memberAddresses,
      totalMembers: memberNames.length
    });

    try {
      // Use selected token address
      const contracts = getContractAddresses();
      const tokenAddress = contracts.TOKENS?.[selectedToken as keyof typeof contracts.TOKENS] ||
        contracts.TOKENS?.WETH ||
        '0x980B62Da83eFf3D4576C647993b0c1D7faf17c73'; // Fallback to WETH

      console.log('Creating group with selected token:', { selectedToken, tokenAddress });

      await expenseSplitter.createGroup(
        groupName,
        tokenAddress, // Use real WETH token address
        memberNames,    // Actual member names
        memberAddresses // Corresponding addresses
      );

      // Reset form
      setGroupName('');
      setSelectedToken('WETH');
      setMembers([]);
      toast.success('Group created successfully! It will appear in your groups list shortly.');

      // Switch to groups tab to see the new group
      setActiveTab('groups');
    } catch (error) {
      console.error('Error creating group:', error);
      // Error toast is handled in the hook
    }
  };

  // Handle viewing group details with real contract data
  const handleViewGroupDetails = (group: any) => {
    if (!onGroupDetails) return;

    // Create group data object with contract information
    const groupData = {
      id: group.id,
      name: group.name,
      description: group.description,
      totalExpenses: 0, // Will be calculated from bills
      pendingAmount: 0, // Will be calculated from debts
      monthlyTotal: 0, // Will be calculated from bills
      members: [], // Will be loaded by GroupDetailsScreen using useGroupMembers
      recentExpenses: [], // Will be loaded by GroupDetailsScreen using useGroupBills
      groupSettings: {
        autoApproveLimit: 0,
        requireAllApprovals: false,
        allowMemberInvites: true,
      }
    };

    onGroupDetails(groupData);
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600';
    if (balance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getBalanceSign = (balance: number) => {
    if (balance > 0) return '+';
    if (balance < 0) return '';
    return '';
  };

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
              <h1 className="text-2xl font-bold text-gray-900">Group Management</h1>
              <p className="text-gray-600">Manage your expense groups and settlements</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="primary" icon={<Plus className="w-5 h-5" />} onClick={() => setActiveTab('create')}>
              Create Group
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm max-w-md">
            {[
              { id: 'groups', label: 'My Groups', count: groups.length },
              { id: 'create', label: 'Create New' }
            ].map((tab) => (
              <button
                key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'groups' | 'create')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#7C3AED] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label} {tab.count && `(${tab.count})`}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          {activeTab === 'groups' && (
            <div className="space-y-6">
              {groups.map((group, index) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    {/* Group Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                          <span className="text-2xl font-bold text-blue-600">
                            {group.name.split(' ').map(word => word[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{group.name}</h3>
                          <p className="text-gray-600">{group.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {group.members.length} members
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              ${group.totalExpenses.toFixed(2)} total
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              2 hours ago
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {group.pendingAmount > 0 && (
                          <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                            ${group.pendingAmount.toFixed(2)} pending
                          </div>
                        )}
                        <Button variant="ghost" className="p-2">
                          <Settings className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" className="p-2">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Members */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 mb-3">Members & Balances</h4>
                      {group.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <ProfilePicture name={member.name} size="md" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{member.name}</span>
                                {member.role === 'admin' && (
                                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                    Admin
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{member.username}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className={`font-semibold ${getBalanceColor(member.balance)}`}>
                                {getBalanceSign(member.balance)}${Math.abs(member.balance).toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {member.balance > 0 ? 'Owes you' : member.balance < 0 ? 'You owe' : 'Settled'}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" className="p-2">
                                <MessageCircle className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="p-2">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewGroupDetails(group)}
                        >
                          View Expenses
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewGroupDetails(group)}
                        >
                          Settlement History
                        </Button>
                      </div>
                      <Button variant="primary" size="sm" onClick={onBack}>
                        Create Expense
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'create' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="max-w-2xl">
                <Card className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Create New Group</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Group Name
                      </label>
                      <input
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="e.g., SF Roommates, Work Lunch Crew"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Token
                      </label>
                      <select
                        value={selectedToken}
                        onChange={(e) => setSelectedToken(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent bg-white"
                      >
                        <option value="WETH">WETH - Wrapped Ethereum</option>
                        <option value="USDC">USDC - USD Coin</option>
                        <option value="CUSTOM">CUSTOM - Your Custom Token</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        All expenses in this group will use {selectedToken} tokens. Members need to have {selectedToken} to participate.
                      </p>
                      {selectedToken === 'CUSTOM' && (
                        <p className="text-xs text-blue-600 mt-1 font-mono">
                          Token Address: 0x0f764437ffBE1fcd0d0d276a164610422710B482
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Add Members
                      </label>

                      {/* Add Member Form */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Member name (e.g., Alice, Bob)"
                            value={newMemberName}
                            onChange={(e) => setNewMemberName(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
                          />
                          <input
                            type="text"
                            placeholder="0x... wallet address"
                            value={newMemberAddress}
                            onChange={(e) => setNewMemberAddress(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
                          />
                        </div>
                        <Button
                          variant="secondary"
                          onClick={addMember}
                          disabled={!newMemberName.trim() || !newMemberAddress.trim()}
                          icon={<UserPlus className="w-5 h-5" />}
                        >
                          Add Member
                        </Button>
                      </div>

                      {/* Members List */}
                      {members.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <h4 className="text-sm font-medium text-gray-700">Group Members:</h4>
                          <div className="bg-gray-50 rounded-lg p-3">
                            {/* Current User */}
                            <div className="flex items-center justify-between py-2">
                              <div className="flex items-center gap-3">
                                <ProfilePicture name="You" size="sm" />
                                <div>
                                  <span className="text-sm font-medium text-gray-900">You</span>
                                  <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">Admin</span>
                                </div>
                              </div>
                              <span className="text-xs text-gray-500 font-mono">
                                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
                              </span>
                            </div>

                            {/* Added Members */}
                            {members.map((member, index) => (
                              <div key={index} className="flex items-center justify-between py-2 border-t border-gray-200">
                                <div className="flex items-center gap-3">
                                  <ProfilePicture name={member.name} size="sm" />
                                  <span className="text-sm font-medium text-gray-900">{member.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500 font-mono">
                                    {member.address.slice(0, 6)}...{member.address.slice(-4)}
                                  </span>
                                  <button
                                    onClick={() => removeMember(index)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-sm text-gray-500 mt-2">
                        Add at least 1 other member (minimum 2 total members required)
                        <br />
                        <span className="text-xs text-orange-600">
                          📋 You will be automatically added as the group admin
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm text-gray-700">
                          Make this a public group (others can discover and request to join)
                        </span>
                      </label>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                      <Button variant="secondary" onClick={() => setActiveTab('groups')}>
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleCreateGroup}
                        disabled={expenseSplitter.isPending || !groupName.trim() || members.length === 0}
                      >
                        {expenseSplitter.isPending ? 'Creating...' : `Create Group (${members.length + 1} members)`}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
