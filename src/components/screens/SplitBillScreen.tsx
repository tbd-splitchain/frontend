import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { ProfilePicture } from '../ui/ProfilePicture';
import { ArrowLeft, ArrowRight, Settings } from 'lucide-react';

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

interface SplitBillScreenProps {
  onBack: () => void;
  billData?: BillData;
}

export const SplitBillScreen: React.FC<SplitBillScreenProps> = ({ onBack, billData }) => {
  // Default data if none provided (fallback to current data)
  const defaultBillData = {
    id: 'bill-89',
    amount: 89.30,
    title: 'Dinner Split',
    participants: [
      { name: 'Alice Smith', amount: 29.77, status: 'approved' },
      { name: 'Bob Johnson', amount: 29.77, status: 'approved' },
      { name: 'You', amount: 29.76, status: 'pending' }
    ],
    totalApproved: 2,
    totalParticipants: 3,
    isReady: false
  };

  const bill = billData || defaultBillData;

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
              <h1 className="text-2xl font-bold text-gray-900">Split bill</h1>
              <p className="text-gray-600">{bill.title}</p>
            </div>
          </div>
          <Button variant="ghost" className="p-3">
            <Settings className="w-6 h-6 text-gray-600" />
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Balance & Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Balance Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
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

            {/* Bill Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="text-center mb-6">
                  <p className={`text-sm font-medium mb-1 ${bill.isReady ? 'text-green-600' : 'text-orange-600'}`}>
                    {bill.isReady ? 'Ready to Split' : 'Pending'}
                  </p>
                  <h2 className="text-4xl font-bold text-gray-900 mb-2">${bill.amount.toFixed(2)}</h2>
                  <p className="text-gray-600 mb-4">Total</p>
                  <p className="text-sm text-gray-500 mb-4">Split between {bill.totalParticipants} friends</p>

                  <div className="flex justify-center -space-x-2 mb-4">
                    {bill.participants.map((participant: Participant, index: number) => (
                      <ProfilePicture key={index} name={participant.name} size="md" />
                    ))}
                  </div>
                </div>

                {/* Approval Progress */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">Approval Progress</span>
                    <span className="text-sm font-bold text-gray-900">{bill.totalApproved}/{bill.totalParticipants}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full ${bill.isReady ? 'bg-green-600' : 'bg-purple-600'}`}
                      style={{width: `${(bill.totalApproved / bill.totalParticipants) * 100}%`}}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {bill.isReady ? 'All approved - Ready to execute!' : `${bill.totalParticipants - bill.totalApproved} people still need to approve`}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Participants & Details */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Split the bill</h2>

              {/* Participants */}
              <div className="space-y-4 mb-6">
                {bill.participants.map((participant: Participant, index: number) => (
                  <div
                    key={index}
                    className={`rounded-2xl p-4 ${
                      participant.status === 'approved' ? 'bg-green-50' : 'bg-yellow-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ProfilePicture name={participant.name} size="md" />
                        <div>
                          <p className="font-semibold text-gray-900">{participant.name}</p>
                          <p className="text-sm text-gray-500">
                            {participant.name === 'You' ? 'Your share' : 'Owes you'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">${participant.amount.toFixed(2)}</p>
                        <p className={`text-xs font-medium ${
                          participant.status === 'approved' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {participant.status === 'approved' ? 'Approved' : 'Pending'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <Button
                variant="primary"
                className={`w-full py-4 rounded-2xl font-semibold mb-6 ${
                  bill.isReady
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
                onClick={() => {
                  if (bill.isReady) {
                    alert('Executing smart contract payment...');
                  } else {
                    const pendingParticipant = bill.participants.find((p: Participant) => p.status === 'pending');
                    alert(`Approving ${pendingParticipant?.name === 'You' ? 'your' : pendingParticipant?.name + "'s"} share of $${pendingParticipant?.amount.toFixed(2)}...`);
                  }
                }}
              >
                {bill.isReady ? 'Execute Payment' : 'Approve Settlement'}
              </Button>

              {/* Transaction Details */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created</span>
                    <span className="text-gray-900">2024-09-23</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Currency</span>
                    <span className="text-gray-900">USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Network</span>
                    <span className="text-gray-900">Arbitrum</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Contract</span>
                    <span className="text-gray-900 font-mono">0x742d...8D32</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
