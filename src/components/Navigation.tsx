'use client';

import React, { useState } from 'react';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { HomeScreen } from './screens/HomeScreen';
import { SplitBillScreen } from './screens/SplitBillScreen';
import { CreateExpenseScreen } from './screens/CreateExpenseScreen';
import { GroupManagementScreen } from './screens/GroupManagementScreen';
import { TransactionHistoryScreen } from './screens/TransactionHistoryScreen';
import { ReceiptScanScreen } from './screens/ReceiptScanScreen';
import { GroupDetailsScreen } from './screens/GroupDetailsScreen';
import { ExpenseDetailsScreen } from './screens/ExpenseDetailsScreen';

type Screen = 'onboarding' | 'home' | 'split-bill' | 'create-expense' | 'groups' | 'transactions' | 'receipt-scan' | 'group-details' | 'expense-details';

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

export const Navigation: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [selectedBill, setSelectedBill] = useState<BillData | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseData | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null);

  const handleNext = () => {
    setCurrentScreen('home');
  };

  const handleSplitBill = (billData?: BillData) => {
    setSelectedBill(billData || null);
    setCurrentScreen('split-bill');
  };

  const handleCreateExpense = () => {
    setCurrentScreen('create-expense');
  };

  const handleGroups = () => {
    setCurrentScreen('groups');
  };

  const handleTransactions = () => {
    setCurrentScreen('transactions');
  };

  const handleReceiptScan = () => {
    setCurrentScreen('receipt-scan');
  };

  const handleGroupDetails = (groupData?: GroupData) => {
    setSelectedGroup(groupData || null);
    setCurrentScreen('group-details');
  };

  const handleExpenseDetails = (expenseData?: ExpenseData) => {
    setSelectedExpense(expenseData || null);
    setCurrentScreen('expense-details');
  };

  const handleBack = () => {
    setCurrentScreen('home');
  };

  switch (currentScreen) {
    case 'onboarding':
      return <OnboardingScreen onNext={handleNext} />;
    case 'home':
      return (
        <HomeScreen
          onSplitBill={handleSplitBill}
          onCreateExpense={handleCreateExpense}
          onFriends={handleGroups}
          onTransactions={handleTransactions}
          onReceiptScan={handleReceiptScan}
          onGroupDetails={handleGroupDetails}
          onExpenseDetails={handleExpenseDetails}
        />
      );
    case 'split-bill':
      return <SplitBillScreen onBack={handleBack} billData={selectedBill || undefined} />;
    case 'create-expense':
      return <CreateExpenseScreen onBack={handleBack} />;
    case 'groups':
      return <GroupManagementScreen onBack={handleBack} onGroupDetails={handleGroupDetails} />;
    case 'transactions':
      return <TransactionHistoryScreen onBack={handleBack} onExpenseDetails={handleExpenseDetails} />;
    case 'receipt-scan':
      return <ReceiptScanScreen onBack={handleBack} onExpenseCreated={handleBack} />;
    case 'group-details':
      return <GroupDetailsScreen onBack={handleBack} onExpenseDetails={handleExpenseDetails} groupData={selectedGroup || undefined} />;
    case 'expense-details':
      return <ExpenseDetailsScreen onBack={handleBack} expenseData={selectedExpense || undefined} />;
    default:
      return <OnboardingScreen onNext={handleNext} />;
  }
};
