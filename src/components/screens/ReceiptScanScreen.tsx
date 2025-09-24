import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ArrowLeft, Camera, Upload, CheckCircle, DollarSign, Calendar, MapPin } from 'lucide-react';

interface ExtractedData {
  total: string;
  date: string;
  merchant: string;
  items: Array<{
    name: string;
    price: number;
  }>;
  confidence: number;
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

interface ReceiptScanScreenProps {
  onBack: () => void;
  onExpenseCreated: (expenseData: ExpenseData) => void;
}

export const ReceiptScanScreen: React.FC<ReceiptScanScreenProps> = ({ onBack, onExpenseCreated }) => {
  const [scanStep, setScanStep] = useState<'upload' | 'processing' | 'review' | 'complete'>('upload');
  const [extractedData, setExtractedData] = useState<ExtractedData>({
    total: '',
    date: '',
    merchant: '',
    items: [],
    confidence: 0
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setScanStep('processing');
      // Simulate AI processing
      setTimeout(() => {
        const mockData = {
          total: '45.67',
          date: new Date().toISOString().split('T')[0],
          merchant: 'Downtown Café',
          items: [
            { name: 'Coffee', price: 4.50 },
            { name: 'Sandwich', price: 12.99 },
            { name: 'Salad', price: 8.99 },
            { name: 'Tax', price: 2.19 }
          ],
          confidence: 94
        };
        setExtractedData(mockData);
        setScanStep('review');
      }, 2000);
    }
  };

  const handleConfirmExpense = () => {
    const expenseData = {
      id: `receipt-${Date.now()}`,
      description: `Receipt from ${extractedData.merchant}`,
      amount: parseFloat(extractedData.total),
      date: extractedData.date,
      timestamp: 'Just now',
      merchant: extractedData.merchant,
      location: 'San Francisco, CA',
      paidBy: 'You (ogazboiz)',
      participants: [
        { name: 'You (ogazboiz)', amount: parseFloat(extractedData.total), status: 'paid' }
      ],
      status: 'pending',
      approvals: 1,
      totalParticipants: 1,
      isReady: true,
      txHash: null,
      category: 'Food & Dining',
      splitMethod: 'equal',
      receipt: 'Available',
      notes: 'Receipt scanned and processed',
      group: 'General',
      youWillReceive: 0,
      youOwe: 0,
      userAction: 'collect',
      items: extractedData.items
    };
    onExpenseCreated(expenseData);
    setScanStep('complete');
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
              <h1 className="text-2xl font-bold text-gray-900">Scan Receipt</h1>
              <p className="text-gray-600">AI-powered receipt processing</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {scanStep === 'upload' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-8 text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Camera className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Upload Receipt Photo</h3>
                <p className="text-gray-600 mb-6">
                  Take a photo of your receipt or upload an image. Our AI will automatically extract the details.
                </p>
                
                <div className="space-y-4">
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="w-full py-4 px-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 cursor-pointer transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <span className="text-gray-600">Click to upload or drag and drop</span>
                    </div>
                  </label>
                  
                  <Button variant="secondary" onClick={onBack}>
                    Cancel
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {scanStep === 'processing' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-8 text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Processing Receipt</h3>
                <p className="text-gray-600">
                  Our AI is analyzing your receipt and extracting the details...
                </p>
              </Card>
            </motion.div>
          )}

          {scanStep === 'review' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <h3 className="text-xl font-bold text-gray-900">Receipt Processed</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {extractedData.confidence}% confidence
                  </span>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Total Amount
                      </label>
                      <input
                        type="text"
                        value={extractedData.total}
                        onChange={(e) => setExtractedData({...extractedData, total: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Date
                      </label>
                      <input
                        type="date"
                        value={extractedData.date}
                        onChange={(e) => setExtractedData({...extractedData, date: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Merchant
                    </label>
                    <input
                      type="text"
                      value={extractedData.merchant}
                      onChange={(e) => setExtractedData({...extractedData, merchant: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Items
                    </label>
                    <div className="space-y-2">
                      {extractedData.items.map((item: { name: string; price: number }, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-gray-600">${item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <Button variant="secondary" onClick={onBack}>
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={handleConfirmExpense}>
                      Create Expense
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {scanStep === 'complete' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-8 text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Expense Created!</h3>
                <p className="text-gray-600 mb-6">
                  Your receipt has been processed and an expense of ${extractedData.total} has been created.
                </p>
                <Button variant="primary" onClick={onBack}>
                  Back to Dashboard
                </Button>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
