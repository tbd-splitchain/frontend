import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { ArrowRight } from 'lucide-react';
import { FolderAnimation } from '../illustrations/FolderAnimation';
import ConnectWallet from '../ConnectWallet';

interface OnboardingScreenProps {
  onNext: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onNext }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 3;
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [totalSlides]);

  const slides = [
    {
      title: "Split bills easily with your friends and family",
      description: "Automate crypto payments between friends when splitting expenses. No more awkward money conversations or forgotten payments."
    },
    {
      title: "Instant crypto settlements worldwide",
      description: "Send payments instantly across borders using USDC and other cryptocurrencies. No banking required, just your wallet."
    },
    {
      title: "Smart contract automation",
      description: "Our smart contracts handle the splitting and payments automatically when everyone approves. Transparent and secure."
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-6xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid lg:grid-cols-2 min-h-[800px]">
            {/* Left Side - Illustration */}
            <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="relative"
              >
                <div className="w-96 h-96 flex items-center justify-center">
                  <FolderAnimation />
                </div>
              </motion.div>
            </div>

            {/* Right Side - Content */}
            <div className="flex flex-col justify-center p-12 space-y-8">
              {/* Headline */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{
                    duration: 0.6,
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                  className="w-full"
                >
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
                    {slides[currentSlide].title}
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    {slides[currentSlide].description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Progress Dots */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex items-center gap-3"
              >
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-500 ease-out hover:scale-110 ${
                      index === currentSlide ? 'bg-gray-900 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </motion.div>


              {/* Get Started Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.5 }}
              >
                {isWalletConnected ? (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold shadow-lg"
                    icon={<ArrowRight className="w-6 h-6" />}
                    onClick={onNext}
                  >
                    Continue to Dashboard
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-center text-gray-600 text-sm">
                      Connect your wallet to get started
                    </p>
                    <ConnectWallet
                      variant="onboarding"
                      onConnectionChange={setIsWalletConnected}
                    />
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
