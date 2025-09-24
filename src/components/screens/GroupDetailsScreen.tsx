import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ProfilePicture } from '../ui/ProfilePicture';
import { ArrowLeft, Plus, DollarSign, Calendar, Users, TrendingUp, AlertCircle } from 'lucide-react';

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

  // Use passed group data or determine which group to show
  const groupData = passedGroupData?.id === 'work-lunch-crew' ? workLunchCrewData : sfRoommatesData;

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600 bg-green-50';
    if (balance < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
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
              <h1 className="text-2xl font-bold text-gray-900">{groupData.name}</h1>
              <p className="text-gray-600">{groupData.description}</p>
            </div>
          </div>
          <Button variant="primary" icon={<Plus className="w-5 h-5" />}>
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
                  <p className="text-2xl font-bold text-gray-900">${groupData.monthlyTotal.toFixed(2)}</p>
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
                  <p className="text-2xl font-bold text-gray-900">${groupData.pendingAmount.toFixed(2)}</p>
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
                  <p className="text-2xl font-bold text-green-600">+$45.20</p>
                  <p className="text-xs text-green-500">Others owe you</p>
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
                  <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => onExpenseDetails && onExpenseDetails(expense)}>
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
                      <p className="font-bold text-gray-900 text-lg">${expense.amount.toFixed(2)}</p>
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
                  <div key={expense.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer" onClick={() => onExpenseDetails && onExpenseDetails(expense)}>
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
                        <p className="text-3xl font-bold text-gray-900">${expense.amount.toFixed(2)}</p>
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
                              <p className="text-sm font-bold text-gray-900">${participant.amount.toFixed(2)}</p>
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
                          {expense.participants.length} participants • ${(expense.amount / expense.participants.length).toFixed(2)} each
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
