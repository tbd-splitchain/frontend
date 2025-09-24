import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { ArrowRight, Apple, Chrome } from 'lucide-react';
import { FolderAnimation } from '../illustrations/FolderAnimation';

interface OnboardingScreenProps {
  onNext: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onNext }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 3;

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

              {/* Social Login */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="space-y-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-6 bg-white text-gray-500 font-medium">or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="social"
                    className="py-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                    icon={<Apple className="w-6 h-6 text-gray-700" />}
                    onClick={onNext}
                  >
                    <span className="font-medium text-gray-700 ml-2">Apple</span>
                  </Button>
                  <Button
                    variant="social"
                    className="py-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                    icon={<Chrome className="w-6 h-6" />}
                    onClick={onNext}
                  >
                    <span className="font-medium text-gray-700 ml-2">Google</span>
                  </Button>
                </div>
              </motion.div>

              {/* Sign In Link */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="text-gray-600"
              >
                Already have an account?{' '}
                <button className="text-[#7C3AED] font-semibold hover:underline hover:text-[#6D28D9] transition-colors" onClick={onNext}>
                  Sign In
                </button>
              </motion.p>

              {/* Next Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.5 }}
              >
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-4 rounded-xl font-semibold shadow-lg"
                  icon={<ArrowRight className="w-6 h-6" />}
                  onClick={onNext}
                >
                  Get Started
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
