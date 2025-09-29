import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ProfilePicture } from '../ui/ProfilePicture';
import { ArrowLeft, DollarSign, Users } from 'lucide-react';
import { useExpenseSplitter } from '@/hooks/useExpenseSplitter';
import { parseEther } from 'viem';
import { useAccount } from 'wagmi';

interface CreateExpenseScreenProps {
  onBack: () => void;
  groupId?: bigint | string;
  groupMembers?: Array<{ address: string; name: string; }>;
}

export const CreateExpenseScreen: React.FC<CreateExpenseScreenProps> = ({ onBack, groupId, groupMembers }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const { addBill } = useExpenseSplitter();
  const { address: currentUserAddress } = useAccount();

  console.log('CreateExpenseScreen - groupId:', groupId);
  console.log('CreateExpenseScreen - groupId type:', typeof groupId);
  console.log('CreateExpenseScreen - groupId is undefined?', groupId === undefined);
  console.log('CreateExpenseScreen - groupMembers:', groupMembers);
  console.log('CreateExpenseScreen - groupMembers length:', groupMembers?.length);

  // Use group members or fallback to default friends, excluding current user
  const allMembers = groupMembers || [
    { address: '0xabcd1234567890ef...5678', name: 'Jimmy Cooper' },
    { address: '0xef9876543210abcd...9abc', name: 'Guy Hawkins' },
    { address: '0x567890abcdef1234...def0', name: 'Robert Fox' },
    { address: '0x9876543210fedcba...4321', name: 'Alice Smith' },
    { address: '0xfedcba0987654321...8765', name: 'Bob Johnson' },
  ];

  // Filter out current user from available members
  const availableMembers = allMembers.filter(member =>
    member.address.toLowerCase() !== currentUserAddress?.toLowerCase()
  );

  const toggleMember = (memberAddress: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberAddress)
        ? prev.filter(address => address !== memberAddress)
        : [...prev, memberAddress]
    );
  };

  const handleCreateExpense = async () => {
    console.log('handleCreateExpense called with:', { groupId, amount, description, selectedMembers });

    // Fix: BigInt(0) is falsy, so we need to check for null/undefined specifically
    if (groupId === undefined || groupId === null || !amount || !description || selectedMembers.length === 0) {
      console.log('Validation failed:', {
        groupId: groupId,
        hasGroupId: groupId !== undefined && groupId !== null,
        hasAmount: !!amount,
        hasDescription: !!description,
        hasSelectedMembers: selectedMembers.length > 0
      });
      return;
    }

    setIsCreating(true);
    try {
      // Convert groupId to BigInt if it's a string
      const groupIdBigInt = typeof groupId === 'string' ? BigInt(groupId) : groupId;
      const amountWei = parseEther(amount);

      console.log('About to call addBill with:', {
        groupId: groupIdBigInt,
        description,
        amountWei,
        selectedMembers
      });

      await addBill(groupIdBigInt, description, amountWei, selectedMembers as `0x${string}`[]);
      onBack(); // Go back on success
    } catch (error) {
      console.error('Failed to create expense:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="p-3" onClick={onBack}>
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Expense</h1>
              <p className="text-gray-600">Split a bill with your friends</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Expense Details */}
          <div className="space-y-6">
            {/* Basic Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Expense Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g., Coffee & Lunch at Downtown Café"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
                      />
                    </div>
                  </div>

                </div>
              </Card>
            </motion.div>

          </div>

          {/* Right Column - Split Options */}
          <div className="space-y-6">

            {/* Select Group Members */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Select Participants</h3>
                  <span className="text-sm text-gray-500">{selectedMembers.length} selected</span>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {availableMembers.map((member) => (
                    <label
                      key={member.address}
                      className="flex items-center p-3 border border-gray-200 rounded-xl cursor-pointer hover:border-[#7C3AED] transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member.address)}
                        onChange={() => toggleMember(member.address)}
                        className="mr-3"
                      />
                      <ProfilePicture name={member.name} size="md" />
                      <div className="ml-3 flex-1">
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.address}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Summary */}
            {amount && selectedMembers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount</span>
                      <span className="font-semibold">{amount} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Participants</span>
                      <span className="font-semibold">{selectedMembers.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Description</span>
                      <span className="font-semibold">{description || 'No description'}</span>
                    </div>
                    <hr className="my-3" />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Each Person Owes</span>
                      <span className="text-[#7C3AED]">
                        {selectedMembers.length > 0 ? (parseFloat(amount) / selectedMembers.length).toFixed(4) : '0'} ETH
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Create Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button
                variant="primary"
                className="w-full py-4 text-lg font-semibold"
                disabled={!amount || !description || selectedMembers.length === 0 || isCreating || (groupId === undefined || groupId === null)}
                onClick={handleCreateExpense}
              >
                {isCreating ? 'Creating...' : 'Create Expense'}
              </Button>
              {(groupId === undefined || groupId === null) && (
                <p className="text-sm text-red-600 mt-2 text-center">
                  Group ID is required to create an expense
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
