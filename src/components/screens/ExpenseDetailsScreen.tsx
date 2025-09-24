import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ProfilePicture } from '../ui/ProfilePicture';
import { ArrowLeft, DollarSign, Calendar, MapPin, Users, CheckCircle, Clock } from 'lucide-react';

interface ExpenseDetailsScreenProps {
  onBack: () => void;
  expenseData?: ExpenseData;
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

interface ExpenseItem {
  name: string;
  price: number;
}

interface Participant {
  name: string;
  amount: number;
  status: string;
}

export const ExpenseDetailsScreen: React.FC<ExpenseDetailsScreenProps> = ({ onBack, expenseData: passedExpenseData }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'split' | 'history'>('overview');

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

  const expenseData = passedExpenseData || defaultExpenseData;

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
              <h1 className="text-2xl font-bold text-gray-900">{detailedExpenseData.description}</h1>
              <p className="text-gray-600">{detailedExpenseData.merchant} • {detailedExpenseData.timestamp}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            {detailedExpenseData.userAction === 'collect' && (
              <div className="text-right">
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl font-bold text-lg mb-2">
                  💰 You Will Receive: ${(detailedExpenseData.youWillReceive || 0).toFixed(2)}
                </div>
                <p className="text-sm text-green-600 font-medium">Others owe you money</p>
              </div>
            )}
            {detailedExpenseData.userAction === 'pay' && (
              <div className="text-right">
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl font-bold text-lg mb-2">
                  💳 You Owe: ${(detailedExpenseData.youOwe || 0).toFixed(2)}
                </div>
                <p className="text-sm text-red-600 font-medium">You need to pay your share</p>
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
                  You Will Receive ${(detailedExpenseData.youWillReceive || 0).toFixed(2)}
                </h2>
                <p className="text-green-700 text-lg mb-4">You paid the bill - others will reimburse you</p>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-600 font-medium">All participants approved</span>
                </div>
                <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-2xl font-bold text-lg">
                  Collect Payment Now
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-red-50 to-orange-100 border-2 border-red-200 rounded-3xl p-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💳</span>
                </div>
                <h2 className="text-3xl font-bold text-red-900 mb-2">
                  You Owe ${(detailedExpenseData.youOwe || 0).toFixed(2)}
                </h2>
                <p className="text-red-700 text-lg mb-4">Pay your share of the bill</p>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="text-orange-600 font-medium">Your approval needed</span>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-2xl font-bold text-lg">
                  Pay Your Share
                </Button>
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
                  <p className="text-2xl font-bold text-gray-900">${(detailedExpenseData.amount || 0).toFixed(2)}</p>
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
                  <p className="text-2xl font-bold text-gray-900">${((detailedExpenseData.amount || 0) / Math.max(detailedExpenseData.participants.length, 1)).toFixed(2)}</p>
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
                            <span className="text-green-600">Will transfer ${(participant.amount || 0).toFixed(2)} to you</span>
                          ) : participant.name.includes('You') ? (
                            <span className="text-red-600">You need to pay ${(participant.amount || 0).toFixed(2)}</span>
                          ) : participant.status === 'paid' ? (
                            <span className="text-blue-600">Already covered their share</span>
                          ) : (
                            <span className="text-gray-600">Will pay ${(participant.amount || 0).toFixed(2)}</span>
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
                        ${(participant.amount || 0).toFixed(2)}
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
