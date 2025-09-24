import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ProfilePicture } from '../ui/ProfilePicture';
import { ArrowLeft, Plus, Camera, DollarSign, Users, Calendar, MapPin } from 'lucide-react';

interface CreateExpenseScreenProps {
  onBack: () => void;
  onReceiptScan?: () => void;
}

export const CreateExpenseScreen: React.FC<CreateExpenseScreenProps> = ({ onBack, onReceiptScan }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

  const friends = [
    { id: '1', name: 'Jimmy Cooper', username: '0xabcd1234567890ef...5678' },
    { id: '2', name: 'Guy Hawkins', username: '0xef9876543210abcd...9abc' },
    { id: '3', name: 'Robert Fox', username: '0x567890abcdef1234...def0' },
    { id: '4', name: 'Alice Smith', username: '0x9876543210fedcba...4321' },
    { id: '5', name: 'Bob Johnson', username: '0xfedcba0987654321...8765' },
  ];

  const toggleFriend = (friendId: string) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent">
                        <option>Food & Dining</option>
                        <option>Transportation</option>
                        <option>Entertainment</option>
                        <option>Groceries</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="date"
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="e.g., Downtown Café, San Francisco"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="secondary" className="justify-start" icon={<Camera className="w-5 h-5" />} onClick={onReceiptScan}>
                    Scan Receipt
                  </Button>
                  <Button variant="secondary" className="justify-start" icon={<Plus className="w-5 h-5" />}>
                    Add Photo
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Split Options */}
          <div className="space-y-6">
            {/* Split Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Split Method</h3>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-[#7C3AED] transition-colors">
                    <input type="radio" name="splitMethod" value="equal" defaultChecked className="mr-3" />
                    <Users className="w-5 h-5 text-gray-600 mr-3" />
                    <div>
                      <div className="font-medium">Equal Split</div>
                      <div className="text-sm text-gray-500">Split equally among all participants</div>
                    </div>
                  </label>
                  <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-[#7C3AED] transition-colors">
                    <input type="radio" name="splitMethod" value="custom" className="mr-3" />
                    <DollarSign className="w-5 h-5 text-gray-600 mr-3" />
                    <div>
                      <div className="font-medium">Custom Amounts</div>
                      <div className="text-sm text-gray-500">Set specific amounts for each person</div>
                    </div>
                  </label>
                </div>
              </Card>
            </motion.div>

            {/* Select Friends */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Select Friends</h3>
                  <span className="text-sm text-gray-500">{selectedFriends.length} selected</span>
                </div>
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {friends.map((friend) => (
                    <label
                      key={friend.id}
                      className="flex items-center p-3 border border-gray-200 rounded-xl cursor-pointer hover:border-[#7C3AED] transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFriends.includes(friend.id)}
                        onChange={() => toggleFriend(friend.id)}
                        className="mr-3"
                      />
                      <ProfilePicture name={friend.name} size="md" />
                      <div className="ml-3 flex-1">
                        <div className="font-medium text-gray-900">{friend.name}</div>
                        <div className="text-sm text-gray-500">{friend.username}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Summary */}
            {amount && selectedFriends.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Split Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount</span>
                      <span className="font-semibold">${amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Number of People</span>
                      <span className="font-semibold">{selectedFriends.length + 1}</span>
                    </div>
                    <hr className="my-3" />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Each Person Pays</span>
                      <span className="text-[#7C3AED]">
                        ${(parseFloat(amount) / (selectedFriends.length + 1)).toFixed(2)}
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
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Button 
                variant="primary" 
                className="w-full py-4 text-lg font-semibold"
                disabled={!amount || selectedFriends.length === 0}
                onClick={onBack}
              >
                Create Expense
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
