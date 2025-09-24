import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ProfilePicture } from '../ui/ProfilePicture';
import { MoreVertical, ArrowRight, Plus, Camera, User } from 'lucide-react';

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
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <ProfilePicture name="ogazboiz" size="lg" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ogazboiz</h1>
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
                        <p className="text-gray-400 text-sm mb-2">My Balance</p>
                        <p className="text-3xl font-bold text-white">$14,905.80</p>
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

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Payment received</p>
                      <p className="text-xs text-gray-500">From Jimmy Cooper</p>
                    </div>
                    <span className="text-sm font-semibold text-green-600">+$45.20</span>
                  </div>

                  <div className="flex items-center gap-3 p-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Expense created</p>
                      <p className="text-xs text-gray-500">Coffee & Lunch</p>
                    </div>
                    <span className="text-sm font-semibold text-purple-600">$150.50</span>
                  </div>

                  <div className="flex items-center gap-3 p-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Group joined</p>
                      <p className="text-xs text-gray-500">SF Roommates</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            {/* Pending Settlements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Pending Settlements</h2>
                <Button variant="ghost" className="text-[#7C3AED] hover:text-[#6D28D9]" onClick={onTransactions}>
                  View All Transactions
                </Button>
              </div>
              
              <div className="grid gap-6">
                {/* Pending Bill - All Approved - Ready to Execute - You paid, others owe you */}
                <div
                  className="bg-gradient-to-br from-green-100 to-green-200 rounded-3xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => onExpenseDetails && onExpenseDetails({
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
                    userAction: 'collect',
                    youWillReceive: 150.50,
                    youOwe: 0,
                    category: 'Food & Dining',
                    splitMethod: 'equal',
                    receipt: 'Available',
                    notes: 'You paid for lunch at downtown cafe. Others will reimburse you.',
                    items: [
                      { name: 'Coffee (4x)', price: 20.00 },
                      { name: 'Sandwiches (4x)', price: 80.00 },
                      { name: 'Pastries (4x)', price: 32.00 },
                      { name: 'Tax & Tip', price: 18.50 }
                    ]
                  })}
                >
                  <div className="mb-4">
                    <p className="text-green-600 text-sm font-medium mb-1">💰 You Will Receive</p>
                    <h3 className="font-bold text-gray-900 text-2xl mb-1">$150.50</h3>
                    <p className="text-green-700 text-sm mb-3">You paid • Others will reimburse you</p>
                    <div className="flex -space-x-2 mb-3">
                      <ProfilePicture name="ogazboiz" size="sm" />
                      <ProfilePicture name="Jimmy Cooper" size="sm" />
                      <ProfilePicture name="Guy Hawkins" size="sm" />
                      <ProfilePicture name="Robert Fox" size="sm" />
                    </div>
                    <p className="text-sm text-green-600 font-medium mb-3">✅ All 4 participants (3 approved, you paid)</p>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl font-semibold shadow-lg"
                    onClick={() => { alert('Executing payment to collect your money...'); }}
                  >
                    Collect Payment
                  </Button>
                </div>

                {/* Pending Bill - You need to pay your share */}
                <div
                  className="bg-gradient-to-br from-orange-100 to-red-200 rounded-3xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => onExpenseDetails && onExpenseDetails({
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
                    userAction: 'pay',
                    youWillReceive: 0,
                    youOwe: 29.76,
                    category: 'Food & Dining',
                    splitMethod: 'equal',
                    receipt: 'Available',
                    notes: 'Alice paid for team dinner. You need to pay your share.',
                    items: [
                      { name: 'Main Courses (3x)', price: 54.00 },
                      { name: 'Appetizers', price: 18.00 },
                      { name: 'Drinks', price: 12.00 },
                      { name: 'Tax & Tip', price: 5.30 }
                    ]
                  })}
                >
                  <div className="mb-4">
                    <p className="text-red-600 text-sm font-medium mb-1">💳 You Owe</p>
                    <h3 className="font-bold text-gray-900 text-2xl mb-1">$29.76</h3>
                    <p className="text-red-700 text-sm mb-3">Alice paid • You need to reimburse your share</p>
                    <div className="flex -space-x-2 mb-3">
                      <ProfilePicture name="Alice Smith" size="sm" />
                      <ProfilePicture name="Bob Johnson" size="sm" />
                      <ProfilePicture name="ogazboiz" size="sm" />
                    </div>
                    <p className="text-sm text-orange-600 font-medium mb-3">⏳ Your approval needed</p>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-2xl font-semibold shadow-lg"
                    onClick={() => { alert('Approving and paying your share of $29.76...'); }}
                  >
                    Pay Your Share
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Active Groups */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Active Groups</h2>
                <Button variant="ghost" className="text-[#7C3AED] hover:text-[#6D28D9]" onClick={onFriends}>
                  Manage Groups
                </Button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <span className="text-xl font-bold text-blue-600">SF</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">SF Roommates</h3>
                      <p className="text-sm text-gray-500">4 members • $3,330.30 total</p>
                    </div>
                  </div>
                  <div className="flex -space-x-2 mb-4">
                    <ProfilePicture name="ogazboiz" size="sm" />
                    <ProfilePicture name="Jimmy Cooper" size="sm" />
                    <ProfilePicture name="Guy Hawkins" size="sm" />
                    <ProfilePicture name="Robert Fox" size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Last expense: 2 hours ago</span>
                    <Button variant="secondary" size="sm" onClick={() => onGroupDetails && onGroupDetails({
                      id: 'sf-roommates',
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
                    })}>
                      View Details
                    </Button>
                  </div>
                </Card>
                
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <span className="text-xl font-bold text-green-600">W</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Work Lunch Crew</h3>
                      <p className="text-sm text-gray-500">3 members • $89.30 total</p>
                    </div>
                  </div>
                  <div className="flex -space-x-2 mb-4">
                    <ProfilePicture name="Alice Smith" size="sm" />
                    <ProfilePicture name="Bob Johnson" size="sm" />
                    <ProfilePicture name="ogazboiz" size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Last expense: 1 day ago</span>
                    <Button variant="secondary" size="sm" onClick={() => onGroupDetails && onGroupDetails({
                      id: 'work-lunch-crew',
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
                    })}>
                      View Details
                    </Button>
                  </div>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
