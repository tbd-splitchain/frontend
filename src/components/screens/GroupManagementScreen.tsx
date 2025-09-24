import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ProfilePicture } from '../ui/ProfilePicture';
import { ArrowLeft, Plus, Settings, Users, DollarSign, Calendar, MoreVertical, UserPlus, MessageCircle } from 'lucide-react';

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

export const GroupManagementScreen: React.FC<GroupManagementScreenProps> = ({ onBack, onGroupDetails }) => {
  const [activeTab, setActiveTab] = useState<'groups' | 'create'>('groups');

  const groups: GroupData[] = [
    {
      id: '1',
      name: 'SF Roommates',
      description: 'Shared expenses for San Francisco apartment',
      totalExpenses: 1250.40,
      pendingAmount: 200.00,
      monthlyTotal: 1250.40,
      members: [
        { id: '1', name: 'ogazboiz', username: '0x1234567890abcdef...1234', role: 'admin', balance: 45.20, status: 'active' },
        { id: '2', name: 'Jimmy Cooper', username: '0xabcd1234567890ef...5678', role: 'member', balance: -23.50, status: 'active' },
        { id: '3', name: 'Guy Hawkins', username: '0xef9876543210abcd...9abc', role: 'member', balance: 0, status: 'active' },
        { id: '4', name: 'Robert Fox', username: '0x567890abcdef1234...def0', role: 'member', balance: -21.70, status: 'active' }
      ],
      recentExpenses: [],
      groupSettings: {
        autoApproveLimit: 50.00,
        requireAllApprovals: true,
        allowMemberInvites: true
      }
    },
    {
      id: '2',
      name: 'Work Lunch Crew',
      description: 'Office lunch and team outings',
      totalExpenses: 890.50,
      pendingAmount: 100.00,
      monthlyTotal: 890.50,
      members: [
        { id: '5', name: 'Alice Smith', username: '0x9876543210fedcba...4321', role: 'member', balance: -67.90, status: 'active' },
        { id: '6', name: 'Bob Johnson', username: '0xfedcba0987654321...8765', role: 'member', balance: 12.80, status: 'active' },
        { id: '7', name: 'Sarah Wilson', username: '0x2468135790acefbd...2468', role: 'admin', balance: 89.30, status: 'active' },
        { id: '8', name: 'Mike Chen', username: '0x13579bdf02468ace...1357', role: 'member', balance: -34.20, status: 'active' }
      ],
      recentExpenses: [],
      groupSettings: {
        autoApproveLimit: 30.00,
        requireAllApprovals: false,
        allowMemberInvites: true
      }
    }
  ];

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
                        <Button variant="secondary" size="sm" onClick={onGroupDetails}>
                          View Expenses
                        </Button>
                        <Button variant="secondary" size="sm" onClick={onGroupDetails}>
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
                        placeholder="e.g., SF Roommates, Work Lunch Crew"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        placeholder="Describe the purpose of this group..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Add Members
                      </label>
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <input
                            type="text"
                            placeholder="Enter wallet address or username"
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
                          />
                          <Button variant="secondary" icon={<UserPlus className="w-5 h-5" />}>
                            Add
                          </Button>
                        </div>
                        <div className="text-sm text-gray-500">
                          You can add friends by their wallet address or username
                        </div>
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
                      <Button variant="primary" onClick={() => setActiveTab('groups')}>
                        Create Group
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
