import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ProfilePicture } from '../ui/ProfilePicture';
import { ArrowLeft, Plus, Settings, Users, DollarSign, Calendar, MoreVertical, UserPlus, MessageCircle } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useExpenseSplitter, useGroupManagementData, useGroupCreator } from '@/hooks/useExpenseSplitter';
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
  const [selectedToken, setSelectedToken] = useState('STK');
  const [members, setMembers] = useState<Member[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAddress, setNewMemberAddress] = useState('');

  const { address, isConnected } = useAccount();
  const expenseSplitter = useExpenseSplitter();

  // Load real blockchain data
  const { groups, isLoading: groupsLoading, error: groupsError } = useGroupManagementData();
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
    if (!address) {
      toast.error('Please connect wallet');
      return;
    }

    // Validate minimum 2 members requirement (including current user)
    if (members.length === 0) {
      toast.error('Please add at least 1 other member (minimum 2 total members required)');
      return;
    }

    // Prepare data for contract - use ID-based group naming
    const memberNames = ['You', ...members.map(member => member.name)];
    const memberAddresses = [address as `0x${string}`, ...members.map(member => member.address as `0x${string}`)];

    // Auto-generate group name based on next available ID
    const autoGroupName = `Group ${Math.max(...groups.map(g => parseInt(g.id)), -1) + 1}`;

    console.log('Creating group with auto-generated name:', {
      name: autoGroupName,
      memberNames,
      memberAddresses,
      totalMembers: memberNames.length
    });

    try {
      // Use STK token address
      const contracts = getContractAddresses();
      console.log('Contract addresses:', contracts);
      console.log('Available tokens:', contracts.TOKENS);

      const tokenAddress = contracts.TOKENS?.STK;
      console.log('STK token address from config:', tokenAddress);

      if (!tokenAddress) {
        throw new Error(`STK token address not found in config. Available tokens: ${Object.keys(contracts.TOKENS || {})}`);
      }

      // Force the correct STK address as a safety check
      const stkTokenAddress = '0x5423d4026EdeB17e30DF603Dc65Db7d8C5dC1c25' as `0x${string}`;

      console.log('Creating group with STK token:', {
        configAddress: tokenAddress,
        forcedAddress: stkTokenAddress,
        usingAddress: stkTokenAddress
      });

      await expenseSplitter.createGroup(
        autoGroupName, // Use auto-generated name instead of user input
        stkTokenAddress, // Use forced STK token address
        memberNames,    // Actual member names
        memberAddresses // Corresponding addresses
      );

      // Reset form
      setGroupName('');
      setMembers([]);
      toast.success('Group created successfully! It will appear in your groups list shortly.');

      // Switch to groups tab to see the new group
      setActiveTab('groups');

      // Force refresh group data after successful creation
      setTimeout(() => {
        window.location.reload(); // Simple solution to refresh data
      }, 2000);
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
              {groupsLoading && (
                <div className="text-center py-8">
                  <div className="text-gray-600">Loading your groups...</div>
                </div>
              )}
              {groupsError && (
                <div className="text-center py-8">
                  <div className="text-red-600">Error loading groups: {groupsError.message}</div>
                </div>
              )}
              {!groupsLoading && !groupsError && groups.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-600">No groups found. Create your first group!</div>
                </div>
              )}
              {!groupsLoading && !groupsError && groups.map((group, index) => (
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
                              {group.description}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {group.totalExpenses.toFixed(4)} ETH total
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
                        Group Name (Auto-generated)
                      </label>
                      <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600">
                        Group {Math.max(...groups.map(g => parseInt(g.id)), -1) + 1}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Group names are automatically assigned based on creation order
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Token
                      </label>
                      <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700">
                        STK - SplitChain Token
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        All expenses in this group will use STK tokens. Members need to have STK to participate.
                      </p>
                      <p className="text-xs text-blue-600 mt-1 font-mono">
                        Token Address: 0x5423d4026EdeB17e30DF603Dc65Db7d8C5dC1c25
                      </p>
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
                        disabled={expenseSplitter.isPending || members.length === 0}
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
