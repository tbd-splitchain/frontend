import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ArrowLeft, Filter, Download, ExternalLink, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  from: string;
  to: string;
  description: string;
  timestamp: string;
  status: string;
  txHash: string | null;
  group: string;
  participants: number;
  yourShare: number;
  approvals?: number;
  errorReason?: string;
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

interface TransactionHistoryScreenProps {
  onBack: () => void;
  onExpenseDetails?: (expenseData: ExpenseData) => void;
}

export const TransactionHistoryScreen: React.FC<TransactionHistoryScreenProps> = ({ onBack, onExpenseDetails }) => {
  const [filter, setFilter] = useState<'all' | 'sent' | 'received' | 'pending'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [displayCount, setDisplayCount] = useState(5);

  const transactions: Transaction[] = [
    {
      id: 'bill-150',
      type: 'settlement',
      amount: 150.50,
      from: 'Group',
      to: 'You',
      description: 'Coffee & Lunch - Group Settlement',
      timestamp: '2 hours ago',
      status: 'pending',
      txHash: null,
      group: 'SF Roommates',
      participants: 4,
      yourShare: 150.50
    },
    {
      id: 'bill-89',
      type: 'payment',
      amount: 29.76,
      from: 'You',
      to: 'Alice Smith',
      description: 'Team Dinner - Your Share',
      timestamp: '1 day ago',
      status: 'pending',
      txHash: null,
      group: 'Work Lunch Crew',
      participants: 3,
      yourShare: 29.76
    },
    {
      id: '5',
      type: 'settlement',
      amount: 815.80,
      from: 'Group',
      to: 'You',
      description: 'Utilities & Internet - Group Settlement',
      timestamp: '1 week ago',
      status: 'pending',
      txHash: null,
      group: 'SF Roommates',
      participants: 4,
      yourShare: 815.80
    },
    {
      id: '3',
      type: 'payment',
      amount: 500.00,
      from: 'You',
      to: 'Guy Hawkins',
      description: 'Monthly Rent Payment',
      timestamp: '3 weeks ago',
      status: 'completed',
      txHash: '0xd4e7b9f2...3C8A',
      group: 'SF Roommates',
      participants: 4,
      yourShare: 500.00
    },
    {
      id: '4',
      type: 'payment',
      amount: 46.30,
      from: 'You',
      to: 'Robert Fox',
      description: 'Groceries & Household',
      timestamp: '5 days ago',
      status: 'completed',
      txHash: '0xa5c8f2b3...9E4D',
      group: 'SF Roommates',
      participants: 4,
      yourShare: 46.30
    },
    {
      id: '6',
      type: 'payment',
      amount: 22.38,
      from: 'You',
      to: 'Jimmy Cooper',
      description: 'Cleaning Supplies',
      timestamp: '2 weeks ago',
      status: 'completed',
      txHash: '0xf7e8a9d2...1B5C',
      group: 'SF Roommates',
      participants: 4,
      yourShare: 22.38
    },
    {
      id: '7',
      type: 'settlement',
      amount: 200.00,
      from: 'Alice Smith',
      to: 'You',
      description: 'Previous Lunch Reimbursement',
      timestamp: '1 month ago',
      status: 'completed',
      txHash: '0x1a2b3c4d...5e6f',
      group: 'Work Lunch Crew',
      participants: 3,
      yourShare: 200.00
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };


  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    if (filter === 'pending') return tx.status === 'pending';
    if (filter === 'received') return (tx.type === 'settlement' && tx.to === 'You');
    if (filter === 'sent') return (tx.type === 'payment' && tx.from === 'You');
    return false;
  });

  // Calculate totals based on actual transaction flow
  const totalReceived = transactions
    .filter(tx => tx.type === 'settlement' && tx.status === 'completed' && tx.to === 'You')
    .reduce((sum, tx) => sum + tx.yourShare, 0);

  const totalSent = transactions
    .filter(tx => (tx.type === 'payment' || tx.type === 'settlement') && tx.status === 'completed' && tx.from === 'You')
    .reduce((sum, tx) => sum + tx.yourShare, 0);

  // Pending includes both money you'll receive and money you need to pay
  const pendingReceive = transactions
    .filter(tx => tx.type === 'settlement' && tx.status === 'pending' && tx.to === 'You')
    .reduce((sum, tx) => sum + tx.yourShare, 0);

  const pendingSend = transactions
    .filter(tx => tx.type === 'payment' && tx.status === 'pending' && tx.from === 'You')
    .reduce((sum, tx) => sum + tx.yourShare, 0);

  const pendingAmount = pendingReceive + pendingSend;

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
              <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
              <p className="text-gray-600">All your crypto expense transactions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" icon={<Download className="w-5 h-5" />} onClick={() => {
              const csvContent = transactions.map(tx => 
                `${tx.type},${tx.amount},${tx.type === 'received' ? tx.from : tx.to},${tx.description},${tx.timestamp},${tx.status},${tx.txHash || 'N/A'}`
              ).join('\n');
              const csvHeader = 'Type,Amount,Party,Description,Timestamp,Status,Transaction Hash\n';
              const blob = new Blob([csvHeader + csvContent], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'splitchain-transactions.csv';
              a.click();
              window.URL.revokeObjectURL(url);
            }}>
              Export
            </Button>
            <Button variant="secondary" icon={<Filter className="w-5 h-5" />} onClick={() => setShowFilters(!showFilters)}>
              Filter
            </Button>
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant={filter === 'all' ? 'primary' : 'secondary'}
                  onClick={() => setFilter('all')}
                  className="justify-start"
                >
                  All Transactions
                </Button>
                <Button
                  variant={filter === 'received' ? 'primary' : 'secondary'}
                  onClick={() => setFilter('received')}
                  className="justify-start"
                >
                  Received
                </Button>
                <Button
                  variant={filter === 'sent' ? 'primary' : 'secondary'}
                  onClick={() => setFilter('sent')}
                  className="justify-start"
                >
                  Sent
                </Button>
                <Button
                  variant={filter === 'pending' ? 'primary' : 'secondary'}
                  onClick={() => setFilter('pending')}
                  className="justify-start"
                >
                  Pending
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Total Received</h3>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">+</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-green-600">${totalReceived.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">From expense splits</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Total Sent</h3>
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm">-</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-red-600">${totalSent.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">For shared expenses</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Pending</h3>
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-yellow-600">${pendingAmount.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
            </Card>
          </motion.div>
        </div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm">
            {[
              { id: 'all', label: 'All Transactions', count: transactions.length },
              { id: 'received', label: 'Received', count: transactions.filter(t => t.type === 'settlement' && t.to === 'You').length },
              { id: 'sent', label: 'Sent', count: transactions.filter(t => t.type === 'payment' && t.from === 'You').length },
              { id: 'pending', label: 'Pending', count: transactions.filter(t => t.status === 'pending').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as 'all' | 'sent' | 'received' | 'pending')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  filter === tab.id
                    ? 'bg-[#7C3AED] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </motion.div>

        {/* Transaction List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-4"
        >
          {filteredTransactions.slice(0, displayCount).map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                if (onExpenseDetails) {
                  // Convert transaction data to expense data format with proper participants
                  let participants = [];
                  let paidBy = '';
                  let userAction = 'collect';
                  let youWillReceive = 0;
                  let youOwe = 0;

                  // Map transaction to specific expense data based on transaction ID
                  switch (transaction.id) {
                    case 'bill-150': // Coffee & Lunch - You paid, others owe you
                      paidBy = 'You (ogazboiz)';
                      participants = [
                        { name: 'You (ogazboiz)', amount: 50.17, status: 'paid' },
                        { name: 'Jimmy Cooper', amount: 50.17, status: 'approved' },
                        { name: 'Guy Hawkins', amount: 50.17, status: 'approved' },
                        { name: 'Robert Fox', amount: 50.16, status: 'approved' }
                      ];
                      userAction = 'collect';
                      youWillReceive = 150.50;
                      break;

                    case 'bill-89': // Team Dinner - Alice paid, you owe
                      paidBy = 'Alice Smith';
                      participants = [
                        { name: 'Alice Smith', amount: 29.77, status: 'paid' },
                        { name: 'Bob Johnson', amount: 29.77, status: 'approved' },
                        { name: 'You (ogazboiz)', amount: 29.76, status: 'pending' }
                      ];
                      userAction = 'pay';
                      youOwe = 29.76;
                      break;

                    case '5': // Utilities & Internet - You paid, others owe you
                      paidBy = 'You (ogazboiz)';
                      participants = [
                        { name: 'You (ogazboiz)', amount: 203.95, status: 'paid' },
                        { name: 'Jimmy Cooper', amount: 203.95, status: 'approved' },
                        { name: 'Guy Hawkins', amount: 203.95, status: 'approved' },
                        { name: 'Robert Fox', amount: 203.95, status: 'approved' }
                      ];
                      userAction = 'collect';
                      youWillReceive = 611.85;
                      break;

                    case '3': // Monthly Rent - Guy paid, you owe
                      paidBy = 'Guy Hawkins';
                      participants = [
                        { name: 'You (ogazboiz)', amount: 500.00, status: 'approved' },
                        { name: 'Jimmy Cooper', amount: 500.00, status: 'approved' },
                        { name: 'Guy Hawkins', amount: 500.00, status: 'paid' },
                        { name: 'Robert Fox', amount: 500.00, status: 'approved' }
                      ];
                      userAction = 'pay';
                      youOwe = 500.00;
                      break;

                    case '4': // Groceries & Household - Robert paid, you owe
                      paidBy = 'Robert Fox';
                      participants = [
                        { name: 'You (ogazboiz)', amount: 46.30, status: 'approved' },
                        { name: 'Jimmy Cooper', amount: 46.30, status: 'approved' },
                        { name: 'Guy Hawkins', amount: 46.30, status: 'approved' },
                        { name: 'Robert Fox', amount: 46.30, status: 'paid' }
                      ];
                      userAction = 'pay';
                      youOwe = 46.30;
                      break;

                    case '6': // Cleaning Supplies - Jimmy paid, you owe
                      paidBy = 'Jimmy Cooper';
                      participants = [
                        { name: 'You (ogazboiz)', amount: 22.38, status: 'approved' },
                        { name: 'Jimmy Cooper', amount: 22.38, status: 'paid' },
                        { name: 'Guy Hawkins', amount: 22.37, status: 'approved' },
                        { name: 'Robert Fox', amount: 22.37, status: 'approved' }
                      ];
                      userAction = 'pay';
                      youOwe = 22.38;
                      break;

                    default:
                      // Fallback case
                      paidBy = 'Unknown';
                      participants = [{ name: 'You (ogazboiz)', amount: 0, status: 'pending' }];
                      userAction = 'pay';
                      youOwe = 0;
                  }

                  // Get expense-specific details based on transaction ID
                  let merchant = 'Unknown Merchant';
                  const location = 'San Francisco, CA';
                  let category = 'Food & Dining';
                  let items: Array<{ name: string; price: number }> = [];

                  switch (transaction.id) {
                    case 'bill-150': // Coffee & Lunch
                      merchant = 'Downtown Café';
                      category = 'Food & Dining';
                      items = [
                        { name: 'Coffee (4x)', price: 20.00 },
                        { name: 'Sandwiches (4x)', price: 80.00 },
                        { name: 'Pastries (4x)', price: 32.00 },
                        { name: 'Tax & Tip', price: 18.50 }
                      ];
                      break;
                    case 'bill-89': // Team Dinner
                      merchant = 'Upscale Restaurant';
                      category = 'Food & Dining';
                      items = [
                        { name: 'Main Courses (3x)', price: 54.00 },
                        { name: 'Appetizers', price: 18.00 },
                        { name: 'Drinks', price: 12.00 },
                        { name: 'Tax & Tip', price: 5.30 }
                      ];
                      break;
                    case '5': // Utilities & Internet
                      merchant = 'PG&E & Comcast';
                      category = 'Utilities';
                      items = [
                        { name: 'Electricity (PG&E)', price: 285.40 },
                        { name: 'Gas (PG&E)', price: 125.60 },
                        { name: 'Internet (Comcast)', price: 199.90 },
                        { name: 'Water & Sewer', price: 204.90 }
                      ];
                      break;
                    case '3': // Monthly Rent
                      merchant = 'San Francisco Apartment Complex';
                      category = 'Housing';
                      items = [{ name: 'Monthly Rent', price: 2000.00 }];
                      break;
                    case '4': // Groceries & Household
                      merchant = 'Whole Foods Market';
                      category = 'Groceries';
                      items = [
                        { name: 'Fresh Produce', price: 65.40 },
                        { name: 'Dairy & Eggs', price: 28.80 },
                        { name: 'Household Items', price: 42.20 },
                        { name: 'Meat & Seafood', price: 48.80 }
                      ];
                      break;
                    case '6': // Cleaning Supplies
                      merchant = 'Target';
                      category = 'Household';
                      items = [
                        { name: 'All-Purpose Cleaner', price: 18.99 },
                        { name: 'Laundry Detergent', price: 24.99 },
                        { name: 'Paper Towels', price: 15.49 },
                        { name: 'Dish Soap', price: 8.99 },
                        { name: 'Toilet Paper', price: 21.04 }
                      ];
                      break;
                  }

                  const expenseData = {
                    id: transaction.id,
                    description: transaction.description.split(' - ')[0],
                    amount: transaction.amount,
                    date: '2024-09-23',
                    timestamp: transaction.timestamp,
                    merchant: merchant,
                    location: location,
                    paidBy: paidBy,
                    participants: participants,
                    status: transaction.status,
                    approvals: participants.filter(p => p.status === 'approved' || p.status === 'paid').length,
                    totalParticipants: participants.length,
                    isReady: transaction.status === 'completed',
                    txHash: transaction.txHash,
                    category: category,
                    splitMethod: 'equal',
                    receipt: 'Available',
                    notes: `${paidBy} paid for ${transaction.description.split(' - ')[0].toLowerCase()}. ${userAction === 'collect' ? 'Others will reimburse you.' : 'You need to pay your share.'}`,
                    userAction: userAction,
                    youWillReceive: youWillReceive,
                    youOwe: youOwe,
                    items: items
                  };
                  onExpenseDetails(expenseData);
                }
              }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                        <span className="text-lg font-bold text-blue-600">
                          {transaction.description.split(' ').map(word => word[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border border-gray-100">
                        {getStatusIcon(transaction.status)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 text-lg">
                          {transaction.description.split(' - ')[0]}
                        </h3>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          {transaction.group}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                        <span>{transaction.timestamp}</span>
                        <span>•</span>
                        <span>{transaction.participants} participants</span>
                        {transaction.yourShare && (
                          <>
                            <span>•</span>
                            <span>Your share: ${transaction.yourShare.toFixed(2)}</span>
                          </>
                        )}
                        <span>•</span>
                        <span className="text-purple-600 font-medium">Click for details</span>
                      </div>
                      {transaction.type === 'settlement' && (
                        <p className="text-sm text-gray-600">
                          {transaction.from === 'You' ? `Paid to ${transaction.to}` :
                           transaction.to === 'You' ? `Received from ${transaction.from}` :
                           `${transaction.from} → ${transaction.to}`}
                        </p>
                      )}
                      {transaction.type === 'pending' && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-20 bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-orange-500 h-1.5 rounded-full"
                              style={{width: `${((transaction.approvals || 0) / transaction.participants) * 100}%`}}
                            ></div>
                          </div>
                          <span className="text-xs text-orange-600 font-medium">
                            {transaction.approvals || 0}/{transaction.participants} approved
                          </span>
                        </div>
                      )}
                      {transaction.type === 'failed' && transaction.errorReason && (
                        <p className="text-sm text-red-600 mt-1">{transaction.errorReason}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${
                      transaction.type === 'settlement' ?
                        (transaction.to === 'You' ? 'text-green-600' : 'text-red-600') :
                      transaction.type === 'pending' ? 'text-orange-600' :
                      transaction.type === 'failed' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {transaction.type === 'settlement' ?
                        (transaction.to === 'You' ? '+' : '-') :
                        transaction.type === 'pending' ? '~' : '!'}
                      ${transaction.amount.toFixed(2)}
                    </p>
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-700' :
                        transaction.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                        transaction.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {transaction.status === 'completed' ? 'Settled' :
                         transaction.status === 'pending' ? 'Pending' :
                         transaction.status === 'failed' ? 'Failed' :
                         transaction.status}
                      </span>
                      {transaction.txHash && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 hover:bg-gray-100"
                          onClick={() => window.open(`https://arbiscan.io/tx/${transaction.txHash}`, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {transaction.type === 'settlement' ? 'USDC on Arbitrum' :
                       transaction.type === 'pending' ? 'Awaiting approval' :
                       transaction.type === 'failed' ? 'Transaction failed' :
                       'Smart contract'}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Load More */}
        {displayCount < filteredTransactions.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 text-center"
          >
            <Button variant="secondary" onClick={() => setDisplayCount(prev => prev + 5)}>
              Load More Transactions ({filteredTransactions.length - displayCount} remaining)
            </Button>
          </motion.div>
        )}

        {filteredTransactions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center py-12"
          >
            <Card className="p-8">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-500">No transactions match your current filter selection.</p>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};
