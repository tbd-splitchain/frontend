'use client'

import { useAppKit } from '@reown/appkit/react'
import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'

interface ConnectWalletProps {
  variant?: 'default' | 'onboarding'
  onConnectionChange?: (isConnected: boolean) => void
}

export default function ConnectWallet({ variant = 'default', onConnectionChange }: ConnectWalletProps) {
  const [mounted, setMounted] = useState(false)
  const { open } = useAppKit()

  // Only use wagmi hooks after component is mounted
  let address, isConnected
  try {
    const account = useAccount()
    address = account.address
    isConnected = account.isConnected
  } catch {
    address = undefined
    isConnected = false
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && onConnectionChange) {
      onConnectionChange(isConnected)
    }
  }, [isConnected, mounted, onConnectionChange])

  if (!mounted) {
    return (
      <div className={variant === 'onboarding' ? "w-full py-4" : "px-6 py-2"}>
        <div className="animate-pulse bg-gray-200 rounded-lg h-10 w-full"></div>
      </div>
    )
  }

  if (isConnected && variant === 'default') {
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">
          Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
        </div>
        <appkit-button />
      </div>
    )
  }

  if (isConnected && variant === 'onboarding') {
    return (
      <div className="text-center text-green-600 font-medium">
        ✅ Wallet Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
      </div>
    )
  }

  const buttonClass = variant === 'onboarding'
    ? "w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-4 rounded-xl font-semibold shadow-lg transition-colors"
    : "bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"

  return (
    <button
      onClick={() => open()}
      className={buttonClass}
    >
      Connect Wallet
    </button>
  )
}